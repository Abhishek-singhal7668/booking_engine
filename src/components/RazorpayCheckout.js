import React, { useEffect, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import Loader from 'components/ux/loader/loader';
import { v4 as uuidv4 } from 'uuid';

const ROOT_URL = process.env.REACT_APP_API_URL;;
const ROOT_UURL="http://localhost:8081";
const RAZORPAY_KEY_ID = process.env.REACT_APP_RAZORPAY_KEY_ID;
const RazorpayCheckout = ({ pageInfo, formData, isFormValid,bookingData }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);
  const pmsTransactionId = uuidv4();
  const handleConfirmBooking = async ()=>{
    try {
      
      
      // console.log("New reservation response:", response.data);
      console.log(pageInfo.numGuestsInputValue);
      if (bookingData && bookingData.roomCategories && bookingData.roomCategories.length > 0) {
        console.log("Booking data:", bookingData);
        for (const roomCategory of bookingData.roomCategories) {
          const roomAmount = roomCategory.total / roomCategory.number_of_rooms;
          const roomGst = roomCategory.taxes / roomCategory.number_of_rooms;

          for (let i = 0; i < roomCategory.number_of_rooms; i++) {
            const secondPayload = {
              name: formData.name,
              email: formData.email,
              phone: formData.phone,
              amount: roomAmount,
              checkin: pageInfo.checkin,
              checkout: pageInfo.checkout,
              room_category: roomCategory.room_type,
              gst: roomGst,
              mealPlan: 0,
              propertyId: pageInfo.propertyId,
              currency: 'INR',
              noOfGuest: pageInfo.numGuestsInputValue,
              countryCodePhone: formData.countryCodePhone,
              guest_address: formData.address,
              nationality: formData.nationality,
              pmsTransactionId: pmsTransactionId
            };
            const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
            console.log(`Sending booking response for room category ${roomCategory.room_type}, room ${i + 1}:`, secondPayload);

            await delay(500); // Throttle by delaying each request by 500ms

            await axios.post(
              'https://users-dash.bubbleapps.io/api/1.1/wf/booking_response/',
              secondPayload,
              {
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': 'Bearer aec00c01ad9bf87e212367e8cd9be546'
                }
              }
            ).then(response => {
              console.log(`Response for room category ${roomCategory.room_type}, room ${i + 1}:`, response.data);
            }).catch(error => {
              console.error(`Error for room category ${roomCategory.room_type}, room ${i + 1}:`, error);
            });
          }
        }
        console.log("All booking responses sent successfully.");
      } else {
        console.warn("No room categories found in bookingData.");
      }

      // const bookingDetails = {
      //   checkInDate: pageInfo.checkin,
      //   checkOutDate: pageInfo.checkout,
      //   totalAmount: pageInfo.total,
      //   ...formData,
      //   hotel: "House of kapaali",
      // };

      // console.log("Navigating to booking confirmation with details:", bookingDetails);

      // navigate('/booking-confirmation', {
      //   state: { confirmationData: { bookingDetails } }
      // });
      // Clear localStorage after navigation
      localStorage.removeItem('bookingData');
      localStorage.removeItem('total');
      localStorage.removeItem('taxes');
    } catch (error) {
      console.error("Error during booking process:", error);
      // setToastMessage('Booking failed. Please try again.');
    } finally {
      // setIsSubmitting(false);
    }
  }
  const handlePayment = async () => {
    if (!isFormValid()) {
      toast.error('Please fill in all required fields.');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${ROOT_URL}/api/payment/create_order`, {
        amount: pageInfo.total * 100, // Razorpay amount is in paise (1 INR = 100 paise)
        currency: 'INR',
        receipt: 'receipt#',
        submerchantId :'acc_OcPgzSCDfqI6y4'
      });
      
      const orderData = response.data;
      const payload = {
        checkinDate: pageInfo.checkin,
        checkoutDate: pageInfo.checkout,
        noOfGuest: pageInfo.numGuestsInputValue,
        guestName: formData.name,
        guestEmail: formData.email,
        guestPhone: formData.phone,
        roomId: pageInfo.property,
        propertyId: pageInfo.propertyId,
        mealPlan: 0,
        nationality: formData.nationality,
        token_amount: pageInfo.total,
        amount_percent_received: 0,
        countryCodePhone: formData.countryCodePhone,
        amount: pageInfo.total,
        pmsTransactionId: pmsTransactionId,
        gst: pageInfo.tax,
        room_category: pageInfo.room_category,
        number_of_room: pageInfo.totalRooms,
        gateway_tranactionid:orderData.id,
        remark:"abc",
        number_of_days:pageInfo.totaldays
      };

      // console.log("Creating new reservation with payload:", payload);

      const re = await axios.post(
        'https://users-dash.bubbleapps.io/api/1.1/wf/create_new_reservation',
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer aec00c01ad9bf87e212367e8cd9be546'
          }
        }
      );

      const options = {
        key: RAZORPAY_KEY_ID, // Enter the Test API Key ID here
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Finner',
        description: 'Test Transaction',
        order_id: orderData.id, // This is the order ID returned from the backend
        handler: async function (response) {
          console.log(response);
          try {
            const callbackResponse = await axios.post(`${ROOT_URL}/api/payment/callback`, {
              order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
            }, {
              headers: {
                'X-Razorpay-Signature': response.razorpay_signature
              }
            });
            console.log(callbackResponse.data);
            if (callbackResponse.data === "Payment successful") {
             await handleConfirmBooking();
              toast.success('Payment successful!');
              navigate('/booking-confirmation', {
                state: { confirmationData: { bookingDetails: { paymentId: response.razorpay_payment_id, orderId: response.razorpay_order_id, signature: response.razorpay_signature, formData, pageInfo } } },
              });
            } else {
              toast.error('Payment verification failed. Please try again.');
            }
          } catch (error) {
            toast.error('Error verifying payment. Please try again.');
            console.error('Error verifying payment:', error);
          } finally {
            setLoading(false);
          }
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
            toast.info('Payment was cancelled. Please try again.');
          },
        },
        prefill: {
          name: formData.name,
          email: formData.email,
          contact: formData.phone,
        },
        notes: {
          address: 'Corporate Office',
        },
        theme: {
          color: '#3399cc',
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      toast.error('Error creating order. Please try again.');
      console.error('Error creating order:', error);
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center">
      {loading && <Loader isFullScreen={true} loaderText={'Processing Payment...'} />}
      <button 
        onClick={handlePayment} 
        className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${!isFormValid() ? 'opacity-50 cursor-not-allowed' : ''}`}
        disabled={!isFormValid()}  
      >
        Pay ₹{pageInfo.total}
      </button>
      <ToastContainer />
    </div>
  );
};

export default RazorpayCheckout;

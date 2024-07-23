import React, { useEffect, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import Loader from 'components/ux/loader/loader';

const ROOT_URL = 'https://bookingengine.thefinner.com';

const RazorpayCheckout = ({ pageInfo, formData, isFormValid }) => {
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
        receipt: 'receipt#1'
      });

      const orderData = response.data;
      const options = {
        key: 'rzp_test_LQaX9TQGtDjyCR', // Enter the Test API Key ID here
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

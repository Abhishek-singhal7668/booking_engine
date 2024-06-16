import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import Loader from 'components/ux/loader/loader';
import Toast from 'components/ux/toast/Toast';
//import InputField from 'components/ux/input/InputField';
import RazorpayCheckout from 'components/RazorpayCheckout';
import { format } from 'date-fns';

const Checkout = () => {
  const [errors, setErrors] = useState({});
  const [pageInfo, setPageInfo] = useState({});
  const [bookingData, setBookingData] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const [toastMessage, setToastMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitDisabled, setIsSubmitDisabled] = useState(false);

  const dismissToast = () => {
    setToastMessage('');
  };

  const [formData, setFormData] = useState({
    email: '',
    name: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    countryCodePhone: '',
    nationality: '',
    phone: '',
  });

  useEffect(() => {
    const data = location.state || JSON.parse(localStorage.getItem('bookingData'));
    if (data) {
      setBookingData(data);
      let state = { ...data };
      const checkin = new Date(state.checkin);
      const checkout = new Date(state.checkout);
      state.checkin = format(checkin, "yyyy-MM-dd");
      state.checkout = format(checkout, "yyyy-MM-dd");
      setPageInfo(state);
      console.log('Page Info:', state);  // Add this line to debug
    } else {
      console.error('No booking data available');
    }
  }, [location.state]);
  

  if (!bookingData) {
    return <div>Loading...</div>;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    const isValid = typeof validationSchema[name] === 'function' && validationSchema[name](value);
    setFormData((prevFormData) => ({ ...prevFormData, [name]: value }));
    setErrors((prevErrors) => ({ ...prevErrors, [name]: !isValid }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let isValid = true;
    const newErrors = {};
    Object.keys(formData).forEach((field) => {
      if (typeof validationSchema[field] === 'function') {
        const isFieldValid = validationSchema[field](formData[field]);
        newErrors[field] = !isFieldValid;
        isValid = isValid && isFieldValid;
      } else {
        newErrors[field] = false;
      }
    });
  
    setErrors(newErrors);
  
    if (!isValid) {
      return;
    }
    setIsSubmitting(true);
  
    try {
      const pmsTransactionId = uuidv4();
      const payload = {
        checkinDate: pageInfo.checkin,
        checkoutDate: pageInfo.checkout,
        noOfGuest: location.state.numGuestsInputValue,
        guestName: formData.name,
        guestEmail: formData.email,
        guestPhone: formData.phone,
        roomId: pageInfo.property,
        propertyId: "1632210485323x815939605017133000",
        mealPlan: 0,
        nationality: formData.nationality,
        token_amount: pageInfo.total,
        amount_percent_received: 0,
        countryCodePhone: formData.countryCodePhone,
        amount: pageInfo.total,
        pmsTransactionId: pmsTransactionId,
        gst: pageInfo.tax,
        room_category: pageInfo.room_category,
        number_of_room: pageInfo.number_of_rooms,
      };
  
      console.log("Creating new reservation with payload:", payload);
  
      const response = await axios.post(
        'https://users-dash.bubbleapps.io/api/1.1/wf/create_new_reservation',
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer aec00c01ad9bf87e212367e8cd9be546'
          }
        }
      );
  
      console.log("New reservation response:", response.data);
  
      if (bookingData && bookingData.roomCategories && bookingData.roomCategories.length > 0) {
        console.log("Booking data:", bookingData);
        const bookingPromises = bookingData.roomCategories.flatMap((roomCategory, index) => {
          const roomAmount = roomCategory.total / roomCategory.number_of_rooms;
          const roomGst = roomCategory.taxes / roomCategory.number_of_rooms;
  
          const requests = [];
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
              noOfGuest: location.state.numGuestsInputValue,
              countryCodePhone: formData.countryCodePhone,
              guest_address: formData.address,
              nationality: formData.nationality,
              pmsTransactionId: pmsTransactionId
            };
  
  
            console.log(`Sending booking response for room category ${index + 1}, room ${i + 1}:`, secondPayload);
  
            requests.push(
              axios.post(
                'https://users-dash.bubbleapps.io/version-test/api/1.1/wf/booking_response/',
                secondPayload,
                {
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer aec00c01ad9bf87e212367e8cd9be546'
                  }
                }
              ).then(response => {
                console.log(`Response for room category ${index + 1}, room ${i + 1}:`, response.data);
              }).catch(error => {
                console.error(`Error for room category ${index + 1}, room ${i + 1}:`, error);
              })
            );
          }
          return requests;
        });
  
        await Promise.all(bookingPromises);
        console.log("All booking responses sent successfully.");
      } else {
        console.warn("No room categories found in bookingData.");
      }
  
      const bookingDetails = {
        checkInDate: pageInfo.checkin,
        checkOutDate: pageInfo.checkout,
        totalAmount: pageInfo.total,
        ...formData,
        hotel: pageInfo.property,
      };
  
      console.log("Navigating to booking confirmation with details:", bookingDetails);
  
      navigate('/booking-confirmation', {
        state: { confirmationData: { bookingDetails } }
      });
    } catch (error) {
      console.error("Error during booking process:", error);
      setToastMessage('Payment failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  

  const validationSchema = {
    email: (value) => /\S+@\S+\.\S+/.test(value),
    name: (value) => value.trim() !== '',
    address: (value) => value.trim() !== '',
    city: (value) => value.trim() !== '',
    state: (value) => value.trim() !== '',
    postalCode: (value) => /^\d{6}(-\d{4})?$/.test(value),
    countryCodePhone: (value) => /^\d{1,4}$/.test(value),
    nationality: (value) => value.trim() !== '',
    phone: (value) => /^\d{10}$/.test(value),
  };

  return (
    <div className="flex flex-col justify-center items-center">
      <div className="relative bg-white border shadow-md rounded px-8 pt-6 pb-8 mb-4 w-full max-w-lg mx-auto">
        {isSubmitting && <Loader isFullScreen={true} loaderText={'Processing Payment...'} />}
        <form onSubmit={handleSubmit} className={isSubmitting ? 'opacity-40' : ''}>
          <InputField
            label="Email address"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email"
            required={true}
            error={errors.email}
          />
          <InputField
            label="Name"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Alex"
            required={true}
            error={errors.name}
          />
          <InputField
            label="Address"
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Street Address"
            required={true}
            error={errors.address}
          />
          <InputField
            label="City"
            type="text"
            name="city"
            value={formData.city}
            onChange={handleChange}
            placeholder="City"
            required={true}
            error={errors.city}
          />
          <div className="flex mb-4 justify-between">
            <InputField
              label="State / Province"
              type="text"
              name="state"
              value={formData.state}
              onChange={handleChange}
              placeholder="State"
              required={true}
              error={errors.state}
            />
            <InputField
              label="Postal code"
              type="text"
              name="postalCode"
              value={formData.postalCode}
              onChange={handleChange}
              placeholder="Postal Code"
              required={true}
              error={errors.postalCode}
            />
          </div>
          <InputField
            label="Country code phone"
            type="text"
            name="countryCodePhone"
            value={formData.countryCodePhone}
            onChange={handleChange}
            placeholder="Country code phone"
            required={true}
            error={errors.countryCodePhone}
          />
          <InputField
            label="Phone number"
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Phone number"
            required={true}
            error={errors.phone}
          />
          <InputField
            label="Nationality"
            type="text"
            name="nationality"
            value={formData.nationality}
            onChange={handleChange}
            placeholder="Nationality"
            required={true}
            error={errors.nationality}
          />
          <div className="flex justify-between items-center">
          <RazorpayCheckout 
              pageInfo={pageInfo}
              formData={formData}
              onPaymentSuccess={(responseData) => {
                navigate('/booking-confirmation', {
                  state: { confirmationData: { bookingDetails: responseData } },
                });
              }}
            />
          </div>
        </form>
        {toastMessage && <Toast message={toastMessage} onClose={dismissToast} />}
      </div>
    </div>
  );
};
const InputField = ({
  label,
  type,
  name,
  value,
  onChange,
  placeholder,
  required,
  error,
}) => (
  <div className="mb-4">
    <label
      className="block text-gray-700 text-sm font-bold mb-2"
      htmlFor={name}
    >
      {label}
    </label>
    <input
      className={`shadow appearance-none border ${
        error ? 'border-red-500' : 'border-gray-300'
      } rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline`}
      id={name}
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      aria-invalid={error ? 'true' : 'false'}
    />
    {error && (
      <p className="text-red-500 text-xs my-1">Please check this field.</p>
    )}
  </div>
);
export default Checkout;

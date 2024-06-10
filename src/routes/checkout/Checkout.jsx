import React, { useEffect, useState } from 'react';
import FinalBookingSummary from './components/final-booking-summary/FinalBookingSummary';
import { useLocation, useNavigate } from 'react-router-dom';
import { getReadableMonthFormat } from 'utils/date-helpers';
import { useSearchParams } from 'react-router-dom';
import { AuthContext } from 'contexts/AuthContext';
import { useContext } from 'react';
import { networkAdapter } from 'services/NetworkAdapter';
import Loader from 'components/ux/loader/loader';
import Toast from 'components/ux/toast/Toast';
import Schemas from 'utils/validation-schemas';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import { parse, format } from 'date-fns';
import HotelsSearch from 'routes/listings/HotelsSearch';

/**
 * Checkout component for processing payments and collecting user information.
 *
 * @returns {JSX.Element} The rendered Checkout component.
 */
const Checkout = () => {
  const [errors, setErrors] = useState({});
  const [pageInfo, setPageInfo] = useState({});
  const [bookingData, setBookingData] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
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
      setPageInfo(data); // Make sure pageInfo is set correctly
    } else {
      console.error('No booking data available');
    }
    let state = location.state;
    const checkin = new Date(state.checkin);
    const checkout = new Date(state.checkout);
    state.checkin = format(checkin, "yyyy-MM-dd");
    state.checkout = format(checkout, "yyyy-MM-dd");
    setPageInfo(state);
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
      const pmsTransactionId = uuidv4(); // Generate a random transaction ID
      const payload = {
        checkinDate: pageInfo.checkin,
        checkoutDate: pageInfo.checkout,
        noOfGuest: 3, // Example value, replace with actual data
        guestName: formData.name,
        guestEmail: formData.email,
        guestPhone: formData.phone,
        roomId: pageInfo.property,
        propertyId: pageInfo.propertyId,
        mealPlan: 0, // Example value, replace with actual data
        nationality: formData.nationality,
        token_amount: pageInfo.total, // Example value, replace with actual data
        amount_percent_received: 0, // Example value, replace with actual data
        countryCodePhone: formData.countryCodePhone,
        amount: pageInfo.total,
        pmsTransactionId: pmsTransactionId,
        gst: pageInfo.tax,
        room_category: pageInfo.room_category,
        number_of_room: pageInfo.number_of_room, // Add number_of_room to the payload
      };

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

      const secondPayload = { pmsTransactionId };
      const res = await axios.post(
         'https://users-dash.bubbleapps.io/api/1.1/wf/booking_engine_response',
        secondPayload, 
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer aec00c01ad9bf87e212367e8cd9be546'
          }
        }
      );

      console.log('API Response:', response.data);
      const bookingDetails = {
        checkInDate: pageInfo.checkin,
        checkOutDate: pageInfo.checkout,
        totalAmount: pageInfo.total,
       ...formData,
        hotel: pageInfo.property,
      };
  
      navigate('/booking-confirmation', {
        state: { confirmationData: { bookingDetails } }
      });
    } catch (error) {
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
          <div className="flex items-center justify-between">
            <button
              className={`bg-brand hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full transition duration-300 ${
                isSubmitDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
              }`}
              type="submit"
              disabled={isSubmitDisabled}
            >
              Pay ₹ {pageInfo.total}
            </button>
          </div>
        </form>
        {toastMessage && (
          <div className="my-4">
            <Toast
              message={toastMessage}
              type={'error'}
              dismissError={dismissToast}
            />
          </div>
        )}
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

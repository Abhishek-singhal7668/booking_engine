import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import Loader from 'components/ux/loader/loader';
import Toast from 'components/ux/toast/Toast';
import { format } from 'date-fns';
import RazorpayCheckout from 'components/RazorpayCheckout';
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

  const isFormValid = () => {
    return Object.values(errors).every(error => error === false) &&
           Object.values(formData).every(value => value.trim() !== '');
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
  console.log("pageinfo:",pageInfo);
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
      //console.log('Page Info:', state);  // Add this line to debug
    } else {
      console.error('No booking data available');
    }
  }, [location.state]);

  if (!bookingData) {
    return <div>Loading...</div>;
  }
  
  console.log(location.state.numGuestsInputValue);
  const handleChange = (e) => {
    const { name, value } = e.target;
    const isValid = typeof validationSchema[name] === 'function' && validationSchema[name](value);
    setFormData((prevFormData) => ({ ...prevFormData, [name]: value }));
    setErrors((prevErrors) => ({ ...prevErrors, [name]: !isValid }));
  };

  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

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
        {isSubmitting && <Loader isFullScreen={true} loaderText={'Processing Booking...'} />}
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
             <RazorpayCheckout
  formData={formData}
  pageInfo={pageInfo}
  isFormValid={isFormValid}
  bookingData={bookingData}
/>
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

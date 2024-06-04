import React, { useEffect, useState } from 'react';
import FinalBookingSummary from './components/final-booking-summary/FinalBookingSummary';
import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { getReadableMonthFormat } from 'utils/date-helpers';
import { useSearchParams } from 'react-router-dom';
import { AuthContext } from 'contexts/AuthContext';
import { useContext } from 'react';
import { networkAdapter } from 'services/NetworkAdapter';
import Loader from 'components/ux/loader/loader';
import Toast from 'components/ux/toast/Toast';
import Schemas from 'utils/validation-schemas';
/**
 * Checkout component for processing payments and collecting user information.
 *
 * @returns {JSX.Element} The rendered Checkout component.
 */
const Checkout = () => {
  const [errors, setErrors] = useState({});

  const [pageInfo, setPageInfo] = useState({});

  const location = useLocation();

  const navigate = useNavigate();

  const [searchParams] = useSearchParams();

  const [toastMessage, setToastMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false); 
  const [isSubmitDisabled, setIsSubmitDisabled] = useState(false); 
  
  

  // const [isSubmitDisabled, setIsSubmitDisabled] = useState(false);

  // const [paymentConfirmationDetails, setPaymentConfirmationDetails] = useState({
  //   isLoading: false,
  //   data: {},
  // });

  const dismissToast = () => {
    setToastMessage('');
  };

  // Form state for collecting user payment and address information
  const [formData, setFormData] = useState({
    email: '',
    nameOnCard: '',
    cardNumber: '',
    expiry: '',
    cvc: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    countryCodePhone: '',
    nationality: '',
    phoneNumber: '',
  });

  // Format the check-in and check-out date and time
  const checkInDateTime = `${getReadableMonthFormat(
    searchParams.get('checkIn')
  )}, ${location.state?.checkInTime}`;
  const checkOutDateTime = `${getReadableMonthFormat(
    searchParams.get('checkOut')
  )}, ${location.state?.checkOutTime}`;

  useEffect(() => {
    const state = location.state;
    setPageInfo(state);
    if (state.checkin === undefined || 
      state.checkout === undefined || 
      state.property === undefined 
    || state.totaldays === undefined) {
      
      navigate(`/`);
    }
  }, [location]);

  /**
   * Handle form input changes and validate the input.
   * @param {React.ChangeEvent<HTMLInputElement>} e The input change event.
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    const isValid = validationSchema[name](value);
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: !isValid });
  };

  /**
   * Handle form submission and validate the form.
   * @param {React.FormEvent<HTMLFormElement>} e The form submission event.
   * @returns {void}
   * @todo Implement form submission logic.
   * @todo Implement form validation logic.
   * @todo Implement form submission error handling.
   * @todo Implement form submission success handling.
   * @todo Implement form submission loading state.
   * @todo Implement form submission error state.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    let isValid = true;
    const newErrors = {};

    Object.keys(formData).forEach((field) => {
      const isFieldValid = validationSchema[field](formData[field]);
      newErrors[field] = !isFieldValid;
      isValid = isValid && isFieldValid;
    });

    setErrors(newErrors);

    if (!isValid) {
      return; // Stop form submission if there are errors
    }
    setIsSubmitting(true);
    // setIsSubmitDisabled(true);
    // setPaymentConfirmationDetails({
    //   isLoading: true,
    //   data: {},
    // });
    // const response = await networkAdapter.post(
    //   '/api/payments/confirmation',
    //   formData
    // );
    // const checkinDate = searchParams.get('checkIn');
    // const checkoutDate = searchParams.get('checkOut');
    // const totalAmount = pageInfo.total;
    // if (response && response.data && response.errors.length === 0) {
    //   setPaymentConfirmationDetails({
    //     isLoading: false,
    //     data: response.data,
    //   });
    //   const hotelName = searchParams.get('hotelName').replaceAll('-', '_');
    const checkinDate = searchParams.get('checkIn');
  const checkoutDate = searchParams.get('checkOut');
  const noOfGuest = pageInfo.totaldays; // Assuming totaldays is the number of guests
  const buyerName = formData.nameOnCard;
  const buyerEmail = formData.email;
  const buyerPhone = ''; // Not available in the code, please add the phone number field
  const roomId = pageInfo.property; // Assuming property is the room ID
  const propertyId = pageInfo.property; // Assuming property is the property ID
  const mealPlan = ''; // Not available in the code, please add the meal plan field
  const nationality = ''; // Not available in the code, please add the nationality field
  const tokenAmount = 0; // Assuming total is the token amount
  const amountPercentReceived = 0; // Not available in the code, please add the amount percent received field
  const countryCodePhone = ''; // Not available in the code, please add the country code phone field
  const amount = pageInfo.total; // Assuming total is the amount
  const pmsTransactionId = Math.random().toString(36).substr(2, 9); // Generate a random transaction ID
  const gst_amount = ''; // Not available in the code, please add the GST field
  const roomCategory = ''; 
    try {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
      setToastMessage('');
      const bookingDetails = {
        checkInDate: searchParams.get('checkIn'),
        checkOutDate: searchParams.get('checkOut'),
        totalAmount: pageInfo.total,
        ...formData, // Include all form data in booking details
        hotel: pageInfo.property, // Assuming hotel name is in pageInfo
      };

      // Navigate to booking confirmation with details
      navigate('/booking-confirmation', {
        state: { confirmationData: { bookingDetails } }
      });
    } catch (error) { // Handle payment failure
      setToastMessage('Payment failed. Please try again.');
      // setIsSubmitting(false);
    }
    finally {
      setIsSubmitting(false); // Hide loading indicator regardless of success or failure
    }
  };

  return (
    <div className="flex flex-col justify-center items-center">
      <div className="relative bg-white border shadow-md rounded px-8 pt-6 pb-8 mb-4 w-full max-w-lg mx-auto">
        {isSubmitting && <Loader isFullScreen={true} loaderText={'Processing Payment...'} />}
        <form onSubmit={handleSubmit} className={isSubmitting? 'opacity-40' : ''}>
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
            name="nameOnCard"
            value={formData.nameOnCard}
            onChange={handleChange}
            placeholder="Alex"
            required={true}
            error={errors.nameOnCard}
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
            value={formData.phoneNumber}
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
                isSubmitDisabled
                 ? 'opacity-50 cursor-not-allowed'
                  :'hover:bg-blue-700'
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

/**
 * Generic Input field component for collecting user information.
 * @param {Object} props The component props.
 * @param {string} props.label The input field label.
 * @param {string} props.type The input field type.
 * @param {string} props.name The input field name.
 * @param {string} props.value The input field value.
 * @param {Function} props.onChange The input field change handler.
 * @param {string} props.placeholder The input field placeholder.
 * @param {boolean} props.required The input field required status.
 * @param {boolean} props.error The input field error status.
 *
 * @returns {JSX.Element} The rendered InputField component.
 */
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

// Validation schema for form fields
const validationSchema = {
  email: (value) => /\S+@\S+\.\S+/.test(value),
  nameOnCard: (value) => value.trim() !== '',
  address: (value) => value.trim() !== '',
  city: (value) => value.trim() !== '',
  state: (value) => value.trim() !== '',
  postalCode: (value) => /^\d{5}(-\d{4})?$/.test(value),
  countryCodePhone: (value) => /^\d{1,4}$/.test(value), // Country code phone
  nationality: (value) => value.trim() !== '', // Nationality
  phoneNumber: (value) => /^\d{10}$/.test(value), // Phone number
};

export default Checkout;

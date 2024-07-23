import React from 'react';

/**
 * Represents the booking confirmation component.
 * @component
 * @returns {JSX.Element} The booking confirmation component.
 */
const BookingConfirmation = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-md rounded-lg p-6 md:p-12 w-full max-w-lg">
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <svg className="w-12 h-12 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-10.293a1 1 0 00-1.414-1.414L9 9.586 7.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Booking Confirmed!</h1>
          <p className="text-gray-600">Thank you for your booking. Your reservation has been confirmed. Please check your email for the booking details and instructions for your stay.</p>
        </div>
        <div className="mt-6 flex justify-center">
          <a href="/hotels" className="px-4 py-2 bg-blue-500 text-white font-bold rounded-lg shadow-md hover:bg-blue-700 transition duration-300">Back to Home</a>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmation;

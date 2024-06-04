import React from 'react';
import { differenceInCalendarDays ,format,isValid} from 'date-fns';

/**
 * Component for displaying the final booking summary.
 * @param {Object} props The component props.
 * @param {string} props.hotelName The name of the hotel.
 * @param {string} props.checkIn The check-in date.
 * @param {string} props.checkOut The check-out date.
 * @param {boolean} props.isAuthenticated The user authentication status.
 * @param {string} props.phone The user's phone number.
 * @param {string} props.email The user's email.
 * @param {string} props.fullName The user's full name.
 *
 * @returns {JSX.Element} The rendered FinalBookingSummary component.
 */
const FinalBookingSummary = ({
  hotelName,
  checkIn,
  checkOut,
  isAuthenticated,
  phone,
  email,
  fullName,
}) => {
  const numNights = differenceInCalendarDays(
    new Date(checkOut),
    new Date(checkIn)
  );
  const validCheckIn = isValid(new Date(checkIn));
  const validCheckOut = isValid(new Date(checkOut));

  // Format Dates (only if valid):
  const formattedCheckIn = validCheckIn ? format(new Date(checkIn), 'dd MMMM yyyy') : 'Invalid Check-in Date';
  const formattedCheckOut = validCheckOut ? format(new Date(checkOut), 'dd MMMM yyyy') : 'Invalid Check-out Date';

  return (
    <div className="bg-white border-gray-200 border rounded-lg p-6 mb-6 shadow w-full max-w-lg mx-auto mt-4">
      <div className="mb-4">
        <h3 className="text-2xl font-bold text-gray-800">{hotelName}</h3>
        <div className="grid grid-cols-3 gap-5 mt-3">
          <div>
            <p className="text-sm font-semibold text-gray-600">Check-in</p>
            <p className="text-sm text-gray-800">{formattedCheckIn}</p>
          </div>
          <div >
            <p className="text-sm text-gray-800 inline-flex py-1 px-5 rounded-2xl border">
              {numNights} Nights
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-600">Check-out</p>
            <p className="text-sm text-gray-800">{formattedCheckOut}</p>
          </div>
        </div>
      </div>
      {isAuthenticated && (
        <div className="border-t border-gray-200 pt-4">
          <p className="text-sm font-semibold text-gray-600">
            Booking details will be sent to:
          </p>
          <p className="text-sm text-gray-800">{fullName} (Primary)</p>
          <p className="text-sm text-gray-800">{email}</p>
          <p className="text-sm text-gray-800">{phone}</p>
        </div>
      )}
    </div>
  );
};

export default FinalBookingSummary;

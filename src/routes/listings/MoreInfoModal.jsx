import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWifi, faSnowflake, faTv, faCoffee, faUtensils, faBed, faBath, faMugHot, faSoap, faTshirt, faLock } from '@fortawesome/free-solid-svg-icons';

const amenityIcons = {
  "Free Wi-Fi": faWifi,
  "Air Conditioning": faSnowflake,
  "Flat-screen TV": faTv,
  "Mini-bar": faUtensils,
  "Tea/Coffee Maker": faCoffee,
  "24-hour Room Service": faUtensils,
  "Hair Dryer": faBath,
  "Ironing Facilities": faTshirt,
  "Safety Deposit Box": faLock,
  "Separate Living Room": faBed,
  "Jacuzzi Bathtub": faBath,
  "Nespresso Machine": faCoffee,
  "Premium Toiletries": faSoap,
  "Bathrobes & Slippers": faBath,
  "Balcony with City View": faBed,
  "Cable TV": faTv,
  "Private Bathroom": faBath,
  "Work Desk": faMugHot,
};

const MoreInfoModal = ({ showModal, onClose, roomType, room_image, roomDescription, amenities }) => {
  if (!showModal) return null; // Don't render if not shown

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={onClose}></div>
      <div className="bg-white rounded-lg shadow-lg p-8 z-10 max-w-3xl">
        <div className="flex">
          <img src={room_image} alt={roomType} className="w-96 h-64 object-cover rounded-lg mr-8" />
          <div>
            <h2 className="text-2xl font-bold mb-4">{roomType}</h2>
            <p className="text-gray-700 mb-6">{roomDescription}</p>
            <h3 className="text-xl font-semibold mb-2">Amenities:</h3>
            <ul className="text-gray-700 list-disc list-inside">
              {amenities.map((amenity, index) => (
                <li key={index} className="flex items-center">
                  <FontAwesomeIcon icon={amenityIcons[amenity]} className="mr-2" />
                  {amenity}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <button onClick={onClose} className="mt-6 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Close
        </button>
      </div>
    </div>
  );
};

export default MoreInfoModal;

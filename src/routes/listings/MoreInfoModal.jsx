import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faWifi, faSnowflake, faTv, faCoffee, faUtensils, faBed, faBath,
  faMugHot, faSoap, faTshirt, faLock
} from '@fortawesome/free-solid-svg-icons';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ease-in-out">
      <div className="absolute inset-0 bg-gray-800 opacity-75" onClick={onClose}></div>
      <div className="bg-white rounded-lg shadow-lg z-10 max-w-4xl w-full animate-fadeIn overflow-hidden">
        <div className="flex flex-col md:flex-row">
          <div className="relative md:w-1/2 w-full h-64 md:h-auto">
            <img src={room_image} alt={roomType} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-50"></div>
            <div className="absolute bottom-0 left-0 p-4">
              <h2 className="text-2xl font-bold text-white">{roomType}</h2>
            </div>
          </div>
          <div className="p-6 flex flex-col justify-between md:w-1/2 w-full">
            <div>
              <h3 className="text-xl font-semibold mb-2">Room Description</h3>
              <p className="text-gray-700 mb-4">{roomDescription}</p>
              <h3 className="text-xl font-semibold mb-2">Amenities</h3>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {amenities.map((amenity, index) => (
                  <li key={index} className="flex items-center">
                    <FontAwesomeIcon icon={amenityIcons[amenity]} className="mr-2 text-blue-500" />
                    <span className="text-gray-700">{amenity}</span>
                  </li>
                ))}
              </ul>
            </div>
            <button onClick={onClose} className="mt-6 bg-brand hover:bg-brand-secondary text-white font-bold py-2 px-4 rounded transition-colors duration-300 ease-in-out">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MoreInfoModal;

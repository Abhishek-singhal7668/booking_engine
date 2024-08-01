import React, { useState, useEffect } from 'react';
import { faUser, faChild, faBed } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const GuestSelector = ({ onClose, initialAdults, initialChildren, initialRooms, showModal, setShowModal }) => {
  const [adults, setAdults] = useState(initialAdults);
  const [children, setChildren] = useState(initialChildren);
  const [rooms, setRooms] = useState(initialRooms);

  useEffect(() => {
    setAdults(initialAdults);
    setChildren(initialChildren);
    setRooms(initialRooms);
  }, [initialAdults, initialChildren, initialRooms]);

  const handleAddAdult = () => {
    setAdults(adults + 1);
  };

  const handleRemoveAdult = () => {
    if (adults > 1) {
      setAdults(adults - 1);
    }
  };

  const handleAddChild = () => {
    setChildren(children + 1);
  };

  const handleRemoveChild = () => {
    if (children > 0) {
      setChildren(children - 1);
    }
  };

  const handleAddRoom = () => {
    setRooms(rooms + 1);
  };

  const handleRemoveRoom = () => {
    if (rooms > 1) {
      setRooms(rooms - 1);
    }
  };

  const handleClose = () => {
    onClose(adults, children, rooms);
  };

  return (
    <div className="p-4">
      <div className="flex items-center mb-4">
        <FontAwesomeIcon icon={faUser} className="text-blue-500 mr-2" />
        <span className="text-gray-600 font-semibold">Adults (6 years or above)</span>
        <div className="flex items-center ml-4">
          <button
            className="bg-gray-100 text-gray-700 font-semibold py-1 px-2 rounded-l-md"
            onClick={handleRemoveAdult}
            disabled={adults === 2}
          >
            -
          </button>
          <span className="bg-gray-100 text-gray-700 font-semibold py-1 px-2">
            {adults}
          </span>
          <button
            className="bg-gray-100 text-gray-700 font-semibold py-1 px-2 rounded-r-md"
            onClick={handleAddAdult}
          >
            +
          </button>
        </div>
      </div>
      <div className="flex items-center mb-4">
        <FontAwesomeIcon icon={faChild} className="text-blue-500 mr-2" />
        <span className="text-gray-600 font-semibold">Children</span>
        <div className="flex items-center ml-4">
          <button
            className="bg-gray-100 text-gray-700 font-semibold py-1 px-2 rounded-l-md"
            onClick={handleRemoveChild}
            disabled={children === 0}
          >
            -
          </button>
          <span className="bg-gray-100 text-gray-700 font-semibold py-1 px-2">
            {children}
          </span>
          <button
            className="bg-gray-100 text-gray-700 font-semibold py-1 px-2 rounded-r-md"
            onClick={handleAddChild}
          >
            +
          </button>
        </div>
      </div>
      <div className="flex items-center mb-4">
        <FontAwesomeIcon icon={faBed} className="text-blue-500 mr-2" />
        <span className="text-gray-600 font-semibold">Rooms</span>
        <div className="flex items-center ml-4">
          <button
            className="bg-gray-100 text-gray-700 font-semibold py-1 px-2 rounded-l-md"
            onClick={handleRemoveRoom}
            disabled={rooms === 1}
          >
            -
          </button>
          <span className="bg-gray-100 text-gray-700 font-semibold py-1 px-2">
            {rooms}
          </span>
          <button
            className="bg-gray-100 text-gray-700 font-semibold py-1 px-2 rounded-r-md"
            onClick={handleAddRoom}
          >
            +
          </button>
        </div>
      </div>
      <button
        className="bg-gray-100 text-gray-700 font-semibold py-1 px-2 rounded-md mt-4"
        onClick={handleClose}
      >
        Apply
      </button>
    </div>
  );
};

export default GuestSelector;

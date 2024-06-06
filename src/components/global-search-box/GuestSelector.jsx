import React, { useState, useEffect, useRef } from 'react';
import { faUser, faChild } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Select from 'react-select';
import useOutsideClickHandler from 'hooks/useOutsideClickHandler';

const ageOptions = Array.from({ length: 18 }, (_, i) => ({
  value: i,
  label: `${i} years old`,
}));

const GuestSelector = ({ onClose, initialAdults, initialChildren, showModal, setShowModal }) => {
  const [adults, setAdults] = useState(initialAdults);
  const [children, setChildren] = useState(initialChildren);
  const [childAges, setChildAges] = useState(new Array(initialChildren).fill(0));
  const wrapperRef = useRef();

  useEffect(() => {
    setAdults(initialAdults);
    setChildren(initialChildren);
    setChildAges(new Array(initialChildren).fill(0));
  }, [initialAdults, initialChildren]);

  useOutsideClickHandler(wrapperRef, () => onClose(adults, children)); // Handle outside clicks

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
    setChildAges([...childAges, 0]);
  };

  const handleRemoveChild = () => {
    if (children > 0) {
      setChildren(children - 1);
      setChildAges(childAges.slice(0, -1));
    }
  };

  const handleChildAgeChange = (index, value) => {
    const newChildAges = [...childAges];
    newChildAges[index] = parseInt(value, 10);
    setChildAges(newChildAges);
  };

  const handleClose = () => {
    onClose(adults, children);
    setShowModal(false); // Close the modal
  };

  if (!showModal) return null;

  return (
    <div className="fixed top-0 left-0 w-screen h-screen bg-gray-500 bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-4 rounded-lg shadow-md" ref={wrapperRef}>
        <div className="flex items-center mb-4">
          <FontAwesomeIcon icon={faUser} className="text-blue-500 mr-2" />
          <span className="text-gray-600 font-semibold">Adults</span>
          <div className="flex items-center ml-4">
            <button
              className="bg-gray-100 text-gray-700 font-semibold py-1 px-2 rounded-l-md"
              onClick={handleRemoveAdult}
              disabled={adults === 1}
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
        {children > 0 && (
          <div className="mb-4">
            {childAges.map((age, index) => (
              <div key={index} className="flex items-center mb-2">
                <span className="text-gray-600 font-semibold">Child {index + 1}</span>
                <div className="flex items-center ml-4">
                  <Select
                    value={ageOptions.find((option) => option.value === age)}
                    onChange={(selectedOption) => handleChildAgeChange(index, selectedOption.value)}
                    options={ageOptions}
                    className="bg-gray-100 text-gray-700 font-semibold py-1 px-2 rounded-l-md"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
        <button
          className="bg-gray-100 text-gray-700 font-semibold py-1 px-2 rounded-md mt-4"
          onClick={handleClose}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default GuestSelector;

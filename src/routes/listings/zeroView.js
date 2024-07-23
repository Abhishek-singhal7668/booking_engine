import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';

const ZeroView = () => {
  return (
    <div className="flex flex-col items-center justify-center my-10 p-8 rounded-lg shadow-lg transition-transform transform hover:scale-105 bg-white border border-gray-200">
      <FontAwesomeIcon icon={faSearch} className="text-blue-500 text-6xl mb-4 animate-bounce" />
      <h2 className="text-blue-700 text-2xl mb-4 font-semibold">Search for Rooms</h2>
      <p className="text-gray-700 mb-6 text-center">
        Please enter your search criteria to see available rooms. Select a property, number of guests, and date range.
      </p>
      <button 
        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-full focus:outline-none focus:shadow-outline transition-all duration-300 ease-in-out transform hover:scale-110 shadow-lg"
      >
        Enter Search Criteria
      </button>
    </div>
  );
};

export default ZeroView;

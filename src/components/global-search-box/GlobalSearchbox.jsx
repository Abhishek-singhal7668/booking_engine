import { faLocationDot, faPerson } from '@fortawesome/free-solid-svg-icons';
import DateRangePicker from 'components/ux/data-range-picker/DateRangePicker';
import Input from 'components/ux/input/Input';
import { Select } from 'antd';
import { useState } from 'react';
import GuestSelector from './GuestSelector';

/**
 * GlobalSearchBox Component
 * Renders a search box with input fields for location, number of guests, and a date range picker.
 * It includes a search button to trigger the search based on the entered criteria.
 *
 * @param {Object} props - Props for the component.
 * @param {string} props.locationInputValue - The current value of the location input.
 * @param {string} props.numGuestsInputValue - The current value of the number of guests input.
 * @param {boolean} props.isDatePickerVisible - Flag to control the visibility of the date picker.
 * @param {Function} props.onLocationChangeInput - Callback for location input changes.
 * @param {Function} props.onNumGuestsInputChange - Callback for number of guests input changes.
 * @param {Function} props.onDatePickerIconClick - Callback for the date picker icon click event.
 * @param {Array} props.locationTypeheadResults - Results for the location input typeahead.
 * @param {Function} props.onSearchButtonAction - Callback for the search button click event.
 * @param {Function} props.onDateChangeHandler - Callback for handling date range changes.
 * @param {Function} props.setisDatePickerVisible - Callback to set the visibility state of the date picker.
 * @param {Object} props.dateRange - The selected date range.
 */
const inputSyleMap = {
  SECONDARY: 'Finner__input--secondary',
  DARK: 'Finner__input--dark',
};

const GlobalSearchBox = (props) => {
  const {
    propertyListInput,
    numGuestsInputValue,
    setNumGuestsInputValue,
    isDatePickerVisible,
    handlePropertyNameChange,
    onNumGuestsInputChange,
    onDatePickerIconClick,
    onSearchButtonAction,
    onDateChangeHandler,
    setisDatePickerVisible,
    dateRange,
    defaultPropertyValue
  } = props;

  const [guestSelectorOpen, setGuestSelectorOpen] = useState(false);
  const [adults, setAdults] = useState(1); // Initial state for adults
  const [children, setChildren] = useState(0); // Initial state for children

  const handleGuestInputChange = (totalGuests) => {
    onNumGuestsInputChange(totalGuests); // Pass the total number of guests to the parent component
    setGuestSelectorOpen(false); // Close the GuestSelector component
  };

  return (
    <div className="flex flex-wrap flex-col lg:flex-row hero-content__search-box">
      <Select
        placeholder="Select Property"
        value={propertyListInput.find(
          (property) => property.title === defaultPropertyValue
        )?.title || null}
        onChange={(value) => handlePropertyNameChange(value)}
        dropdownStyle={{ borderRadius: 0 }}
        style={{
          width: '220.8px', // Set width
          height: '43.2px',  // Set height
          lineHeight: '43.2px', // Vertical align text
          border: '2px solid gold', // Golden border
          borderRadius: '0px', // Square corners
        }} // Add custom styles for the square box
      >
        {propertyListInput.map((property, index) => (
          <Select.Option defaultPropertyValue={defaultPropertyValue} key={`property-${index}`} value={property.title}>
            {property.title}
          </Select.Option>
        ))}
      </Select>
      <DateRangePicker
        isDatePickerVisible={isDatePickerVisible}
        onDatePickerIconClick={onDatePickerIconClick}
        onDateChangeHandler={onDateChangeHandler}
        setisDatePickerVisible={setisDatePickerVisible}
        dateRange={dateRange}
      />
      <Input
        size="sm"
        value={numGuestsInputValue} // Use the display value
        onClick={() => setGuestSelectorOpen(true)}
        placeholder="No. of guests"
        icon={faPerson}
        type="number"
        readOnly
      />
      <button
        className="w-full md:w-auto sb__button--secondary bg-brand-secondary hover:bg-yellow-600 px-4 py-2 text-white"
        onClick={onSearchButtonAction}
      >
        SEARCH
      </button>
      {guestSelectorOpen && (
        <GuestSelector
          onClose={(adults, children) => {
            const totalGuests = adults + children; // Calculate total guests
            onNumGuestsInputChange(totalGuests);    // Pass the total number
            setGuestSelectorOpen(false);
          }}
          initialAdults={1}
          initialChildren={0}
          showModal={guestSelectorOpen} // Pass showModal state
          setShowModal={setGuestSelectorOpen} // Pass setter for showModal state
        />
      )}
    </div>
  );
};

export default GlobalSearchBox;

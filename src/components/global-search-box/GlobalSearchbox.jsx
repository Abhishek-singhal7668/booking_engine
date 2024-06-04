import { faLocationDot, faPerson } from '@fortawesome/free-solid-svg-icons';
import DateRangePicker from 'components/ux/data-range-picker/DateRangePicker';
import Input from 'components/ux/input/Input';
import { Select, DatePicker } from 'antd';
import { useState, useEffect } from 'react';
import GuestSelector from './GuestSelector';
import Home from 'routes/home/Home';
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
    inputDisplayValue, setInputDisplayValue,
    propertyListInput,
    numGuestsInputValue,
    isDatePickerVisible,
    handlePropertyNameChange,
    onNumGuestsInputChange,
    onDatePickerIconClick,
    onSearchButtonAction,
    onDateChangeHandler,
    setisDatePickerVisible,
    dateRange,inputStyle,
    defaultPropertyValue
  } = props;
  const [guestSelectorOpen, setGuestSelectorOpen] = useState(false);
  return (
    <div className="flex flex-wrap flex-col lg:flex-row hero-content__search-box">
      <Select
      onChange={handlePropertyNameChange}
      dropdownStyle={{ borderRadius: 0 }}
      value={defaultPropertyValue}
      style={{
        width: '220.8px', 
        height: '43.2px',  
        lineHeight: '43.2px', 
        border: '2px solid gold', 
        borderRadius: '0px', 
      }}
    >
  {propertyListInput.map((property, index) => (
    <Select.Option key={`property-${index}`} value={property.title}>
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
        />
      )}
    </div>
  );
};

export default GlobalSearchBox;

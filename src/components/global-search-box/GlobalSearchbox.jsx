import { faLocationDot, faPerson } from '@fortawesome/free-solid-svg-icons';
import DateRangePicker from 'components/ux/data-range-picker/DateRangePicker';
import Input from 'components/ux/input/Input';
import { Select } from 'antd';
import { useState, useRef } from 'react';
import GuestSelector from './GuestSelector';
import useOutsideClickHandler from 'hooks/useOutsideClickHandler';

const inputSyleMap = {
  SECONDARY: 'Finner__input--secondary',
  DARK: 'Finner__input--dark',
};

const GlobalSearchBox = (props) => {
  const {
    propertyListInput,
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
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const guestSelectorRef = useRef();

  useOutsideClickHandler(guestSelectorRef, () => setGuestSelectorOpen(false));

  const handleGuestInputChange = (adults, children) => {
    setAdults(adults);
    setChildren(children);
    onNumGuestsInputChange(adults + children);
  };

  return (
    <div className="flex flex-wrap flex-col lg:flex-row hero-content__search-box relative p-2 sm:p-4">
      <Select
        className="w-full sm:w-auto mb-4 sm:mb-0"
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
          boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)', // Add subtle shadow
        }} // Add custom styles for the square box
      >
        {propertyListInput.map((property, index) => (
          <Select.Option defaultPropertyValue={defaultPropertyValue} key={`property-${index}`} value={property.title}>
            {property.title}
          </Select.Option>
        ))}
      </Select>
      <DateRangePicker
        className="w-full sm:w-auto mb-4 sm:mb-0"
        isDatePickerVisible={isDatePickerVisible}
        onDatePickerIconClick={onDatePickerIconClick}
        onDateChangeHandler={onDateChangeHandler}
        setisDatePickerVisible={setisDatePickerVisible}
        dateRange={dateRange}
      />
      <div className="relative w-full sm:w-auto mb-4 sm:mb-0">
        <Input
          className="w-full"
          size="sm"
          value={`${adults} adults, ${children} children`}
          onClick={() => setGuestSelectorOpen(!guestSelectorOpen)}
          placeholder="No. of guests"
          icon={faPerson}
          readOnly
        />
        {guestSelectorOpen && (
          <div ref={guestSelectorRef} className="absolute top-12 left-0 w-full bg-white border border-gray-200 shadow-lg z-10">
            <GuestSelector
              onClose={(adults, children) => {
                handleGuestInputChange(adults, children);
                setGuestSelectorOpen(false);
              }}
              initialAdults={adults}
              initialChildren={children}
              showModal={guestSelectorOpen} // Pass showModal state
              setShowModal={setGuestSelectorOpen} // Pass setter for showModal state
            />
          </div>
        )}
      </div>
      <button
        className="w-full md:w-auto sb__button--secondary bg-brand-secondary hover:bg-yellow-600 px-4 py-2 text-white"
        onClick={onSearchButtonAction}
      >
        SEARCH
      </button>
    </div>
  );
};

export default GlobalSearchBox;

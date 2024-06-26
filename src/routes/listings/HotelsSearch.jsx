import React, { useState, useEffect } from 'react';
import GlobalSearchBox from 'components/global-search-box/GlobalSearchbox';
import ResultsContainer from 'components/results-container/ResultsContainer';
import { networkAdapter } from 'services/NetworkAdapter';
import isEmpty from 'utils/helpers';
import { MAX_GUESTS_INPUT_VALUE } from 'utils/constants';
import { formatDate } from 'utils/date-helpers';
import { useLocation, useSearchParams, useNavigate } from 'react-router-dom';
import { parse, format } from 'date-fns';
import PaginationController from 'components/ux/pagination-controller/PaginationController';
import { SORTING_FILTER_LABELS } from 'utils/constants';
import _debounce from 'lodash/debounce';
import axios from 'axios';
import BookingTable from './BookingTable';
import { Button } from 'antd';
import properties from './properties.json';
import calculateRoomPrice from 'utils/calculateRoomPrice';
import tw from 'tailwind-styled-components';

const Container = tw.div`
  w-full
  mx-auto
  my-6
  p-4
  bg-white
  rounded
  shadow
  flex
  flex-col
  sm:flex-row
  sm:items-center
  sm:justify-between
`;

const TotalsWrapper = tw.div`
  flex
  flex-col
  items-end
  mb-4
  sm:mb-0
  sm:mr-4
`;

const ButtonWrapper = tw.div`
  flex
  justify-end
  sm:justify-start
`;

const Buton = tw.button`
  bg-[#006ce4]
  hover:bg-blue-700
  text-white
  font-bold
  h-[44px]
  w-[120px]
  rounded
  ml-0
  mt-4
  sm:ml-0 
`;

const HotelsSearch = () => {
  const navigate = useNavigate();
  const [isDatePickerVisible, setisDatePickerVisible] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const instance = axios.create({
    baseURL: 'https://finner.app/api/1.1/wf',
    headers: {
      'Authorization': `Bearer aec00c01ad9bf87e212367e8cd9be546`,
      'Content-Type': 'application/json'
    }
  });

  const [locationInputValue, setLocationInputValue] = useState('');
  const [pageInfo, setPageInfo] = useState({});
  const [propertyName, setpropertyName] = useState('');
  const [propertyId, setPropertyId] = useState('');
  const [numGuestsInputValue, setNumGuestsInputValue] = useState(0);
  const [availableCities, setAvailableCities] = useState([]);
  const [currentResultsPage, setCurrentResultsPage] = useState(1);
  const [filtersData, setFiltersData] = useState({
    isLoading: true,
    data: [],
    errors: [],
  });
  const [hotelsResults, setHotelsResults] = useState({
    isLoading: true,
    data: [],
    errors: [],
  });
  const [dateRange, setDateRange] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: 'selection',
    },
  ]);
  const location = useLocation();

  useEffect(() => {
    if (!location.state) {
      localStorage.clear();
      setTotal(0);
      setTaxes(0);
    }
  }, []);

  const onDateChangeHandler = (ranges) => {
    setDateRange([ranges.selection]);
  };

  const onSearchButtonAction = () => {
    if (dateRange[0].startDate === dateRange[0].endDate) {
      alert('Please select a valid date range');
      return;
    }
    const checkInDate = format(dateRange[0].startDate, "yyyy-MM-dd");
    const checkOutDate = format(dateRange[0].endDate, "yyyy-MM-dd");
    setHasSearched(true); // Update the search status
    navigate('/hotels', {
      state: {
        numGuestsInputValue,
        checkInDate,
        checkOutDate,
        propertyName,
        propertyId
      },
    });
  };

  const onDatePickerIconClick = () => {
    setisDatePickerVisible(!isDatePickerVisible);
  };

  const onNumGuestsInputChange = (numGuests) => {
    if (numGuests < MAX_GUESTS_INPUT_VALUE && numGuests > 0) {
      setNumGuestsInputValue(numGuests);
    }
  };

  const [searchResult, setSearchResult] = useState([]);

  const fetchData = async (params, totalDays) => {
    try {
      const res = await instance.get('/booking_engine_API', { params });
      const processedResult = await processResult(res.data.response.room, totalDays);
      setSearchResult(processedResult);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const processResult = async (data, totalDays) => {
    const cleanRooms = data?.filter(room => room.cleaning_status !== 'Dirty');
    const groupedRooms = cleanRooms?.reduce((acc, room) => {
      if (!acc[room.Room_category_new_deprecate]) {
        acc[room.Room_category_new_deprecate] = {
          room_type: room.Room_category_new_deprecate,
          number_of_avaiable_rooms: 1,
          rate: room.rack_rate,
          stand_occu: room.standard_occupancy,
          max_occ: room.max_occupancy,
          totaldays: totalDays,
          standard_occupancy: room.standard_occupancy,
          room_image: room.room_image,
          id: room.parent_property
        };
      } else {
        acc[room.Room_category_new_deprecate].number_of_avaiable_rooms++;
      }
      return acc;
    }, {});
    if (groupedRooms === null || groupedRooms === undefined) {
      return;
    }

    const roomTypeArray = Object.values(groupedRooms);
    return roomTypeArray;
  };

  const [total, setTotal] = useState(() => {
    const savedTotal = localStorage.getItem('total');
    return savedTotal !== null ? JSON.parse(savedTotal) : 0;
  });

  const [taxes, setTaxes] = useState(() => {
    const savedTaxes = localStorage.getItem('taxes');
    return savedTaxes !== null ? JSON.parse(savedTaxes) : 0;
  });

  useEffect(() => {
    if (location.state) {
      const { propertyId, numGuest, checkInDate, checkOutDate } = location.state;
      if (numGuest) {
        setNumGuestsInputValue(numGuest.toString());
      }
      setPropertyId(propertyId);
      setLocationInputValue("city");
      if (checkInDate && checkOutDate) {
        setDateRange([
          {
            startDate: parse(checkInDate, 'yyyy-MM-dd', new Date()),
            endDate: parse(checkOutDate, 'yyyy-MM-dd', new Date()),
            key: 'selection',
          },
        ]);
      }
      const totalDays = parse(checkOutDate, 'yyyy-MM-dd', new Date()).getDate() - parse(checkInDate, 'yyyy-MM-dd', new Date()).getDate();
      const params = {
        checkin: checkInDate,
        property: propertyId,
        checkout: checkOutDate
      };
      let pageInfo = { ...params, totaldays: totalDays };
      setPageInfo(pageInfo);
      fetchData(params, totalDays);
    }
  }, [location]);

  const handlePropertyNameChange = (propertyName) => {
    const selectedProperty = properties.find(property => property.title === propertyName);
    if (selectedProperty) {
      setPropertyId(selectedProperty.propertyId);
      setpropertyName(propertyName);
    }
  };

  const [propertyListInput, setPropertyListInput] = useState(properties);

  const handleSubmit = () => {
    navigate('/checkout', {
      state: {
        ...pageInfo,
      numGuestsInputValue,
      roomCategories: searchResult.filter(room => room.number_of_rooms > 0)
      }
    });
  };

  const parseIsoDate = (originalDateString) => {
    const [day, month, year] = originalDateString.split('/').map(Number);
    const date = new Date(Date.UTC(year, month - 1, day, 0, 0));
    const isoDateString = date.toISOString();
    return `${isoDateString.substring(0, 19)}Z`;
  };
  console.log(numGuestsInputValue);
  console.log();
  
  const onSelectAmountChange = (cnt, rate, roomType) => {
    const { total, taxes } = calculateRoomPrice(rate, cnt, pageInfo.totaldays);
    let tempRes = [...searchResult];
    let changedRoom = tempRes.find((e) => e.room_type === roomType);
    const index = tempRes.indexOf(changedRoom);
    tempRes[index].total = total;
    tempRes[index].taxes = taxes;
    tempRes[index].number_of_rooms = cnt; 
    setSearchResult(tempRes);
    const { totalAllRooms, taxAllRooms } = calculateAllRooms(tempRes);
    setTotal(totalAllRooms);
    setTaxes(taxAllRooms);
    setPageInfo((prevPageInfo) => ({
      ...prevPageInfo,
      total: totalAllRooms,
      tax: taxAllRooms,
      room_category: tempRes, // Set room category
      number_of_rooms: cnt // Set number of rooms
    }));

    // Save total and taxes to localStorage
    localStorage.setItem('total', JSON.stringify(totalAllRooms));
    localStorage.setItem('taxes', JSON.stringify(taxAllRooms));
  };

  const calculateAllRooms = () => {
    let tot = 0;
    let tx = 0;
    if (searchResult !== undefined && searchResult.length > 0) {
      searchResult.map((e) => {
        if (e.total !== undefined && e.taxes !== undefined) {
          tot = parseFloat(tot) + parseFloat(e.total);
          tx = parseFloat(tx) + parseFloat(e.taxes);
        }
      });
    }
    return { totalAllRooms: tot, taxAllRooms: tx };
  };

  useEffect(() => {
    calculateAllRooms();
  }, [searchResult]);

  return (
    <div className="hotels">
      <div className="bg-brand px-2 lg:h-[120px] h-[220px] flex items-center justify-center">
        <GlobalSearchBox
          propertyListInput={propertyListInput}
          numGuestsInputValue={numGuestsInputValue}
          isDatePickerVisible={isDatePickerVisible}
          setisDatePickerVisible={setisDatePickerVisible}
          handlePropertyNameChange={handlePropertyNameChange}
          onNumGuestsInputChange={onNumGuestsInputChange}
          dateRange={dateRange}
          onDateChangeHandler={onDateChangeHandler}
          onDatePickerIconClick={onDatePickerIconClick}
          onSearchButtonAction={onSearchButtonAction}
          defaultPropertyValue={propertyName}
        />
      </div>
      <div className="my-4"></div>
      <div className="w-[180px]"></div>
      {searchResult.length === 0 ? (
        <div className="flex justify-center items-center my-10">
          <h2 className="text-gray-700 text-lg">Please enter your search criteria to see available rooms.</h2>
        </div>
      ) : (
        <BookingTable roomData={searchResult} onSelectAmountChange={onSelectAmountChange} total={total} taxes={taxes} numGuestsInputValue={numGuestsInputValue} />
      )}
      {hasSearched && (
        <div className="flex justify-end items-center mt-4 px-5">
          <div className="mr-4">
            <h4>Total Room/Unit tariff (Ex Gst/Tax): ₹{(total - taxes).toFixed(2)}</h4>
            <h4>Tax: ₹{taxes.toFixed(2)}</h4>
            <h4>Gross Total: ₹{total.toFixed(2)}</h4>
          </div>
          <Buton
            onClick={handleSubmit}
            className="bg-[#006ce4] hover:bg-blue-700 text-white font-bold h-[44px] w-[120px] rounded ml-4"
          >
            Pay {pageInfo.total}
          </Buton>
        </div>
      )}
    </div>
  );
};

export default HotelsSearch;

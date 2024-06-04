import React, { useState, useEffect, useCallback } from 'react';
import GlobalSearchBox from 'components/global-search-box/GlobalSearchbox';
import ResultsContainer from 'components/results-container/ResultsContainer';
import { networkAdapter } from 'services/NetworkAdapter';
import isEmpty from 'utils/helpers';
import { MAX_GUESTS_INPUT_VALUE } from 'utils/constants';
import { formatDate } from 'utils/date-helpers';
import { useLocation, useSearchParams } from 'react-router-dom';
import { parse } from 'date-fns';
import PaginationController from 'components/ux/pagination-controller/PaginationController';
import { SORTING_FILTER_LABELS } from 'utils/constants';
import _debounce from 'lodash/debounce';
import axios from 'axios';
import BookingTable from './BookingTable';
import { useNavigate } from 'react-router-dom';
import { formatPrice } from 'utils/price-helpers';
import { Button } from 'antd';
import properties from './properties.json'
 
 
/**
 * Represents the hotels search component.
 * @component
 * @returns {JSX.Element} The hotels search component.
 */
const HotelsSearch = () => {
 
  const navigate = useNavigate();
  // State for managing date picker visibility
  const [isDatePickerVisible, setisDatePickerVisible] = useState(false);
 
  const instance = axios.create({
    baseURL: 'https://finner.app/api/1.1/wf',
    headers: {
        'Authorization': `Bearer aec00c01ad9bf87e212367e8cd9be546`,
        'Content-Type': 'application/json'
    }
});
 
  // State for managing location input value
  const [locationInputValue, setLocationInputValue] = useState('pune');
 
  const [pageInfo, setPageInfo] = useState({});
 
  const [propertyName,setpropertyName] = useState('');
 
  // State for managing number of guests input value
  const [numGuestsInputValue, setNumGuestsInputValue] = useState('');
 
  // State for storing available cities
  const [availableCities, setAvailableCities] = useState([]);
 
  // State for managing current results page
  const [currentResultsPage, setCurrentResultsPage] = useState(1);
 
  // State for managing filters data
  const [filtersData, setFiltersData] = useState({
    isLoading: true,
    data: [],
    errors: [],
  });
 
  // State for storing hotels search results
  const [hotelsResults, setHotelsResults] = useState({
    isLoading: true,
    data: [],
    errors: [],
  });
 
  const [dateRange, setDateRange] = useState([
    {
      startDate: null,
      endDate: null,
      key: 'selection',
    },
  ]);
 
  const location = useLocation();
 
  const onDateChangeHandler = (ranges) => {
    setDateRange([ranges.selection]);
  };
 
  const onSearchButtonAction = () => {
    const checkInDate = formatDate(dateRange[0].startDate);
    const checkOutDate = formatDate(dateRange[0].endDate);
    navigate('/hotels', {
      state: {
        numGuestsInputValue,
        checkInDate,
        checkOutDate,
        propertyName,
      },
    });
  };

 
  // Toggles the visibility of the date picker
  const onDatePickerIconClick = () => {
    setisDatePickerVisible(!isDatePickerVisible);
  };
 
  /**
   * Handles changes in the number of guests input.
   * @param {String} numGuests - Number of guests.
   */
  const onNumGuestsInputChange = (numGuests) => {
    if (numGuests < MAX_GUESTS_INPUT_VALUE && numGuests > 0) {
      setNumGuestsInputValue(numGuests);
    }
  };
 
  const [searchResult, setSearchResult] = useState([]);

 
  const fetchData = async (params,totalDays) => {
    const res = await instance.get('/booking_engine_API', { params });
    const processedResult = await processResult(res.data.response.room,totalDays);
    setSearchResult(processedResult);
  }
 
  const processResult = async (data,totalDays) => {
    console.log(data);
    const cleanRooms = data.filter(room => room.cleaning_status !== 'Dirty');
    const groupedRooms = cleanRooms.reduce((acc, room) => {
      if (!acc[room.Room_category_new_deprecate]) {
          acc[room.Room_category_new_deprecate] = {
              room_type:room.Room_category_new_deprecate,
              number_of_avaiable_rooms: 1,
              rate: room.rack_rate,
              stand_occu: room.standard_occupancy,
              max_occ: room.max_occupancy,
              totaldays:totalDays,
              standard_occupancy:room.standard_occupancy,
              room_image:room.room_image

          };
      } else {
          acc[room.Room_category_new_deprecate].number_of_avaiable_rooms++;
      }
      return acc;
    }, {});
    const roomTypeArray = Object.values(groupedRooms);
    return roomTypeArray;
  }
    const [total, setTotal] = useState(0);
    const [taxes, setTaxes] = useState(0);
 
  useEffect(() => {
    if (location.state) {
      const { propertyName, numGuest, checkInDate, checkOutDate } = location.state;
      if (numGuest) {
        setNumGuestsInputValue(numGuest.toString());
      }
      setpropertyName(propertyName);
      setLocationInputValue("city");
      console.log(checkInDate);
      if (checkInDate && checkOutDate) {
        setDateRange([
          {
            startDate: parse(checkInDate, 'dd/MM/yyyy', new Date()),
            endDate: parse(checkOutDate, 'dd/MM/yyyy', new Date()),
            key: 'selection',
          },
        ]);
      }
      const totalDays = parse(checkOutDate, 'dd/MM/yyyy', new Date()).getDate()-parse(checkInDate, 'dd/MM/yyyy', new Date()).getDate() ;
      const params = {
        checkin:parseIsoDate(checkInDate),
        property: propertyName,
        checkout:parseIsoDate(checkOutDate)
    };
    let pageInfo = {...params,totaldays:totalDays};
    setPageInfo(pageInfo);
    fetchData(params,totalDays);
    }
  }, [location]);
 
  const handlePropertyNameChange = (e) => {
    setpropertyName(e);
  }
 
  const [propertyListInput, setPropertyListInput] = useState(properties);
 
  const handleSubmit = () => {
    navigate('/checkout', {
      state: pageInfo,
    });
  }
 
  const parseIsoDate = (originalDateString) => {
    const [day, month, year] = originalDateString.split('/').map(Number);
    const date = new Date(Date.UTC(year, month - 1, day, 0, 0));
    const isoDateString = date.toISOString();
    return `${isoDateString.substring(0,19)}Z`;
  }
 
  const onSelectAmountChange = ( cnt, rate,roomType) => {
    const {total,taxes} = calculatePrices(rate,cnt,pageInfo.totaldays);
    let tempRes = [...searchResult];
    let changedRoom = tempRes.filter((e)=>e.room_type === roomType);
    const index = tempRes.indexOf(changedRoom[0]);
    tempRes[index].total = total;
    tempRes[index].taxes = taxes;
    setSearchResult(tempRes);
    const {totalAllRooms,taxAllRooms} = calculateAllRooms(tempRes);
    setTotal(totalAllRooms);
    setTaxes(taxAllRooms);
    setPageInfo({...pageInfo,total:totalAllRooms}) 
  }
 
  const calculateAllRooms = () => {
    let tot = 0;
    let tx = 0;
    console.log(searchResult);
    if(searchResult !== undefined && searchResult.length > 0) {
      searchResult.map((e)=>{
        if(e.total !== undefined && e.taxes !== undefined) {
        tot = parseFloat(tot) + parseFloat(e.total);
        tx = parseFloat(tx) + parseFloat(e.taxes);
        }
      })
    }
    return {totalAllRooms:tot,taxAllRooms:tx};
  }
 
  useEffect(()=>{
    calculateAllRooms();
  },[searchResult]);
 
  const calculatePrices = (currentNightRate,numberOfRooms, numberOfDays) => {
    const pricePerNight = currentNightRate * numberOfRooms;
    const gstRate =
      pricePerNight <= 2500 ? 0.12 : pricePerNight > 7500 ? 0.18 : 0.12;
    const totalGst = (pricePerNight * numberOfDays * gstRate).toFixed(2);
    const totalPrice = (
      pricePerNight * numberOfDays +
      parseFloat(totalGst)
    ).toFixed(2);
    return {total:`${parseFloat(totalPrice)}`, taxes:`${parseFloat(totalGst)}`};
  };
 
 
  return (
    <div className="hotels">
      <div className="bg-brand px-2 lg:h-[120px] h-[220px] flex items-center justify-center">
        <GlobalSearchBox
          propertyListInput ={propertyListInput }
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
      <BookingTable roomData={searchResult} onSelectAmountChange={onSelectAmountChange} total={total} taxes={taxes}/>
      <div className="flex justify-end items-center mt-4 px-5"> {/* Added flex container */}
  <div className="mr-4">
    <h4>Gross Total: {total}</h4>
    <h4>Taxes : {taxes}</h4>
  </div>
  <Button 
    onClick={handleSubmit} 
    className="bg-[#006ce4] hover:bg-blue-700 text-white font-bold h-[44px] w-[120px] rounded ml-4"
  > 
    Book now
  </Button>
</div>
    </div>
  );
};
 
export default HotelsSearch;
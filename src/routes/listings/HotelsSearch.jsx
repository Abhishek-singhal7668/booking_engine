import React, { useState, useEffect } from 'react';
import GlobalSearchBox from 'components/global-search-box/GlobalSearchbox';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { parse, format } from 'date-fns';
import axios from 'axios';
import BookingTable from './BookingTable';
import properties from './properties.json';
import calculateRoomPrice from 'utils/calculateRoomPrice';
import tw from 'tailwind-styled-components';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import calculateRoomPriceWithMealPlans from 'utils/calculateRoomPriceWithMealPlans';
import { formatCurrency } from 'utils/formatCurrency';
import ZeroView from './zeroView';
import { getIcon } from './iconMap';
import { generateRoomCombinationsDFS } from 'utils/roomCombination';

const safeJsonParse = (value, defaultValue) => {
  try {
    return value ? JSON.parse(value) : defaultValue;
  } catch (e) {
    console.error("Error parsing JSON", e);
    return defaultValue;
  }
};

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
  sm:p-6
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
  const { propertyId } = useParams();
  const [isDatePickerVisible, setisDatePickerVisible] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const instance = axios.create({
    baseURL: 'https://finner.app/api/1.1/wf',
    headers: {
      'Authorization': `Bearer aec00c01ad9bf87e212367e8cd9be546`,
      'Content-Type': 'application/json'
    }
  });
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const [locationInputValue, setLocationInputValue] = useState('');
  const [pageInfo, setPageInfo] = useState({});
  const [propertyName, setpropertyName] = useState('');
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
      endDate: new Date(new Date().setDate(new Date().getDate() + 1)),
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

  useEffect(() => {
    localStorage.clear();
    setHasSearched(false);
  }, []);

  const onDateChangeHandler = (ranges) => {
    setDateRange([ranges.selection]);
  };

  const [selectedRoomsState, setSelectedRoomsState] = useState({});
  const [selectedPlansState, setSelectedPlansState] = useState({});
  const [numRoomsInputValue, setNumRoomsInputValue] = useState(1);

  const onSearchButtonAction = () => {
    if (!propertyName) {
      toast.error('Property field cannot be empty');
      return;
    }
    if (!dateRange[0].startDate || !dateRange[0].endDate || dateRange[0].startDate === dateRange[0].endDate) {
      toast.error('Please select a valid date range');
      return;
    }
    setTotal(0);
    setTaxes(0);
    setSearchResult([]);
    setSelectedRoomsState({});
    setSelectedRooms({});
    setSelectedPlansState({});
    localStorage.clear();
    const checkInDate = format(dateRange[0].startDate, "yyyy-MM-dd");
    const checkOutDate = format(dateRange[0].endDate, "yyyy-MM-dd");
    setHasSearched(true); // Update the search status

    const updatedPageInfo = {
      numGuestsInputValue,
      checkInDate,
      checkOutDate,
      propertyName,
      propertyId
    };

    navigate(`/hotels/${propertyId}`, {
      state: updatedPageInfo,
    });
  };

  const onDatePickerIconClick = () => {
    setisDatePickerVisible(!isDatePickerVisible);
  };

  const onNumGuestsInputChange = (numGuests, numRooms) => {
    if (numGuests < 500 && numGuests > 0) {
      setNumGuestsInputValue(numGuests);
      setNumRoomsInputValue(numRooms);
    }
  };

  const [searchResult, setSearchResult] = useState([]);
  const roomTypeMaxOccupancy = {};
  
  const fetchData = async (params, totalDays) => {
    try {
      const res = await instance.get('/booking_engine_API', { params });
      if (res.data.status === 'success') {
        const roomsData = await processResult(res.data.response.room, totalDays);
        
        const isGST=res.data.response.isGSTExempt;
        const updatedRoomsData = await Promise.all(
          roomsData.map(async (room) => {
            const roomDetailsRes = await instance.get(`/get_room_rate`, {
              params: {
                room_category: room.room_type,
                from_date: params.checkin,
                to_date: params.checkout,
                property: params.property,
              }
            });
             
            const roomDetails = roomDetailsRes.data.response;
          
            const processedAmenities = roomDetails.amenities_class.map(amenity => ({
              name: amenity.amenity_name,
              icon: getIcon(amenity.amenities_icon_text)
            }));

            return {
              ...room,
              isGST:isGST,
              description: roomDetails.room_description,
              amenities: processedAmenities,
            };
          })
        );
        console.log("hotels",roomsData);
        setSearchResult(updatedRoomsData);

        await fetchMealPlansForRooms(updatedRoomsData, params);
      } else {
        console.error('Failed to fetch room data:', res.data);
      }
    } catch (error) {
      console.error('Error fetching room data:', error);
    }
  };

  const fetchMealPlansForRooms = async (rooms, params) => {
    const headers = {
      'Authorization': `Bearer aec00c01ad9bf87e212367e8cd9be546`,
      'Content-Type': 'application/json'
    };

    const mealPlansPromises = rooms.map(room => {
      const body = {
        room_category: room.room_category,
        start_date: params.checkin,
        end_date: params.checkout,
        property_id: params.property
      };

      return axios.post(
        'https://finner.app/api/1.1/wf/get_category_meal_plan',
        body,
        { headers }
      ).catch(error => {
        console.error('Error fetching meal plans:', error.response?.data);
        return null;
      });
    });

    const mealPlansResponses = await Promise.all(mealPlansPromises);

    const updatedRooms = rooms.map((room, index) => {
      const mealPlans = mealPlansResponses[index]?.data.response.data || [];
      return {
        ...room,
        mealPlans,
        mealPlanPrices: mealPlans.map(plan => ({
          id: plan._id,
          rate: plan.rate
        }))
      };
    });

    setSearchResult(updatedRooms);
  };

  const processResult = async (data, totalDays) => {
    const groupedRooms = data.reduce((acc, room) => {
      const roomKey = room.Room_category_new_deprecate;
      if (!acc[roomKey]) {
        acc[roomKey] = {
          room_type: roomKey,
          number_of_avaiable_rooms: 1,
          rate: room.rack_rate,
          standard_occupancy: room.standard_occupancy,
          max_occupancy: room.max_occupancy,
          totaldays: totalDays,
          room_category: room.category_room_future,
          room_image: room.room_image,
          id: room.parent_property,
          
          mealPlans: []
        };
      } else {
        acc[roomKey].number_of_avaiable_rooms++;
      }
      return acc;
    }, {});

    return Object.values(groupedRooms);
  };

  const [total, setTotal] = useState(() => {
    const savedTotal = safeJsonParse(localStorage.getItem('total'), 0);
    return savedTotal;
  });

  const [taxes, setTaxes] = useState(() => {
    const savedTaxes = safeJsonParse(localStorage.getItem('taxes'), 0);
    return savedTaxes;
  });

  useEffect(() => {
    if (location.state) {
      const { propertyId, numGuestsInputValue, checkInDate, checkOutDate, propertyName } = location.state;
      setNumGuestsInputValue(numGuestsInputValue);
      setpropertyName(propertyName);
      if (checkInDate && checkOutDate) {
        setDateRange([
          {
            startDate: parse(checkInDate, 'yyyy-MM-dd', new Date()),
            endDate: parse(checkOutDate, 'yyyy-MM-dd', new Date()),
            key: 'selection',
          },
        ]);
      }
      const totalDays = (new Date(checkOutDate) - new Date(checkInDate)) / (1000 * 60 * 60 * 24);
      const params = {
        checkin: checkInDate,
        property: propertyId,
        checkout: checkOutDate
      };
      let pageInfo = { ...params, totaldays: totalDays };
      setPageInfo(pageInfo);
      fetchData(params, totalDays);
      setIsInitialLoad(false);
    } else {
      localStorage.clear();
      setTotal(0);
      setTaxes(0);
      setSearchResult([]);
      setSelectedRoomsState({});
      setSelectedRooms({});
      setSelectedPlansState({});
      setIsInitialLoad(true);
    }
  }, [location]);

  const handlePropertyNameChange = (propertyName) => {
    const selectedProperty = properties.find(property => property.title === propertyName);
    if (selectedProperty) {
      setpropertyName(propertyName);
    }
  };

  const [propertyListInput, setPropertyListInput] = useState(properties);
  const [selectedRooms, setSelectedRooms] = useState({});
  console.log("hotels",total,taxes);
  const handleSubmit = () => {
    const newPageInfo = {
      ...pageInfo,
      numGuestsInputValue: numGuestsInputValue
    }
    const totalRooms = Object.values(selectedRooms)
      .flatMap(roomCategory => Object.values(roomCategory))
      .map(Number)
      .reduce((sum, num) => sum + num, 0);

    navigate('/checkout', {
      state: {
        ...newPageInfo,
        roomCategories: searchResult.filter(room => room.number_of_rooms > 0),
        selectedRooms,
        totalRooms,
        propertyId,
      }
    });
  };
 console.log("hotels pinfo",pageInfo);
 
  const onSelectAmountChange = (cnt, rate, roomType, selectedPlans) => {
    const room = searchResult.find(e => e.room_type === roomType);
    console.log("hotels",selectedPlans);
    const { total, taxes } = calculateRoomPriceWithMealPlans(room, selectedPlans);

    setSelectedRooms(prevState => {
      const newState = {
        ...prevState,
        [roomType]: selectedPlans
      };
      return newState;
    });

    const tempRes = [...searchResult];
    const changedRoom = tempRes.find((e) => e.room_type === roomType);
    const index = tempRes.indexOf(changedRoom);
    tempRes[index].total = total;
    tempRes[index].taxes = taxes;
    tempRes[index].number_of_rooms = cnt;
    setSearchResult(tempRes);

    const { totalAllRooms, taxAllRooms } = calculateAllRooms(tempRes);
    setTotal(totalAllRooms);
    setTaxes(taxAllRooms);

    setPageInfo((prevPageInfo) => {
      const newPageInfo = {
        ...prevPageInfo,
        total: totalAllRooms,
        tax: taxAllRooms,
        room_category: tempRes,
        number_of_rooms: cnt
      };
      return newPageInfo;
    });

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
          numRoomsInputValue={numRoomsInputValue}
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
      {!hasSearched ? (
        <ZeroView />
      ) : (
        <BookingTable roomData={searchResult}   numGuestsInputValue={numGuestsInputValue} selectedRooms={selectedRooms} setSelectedRooms={setSelectedRooms} selectedPlansState={selectedPlansState} setSelectedPlansState={setSelectedPlansState} 
        setTotal={setTotal} setTaxes={setTaxes}/>
      )}

      {hasSearched && (
        <div className="flex justify-end items-center mt-4 px-5 sm:justify-end">
          <div className="w-full max-w-sm p-4 bg-white shadow-md rounded-lg text-right sm:mt-4">
            <h4>Total Room/Unit tariff (Ex Gst/Tax): {formatCurrency(total ? (total - taxes) : 0)}</h4>
            <h4>Tax: {formatCurrency(taxes ? taxes : 0)}</h4>
            <h4>Gross Total: {formatCurrency(total ? total : 0)}</h4>
            <button
              onClick={handleSubmit}
              disabled={total <= 0}
              className="bg-[#006ce4] hover:bg-blue-700 text-white font-bold h-[44px] w-[120px] rounded mt-4"
            >
              Book Now
            </button>
          </div>
          <div className="mt-20"></div>
        </div>
      )}
    </div>
  );
};

export default HotelsSearch;

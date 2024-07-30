import React, { useState, useEffect,useContext } from 'react';
import GlobalSearchBox from 'components/global-search-box/GlobalSearchbox';
import { useLocation, useNavigate,useParams } from 'react-router-dom';
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
import {getIcon} from './iconMap';

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
  //const [propertyId, setPropertyId] = useState('');
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
    //setIsInitialLoad(false);
    const updatedPageInfo = {
      numGuestsInputValue,
      checkInDate,
      checkOutDate,
      propertyName,
      propertyId
    };

    // Update pageInfo state
    navigate(`/hotels/${propertyId}`, {
      state: updatedPageInfo,
    });
  };
  console.log("guestn",numGuestsInputValue);
  const onDatePickerIconClick = () => {
    setisDatePickerVisible(!isDatePickerVisible);
  };

  const onNumGuestsInputChange = (numGuests) => {
    
    if (numGuests < 500 && numGuests > 0) {
      setNumGuestsInputValue(numGuests);console.log("ok");
    }
  };

  const [searchResult, setSearchResult] = useState([]);

  const fetchData = async (params, totalDays) => {
    try {
      const res = await instance.get('/booking_engine_API', { params });
      if (res.data.status === 'success') {
        const roomsData = await processResult(res.data.response.room, totalDays);
        
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
           // console.log(room.room_category);
            console.log(roomDetailsRes.data);
            console.log(params);
            const roomDetails = roomDetailsRes.data.response;
            const processedAmenities = roomDetails.amenities_class.map(amenity => ({
              name: amenity.amenity_name,
              icon: getIcon(amenity.amenities_icon_text)// Default icon if not found
            }));
            console.log("ab",processedAmenities);
            return {
              ...room,
              description: roomDetails.room_description,
              amenities: processedAmenities,
            };
          })
        );
        setSearchResult(updatedRoomsData);
        console.log("hn bhai",updatedRoomsData);
        // Fetch meal plans for each room category, passing params
        await fetchMealPlansForRooms(roomsData, params);

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
          mealPlans: []  // Placeholder for meal plans
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
      console.log("HotelsSearch - useEffect - numGuestsInputValue:", numGuestsInputValue);
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
      console.log("HotelsSearch - Initial Load Page Info:", pageInfo);
    } else {
      localStorage.clear();
      setTotal(0);
      setTaxes(0);
      setSearchResult([]);
      setSelectedRoomsState({});
      setSelectedRooms({});
      setSelectedPlansState({});
      localStorage.clear();
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
  
  const handleSubmit = () => {
    console.log("hotelsearch guest",numGuestsInputValue);
    const newPageInfo={
      ...pageInfo,
      numGuestsInputValue:numGuestsInputValue

    }
    const totalRooms = Object.values(selectedRooms)
    .flatMap(roomCategory => Object.values(roomCategory)) // Flatten the nested object values
    .map(Number) // Ensure each value is a number
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

  const onSelectAmountChange = (cnt, rate, roomType, selectedPlans) => {
    const room = searchResult.find(e => e.room_type === roomType);
    //console.log("Room found:", room);
  
    const { total, taxes } = calculateRoomPriceWithMealPlans(room, selectedPlans);
    // console.log("Calculated Total:", total);
    // console.log("Calculated Taxes:", taxes);
  
    setSelectedRooms(prevState => {
      const newState = {
        ...prevState,
        [roomType]: selectedPlans
      };
     // console.log("Updated Selected Rooms State:", newState);
      return newState;
    });
  
    const tempRes = [...searchResult];
    const changedRoom = tempRes.find((e) => e.room_type === roomType);
    const index = tempRes.indexOf(changedRoom);
    tempRes[index].total = total;
    tempRes[index].taxes = taxes;
    tempRes[index].number_of_rooms = cnt;
    //console.log("Updated Room:", tempRes[index]);
    setSearchResult(tempRes);
  //  console.log("Updated Search Result:", tempRes);
  
    const { totalAllRooms, taxAllRooms } = calculateAllRooms(tempRes);
    //console.log("Total All Rooms:", totalAllRooms);
   // console.log("Tax All Rooms:", taxAllRooms);
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
      //console.log("Updated Page Info:", newPageInfo);
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
        <ZeroView /> // Use the ZeroView component here
      ) : (
        <BookingTable roomData={searchResult} onSelectAmountChange={onSelectAmountChange} total={total} taxes={taxes} numGuestsInputValue={numGuestsInputValue} selectedRooms={selectedRooms} setSelectedRooms={setSelectedRooms} selectedPlansState={selectedPlansState} setSelectedPlansState={setSelectedPlansState} /> 
      )}

      {hasSearched && (
        <div className="flex justify-end items-center mt-4 px-5 ">
          <div className="w-full max-w-sm p-4 bg-white shadow-md rounded-lg text-right">
            <h4>Total Room/Unit tariff (Ex Gst/Tax): {formatCurrency(total ? (total - taxes) : 0)}</h4>
            <h4>Tax: {formatCurrency(taxes ? taxes : 0)}</h4>
            <h4>Gross Total: {formatCurrency(total ? total : 0)}</h4>
            <Buton
              onClick={handleSubmit}
              disabled={total <= 0} 
              className="bg-[#006ce4] hover:bg-blue-700 text-white font-bold h-[44px] w-[120px] rounded mt-4"
            >
              Book Now
            </Buton>
          </div>
          <div className="mt-20"></div>
        </div>
      )}
    </div>
  );
};


export default HotelsSearch;

import HeroCover from './components/hero-cover/HeroCover';
import PopularLocations from './components/popular-locations/popular-locations';
import { networkAdapter } from 'services/NetworkAdapter';
import { useState, useEffect, useCallback } from 'react';
import { MAX_GUESTS_INPUT_VALUE } from 'utils/constants';
import ResultsContainer from 'components/results-container/ResultsContainer';
import { formatDate } from 'utils/date-helpers';
import { useNavigate } from 'react-router-dom';
import _debounce from 'lodash/debounce';
import HotelViewCard from 'components/hotel-view-card/HotelViewCard';
import properties from './properties.json'
/**
 * Home component that renders the main page of the application.
 * It includes a navigation bar, hero cover, popular locations, results container, and footer.
 */
const Home = () => {
  const navigate = useNavigate();

  // State variables
  const [isDatePickerVisible, setisDatePickerVisible] = useState(false);
  const [propertyName, setpropertyName] = useState('');
  const [numGuestsInputValue, setNumGuestsInputValue] = useState('');
  const [popularDestinationsData, setPopularDestinationsData] = useState({
    isLoading: true,
    data: [],
    errors: [],
  });
  const [hotelsResults, setHotelsResults] = useState({
    isLoading: true,
    data: [],
    errors: [],
  });

  // State for storing available cities
  const [availableCities, setAvailableCities] = useState([]);

  const [filteredTypeheadResults, setFilteredTypeheadResults] = useState([]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debounceFn = useCallback(_debounce(queryResults, 1000), []);

  const [dateRange, setDateRange] = useState([
    {
      startDate: null,
      endDate: null,
      key: 'selection',
    },
  ]);

  const onDatePickerIconClick = () => {
    setisDatePickerVisible(!isDatePickerVisible);
  };

  /**
   * Queries the available cities based on the user's input.
   * @param {string} query - The user's input.
   * @returns {void}
   *
   */
  function queryResults(query, availableCities) {
    const filteredResults = availableCities.filter((city) =>
      city.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredTypeheadResults(filteredResults);
  }

  const onNumGuestsInputChange = (numGuests) => {
    if (
      (numGuests < MAX_GUESTS_INPUT_VALUE && numGuests > 0) ||
      numGuests === ''
    ) {
      setNumGuestsInputValue(numGuests);
    }
  };

  const onDateChangeHandler = (ranges) => {
    setDateRange([ranges.selection]);
  };

  /**
   * Handles the click event of the search button.
   * It gathers the number of guests, check-in and check-out dates, and selected city
   * from the component's state, and then navigates to the '/hotels' route with this data.
   */
  const onSearchButtonAction = () => {
    const numGuest = Number(numGuestsInputValue);
    const checkInDate = formatDate(dateRange[0].startDate) ?? '';
    const checkOutDate = formatDate(dateRange[0].endDate) ?? '';
    navigate('/hotels', {
      state: {
        numGuest,
        checkInDate,
        checkOutDate,
        propertyName,
      },
    });
  };

  const handlePropertyNameChange = (e) => {
    setpropertyName(e);
  }

  useEffect(() => {
    /**
     * Fetches initial data for the Home route.
     * @returns {Promise<void>} A promise that resolves when the data is fetched.
     */
    const getInitialData = async () => {
      const popularDestinationsResponse = await networkAdapter.get(
        '/api/popularDestinations'
      );
      const hotelsResultsResponse =
        await networkAdapter.get('/api/nearbyHotels');

      const availableCitiesResponse = await networkAdapter.get(
        '/api/availableCities'
      );
      if (availableCitiesResponse) {
        setAvailableCities(availableCitiesResponse.data.elements);
      }

      if (popularDestinationsResponse) {
        setPopularDestinationsData({
          isLoading: false,
          data: popularDestinationsResponse.data.elements,
          errors: popularDestinationsResponse.errors,
        });
      }
      if (hotelsResultsResponse) {
        setHotelsResults({
          isLoading: false,
          data: hotelsResultsResponse.data.elements,
          errors: hotelsResultsResponse.errors,
        });
      }
    };
    getInitialData();
  }, []);

  const [propertyListInput, setPropertyListInput] = useState(properties);
  const sampleProps = {
    id: 'H12345',
    image: {
      imageUrl: 'https://example.com/hotel.jpg',
      accessibleText: 'A beautiful view of the hotel'
    },
    title: 'Luxury Beachside Resort',
    subtitle: 'Enjoy the serene ocean views and luxurious amenities',
    benefits: [
      'Free Wi-Fi',
      'Complimentary breakfast',
      'Swimming pool access',
      '24/7 customer service'
    ],
    price: '7500',
    ratings: 4.5
  };
  const handleCallback = (title) => {
    setpropertyName(title);
  }

  return (
    <>
      <HeroCover
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
      <div className="container mx-auto">
        {/* <PopularLocations popularDestinationsData={popularDestinationsData} /> */}
        <div className="my-8">
          <h2 className="text-3xl font-medium text-slate-700 text-center my-2">
            Handpicked nearby hotels for you
          </h2>
       
          <HotelViewCard
            key={sampleProps.id}
            id={sampleProps.id}
            title='House of Kapaali'
            image={
              {
                "imageUrl":"https://s3.amazonaws.com/appforest_uf/f1632213907504x313913766272804860/Omkara.PNG"
                ,"accessibleText":"Omkara"
              }
            }
            subtitle={sampleProps.subtitle}
            benefits={sampleProps.benefits}
            ratings={sampleProps.ratings}
            price="8500"
            handleCallback = {handleCallback}
          />
        </div>
      </div>
    </>
  );
};

export default Home;
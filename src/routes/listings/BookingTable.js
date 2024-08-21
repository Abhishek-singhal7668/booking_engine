import React, { useState, useMemo, useEffect } from 'react';
import tw from 'tailwind-styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faPlusSquare } from '@fortawesome/free-solid-svg-icons';
import MoreInfoModal from './MoreInfoModal';
import amenities from './amenities.json';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import RoomSelectionModal from './RoomSelectionModal';
import { Typography, Divider, Button } from 'antd';
import calculateRoomPriceWithMealPlans from 'utils/calculateRoomPriceWithMealPlans';
import { formatCurrency } from 'utils/formatCurrency';
import { set } from 'lodash';

const { Text } = Typography;

const Table = tw.table`
  w-full
  border-collapse
  table-auto
  mx-auto
  my-6
`;
const TableContainer = tw.div`
  overflow-x-auto
  w-full
`;

const Thead = tw.thead`
  text-left
  bg-gray-200
  font-medium
  text-gray-700
`;

const TBody = tw.tbody`
  divide-y 
  divide-gray-200 
`;

const Tr = tw.tr`
  border
  border-gray-300
  text-gray-700
  hover:bg-gray-50
  transition
  duration-150
`;

const Th = tw.th`
  px-2 py-1 text-start text-sm font-medium text-gray-700 uppercase bg-blue-600 text-white sm:px-6 sm:py-3 
`;

const Td = tw.td`
  border border-gray-300 px-2 py-2 whitespace-nowrap font-medium text-gray-900 sm:px-6 sm:py-4 text-xs sm:text-base
`;

const RoomName = tw.span`
  block
  font-bold
  text-lg
`;

const RoomTypeContainer = tw.div`
  flex
  flex-wrap
  items-center
  w-full
  sm:flex-nowrap
`;

const RoomInfo = tw.div`
  ml-4
  flex-1
  overflow-hidden
`;

const MoreInfoButton = tw.button`
  text-sm 
  text-blue-500 
  hover:text-blue-700 
  mt-1
  flex 
  items-center
`;

const CellContent = tw.div`
  flex
  items-center
  justify-center
  space-x-2
`;

const BookingTable = ({ roomData, numGuestsInputValue, setTotal, setTaxes, selectedRooms, setSelectedRooms, selectedPlansState, setSelectedPlansState }) => {
  const savedSelectedRooms = JSON.parse(localStorage.getItem('selectedRooms')) || {};
  console.log("BookingTable: Initial roomData", roomData);
  const [selectedRoomsState, setSelectedRoomsState] = useState(savedSelectedRooms);
  const [selectedRoomsData, setSelectedRoomsData] = useState({}); 
  const isGST = roomData.length > 0 ? roomData[0].isGST : 0;
  let total=0;
  let taxes=0;
  
  useEffect(() => {
    localStorage.setItem('selectedRooms', JSON.stringify(selectedRoomsState));
  }, [selectedRoomsState]);
  
  useEffect(() => {
    setSelectedRoomsState(selectedRooms);  // Update the selected rooms state
  }, [selectedRooms]);

  const handleSelectChange = (roomType, occupancy, value, perNightPrice, totalRate) => {
    console.log('BookingTable: handleSelectChange called with:', { roomType, occupancy, value, perNightPrice, totalRate });
    setSelectedRoomsData(prevState => {
      const newState = { ...prevState };
      if (!newState[roomType]) {
        newState[roomType] = {};
      }
      newState[roomType][occupancy] = { rooms: value, perNightPrice, totalRate };
      console.log('BookingTable: Updated selectedRoomsData:', newState);
      return newState;
    });

    setSelectedRooms(prevState => ({
      ...prevState,
      [roomType]: {
        ...prevState[roomType],
        [occupancy]: value
      }
    }));
  };

  const handleModalConfirm = (selectedPlans, roomType, occupancy) => {
    console.log('BookingTable: handleModalConfirm called with:', { selectedPlans, roomType, occupancy });
    setSelectedPlansState(prevState => ({
      ...prevState,
      [roomType]: {
        ...prevState[roomType],
        [occupancy]: selectedPlans
      }
    }));
  };

  return (
    <TableContainer>
      <Table>
        <Thead>
          <Tr>
            <Th>Room Type</Th>
            <Th>Number of Guests</Th>
            <Th>Rate for {roomData && roomData.length > 0 ? roomData[0].totaldays : 1} Nights</Th>
            <Th>Select Room</Th>
            <Th>Total Amount (Incl. Taxes)</Th>
            <Th>Your Choices</Th>
          </Tr>
        </Thead>
        <TBody>
          {roomData && roomData.length > 0 && (
            roomData.map((e) => (
              <React.Fragment key={e.room_type}>
                <RoomInfoRow 
                  roomType={e.room_type}
                  standardOccupancy={e.standard_occupancy}
                  maxOccupancy={e.max_occupancy}
                  room_image={e.room_image}
                  roomData={roomData}
                  numGuestsInputValue={numGuestsInputValue}
                  mealPlans={e.mealPlans}
                  selectedPlansSummary={selectedPlansState[e.room_type] || {}}
                  onSelectChange={handleSelectChange}
                  availableRooms={e.number_of_avaiable_rooms}
                  selectedRooms={selectedRoomsState[e.room_type] || {}}
                  onConfirm={handleModalConfirm}
                  isGst={isGST}
                  total={total}
                  taxes={taxes}
                  setTotal={setTotal}
                  setTaxes={setTaxes}
                />
              </React.Fragment>
            ))
          )}
        </TBody>
        <ToastContainer />
      </Table>
    </TableContainer>
  );
};

// RoomInfoRow Component
const RoomInfoRow = ({
  roomType, standardOccupancy, maxOccupancy, room_image, roomData, numGuestsInputValue, mealPlans, selectedPlansSummary, onSelectChange, availableRooms, selectedRooms, onConfirm, isGst,
  total, taxes, setTotal, setTaxes
}) => {
  console.log("RoomInfoRow: Initial mealPlans", mealPlans);
  console.log("RoomInfoRow: isGst", isGst);
  const [showMoreInfoModal, setShowMoreInfoModal] = useState(false);
  const [showRoomSelectionModal, setShowRoomSelectionModal] = useState(false);
  const [selectedOccupancy, setSelectedOccupancy] = useState(standardOccupancy); 
  const [selectedRoomsData, setSelectedRoomsData] = useState({});
  const [summaryVisibility, setSummaryVisibility] = useState({});
  const [totalSelectedRooms, setTotalSelectedRooms] = useState({});

  const roomInfo = useMemo(() => {
    const room = amenities.find(item => item.room_type === roomType);
    return room ? { description: room.description, amenities: room.amenities } : { description: "", amenities: [] };
  }, [roomType]);

  const handleModalConfirm = (selectedPlans, occupancy) => {
    console.log("RoomInfoRow: handleModalConfirm called with:", { selectedPlans, occupancy });
    onConfirm(selectedPlans, roomType, selectedOccupancy);
    setShowRoomSelectionModal(false);
    updateSummaryVisibility(roomType, occupancy);
    setTotalSelectedRooms(prevState => {
      const newState = { ...prevState };
      const totalSelected = Object.values(selectedPlans).reduce((sum, num) => sum + num, 0);
      if (!newState[roomType]) {
        newState[roomType] = {};
      }
      newState[roomType][occupancy] = totalSelected;
      return newState;
    });
  };

  const handleSelectChange = (plan, value, stdOccupancy, extraCharge) => {
    const extraGuestCharge = value > 0 ? Math.max(0, selectedOccupancy - stdOccupancy) * extraCharge : 0;
    const totalRate = value > 0 ? plan.rate + extraGuestCharge : 0;
  
    const newSelectedData = { rooms: value, perNightPrice: plan.rate, totalRate };
    setSelectedRoomsData(prevState => {
      const newState = { ...prevState };
      if (!newState[roomType]) {
        newState[roomType] = {};
      }
      newState[roomType][selectedOccupancy] = newSelectedData;
      return newState;
    });
  
    onSelectChange(roomType, selectedOccupancy, value, plan.rate, totalRate);
  };
  
  
  const updateSummaryVisibility = (roomType, occupancy) => {
    setSummaryVisibility(prevState => ({
      ...prevState,
      [roomType]: {
        ...prevState[roomType],
        [occupancy]: true,
      },
    }));
  };
  
  const renderMealPlanSummary = (occupancy) => {
    const isVisible = summaryVisibility[roomType] && summaryVisibility[roomType][occupancy];
    const selectedPlanCounts = Object.values(selectedPlansSummary[occupancy] || {}).reduce((sum, num) => sum + num, 0);
    
    return isVisible && (
      <div className="p-4 bg-gray-50 rounded-md shadow-md border border-gray-200">
        <Text strong className="block mb-2 text-lg text-blue-600">Selected Meal Plans:</Text>
        {selectedPlanCounts > 0 ? (
          Object.entries(selectedPlansSummary[occupancy] || {}).map(([plan, count]) => (
            count > 0 && (
              <div key={plan} className="flex justify-between items-center mb-2">
                <Text className="text-gray-700">{plan}:</Text>
                <Text className="text-gray-700">{count}</Text>
              </div>
            )
          ))
        ) : (
          <Text className="text-gray-700">No meal plans selected. Please select a meal plan.</Text>
        )}
        <Divider className="my-2" />
        <Text strong className="text-blue-600">Total Selected Rooms: {selectedPlanCounts}</Text>
      </div>
    );
  };
  
  
  
  
  console.log("RoomInfoRow: room info", selectedOccupancy, selectedPlansSummary[selectedOccupancy]);
  const renderOccupancyOptions = () => {
    const options = [];
    for (let occupancy = standardOccupancy; occupancy <= maxOccupancy; occupancy++) {
      const selectedData = selectedRoomsData[roomType] && selectedRoomsData[roomType][occupancy];
      const calculatedPrice = calculateRoomPriceWithMealPlans({ ...roomData[0], mealPlans, occupancy }, selectedPlansSummary[occupancy] || {}, occupancy, isGst);
      const totalRate = selectedData ? selectedData.totalRate : calculatedPrice.total;
      const displayRate = selectedData && selectedData.rooms === 0 ? 0 : totalRate;
      console.log("room info totalrate",totalRate);
      console.log("room info selectedData",selectedData);
      const tax = calculatedPrice.taxes;
      total += totalRate;
      taxes += tax;
      setTotal(total);
      setTaxes(taxes);
      console.log("RoomInfoRow: loop selectedRoomsData[roomType]", roomData);
      options.push(
        <Tr key={occupancy}>
          {occupancy === standardOccupancy && (
            <Td rowSpan={maxOccupancy - standardOccupancy + 1}>
              <RoomTypeContainer>
                {room_image ? (
                  <img src={room_image} alt={roomType} className="w-16 h-16 rounded-lg object-cover" />
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-gray-300"></div>
                )}
                <RoomInfo>
                  <RoomName>{roomType}</RoomName>
                  <span className="text-sm text-gray-500 block">{roomInfo.description.split(' ').slice(0, 10).join(' ')}...</span>
                  <MoreInfoButton onClick={() => setShowMoreInfoModal(true)}>
                    <FontAwesomeIcon icon={faPlusSquare} className="mr-1" /> More Info
                  </MoreInfoButton>
                </RoomInfo>
              </RoomTypeContainer>
            </Td>
          )}
          <Td>
            <CellContent>
              <FontAwesomeIcon icon={faUser} className="text-lg" />
              <span className='text-xl mx-1'>x</span>
              <span className='text-lg'>{occupancy}</span>
            </CellContent>
          </Td>
          <Td>₹{((displayRate - calculatedPrice.taxes)).toFixed(2)}</Td>
          <Td>
          <div className="flex flex-col items-center">
            <Button
              type="primary"
              size="large"
              icon={<FontAwesomeIcon icon={faPlusSquare} />}
              onClick={() => { setShowRoomSelectionModal(true); setSelectedOccupancy(occupancy); }}
            >
              Select Room
            </Button>
            </div>

          </Td>
          <Td>
            <div className="flex flex-col items-start">
              <span className="font-bold">{formatCurrency(totalRate)}</span>
              <span className="text-xs text-gray-500">Incl. taxes {formatCurrency(calculatedPrice.taxes)}</span>
            </div>
          </Td>
          <Td>
            {renderMealPlanSummary(occupancy)}
          </Td>
        </Tr>
      );
    }
    return options;
  };

  return (
    <>
      {renderOccupancyOptions()}
      <RoomSelectionModal
        open={showRoomSelectionModal}
        onClose={() => setShowRoomSelectionModal(false)}
        onConfirm={(e) => handleModalConfirm(e, selectedOccupancy)}
        roomType={roomType}
        availableRooms={availableRooms}
        mealPlans={mealPlans}
        selectedOccupancy={selectedOccupancy}
        occupancy={selectedOccupancy} 
        selectedPlans={selectedPlansSummary[selectedOccupancy] || {}}
       
      />
      <MoreInfoModal
        showModal={showMoreInfoModal}
        onClose={() => setShowMoreInfoModal(false)}
        roomType={roomType}
        room_image={room_image}
        roomDescription={roomData.description}
        amenities={roomInfo.amenities}
        room={roomData}
      />
    </>
  );
};

export default BookingTable;

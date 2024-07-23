import React, { useState, useMemo, useEffect } from 'react';
import tw from 'tailwind-styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faPlusSquare, faCaretRight } from '@fortawesome/free-solid-svg-icons';
import calculateRoomPrice from 'utils/calculateRoomPrice';
import MoreInfoModal from './MoreInfoModal';
import amenities from './amenities.json';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import RoomSelectionModal from './RoomSelectionModal';
import { Typography, Divider } from 'antd';
import calculateRoomPriceWithMealPlans from 'utils/calculateRoomPriceWithMealPlans';
import { formatCurrency } from 'utils/formatCurrency';
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

const BookingTable = ({ roomData, onSelectAmountChange, total, taxes, numGuestsInputValue,selectedRooms, setSelectedRooms,selectedPlansState, 
  setSelectedPlansState  }) => {
    console.log("BookingTable - Total:", total);
    console.log("BookingTable - Taxes:", taxes);
  const savedSelectedRooms = JSON.parse(localStorage.getItem('selectedRooms')) || {};

  const [selectedRoomsState, setSelectedRoomsState] = useState(savedSelectedRooms);
  
  useEffect(() => {
    localStorage.setItem('selectedRooms', JSON.stringify(selectedRoomsState));
  }, [selectedRoomsState]);
  useEffect(() => {
    setSelectedRoomsState(selectedRooms);  // Update the selected rooms state
  }, [selectedRooms]);


  const handleSelectChange = (roomType, value, perNightPrice, selectedPlans) => {
    const updatedSelectedRooms = { ...selectedRoomsState, [roomType]: Number(value) };
    setSelectedRoomsState(updatedSelectedRooms);
    setSelectedRooms(updatedSelectedRooms); 
    onSelectAmountChange(value, perNightPrice, roomType, selectedPlans);
  };
  
  const handleModalConfirm = (selectedPlans, roomType) => {
    setSelectedPlansState(prevState => ({
      ...prevState,
      [roomType]: selectedPlans
    }));
    
  };

  return (
    <TableContainer>
      <Table>
        <Thead>
          <Tr>
            <Th>Room Type</Th>
            <Th>Maximum Occupancy</Th>
            <Th>{roomData && roomData.length > 0 ? `Rate for ${roomData[0].totaldays} Nights` : 'Price for Nights'}</Th>
            <Th></Th>
            <Th>Total Amount (Incl. Taxes)</Th>
            <Th>Selected Meal Plans</Th>
          </Tr>
        </Thead>
        <TBody>
          {roomData && roomData.length > 0 && (
            roomData.map((e) => (
              <RoomInfoRow 
                key={e.room_type} 
                totalPrice={e.rate * e.totaldays}
                perNightPrice={e.rate}
                availableRooms={e.number_of_avaiable_rooms}
                roomType={e.room_type}
                selectedRooms={selectedRoomsState[e.room_type] || 0}
                onSelectChange={handleSelectChange}
                total={total} 
                taxes={taxes}
                countOfGuests={e.standard_occupancy}
                room_image={e.room_image}
                roomData={roomData}
                numGuestsInputValue={numGuestsInputValue}
                mealPlans={e.mealPlans}
                selectedPlansSummary={selectedPlansState[e.room_type] || {}}
                onConfirm={handleModalConfirm}
              />
            ))
          )}
        </TBody>
        <ToastContainer />
      </Table>
    </TableContainer>
  );
};

const RoomInfoRow = ({
  roomType, totalPrice, perNightPrice, availableRooms, selectedRooms, onSelectChange,
  total, taxes, countOfGuests, room_image, roomData, numGuestsInputValue, mealPlans, selectedPlansSummary, onConfirm
}) => {
  console.log("RoomInfoRow - Total:", total);
  console.log("RoomInfoRow - Taxes:", taxes);
  console.log("RoomInfoRow - TotalPrice:", totalPrice);

  const [showMoreInfoModal, setShowMoreInfoModal] = useState(false);
  const [showRoomSelectionModal, setShowRoomSelectionModal] = useState(false);

  const roomInfo = useMemo(() => {
    const room = amenities.find(item => item.room_type === roomType);
    return room ? { description: room.description, amenities: room.amenities } : { description: "", amenities: [] };
  }, [roomType]);

  const handleModalConfirm = (selectedPlans) => {
    const totalSelectedRooms = Object.values(selectedPlans).reduce((sum, num) => sum + num, 0);
    const totalPriceForSelectedPlans = Object.keys(selectedPlans).reduce((sum, planId) => {
      const plan = mealPlans.find(p => p.rate_plan_name === planId);
      if (!plan) {
        console.error(`Plan with id ${planId} not found`);
        return sum;
      }
      return sum + (selectedPlans[planId] * plan.rate);
    }, 0);
    console.log("Selected Plans:", selectedPlans);
    console.log("Total Price:", totalPriceForSelectedPlans);
    onSelectChange(roomType, totalSelectedRooms, totalPriceForSelectedPlans / totalSelectedRooms, selectedPlans);
    onConfirm(selectedPlans, roomType);
    setShowRoomSelectionModal(false);
  };

  const calculatedPrice = calculateRoomPriceWithMealPlans({ ...roomData[0], mealPlans }, selectedPlansSummary);

  const renderSelectedPlansSummary = () => (
    <div className="p-4 bg-gray-50 rounded-md shadow-md border border-gray-200">
      <Text strong className="block mb-2 text-lg text-blue-600">Selected Meal Plans:</Text>
      {Object.entries(selectedPlansSummary).map(([plan, count]) => (
        count > 0 && (
          <div key={plan} className="flex justify-between items-center mb-2">
            <Text className="text-gray-700">{plan}:</Text>
            <Text className="text-gray-700">{count}</Text>
          </div>
        )
      ))}
      <Divider className="my-2" />
      <Text strong className="text-blue-600">Total Selected Rooms: {Object.values(selectedPlansSummary).reduce((sum, num) => sum + num, 0)}</Text>
    </div>
  );

  return (
    <Tr>
      <Td>
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
      <Td>
        <CellContent>
          <FontAwesomeIcon icon={faUser} className="text-lg" />
          <span className='text-xl mx-1'>x</span>
          <span className='text-lg'>{countOfGuests}</span>
        </CellContent>
      </Td>
      <Td>₹{((calculatedPrice.total)-(calculatedPrice.taxes)).toFixed(2)}</Td>
      <Td>
        <button className="p-2 bg-blue-500 text-white rounded hover:bg-blue-700 transition duration-150"
                onClick={() => setShowRoomSelectionModal(true)}>
          <FontAwesomeIcon icon={faCaretRight} className="mr-2" />Select Rooms
        </button>
      </Td>
      <Td>
        <div className="flex flex-col items-start">
        <span className="font-bold">{formatCurrency(calculatedPrice.total)}</span>
<span className="text-xs text-gray-500">Incl. taxes {formatCurrency(calculatedPrice.taxes)}</span>

        </div>
      </Td>
      <Td>{renderSelectedPlansSummary()}</Td>
      <RoomSelectionModal
        open={showRoomSelectionModal}
        onClose={() => setShowRoomSelectionModal(false)}
        onConfirm={handleModalConfirm}
        roomType={roomType}
        availableRooms={availableRooms}
        mealPlans={mealPlans}
      />
      <MoreInfoModal
        showModal={showMoreInfoModal}
        onClose={() => setShowMoreInfoModal(false)}
        roomType={roomType}
        room_image={room_image}
        roomDescription={roomInfo.description}
        amenities={roomInfo.amenities}
      />
    </Tr>
  );
};

export default BookingTable;

import React, { useState, useMemo, useEffect } from 'react';
import tw from 'tailwind-styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faPlusSquare } from '@fortawesome/free-solid-svg-icons';
import calculateRoomPrice from 'utils/calculateRoomPrice';
import MoreInfoModal from './MoreInfoModal';
import amenities from './amenities.json';

const Table = tw.table`
  w-full
  border-collapse
  table-auto
  mx-auto
  my-6
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
  px-6 
  py-3 
  text-start 
  text-sm 
  font-medium 
  text-gray-700
  uppercase 
  bg-blue-600
  text-white
`;

const Td = tw.td`
  border
  border-gray-300
  px-6 
  py-4 
  whitespace-nowrap 
  font-medium 
  text-gray-900
`;

const Select = tw.select`
  w-full
  border
  border-gray-300
  p-2
  rounded-lg
  text-gray-700
`;

const Option = tw.option`
  p-2
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

const BookingTable = ({ roomData, onSelectAmountChange, total, taxes }) => {
  // Load selected rooms state from localStorage
  const savedSelectedRooms = JSON.parse(localStorage.getItem('selectedRooms')) || {};

  const [selectedRoomsState, setSelectedRoomsState] = useState(savedSelectedRooms);

  useEffect(() => {
    // Save selected rooms state to localStorage whenever it changes
    localStorage.setItem('selectedRooms', JSON.stringify(selectedRoomsState));
  }, [selectedRoomsState]);

  const handleSelectChange = (roomType, value, perNightPrice) => {
    const updatedSelectedRooms = { ...selectedRoomsState, [roomType]: Number(value) };
    setSelectedRoomsState(updatedSelectedRooms);
    onSelectAmountChange(value, perNightPrice, roomType);
  };

  return (
    <Table>
      <Thead>
        <Tr>
          <Th>Room Type</Th>
          <Th>Maximum Occupancy</Th>
          <Th>{roomData && roomData.length > 0 ? `Rate for ${roomData[0].totaldays} Nights` : 'Price for Nights'}</Th>
          <Th>Select Rooms</Th>
          <Th>Total Amount (Incl. Taxes)</Th>
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
            />
          ))
        )}
      </TBody>
    </Table>
  );
};

const RoomInfoRow = ({ roomType, totalPrice, perNightPrice, availableRooms, selectedRooms, onSelectChange, total, taxes, countOfGuests, room_image, roomData }) => {
  const [showModal, setShowModal] = useState(false);

  const roomInfo = useMemo(() => {
    const room = amenities.find(item => item.room_type === roomType);
    return room ? { description: room.description, amenities: room.amenities } : { description: "", amenities: [] };
  }, [roomType]);

  const pricePerRoomType = useMemo(() => {
    return calculateRoomPrice(perNightPrice, selectedRooms, roomData[0].totaldays);
  }, [selectedRooms, perNightPrice, roomData]);

  return (
    <Tr>
      <Td>
        <RoomTypeContainer>
          {room_image ? (
            <img src={room_image} alt={roomType} className="w-16 h-16 rounded-lg object-cover" />
          ) : (
            <div className="w-16 h-16 rounded-lg bg-gray-300"></div> // Placeholder
          )}
          <RoomInfo>
            <RoomName>{roomType}</RoomName>
            <span className="text-sm text-gray-500 block">{roomInfo.description.split(' ').slice(0, 10).join(' ')}...</span>
            <MoreInfoButton onClick={() => setShowModal(true)}>
              <FontAwesomeIcon icon={faPlusSquare} className="mr-1" /> More Info
            </MoreInfoButton>
          </RoomInfo>
        </RoomTypeContainer>
      </Td>
      <Td className="flex items-center">
        <FontAwesomeIcon icon={faUser} className="text-lg" />
        <span className='text-xl mx-3'>x</span>
        {countOfGuests}
      </Td>
      <Td>₹{totalPrice.toFixed(2)}</Td>
      <Td>
        <Select onChange={(e) => onSelectChange(roomType, e.target.value, perNightPrice)} value={selectedRooms}>
          <Option value={0}>0</Option>
          {Array.from({ length: availableRooms }, (_, i) => (
            <Option key={i + 1} value={i + 1}>{i + 1}</Option>
          ))}
        </Select>
      </Td>
      <Td>
        <div className="flex flex-col items-start">
          <span className="font-bold">₹{pricePerRoomType?.total || 0}</span>
          <span className="text-xs text-gray-500">Incl. taxes ₹{pricePerRoomType?.taxes || 0}</span>
        </div>
      </Td>
      <MoreInfoModal 
        showModal={showModal} 
        onClose={() => setShowModal(false)} 
        roomType={roomType}
        room_image={room_image}
        roomDescription={roomInfo.description}
        amenities={roomInfo.amenities}
      />
    </Tr>
  );
};

export default BookingTable;

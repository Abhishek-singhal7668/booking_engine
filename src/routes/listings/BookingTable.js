import React, { useState, useMemo } from 'react';
import tw from 'tailwind-styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faPlusSquare } from '@fortawesome/free-solid-svg-icons';
import calculateRoomPrice from 'utils/calculateRoomPrice';
import MoreInfoModal from './MoreInfoModal';
import amenities from './amenities.json';

const Table = tw.table`
  w-[97%]
  border-collapse
  table-auto
  mx-auto
  my-6
`;

const Thead = tw.thead`
  text-left
  bg-white
  font-medium
  text-gray-500 
`;

const TBody = tw.tbody`
  divide-y 
  divide-gray-200 
`;

const Tr = tw.tr`
  border
  border-[#5bbaff]
  text-gray-700
`;

const Th = tw.th`
  px-6 
  py-3 
  text-start 
  text-sm 
  font-medium 
  text-gray-500
  uppercase 
  bg-[#4c76b2]
  text-[#fff]
`;

const Td = tw.td`
  border
  border-[#5bbaff]
  px-6 py-4 whitespace-nowrap font-medium text-gray-800
`;

const Select = tw.select`
  w-full
  border
  border-[#5bbaff]
  p-2
  text-gray-700
`;

const Option = tw.option`
  p-2
`;

const RoomName = tw.span`
  overflow-hidden
  whitespace-nowrap
  overflow-ellipsis
`;

const BookingTable = ({ roomData, onSelectAmountChange, total, taxes }) => {
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
              onSelectAmountChange={onSelectAmountChange}
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

const RoomInfoRow = ({ roomType, totalPrice, perNightPrice, availableRooms, onSelectAmountChange, total, taxes, countOfGuests, room_image, roomData }) => {
  const [selectedRooms, setSelectedRooms] = useState(0);
  const [showModal, setShowModal] = useState(false);

  const roomInfo = useMemo(() => {
    const room = amenities.find(item => item.room_type === roomType);
    return room ? { description: room.description, amenities: room.amenities } : { description: "", amenities: [] };
  }, [roomType]);
  
  const pricePerRoomType = useMemo(() => {
    return calculateRoomPrice(perNightPrice, selectedRooms, roomData[0].totaldays);
  }, [selectedRooms, perNightPrice, roomData]);

  const handleSelectChange = (value) => {
    setSelectedRooms(Number(value));
    onSelectAmountChange(value, perNightPrice, roomType);
  };

  return (
    <Tr className='hover:bg-gray-100'>
      <Td>
        <div className='flex items-center'>
          {room_image ? (
            <img src={room_image} alt={roomType} className="w-12 h-12 mr-2 rounded" />
          ) : (
            <div className="w-12 h-12 mr-2 rounded bg-gray-300"></div> // Placeholder
          )}
          <RoomName>{roomType}</RoomName>
          <button onClick={() => setShowModal(true)} className="ml-2 text-xs text-blue-500 hover:text-blue-700">
          <FontAwesomeIcon icon={faPlusSquare} className="ml-1" />  More Info 
          </button>
        </div>
      </Td>
      <Td>
        <FontAwesomeIcon icon={faUser} className="text-lg" />
        <span className='text-xl mx-3'>x</span>
        {countOfGuests}
      </Td>
      <Td>₹{totalPrice.toFixed(2)}</Td>
      <Td>
        <Select className="bg-blue-100 text-blue-700 border border-blue-300 rounded" onChange={(e) => handleSelectChange(e.target.value)}>
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
        roomDescription={roomInfo.description

        }
        amenities={roomInfo.amenities}
      />
    </Tr>
  );
};

export default BookingTable;

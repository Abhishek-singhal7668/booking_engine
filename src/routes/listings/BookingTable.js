import React from 'react';
import tw from 'tailwind-styled-components';
import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';
 
const Table = tw.table`
  w-[97%]
  border-collapse
  table-auto
  mx-auto
  my-6
`;
 
const Thead = tw.thead`
text-left // Align headers to the left
bg-white // White background
 // Smaller font size
font-medium // Slightly bolder font
text-gray-500 
`;
 
const TBody =tw.tbody`
divide-y 
divide-gray-200 
`
 
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
 
const BookingTable = ({ roomData, onSelectAmountChange, total, taxes }) => {
  return (
    <Table>
      <Thead>
        <Tr>
          <Th>Room Type</Th>
          <Th>Number of guests</Th>
          <Th>
            {roomData && roomData.length > 0 ? `Price for ${roomData[0].totaldays} Nights` : 'Price for Nights'}
          </Th>
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
            />
          ))
        )}
      </TBody>
    </Table>
  );
};
 
const RoomInfoRow = ({ roomType, totalPrice, perNightPrice, availableRooms, onSelectAmountChange, total, taxes,countOfGuests,room_image }) => {
  const [selectedRooms, setSelectedRooms] = useState(0);
 
  const handleSelectChange = (value) => {
    setSelectedRooms(value);
    onSelectAmountChange(value, perNightPrice, roomType);
  };
 console.log(room_image);
 console.log(roomType);
 
  return (
    <tr className='hover:bg-gray-100'>
      <Td>
        <div className='flex items-center'>
        {room_image ? (
            <img src={room_image} alt={roomType} className="w-12 h-12 mr-2 rounded" />
        ) : (
            <div className="w-12 h-12 mr-2 rounded bg-gray-300"></div> // Placeholder
        )}
        <span>{roomType}</span>
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
          <span className="font-bold">₹{total.toFixed(2)}</span>
          <span className="text-xs text-gray-500">Incl. taxes ₹{taxes.toFixed(2)
          }</span>
        </div>
      </Td>
    </tr>
  );
};
 
export default BookingTable;

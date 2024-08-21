// utils/checkGuestAccommodation.js

import { toast } from 'react-toastify';

const checkGuestAccommodation = (selectedRoomsState, numGuestsInputValue, roomTypeMaxOccupancy) => {
  let totalCapacity = 0;

  Object.entries(selectedRoomsState).forEach(([roomType, occupancyData]) => {
    Object.values(occupancyData).forEach(({ rooms }) => {
      totalCapacity += rooms * roomTypeMaxOccupancy[roomType];
    });
  });

  if (totalCapacity >= numGuestsInputValue) {
    return true;
  } else {
    toast.error(`Selected rooms cannot accommodate ${numGuestsInputValue} guests.`);
    return false;
  }
};

export default checkGuestAccommodation;

// utils/roomCombination.js
export const generateRoomCombinationsDFS = (roomCategories, numGuests, numRooms) => {
    const combinations = [];
  
    const dfs = (currentCombination, start, currentGuests, currentRooms) => {
      if (currentRooms === numRooms && currentGuests >= numGuests) {
        combinations.push([...currentCombination]);
        return;
      }
      if (currentRooms >= numRooms || currentGuests >= numGuests) {
        return;
      }
      for (let i = start; i < roomCategories.length; i++) {
        const category = roomCategories[i];
        if (category.number_of_avaiable_rooms > 0) { // Check if there are available rooms in this category
          for (const mealPlan of category.mealPlans) {
            const extraGuests = Math.max(0, (currentGuests + mealPlan.occupancy) - numGuests);
            const totalGuests = currentGuests + mealPlan.occupancy;
            const maxExtraGuests = mealPlan.max_occupancy - mealPlan.occupancy;
  
            if (totalGuests <= numGuests + maxExtraGuests * numRooms) {
              currentCombination.push({
                ...category,
                mealPlan,
                extraGuests: extraGuests,
                totalGuests: totalGuests,
              });
              category.number_of_avaiable_rooms--; // Decrement the available rooms
              dfs(currentCombination, i, totalGuests, currentRooms + 1);
              category.number_of_avaiable_rooms++; // Backtrack: increment the available rooms back
              currentCombination.pop();
            }
          }
        }
      }
    };
  
    dfs([], 0, 0, 0);
    return combinations;
  };
  
  export default generateRoomCombinationsDFS;
  
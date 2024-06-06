const calculateRoomPrice = (currentNightRate,numberOfRooms, numberOfDays) => {
    const pricePerNight = currentNightRate * numberOfRooms;
    const gstRate =
      pricePerNight <= 2500 ? 0.12 : pricePerNight > 7500 ? 0.18 : 0.12;
    const totalGst = (pricePerNight * numberOfDays * gstRate).toFixed(2);
    const totalPrice = (
      pricePerNight * numberOfDays +
      parseFloat(totalGst)
    ).toFixed(2);
    return { total: parseFloat(totalPrice), taxes: parseFloat(totalGst) };

  };

  export default calculateRoomPrice
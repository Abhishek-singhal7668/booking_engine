const calculateRoomPriceWithMealPlans = (room, selectedPlans = {}) => {
  const basePrice = room.totaldays; // Use total days directly as base price
  console.log("Base Price:", basePrice);

  const selectedPlanPrices = Object.keys(selectedPlans).map(planId => {
    const plan = room.mealPlans.find(plan => plan.rate_plan_name === planId);
    console.log("Plan:", plan);
    console.log("Plan Rate:", plan ? plan.rate : "N/A");
    console.log("Selected Plan Count:", selectedPlans[planId]);
    return plan ? { rate: plan.rate, count: selectedPlans[planId] } : { rate: 0, count: 0 };
  });

  console.log("Selected Plan Prices:", selectedPlanPrices); 

  const totalPlanPrice = selectedPlanPrices.reduce((total, { rate, count }) => total + (rate * count), 0);
  console.log("Total Plan Price:", totalPlanPrice);

  const totalPriceBeforeGst = basePrice * totalPlanPrice;
  console.log("Total Price before GST:", totalPriceBeforeGst);

  const totalGst = selectedPlanPrices.reduce((totalGst, { rate, count }) => {
    const gstRate = rate <= 2500 ? 0.12 : rate > 7500 ? 0.18 : 0.12;
    return totalGst + (rate * count * gstRate * basePrice); // Adjust GST calculation to multiply by total days
  }, 0);

  console.log("Total GST:", totalGst);

  const finalPrice = (totalPriceBeforeGst + totalGst).toFixed(2);
  console.log("Final Price:", finalPrice);

  return { total: parseFloat(finalPrice), taxes: parseFloat(totalGst.toFixed(2)) };
};

export default calculateRoomPriceWithMealPlans;

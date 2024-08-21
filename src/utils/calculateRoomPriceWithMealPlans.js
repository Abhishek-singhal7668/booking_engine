const calculateRoomPriceWithMealPlans = (room, selectedPlans = {},occupancy,isGst) => {
  const basePrice = 1 * room.totaldays;
  let p={};
  let check=1;
  const selectedPlanPrices = Object.keys(selectedPlans).map(planId => {
    const plan = room.mealPlans.find(plan => plan.rate_plan_name === planId);
    ;
    p=plan;check=selectedPlans[plan.rate_plan_name]<1?0:1;
    console.log("calculalte count",selectedPlans[plan.rate_plan_name]);

    return plan ? { rate: plan.rate, count: selectedPlans[planId] } : { rate: 0, count: 0 };
  });
   if(check) return {total:0,taxes:0};
  console.log(selectedPlans,occupancy,room.room_type,p);
  const totalPlanPrice = selectedPlanPrices.reduce((total, { rate, count }) => total + (rate * count), 0);
  const extra=(occupancy>p.occupancy)?(occupancy-p.occupancy)*p.extra_occupancy_charge:0;
  const totalPriceBeforeGst = basePrice * (totalPlanPrice+extra);

  let totalGst = selectedPlanPrices.reduce((totalGst, { rate, count }) => {
    const gstRate = rate <= 2500 ? 0.12 : rate > 7500 ? 0.18 : 0.12;
    return totalGst * room.totaldays + (rate * count * gstRate);
  }, 0);
 totalGst=(isGst===false)?0:totalGst;
 console.log("calculate",totalGst);
  const finalPrice = (totalPriceBeforeGst + totalGst).toFixed(2);
 
  return { total: parseFloat(finalPrice), taxes: parseFloat(totalGst.toFixed(2))};
};

export default calculateRoomPriceWithMealPlans;

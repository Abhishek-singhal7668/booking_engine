import React, { useState, useEffect } from 'react';
import { Modal, Row, Col, Typography, Space, Divider, Select } from 'antd';
import tw from 'tailwind-styled-components';

const { Title, Text } = Typography;
const { Option } = Select;

const StyledModal = tw(Modal)`
  top-5
  rounded-lg
   w-full max-w-md mx-auto
`;

const ModalTitle = tw(Title)`
  text-center
  text-[#003580]
  mb-4
`;

const DividerStyled = tw(Divider)`
  border-gray-300
  mb-4
`;

const MealPlanRow = tw(Row)`
  items-center
  space-y-4
  mb-4
`;

const LabelCol = tw(Col)`
  text-left
  pl-2
`;

const SelectCol = tw(Col)`
  text-right
`;

const RoomSelectionModal = ({ open, onClose, onConfirm, roomType, availableRooms, mealPlans = [] ,selectedOccupancy}) => {
  const [selectedPlans, setSelectedPlans] = useState({});
  const [remainingRooms, setRemainingRooms] = useState(availableRooms);

  useEffect(() => {
    const storedPlans = JSON.parse(localStorage.getItem(`selectedPlans-${roomType}`)) || {};
    const initialPlans = mealPlans.reduce((acc, plan) => {
      acc[plan.rate_plan_name] = storedPlans[plan.rate_plan_name] || 0;
      return acc;
    }, {});
    setSelectedPlans(initialPlans);
  }, [mealPlans, roomType]);

  useEffect(() => {
    const totalSelectedRooms = Object.values(selectedPlans).reduce((sum, num) => sum + num, 0);
    setRemainingRooms(availableRooms - totalSelectedRooms);
  }, [selectedPlans, availableRooms]);

  const handleConfirm = () => {
    localStorage.setItem(`selectedPlans-${roomType}`, JSON.stringify(selectedPlans));
    onConfirm(selectedPlans);
    onClose();
  };

  const handleSelectChange = (plan, value) => {
    setSelectedPlans(prev => {
      const newSelectedPlans = { ...prev, [plan]: value };
      return newSelectedPlans;
    });
  };
  const modifiedMealPlans = mealPlans.map(plan => ({
    ...plan,
    rate: plan.rate + Math.max(0, selectedOccupancy - plan.occupancy) * plan.extra_occupancy_charge
  }));
  const renderMealPlanRow = (label, value, setter, rate, stdOccupancy, extraCharge, maxOccupancy) => {
    const maxRooms = Math.max(availableRooms - Object.values(selectedPlans).reduce((sum, num) => sum + num, 0) + value, 0);
    const options = Array.from({ length: maxRooms + 1 }, (_, i) => i);

    return (
      <MealPlanRow gutter={[16, 16]} key={label}>
        <LabelCol span={18}>
          <Text strong>{label} - ₹{rate}</Text>
          <div style={{ marginTop: '4px', padding: '8px', backgroundColor: '#f0f4f8', borderRadius: '4px', border: '1px solid #d9d9d9' }}>
            {stdOccupancy !== maxOccupancy ? (
              <Text type="secondary" className="text-xs">
                <span style={{ color: '#555' }}>Note: Extra Person above {stdOccupancy} in a room will be charged extra ₹{extraCharge}/person. This room can have maximum occupancy of {maxOccupancy}</span>
              </Text>
            ) : (
              <Text type="secondary" className="text-xs">
                <span style={{ color: '#555' }}>Note: This room can have a maximum occupancy of {maxOccupancy}</span>
              </Text>
            )}
          </div>
        </LabelCol>
        <SelectCol span={6}>
          <Select style={{ width: '100%' }} value={value} onChange={(val) => setter(label, val)}>
            {options.map(num => (
              <Option key={num} value={num}>{num} {num > stdOccupancy ? `(+₹${extraCharge * (num - stdOccupancy)})` : ''}</Option>
            ))}
          </Select>
        </SelectCol>
      </MealPlanRow>
    );

  };

  const renderSelectedPlansSummary = () => (
    <div className="p-4 bg-gray-100 rounded-md">
      <Text strong>Selected Meal Plans:</Text>
      {Object.entries(selectedPlans).map(([plan, count]) => (
        count > 0 && (
          <div key={plan} className="flex justify-between mt-2">
            <Text>{plan}:</Text>
            <Text>{count}</Text>
          </div>
        )
      ))}
    </div>
  );

  return (
    <StyledModal
      open={open}
      onCancel={onClose}
      onOk={handleConfirm}
      okText="Confirm"
      cancelText="Cancel"
      okButtonProps={{ className: 'bg-[#003580] border-[#003580] text-white' }}
      cancelButtonProps={{ className: 'border-[#003580] text-[#003580]' }}
    >
      <Space direction="vertical" size="large" className="w-full p-5">
        <ModalTitle level={3}>Choose Your Options</ModalTitle>
        <DividerStyled />
        <Space direction="vertical" size="middle" className="w-full">
          {modifiedMealPlans.length > 0 ? (
            mealPlans.map(plan => (
              renderMealPlanRow(
                plan.rate_plan_name, 
                selectedPlans[plan.rate_plan_name], 
                handleSelectChange,
                plan.rate,
                plan.occupancy,
                plan.extra_occupancy_charge,
                plan.max_occupancy
              )
            ))
          ) : (
            <Text>No meal plans available</Text>
          )}
        </Space>
        <DividerStyled />
        {renderSelectedPlansSummary()}
      </Space>
    </StyledModal>
  );
};

export default RoomSelectionModal;

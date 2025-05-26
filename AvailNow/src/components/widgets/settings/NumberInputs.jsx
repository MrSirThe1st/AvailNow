import React from "react";

const NumberInputs = ({ showDays, onNumberChange }) => {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">Days to Show</label>
      <select
        value={showDays}
        onChange={(e) => onNumberChange("showDays", parseInt(e.target.value))}
        className="w-full border rounded-md p-2 text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
      >
        <option value="3">3 days</option>
        <option value="5">5 days</option>
        <option value="7">7 days</option>
        <option value="14">14 days</option>
      </select>
    </div>
  );
};

export default NumberInputs;

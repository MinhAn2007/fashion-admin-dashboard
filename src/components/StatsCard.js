import React from "react";

const StatsCard = ({ title, value, color }) => {
  return (
    <div className={`p-4 rounded-lg shadow-md w-full md:w-1/5 ${color}`}>
      <h2 className="text-gray-600">{title}</h2>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
};

export default StatsCard;

import React from "react";
import StatsCard from "./StatsCard";
import Chart from "./Chart";

const Dashboard = () => {
  return (
    <div className="p-6 flex flex-col space-y-6">
      <div className="flex flex-wrap space-x-4 gap-10">
        <StatsCard title="Total Sales" value="12,000₫" color="bg-blue-100" />
        <StatsCard title="Products Sold" value="1,200" color="bg-green-100" />
        <StatsCard title="New Customers" value="300" color="bg-yellow-100" />
        <StatsCard title="Total Orders" value="800" color="bg-red-100" />
      </div>
      <Chart />
    </div>
  );
}

export default Dashboard;

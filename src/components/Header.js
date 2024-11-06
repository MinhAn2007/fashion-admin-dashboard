import React from 'react';
import { FiBell } from 'react-icons/fi';

const Header = () => {
  return (
    <div className="bg-white p-4 flex justify-between items-center shadow-md">
      <h1 className="text-xl font-semibold">Dashboard</h1>
      <FiBell className="text-xl text-gray-600" />
    </div>
  );
}

export default Header;
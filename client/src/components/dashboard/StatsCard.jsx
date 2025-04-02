import React from 'react';

const StatsCard = ({ title, value, icon, change, changeType }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm">{title}</p>
          <h3 className="text-2xl font-bold">{value}</h3>
          {change && (
            <p className={`text-sm ${changeType === 'increase' ? 'text-green-500' : 'text-red-500'}`}>
              {changeType === 'increase' ? '↑' : '↓'} {change}
            </p>
          )}
        </div>
        <div className="text-blue-500 text-2xl">{icon}</div>
      </div>
    </div>
  );
};

export default StatsCard;
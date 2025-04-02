import React from 'react';

const LineChart = ({ data, title }) => {
  // In a real implementation, you would use a charting library like Chart.js or Recharts
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-medium mb-4">{title}</h3>
      <div className="h-64 flex items-center justify-center bg-gray-100 rounded">
        <p className="text-gray-500">Line Chart Placeholder</p>
        {/* You would render your actual chart here */}
      </div>
    </div>
  );
};

export default LineChart;
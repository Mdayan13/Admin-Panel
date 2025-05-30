import React from 'react';

const Loading = () => {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div role="progressbar" aria-busy="true" className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500">
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  );
};

export default Loading;
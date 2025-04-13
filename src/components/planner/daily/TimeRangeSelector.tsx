
import React from 'react';

interface TimeRangeSelectorProps {
  displayRange: 'all' | 'morning' | 'afternoon' | 'evening';
  onRangeChange: (range: 'all' | 'morning' | 'afternoon' | 'evening') => void;
}

const TimeRangeSelector: React.FC<TimeRangeSelectorProps> = ({
  displayRange,
  onRangeChange
}) => {
  const ranges = ['all', 'morning', 'afternoon', 'evening'] as const;
  
  return (
    <div className="flex items-center justify-between mb-4 space-x-2">
      {ranges.map(range => (
        <button 
          key={range} 
          onClick={() => onRangeChange(range)} 
          className={`flex-1 py-2 px-1 rounded-md text-sm transition-colors ${
            displayRange === range 
              ? 'bg-purple-600/20 text-purple-300 border border-purple-600/30' 
              : 'bg-gray-800/40 hover:bg-gray-800/60'
          }`}
        >
          {range.charAt(0).toUpperCase() + range.slice(1)}
        </button>
      ))}
    </div>
  );
};

export default TimeRangeSelector;

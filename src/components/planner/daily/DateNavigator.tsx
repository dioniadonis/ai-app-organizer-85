
import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface DateNavigatorProps {
  formattedDate: string;
  onPreviousDay: () => void;
  onNextDay: () => void;
}

const DateNavigator: React.FC<DateNavigatorProps> = ({
  formattedDate,
  onPreviousDay,
  onNextDay
}) => {
  return (
    <div className="flex items-center justify-between mb-4 py-2 bg-gray-800/30 rounded-lg relative h-12 my-[10px] px-0 mx-0">
      <button 
        onClick={onPreviousDay} 
        className="hover:bg-gray-800 p-2 rounded-full transition-colors absolute left-2 z-10"
      >
        <ChevronLeft size={20} className="text-blue-400" />
      </button>
      
      <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full text-center">
        <span className="text-lg font-medium text-white">{formattedDate}</span>
      </div>
      
      <button 
        onClick={onNextDay} 
        className="hover:bg-gray-800 p-2 rounded-full transition-colors absolute right-2 z-10"
      >
        <ChevronRight size={20} className="text-blue-400" />
      </button>
    </div>
  );
};

export default DateNavigator;

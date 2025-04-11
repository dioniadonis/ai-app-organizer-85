
import React from 'react';
import { format, isToday, isTomorrow } from 'date-fns';
import { ChevronLeft, ChevronRight, CalendarCheck } from 'lucide-react';

interface DateNavigationProps {
  currentDate: Date;
  handlePreviousDay: () => void;
  handleNextDay: () => void;
  setShowCalendarModal: (show: boolean) => void;
}

const DateNavigation: React.FC<DateNavigationProps> = ({
  currentDate,
  handlePreviousDay,
  handleNextDay,
  setShowCalendarModal
}) => {
  const formattedDate = format(currentDate, 'MMMM d, yyyy');
  const dayName = format(currentDate, 'EEEE');
  
  const dateLabel = isToday(currentDate) 
    ? 'Today' 
    : isTomorrow(currentDate) 
      ? 'Tomorrow' 
      : dayName;

  return (
    <>
      <div className="flex items-center justify-between mb-4 py-2">
        <div className="flex flex-col items-center w-full">
          <button 
            onClick={() => setShowCalendarModal(true)}
            className="flex items-center gap-2 text-2xl font-bold text-white hover:text-blue-300 transition-colors"
          >
            <CalendarCheck className="h-6 w-6 text-purple-400" />
            <span className="text-green-400">{dateLabel}</span>
          </button>
          <div className="text-lg font-medium text-center text-blue-400">
            {formattedDate}
          </div>
        </div>
      </div>
      
      <div className="flex items-center justify-between mb-4 px-4 py-2 bg-gray-800/30 rounded-lg">
        <button 
          onClick={handlePreviousDay}
          className="hover:bg-gray-800 p-2 rounded-full transition-colors"
        >
          <ChevronLeft size={20} className="text-blue-400" />
        </button>
        
        <button 
          onClick={() => setShowCalendarModal(true)}
          className="text-lg font-medium text-white hover:text-blue-300 transition-colors"
        >
          <span className="sr-only">{formattedDate}</span>
        </button>
        
        <button 
          onClick={handleNextDay}
          className="hover:bg-gray-800 p-2 rounded-full transition-colors"
        >
          <ChevronRight size={20} className="text-blue-400" />
        </button>
      </div>
    </>
  );
};

export default DateNavigation;

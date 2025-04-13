
import React from 'react';
import { format, isToday, isTomorrow } from 'date-fns';
import { ChevronLeft, ChevronRight, CalendarCheck, Settings, Copy, Trash2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DailyTasksHeaderProps {
  currentDate: Date;
  onPreviousDay: () => void;
  onNextDay: () => void;
  onOpenCalendar: () => void;
  onOpenSettings: () => void;
  onOpenCopyModal: () => void;
  onClearTasks: () => void;
  onAddTask: () => void;
}

const DailyTasksHeader: React.FC<DailyTasksHeaderProps> = ({
  currentDate,
  onPreviousDay,
  onNextDay,
  onOpenCalendar,
  onOpenSettings,
  onOpenCopyModal,
  onClearTasks,
  onAddTask
}) => {
  const formattedDate = format(currentDate, 'MMMM d, yyyy');
  const dayName = format(currentDate, 'EEEE');
  const dateLabel = isToday(currentDate) ? 'Today' : isTomorrow(currentDate) ? 'Tomorrow' : dayName;

  return (
    <>
      <div className="flex items-center justify-between mb-4 my-0 px-px mx-0 py-[3px]">
        <button className="rounded-md p-2 hover:bg-gray-800 transition-colors">
          {/* Home button placeholder */}
        </button>
        
        <div className="flex items-center absolute left-1/2 transform -translate-x-1/2 text-white">
          <div className="flex flex-col items-center">
            <button onClick={onOpenCalendar} className="flex items-center gap-2 text-2xl font-bold transition-colors">
              <CalendarCheck className="h-6 w-6 text-blue-400" />
              {dateLabel}
            </button>
          </div>
        </div>
        
        <div className="flex gap-1">
          <button onClick={onOpenSettings} className="rounded-md p-2 hover:bg-gray-800 transition-colors">
            <Settings size={20} className="text-blue-400" />
          </button>
          
          <button onClick={onOpenCopyModal} className="rounded-md p-2 hover:bg-gray-800 transition-colors">
            <Copy size={20} className="text-blue-400" />
          </button>
          
          <button onClick={onClearTasks} className="rounded-md p-2 hover:bg-gray-800 transition-colors">
            <Trash2 size={20} className="text-red-400" />
          </button>
          
          <button onClick={onAddTask} className="rounded-md p-2 hover:bg-gray-800 transition-colors">
            <Plus size={20} className="text-blue-400" />
          </button>
        </div>
      </div>
      
      <div className="flex items-center justify-between mb-4 py-2 bg-gray-800/30 rounded-lg relative h-12 my-[10px] px-0 mx-0">
        <button onClick={onPreviousDay} className="hover:bg-gray-800 p-2 rounded-full transition-colors absolute left-2 z-10">
          <ChevronLeft size={20} className="text-blue-400" />
        </button>
        
        <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full text-center">
          <button 
            onClick={onOpenCalendar} 
            className="text-lg font-medium text-white hover:text-blue-300 transition-colors cursor-pointer"
          >
            {formattedDate}
          </button>
        </div>
        
        <button onClick={onNextDay} className="hover:bg-gray-800 p-2 rounded-full transition-colors absolute right-2 z-10">
          <ChevronRight size={20} className="text-blue-400" />
        </button>
      </div>
    </>
  );
};

export default DailyTasksHeader;

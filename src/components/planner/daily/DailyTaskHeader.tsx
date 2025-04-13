
import React from 'react';
import { Home, CalendarCheck, Settings, Copy, Trash2, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface DailyTaskHeaderProps {
  dateLabel: string;
  openCalendarModal: () => void;
  openSettingsModal: () => void;
  openCopyModal: () => void;
  clearTasks: () => void;
  addNewTask: (e: React.MouseEvent) => void;
  isMobile: boolean;
}

const DailyTaskHeader: React.FC<DailyTaskHeaderProps> = ({
  dateLabel,
  openCalendarModal,
  openSettingsModal,
  openCopyModal,
  clearTasks,
  addNewTask,
  isMobile
}) => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between mb-4 my-0 px-px mx-0 py-[3px]">
      <button 
        onClick={() => navigate('/')} 
        className="rounded-md p-2 hover:bg-gray-800 transition-colors"
      >
        <Home size={24} className="text-blue-400" />
      </button>
      
      <div className="flex items-center absolute left-1/2 transform -translate-x-1/2 text-white">
        <div className="flex flex-col items-center">
          <button 
            onClick={openCalendarModal} 
            className="flex items-center gap-2 text-2xl font-bold transition-colors"
          >
            <CalendarCheck className="h-6 w-6 text-blue-400" />
            {dateLabel}
          </button>
        </div>
      </div>
      
      <div className="flex gap-1">
        <button 
          onClick={openSettingsModal} 
          className="rounded-md p-2 hover:bg-gray-800 transition-colors"
        >
          <Settings size={20} className="text-blue-400" />
        </button>
        
        <button 
          onClick={openCopyModal} 
          className="rounded-md p-2 hover:bg-gray-800 transition-colors"
        >
          <Copy size={20} className="text-blue-400" />
        </button>
        
        <button 
          onClick={clearTasks} 
          className="rounded-md p-2 hover:bg-gray-800 transition-colors"
        >
          <Trash2 size={20} className="text-red-400" />
        </button>
        
        <button 
          onClick={addNewTask} 
          className="rounded-md p-2 hover:bg-gray-800 transition-colors"
        >
          <Plus size={20} className="text-blue-400" />
        </button>
      </div>
    </div>
  );
};

export default DailyTaskHeader;

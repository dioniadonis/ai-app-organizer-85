
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
    <div className="flex flex-col mb-4 my-0 px-px mx-0 py-[3px]">
      <div className="flex items-center justify-between">
        <button onClick={() => navigate('/')} className="rounded-md p-2 hover:bg-gray-800 transition-colors">
          <Home size={24} className="text-blue-400" />
        </button>
        
        <div className="flex gap-1">
          <button onClick={openSettingsModal} className="rounded-md p-2 hover:bg-gray-800 transition-colors">
            <Settings size={20} className="text-blue-400" />
          </button>
          
          <button onClick={openCopyModal} className="rounded-md p-2 hover:bg-gray-800 transition-colors">
            <Copy size={20} className="text-blue-400" />
          </button>
          
          <button onClick={clearTasks} className="rounded-md p-2 hover:bg-gray-800 transition-colors">
            <Trash2 size={20} className="text-red-400" />
          </button>
          
          <button onClick={addNewTask} className="rounded-md p-2 hover:bg-gray-800 transition-colors">
            <Plus size={20} className="text-green-400" />
          </button>
        </div>
      </div>
      
      {/* Move date label to its own row */}
      <div className="flex justify-center mt-2">
        <button onClick={openCalendarModal} className="flex items-center gap-2 text-xl font-bold transition-colors">
          <CalendarCheck className="h-5 w-5 text-blue-400" />
          {dateLabel}
        </button>
      </div>
    </div>
  );
};

export default DailyTaskHeader;

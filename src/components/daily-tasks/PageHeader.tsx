
import React from 'react';
import { Home, Settings, Copy, Trash2, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { format } from 'date-fns';

interface PageHeaderProps {
  currentDate: Date;
  navigate: ReturnType<typeof useNavigate>;
  showClearWarning: boolean;
  handleClearTasks: () => void;
  setShowSettingsModal: (show: boolean) => void;
  setShowCopyModal: (show: boolean) => void;
  setShowAddModal: (show: boolean) => void;
  setSelectedTask: (task: any) => void;
  setEditingTaskId: (id: number | null) => void;
  setNewTaskName: (name: string) => void;
  setNewTaskTime: (time: string) => void;
  setNewTaskCategory: (category: string) => void;
  setNewTaskColor: (color: string) => void;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  currentDate,
  navigate,
  showClearWarning,
  handleClearTasks,
  setShowSettingsModal,
  setShowCopyModal,
  setShowAddModal,
  setSelectedTask,
  setEditingTaskId,
  setNewTaskName,
  setNewTaskTime,
  setNewTaskCategory,
  setNewTaskColor
}) => {
  const formattedDate = format(currentDate, 'MMMM d, yyyy');

  return (
    <div className="flex items-center justify-between mb-4 py-2">
      <button 
        onClick={() => navigate('/')} 
        className="rounded-md p-2 hover:bg-gray-800 transition-colors"
      >
        <Home size={24} className="text-blue-400" />
      </button>
      
      <div className="flex gap-1">
        <button
          onClick={() => setShowSettingsModal(true)}
          className="rounded-md p-2 hover:bg-gray-800 transition-colors"
        >
          <Settings size={20} className="text-blue-400" />
        </button>
        
        <button
          onClick={() => setShowCopyModal(true)}
          className="rounded-md p-2 hover:bg-gray-800 transition-colors"
        >
          <Copy size={20} className="text-blue-400" />
        </button>
        
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button
              className="rounded-md p-2 hover:bg-gray-800 transition-colors"
            >
              <Trash2 size={20} className="text-red-400" />
            </button>
          </AlertDialogTrigger>
          {showClearWarning && (
            <AlertDialogContent className="bg-gray-800 border-gray-700">
              <AlertDialogHeader>
                <AlertDialogTitle>Clear all tasks?</AlertDialogTitle>
                <AlertDialogDescription className="text-gray-400">
                  This will remove all tasks for {formattedDate}. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="bg-gray-700 border-gray-600 text-gray-300">Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  className="bg-red-600 hover:bg-red-700 text-white"
                  onClick={handleClearTasks}
                >
                  Clear Tasks
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          )}
          {!showClearWarning && (
            <AlertDialogContent className="bg-gray-800 border-gray-700">
              <AlertDialogHeader>
                <AlertDialogTitle>Clearing tasks</AlertDialogTitle>
                <AlertDialogDescription className="text-gray-400">
                  Clearing all tasks for {formattedDate}...
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogAction 
                  className="bg-red-600 hover:bg-red-700 text-white"
                  onClick={handleClearTasks}
                >
                  Clear Tasks
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          )}
        </AlertDialog>
        
        <button
          onClick={(e) => {
            e.stopPropagation();
            setSelectedTask(null);
            setEditingTaskId(null);
            setNewTaskName('');
            setNewTaskTime('');
            setNewTaskCategory('Personal');
            setNewTaskColor('#9b87f5');
            setShowAddModal(true);
          }}
          className="rounded-md p-2 hover:bg-gray-800 transition-colors"
        >
          <Plus size={20} className="text-blue-400" />
        </button>
      </div>
    </div>
  );
};

export default PageHeader;

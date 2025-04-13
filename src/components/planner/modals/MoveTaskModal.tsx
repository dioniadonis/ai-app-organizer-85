
import React from 'react';
import { format } from 'date-fns';
import { Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { DatePicker } from '@/components/ui/date-picker';
import { DailyTask } from '../types';
import { Switch } from '@/components/ui/switch';

interface MoveTaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedTask: DailyTask | null;
  moveToDate: Date | undefined;
  setMoveToDate: (date: Date | undefined) => void;
  onMoveTask: () => void;
  currentDate: Date;
  showMoveWarning: boolean;
  setShowMoveWarning: (show: boolean) => void;
}

const MoveTaskModal: React.FC<MoveTaskModalProps> = ({
  open,
  onOpenChange,
  selectedTask,
  moveToDate,
  setMoveToDate,
  onMoveTask,
  currentDate,
  showMoveWarning,
  setShowMoveWarning
}) => {
  const [dontShowAgain, setDontShowAgain] = React.useState(false);

  const handleMove = () => {
    if (dontShowAgain) {
      setShowMoveWarning(false);
    }
    onMoveTask();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-800 border-gray-700 sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Move Task to Another Date</DialogTitle>
          <DialogDescription className="text-gray-400">
            Choose which date to move this task to
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <div className="grid gap-4">
            <div className="bg-gray-700/40 p-3 rounded-md">
              <p className="font-medium">{selectedTask?.name}</p>
              {selectedTask?.timeOfDay && (
                <p className="text-sm text-gray-400 flex items-center mt-1">
                  <Clock className="h-3 w-3 mr-1" />
                  {selectedTask.timeOfDay}
                </p>
              )}
            </div>
            
            {showMoveWarning && (
              <div className="bg-amber-900/20 border border-amber-700/30 p-3 rounded-md text-amber-300 text-sm">
                <p className="font-medium">Warning: This task will be removed from {format(currentDate, 'MMMM d, yyyy')}</p>
                <div className="flex items-center mt-2">
                  <Switch id="dontShow" checked={dontShowAgain} onCheckedChange={setDontShowAgain} />
                  <label htmlFor="dontShow" className="ml-2 text-xs">Don't show this warning again</label>
                </div>
              </div>
            )}
            
            <div className="grid gap-2">
              <label className="text-sm font-medium text-gray-200">
                Select Date to Move To
              </label>
              <DatePicker 
                date={moveToDate} 
                onDateChange={setMoveToDate} 
                disabled={false} 
                className="border-gray-600" 
              />
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)} 
            className="border-gray-600 text-gray-300"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleMove} 
            className="bg-purple-600 hover:bg-purple-700" 
            disabled={!moveToDate}
          >
            Move Task
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MoveTaskModal;

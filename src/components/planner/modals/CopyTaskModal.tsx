
import React from 'react';
import { format } from 'date-fns';
import { Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { DatePicker } from '@/components/ui/date-picker';
import { DailyTask } from '../types';

interface CopyTaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedTask: DailyTask | null;
  copyToDate: Date | undefined;
  setCopyToDate: (date: Date | undefined) => void;
  onCopyTask: () => void;
}

const CopyTaskModal: React.FC<CopyTaskModalProps> = ({
  open,
  onOpenChange,
  selectedTask,
  copyToDate,
  setCopyToDate,
  onCopyTask
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-800 border-gray-700 sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Copy Task to Another Date</DialogTitle>
          <DialogDescription className="text-gray-400">
            Choose which date to copy this task to
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
            
            <div className="grid gap-2">
              <label className="text-sm font-medium text-gray-200">
                Select Date to Copy To
              </label>
              <DatePicker 
                date={copyToDate} 
                onDateChange={setCopyToDate} 
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
            onClick={onCopyTask} 
            className="bg-purple-600 hover:bg-purple-700" 
            disabled={!copyToDate}
          >
            Copy Task
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CopyTaskModal;

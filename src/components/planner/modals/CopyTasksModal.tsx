
import React from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { DatePicker } from '@/components/ui/date-picker';

interface CopyTasksModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  copyToDate: Date | undefined;
  setCopyToDate: (date: Date | undefined) => void;
  onCopyTasks: () => void;
  currentDate: Date;
}

const CopyTasksModal: React.FC<CopyTasksModalProps> = ({
  open,
  onOpenChange,
  copyToDate,
  setCopyToDate,
  onCopyTasks,
  currentDate
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-800 border-gray-700 sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Copy Tasks</DialogTitle>
          <DialogDescription className="text-gray-400">
            Copy current tasks from {format(currentDate, 'MMMM d, yyyy')} to another date
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <div className="grid gap-2">
            <label className="text-sm font-medium text-gray-200">
              Select Target Date
            </label>
            <DatePicker 
              date={copyToDate} 
              onDateChange={setCopyToDate} 
              disabled={false} 
              className="border-gray-600" 
            />
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
            onClick={onCopyTasks} 
            className="bg-purple-600 hover:bg-purple-700" 
            disabled={!copyToDate}
          >
            Copy Tasks
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CopyTasksModal;

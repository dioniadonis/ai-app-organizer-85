
import React from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

interface ClearTasksModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClearTasks: () => void;
  currentDate: Date;
}

const ClearTasksModal: React.FC<ClearTasksModalProps> = ({
  open,
  onOpenChange,
  onClearTasks,
  currentDate
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-800 border-gray-700 sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Clear All Tasks</DialogTitle>
          <DialogDescription className="text-gray-400">
            Are you sure you want to clear all tasks for {format(currentDate, 'MMMM d, yyyy')}? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        
        <DialogFooter className="gap-2">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)} 
            className="border-gray-600 text-gray-300"
          >
            Cancel
          </Button>
          <Button 
            onClick={onClearTasks} 
            className="bg-red-600 hover:bg-red-700"
          >
            Clear Tasks
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ClearTasksModal;

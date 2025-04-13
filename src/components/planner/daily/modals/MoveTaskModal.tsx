
import React from 'react';
import { DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { DatePicker } from '@/components/ui/date-picker';

interface MoveTaskModalProps {
  date: Date | undefined;
  onDateChange: (date: Date) => void;
  onCancel: () => void;
  onMove: () => void;
}

const MoveTaskModal: React.FC<MoveTaskModalProps> = ({
  date,
  onDateChange,
  onCancel,
  onMove
}) => {
  return (
    <DialogContent className="bg-gray-800 border-gray-700 text-white">
      <DialogHeader>
        <DialogTitle>Move Task</DialogTitle>
        <DialogDescription className="text-gray-400">
          Move this task to another date
        </DialogDescription>
      </DialogHeader>
      
      <div className="py-4">
        <Label>Select target date</Label>
        <div className="mt-2">
          <DatePicker
            date={date}
            onDateChange={onDateChange}
          />
        </div>
      </div>
      
      <DialogFooter>
        <Button 
          variant="outline" 
          onClick={onCancel}
          className="border-gray-600 text-gray-300"
        >
          Cancel
        </Button>
        <Button 
          onClick={onMove}
          className="bg-purple-600 hover:bg-purple-700"
          disabled={!date}
        >
          Move Task
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};

export default MoveTaskModal;

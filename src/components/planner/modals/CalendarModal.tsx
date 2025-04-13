
import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { DatePicker } from '@/components/ui/date-picker';

interface CalendarModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentDate: Date;
  onDateSelect: (date: Date) => void;
}

const CalendarModal: React.FC<CalendarModalProps> = ({
  open,
  onOpenChange,
  currentDate,
  onDateSelect
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-800 border-gray-700 sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Select Date</DialogTitle>
          <DialogDescription className="text-gray-400">
            Choose a date to view tasks
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <DatePicker 
            date={currentDate} 
            onDateChange={date => {
              if (date) {
                onDateSelect(date);
                onOpenChange(false);
              }
            }} 
            disabled={false} 
            className="border-gray-600" 
          />
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)} 
            className="border-gray-600 text-gray-300"
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CalendarModal;

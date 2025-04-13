
import React from 'react';
import { DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';

interface CalendarModalProps {
  date: Date;
  onDateChange: (date: Date) => void;
  onClose: () => void;
}

const CalendarModal: React.FC<CalendarModalProps> = ({
  date,
  onDateChange,
  onClose
}) => {
  return (
    <DialogContent className="bg-gray-800 border-gray-700 text-white">
      <DialogHeader>
        <DialogTitle>Select Date</DialogTitle>
      </DialogHeader>
      
      <div className="py-4">
        <DatePicker
          date={date}
          onDateChange={onDateChange}
        />
      </div>
      
      <DialogFooter>
        <Button 
          onClick={onClose}
          className="bg-purple-600 hover:bg-purple-700"
        >
          Done
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};

export default CalendarModal;


import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import TimeInput from '@/components/TimeInput';

interface ReminderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reminderTime: string;
  setReminderTime: (time: string) => void;
  onSaveReminder: () => void;
}

const ReminderModal: React.FC<ReminderModalProps> = ({
  open,
  onOpenChange,
  reminderTime,
  setReminderTime,
  onSaveReminder
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-800 border-gray-700 sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Set Reminder</DialogTitle>
          <DialogDescription className="text-gray-400">
            When do you want to be reminded about this task?
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="grid gap-2">
            <label className="text-sm font-medium text-gray-200">
              Time of Day
            </label>
            <TimeInput value={reminderTime} onChange={setReminderTime} label="Time" />
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
            onClick={onSaveReminder} 
            className="bg-purple-600 hover:bg-purple-700"
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReminderModal;

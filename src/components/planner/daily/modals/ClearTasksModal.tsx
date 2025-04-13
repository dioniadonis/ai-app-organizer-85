
import React from 'react';
import { DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

interface ClearTasksModalProps {
  date: string;
  showWarning: boolean;
  onShowWarningChange: (show: boolean) => void;
  onCancel: () => void;
  onClear: () => void;
}

const ClearTasksModal: React.FC<ClearTasksModalProps> = ({
  date,
  showWarning,
  onShowWarningChange,
  onCancel,
  onClear
}) => {
  return (
    <DialogContent className="bg-gray-800 border-gray-700 text-white">
      <DialogHeader>
        <DialogTitle>Clear All Tasks</DialogTitle>
        <DialogDescription className="text-gray-400">
          Are you sure you want to clear all tasks for {date}?
        </DialogDescription>
      </DialogHeader>
      
      <div className="py-2">
        <p className="text-gray-300">This action cannot be undone.</p>
      </div>
      
      <div className="flex items-center py-2">
        <Switch 
          id="disable-warning"
          checked={!showWarning} 
          onCheckedChange={(checked) => onShowWarningChange(!checked)}
        />
        <Label htmlFor="disable-warning" className="ml-2">
          Don't ask me again
        </Label>
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
          onClick={onClear}
          className="bg-red-600 hover:bg-red-700"
        >
          Clear Tasks
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};

export default ClearTasksModal;

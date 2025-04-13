
import React from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { TimeIncrementOption } from '../types';

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  timeIncrement: number;
  handleTimeIncrementChange: (value: number) => void;
  timeIncrementOptions: TimeIncrementOption[];
  showMoveWarning: boolean;
  setShowMoveWarning: (show: boolean) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
  open,
  onOpenChange,
  timeIncrement,
  handleTimeIncrementChange,
  timeIncrementOptions,
  showMoveWarning,
  setShowMoveWarning
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-800 border-gray-700 sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription className="text-gray-400">
            Customize your daily tasks view
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="grid gap-2">
            <label className="text-sm font-medium text-gray-200">
              Time Increment
            </label>
            <div className="grid grid-cols-3 gap-2">
              {timeIncrementOptions.map(option => (
                <Button 
                  key={option.value} 
                  variant={timeIncrement === option.value ? "default" : "outline"} 
                  className={timeIncrement === option.value ? "bg-purple-600 hover:bg-purple-700" : "border-gray-600 text-gray-300"} 
                  onClick={() => handleTimeIncrementChange(option.value)}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-200">
              Show Clear Tasks Warning
            </label>
            <Switch checked={showMoveWarning} onCheckedChange={setShowMoveWarning} />
          </div>
          
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-200">
              Show Move Task Warning
            </label>
            <Switch checked={showMoveWarning} onCheckedChange={setShowMoveWarning} />
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)} 
            className="border-gray-600 text-gray-300"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsModal;

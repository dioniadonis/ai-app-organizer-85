
import React from 'react';
import { DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

interface TimeIncrementOption {
  label: string;
  value: number;
}

interface SettingsModalProps {
  timeIncrement: number;
  timeIncrementOptions: TimeIncrementOption[];
  showClearTaskWarning: boolean;
  onTimeIncrementChange: (value: number) => void;
  onClearTaskWarningChange: (value: boolean) => void;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
  timeIncrement,
  timeIncrementOptions,
  showClearTaskWarning,
  onTimeIncrementChange,
  onClearTaskWarningChange,
  onClose
}) => {
  return (
    <DialogContent className="bg-gray-800 border-gray-700 text-white">
      <DialogHeader>
        <DialogTitle>Settings</DialogTitle>
        <DialogDescription className="text-gray-400">
          Customize your daily tasks view
        </DialogDescription>
      </DialogHeader>
      
      <div className="space-y-4 my-4">
        <div>
          <Label>Time Interval</Label>
          <div className="grid grid-cols-3 gap-2 mt-2">
            {timeIncrementOptions.map((option) => (
              <Button
                key={option.value}
                variant={timeIncrement === option.value ? "default" : "outline"}
                className={timeIncrement === option.value ? "bg-purple-600" : "border-gray-600"}
                onClick={() => onTimeIncrementChange(option.value)}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <Label>Show clear tasks warning</Label>
            <p className="text-sm text-gray-400">
              Show confirmation when clearing tasks
            </p>
          </div>
          <Switch 
            checked={showClearTaskWarning} 
            onCheckedChange={onClearTaskWarningChange}
          />
        </div>
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

export default SettingsModal;

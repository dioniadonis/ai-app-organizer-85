
import React from 'react';
import { Clock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';

interface TimeInputProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
}

const TimeInput: React.FC<TimeInputProps> = ({ value, onChange, label = "Time" }) => {
  const [hours, minutes] = value ? value.split(':') : ['', ''];
  
  const handleHoursChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    if (val === '') {
      onChange('');
      return;
    }
    
    const numVal = parseInt(val);
    if (isNaN(numVal)) return;
    
    if (numVal > 23) val = '23';
    if (numVal < 0) val = '0';
    
    val = val.padStart(2, '0');
    onChange(`${val}:${minutes || '00'}`);
  };
  
  const handleMinutesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    if (val === '') {
      onChange(`${hours || '00'}:00`);
      return;
    }
    
    const numVal = parseInt(val);
    if (isNaN(numVal)) return;
    
    if (numVal > 59) val = '59';
    if (numVal < 0) val = '0';
    
    val = val.padStart(2, '0');
    onChange(`${hours || '00'}:${val}`);
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex items-center gap-2">
        <Clock className="h-4 w-4 text-gray-400" />
        <div className="flex items-center">
          <Input
            type="number"
            placeholder="HH"
            value={hours}
            onChange={handleHoursChange}
            min={0}
            max={23}
            className="w-16 bg-gray-700 border-gray-600"
          />
          <span className="mx-1 text-gray-400">:</span>
          <Input
            type="number"
            placeholder="MM"
            value={minutes}
            onChange={handleMinutesChange}
            min={0}
            max={59}
            className="w-16 bg-gray-700 border-gray-600"
          />
        </div>
      </div>
    </div>
  );
};

export default TimeInput;

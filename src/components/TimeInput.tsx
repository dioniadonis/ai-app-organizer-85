
import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface TimeInputProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
}

const TimeInput: React.FC<TimeInputProps> = ({ value, onChange, label = "Time" }) => {
  const [hours, setHours] = useState<string>('');
  const [minutes, setMinutes] = useState<string>('');
  const [period, setPeriod] = useState<string>('AM');
  
  // Convert 24-hour format to 12-hour format when value changes
  useEffect(() => {
    if (!value) {
      setHours('');
      setMinutes('');
      setPeriod('AM');
      return;
    }
    
    const [hourStr, minuteStr] = value.split(':');
    const hourNum = parseInt(hourStr);
    
    if (isNaN(hourNum)) {
      setHours('');
      setMinutes('');
      return;
    }
    
    if (hourNum === 0) {
      setHours('12');
      setPeriod('AM');
    } else if (hourNum === 12) {
      setHours('12');
      setPeriod('PM');
    } else if (hourNum > 12) {
      setHours((hourNum - 12).toString());
      setPeriod('PM');
    } else {
      setHours(hourNum.toString());
      setPeriod('AM');
    }
    
    setMinutes(minuteStr || '00');
  }, [value]);
  
  // Convert back to 24-hour format when updating
  const updateTime = () => {
    let hourNum = parseInt(hours);
    if (isNaN(hourNum) || hourNum < 1) hourNum = 12;
    if (hourNum > 12) hourNum = 12;
    
    let minNum = parseInt(minutes);
    if (isNaN(minNum)) minNum = 0;
    if (minNum > 59) minNum = 59;
    
    // Convert to 24-hour format
    let hour24 = hourNum;
    if (period === 'PM' && hourNum !== 12) hour24 = hourNum + 12;
    if (period === 'AM' && hourNum === 12) hour24 = 0;
    
    const formattedHours = hour24.toString().padStart(2, '0');
    const formattedMinutes = minNum.toString().padStart(2, '0');
    
    onChange(`${formattedHours}:${formattedMinutes}`);
  };
  
  const handleHoursChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '');
    const num = val === '' ? '' : Math.min(Math.max(parseInt(val) || 0, 1), 12).toString();
    setHours(num);
    if (val !== '') setTimeout(updateTime, 100);
  };
  
  const handleMinutesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '');
    const num = val === '' ? '' : Math.min(Math.max(parseInt(val) || 0, 0), 59).toString().padStart(2, '0');
    setMinutes(num);
    if (val !== '') setTimeout(updateTime, 100);
  };
  
  const handlePeriodChange = (newPeriod: string) => {
    setPeriod(newPeriod);
    setTimeout(updateTime, 100);
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex items-center gap-2">
        <Clock className="h-4 w-4 text-gray-400" />
        <div className="flex items-center gap-2">
          <Input
            type="text"
            inputMode="numeric"
            placeholder="12"
            value={hours}
            onChange={handleHoursChange}
            className="w-14 bg-gray-700 border-gray-600 text-center"
            onClick={(e) => e.stopPropagation()}
          />
          <span className="text-gray-400">:</span>
          <Input
            type="text"
            inputMode="numeric"
            placeholder="00"
            value={minutes}
            onChange={handleMinutesChange}
            className="w-14 bg-gray-700 border-gray-600 text-center"
            onClick={(e) => e.stopPropagation()}
          />
          <Select value={period} onValueChange={handlePeriodChange}>
            <SelectTrigger className="w-16 bg-gray-700 border-gray-600" onClick={(e) => e.stopPropagation()}>
              <SelectValue placeholder="AM" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="AM">AM</SelectItem>
              <SelectItem value="PM">PM</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default TimeInput;

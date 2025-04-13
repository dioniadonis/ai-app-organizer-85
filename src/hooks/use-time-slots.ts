
import { useState, useCallback, useEffect } from 'react';
import { TimeIncrementOption } from '@/components/planner/types';

export const useTimeSlots = () => {
  const [timeIncrement, setTimeIncrement] = useState<number>(30);
  const [displayRange, setDisplayRange] = useState<'all' | 'morning' | 'afternoon' | 'evening'>('all');
  
  const timeIncrementOptions: TimeIncrementOption[] = [
    { label: '15 minutes', value: 15 },
    { label: '30 minutes', value: 30 },
    { label: '60 minutes', value: 60 }
  ];

  useEffect(() => {
    const savedIncrement = localStorage.getItem('timeIncrement');
    if (savedIncrement) {
      setTimeIncrement(parseInt(savedIncrement));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('timeIncrement', timeIncrement.toString());
  }, [timeIncrement]);

  const generateTimeSlots = useCallback(() => {
    const slots = [];
    const totalMinutesInDay = 24 * 60;
    
    for (let minutes = 0; minutes < totalMinutesInDay; minutes += timeIncrement) {
      const hour = Math.floor(minutes / 60);
      const minute = minutes % 60;
      const period = hour < 12 ? 'AM' : 'PM';
      const displayHour = hour % 12 === 0 ? 12 : hour % 12;
      slots.push(`${displayHour}:${minute.toString().padStart(2, '0')} ${period}`);
    }
    
    return slots;
  }, [timeIncrement]);

  const getFilteredTimeSlots = useCallback(() => {
    const timeSlots = generateTimeSlots();
    
    switch (displayRange) {
      case 'morning':
        return timeSlots.filter(slot => {
          const [time, period] = slot.split(' ');
          return period === 'AM';
        });
      case 'afternoon':
        return timeSlots.filter(slot => {
          const [time, period] = slot.split(' ');
          const [hour] = time.split(':');
          return period === 'PM' && parseInt(hour) < 6;
        });
      case 'evening':
        return timeSlots.filter(slot => {
          const [time, period] = slot.split(' ');
          const [hour] = time.split(':');
          return period === 'PM' && parseInt(hour) >= 5;
        });
      default:
        return timeSlots;
    }
  }, [displayRange, generateTimeSlots]);

  return {
    timeIncrement,
    setTimeIncrement,
    displayRange,
    setDisplayRange,
    timeIncrementOptions,
    getFilteredTimeSlots
  };
};

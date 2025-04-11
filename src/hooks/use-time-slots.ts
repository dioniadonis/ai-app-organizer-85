
import { useState, useCallback, useEffect } from 'react';
import { DailyTask } from '@/components/planner/DailyTasksTab';

export interface TimeIncrementOption {
  label: string;
  value: number;
}

export const useTimeSlots = (timeIncrement: number) => {
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

  const timeSlots = generateTimeSlots();

  const getFilteredTimeSlots = useCallback((displayRange: 'all' | 'morning' | 'afternoon' | 'evening') => {
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
  }, [timeSlots]);

  const getTasksForTimeSlot = useCallback((timeSlot: string, tasks: DailyTask[]) => {
    const [time, period] = timeSlot.split(' ');
    const [hour, minute] = time.split(':');
    let hour24 = parseInt(hour);
    
    if (period === 'PM' && hour24 !== 12) {
      hour24 += 12;
    } else if (period === 'AM' && hour24 === 12) {
      hour24 = 0;
    }
    
    const timeString = `${hour24.toString().padStart(2, '0')}:${minute}`;
    
    return tasks.filter(task => task.timeOfDay === timeString);
  }, []);

  const isCurrentTimeSlot = useCallback((timeSlot: string, currentDate: Date) => {
    const now = new Date();
    const [slotTime, slotPeriod] = timeSlot.split(' ');
    const [slotHour, slotMinute] = slotTime.split(':');
    let slotHour24 = parseInt(slotHour);
    
    if (slotPeriod === 'PM' && slotHour24 !== 12) {
      slotHour24 += 12;
    } else if (slotPeriod === 'AM' && slotHour24 === 12) {
      slotHour24 = 0;
    }
    
    const isToday = now.toDateString() === currentDate.toDateString();
    
    return isToday && 
      now.getHours() === slotHour24 && 
      now.getMinutes() >= parseInt(slotMinute) && 
      now.getMinutes() < parseInt(slotMinute) + timeIncrement;
  }, [timeIncrement]);

  return {
    timeSlots,
    getFilteredTimeSlots,
    getTasksForTimeSlot,
    isCurrentTimeSlot
  };
};

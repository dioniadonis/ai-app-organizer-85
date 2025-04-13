
import { format, isToday, isSameDay } from "date-fns";

export interface TimeIncrementOption {
  label: string;
  value: number;
}

export const TIME_INCREMENT_OPTIONS: TimeIncrementOption[] = [
  {
    label: '15 minutes',
    value: 15
  },
  {
    label: '30 minutes',
    value: 30
  },
  {
    label: '60 minutes',
    value: 60
  }
];

export const generateTimeSlots = (timeIncrement: number) => {
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
};

export const filterTimeSlotsByRange = (
  timeSlots: string[],
  displayRange: 'all' | 'morning' | 'afternoon' | 'evening'
) => {
  switch (displayRange) {
    case 'morning':
      return timeSlots.filter(slot => {
        const [time, period] = slot.split(' ');
        const [hourStr] = time.split(':');
        const hour = parseInt(hourStr);
        
        // Morning excludes 12 PM
        return period === 'AM' && hour !== 12;
      });
    case 'afternoon':
      return timeSlots.filter(slot => {
        const [time, period] = slot.split(' ');
        const [hourStr] = time.split(':');
        const hour = parseInt(hourStr);
        
        // Afternoon includes 12 PM to 4:59 PM
        return (period === 'PM' && hour <= 4) || (period === 'PM' && hour === 12);
      });
    case 'evening':
      return timeSlots.filter(slot => {
        const [time, period] = slot.split(' ');
        const [hourStr] = time.split(':');
        const hour = parseInt(hourStr);
        
        // Evening is 5 PM onwards
        return period === 'PM' && hour >= 5 && hour !== 12;
      });
    default:
      return timeSlots;
  }
};

export const parseTimeSlot = (timeSlot: string) => {
  const [time, period] = timeSlot.split(' ');
  const [hour, minute] = time.split(':');
  let hour24 = parseInt(hour);
  if (period === 'PM' && hour24 !== 12) {
    hour24 += 12;
  } else if (period === 'AM' && hour24 === 12) {
    hour24 = 0;
  }
  return `${hour24.toString().padStart(2, '0')}:${minute}`;
};

export const scrollToCurrentTimeSlot = (
  scrollRef: React.RefObject<HTMLDivElement>,
  currentDate: Date,
  timeIncrement: number
) => {
  if (scrollRef.current && isToday(currentDate)) {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinutes = now.getMinutes();
    const roundedMinutes = Math.floor(currentMinutes / timeIncrement) * timeIncrement;
    const closestTimeSlot = `${currentHour % 12 === 0 ? 12 : currentHour % 12}:${roundedMinutes.toString().padStart(2, '0')} ${currentHour < 12 ? 'AM' : 'PM'}`;
    const timeSlotElement = document.getElementById(`timeslot-${closestTimeSlot}`);
    if (timeSlotElement) {
      setTimeout(() => {
        timeSlotElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }, 500);
    }
  }
};

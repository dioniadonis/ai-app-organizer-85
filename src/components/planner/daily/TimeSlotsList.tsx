
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import TimeSlot from './TimeSlot';
import { DailyTask } from '@/components/planner/DailyTasksTab';
import { isToday } from 'date-fns';

interface TimeSlotsListProps {
  displayTimeSlots: string[];
  currentDate: Date;
  timeIncrement: number;
  isDragging: boolean;
  draggedTask: DailyTask | null;
  targetTimeSlot: string | null;
  editingTaskId: number | null;
  newTaskName: string;
  isMobile: boolean;
  isTouchDevice: boolean;
  scrollRef: React.RefObject<HTMLDivElement>;
  getTasksForTimeSlot: (timeSlot: string) => DailyTask[];
  onTimeSlotHover: (timeSlot: string) => void;
  onDragEnd: () => void;
  onQuickAddTask: (timeSlot: string) => void;
  onTaskToggle: (taskId: number) => void;
  onMoveTask: (task: DailyTask) => void;
  onDeleteTask: (taskId: number) => void;
  onNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onNameBlur: (taskId: number) => void;
  onDragStart: (task: DailyTask) => void;
  onEditTask: (taskId: number, task: Partial<DailyTask>) => void;
}

const TimeSlotsList: React.FC<TimeSlotsListProps> = ({
  displayTimeSlots,
  currentDate,
  timeIncrement,
  isDragging,
  draggedTask,
  targetTimeSlot,
  editingTaskId,
  newTaskName,
  isMobile,
  isTouchDevice,
  scrollRef,
  getTasksForTimeSlot,
  onTimeSlotHover,
  onDragEnd,
  onQuickAddTask,
  onTaskToggle,
  onMoveTask,
  onDeleteTask,
  onNameChange,
  onNameBlur,
  onDragStart,
  onEditTask
}) => {
  const isCurrentTimeSlot = (timeSlot: string) => {
    const now = new Date();
    const [slotTime, slotPeriod] = timeSlot.split(' ');
    const [slotHour, slotMinute] = slotTime.split(':');
    let slotHour24 = parseInt(slotHour);
    if (slotPeriod === 'PM' && slotHour24 !== 12) {
      slotHour24 += 12;
    } else if (slotPeriod === 'AM' && slotHour24 === 12) {
      slotHour24 = 0;
    }
    return isToday(currentDate) && 
      now.getHours() === slotHour24 && 
      now.getMinutes() >= parseInt(slotMinute) && 
      now.getMinutes() < parseInt(slotMinute) + timeIncrement;
  };

  return (
    <ScrollArea className="h-[calc(100dvh-200px)] rounded-lg border border-gray-800 bg-gray-900/80 overflow-x-hidden -webkit-overflow-scrolling-touch" ref={scrollRef}>
      {displayTimeSlots.map((timeSlot) => {
        const tasksInSlot = getTasksForTimeSlot(timeSlot);
        const timeSlotId = `timeslot-${timeSlot}`;
        
        return (
          <TimeSlot 
            key={timeSlot}
            timeSlot={timeSlot}
            timeSlotId={timeSlotId}
            isCurrentTimeSlot={isCurrentTimeSlot(timeSlot)}
            isTargetTimeSlot={targetTimeSlot === timeSlot}
            isDragging={isDragging}
            draggedTask={draggedTask}
            tasksInSlot={tasksInSlot}
            editingTaskId={editingTaskId}
            newTaskName={newTaskName}
            isMobile={isMobile}
            isTouchDevice={isTouchDevice}
            onTimeSlotHover={onTimeSlotHover}
            onDragEnd={onDragEnd}
            onQuickAddTask={onQuickAddTask}
            onTaskToggle={onTaskToggle}
            onMoveTask={onMoveTask}
            onDeleteTask={onDeleteTask}
            onNameChange={onNameChange}
            onNameBlur={onNameBlur}
            onDragStart={onDragStart}
            onEditTask={onEditTask}
          />
        );
      })}
    </ScrollArea>
  );
};

export default TimeSlotsList;

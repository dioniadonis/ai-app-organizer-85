
import { useState } from 'react';
import { format } from 'date-fns';
import { DailyTask } from '@/components/planner/DailyTasksTab';
import { toast } from '@/components/ui/use-toast';
import { parseTimeSlot } from '@/utils/timeUtils';

export const useDragAndDrop = (
  dailyTasks: DailyTask[], 
  onTaskUpdate: (taskId: number, updates: Partial<DailyTask>) => void
) => {
  const [isDragging, setIsDragging] = useState(false);
  const [draggedTask, setDraggedTask] = useState<DailyTask | null>(null);
  const [targetTimeSlot, setTargetTimeSlot] = useState<string | null>(null);

  const handleDragStart = (task: DailyTask) => {
    setIsDragging(true);
    setDraggedTask(task);
  };

  const handleDragEnd = () => {
    if (draggedTask && targetTimeSlot) {
      const timeString = parseTimeSlot(targetTimeSlot);
      
      onTaskUpdate(draggedTask.id, { timeOfDay: timeString });
      
      toast({
        title: "Task moved",
        description: `"${draggedTask.name}" moved to ${targetTimeSlot}`
      });
    }
    
    setIsDragging(false);
    setDraggedTask(null);
    setTargetTimeSlot(null);
  };

  const handleTimeSlotHover = (timeSlot: string) => {
    if (isDragging) {
      setTargetTimeSlot(timeSlot);
    }
  };

  return {
    isDragging,
    draggedTask,
    targetTimeSlot,
    handleDragStart,
    handleDragEnd,
    handleTimeSlotHover
  };
};

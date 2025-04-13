import React from 'react';
import { isToday } from 'date-fns';
import { Plus } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import TaskItem from './TaskItem';
import { DailyTask } from './types';

interface TimeSlotsProps {
  currentDate: Date;
  timeSlots: string[];
  timeIncrement: number;
  getTasksForTimeSlot: (timeSlot: string) => DailyTask[];
  handleQuickAddTask: (timeSlot: string) => void;
  editingTaskId: number | null;
  newTaskName: string;
  setNewTaskName: (name: string) => void;
  onToggleComplete: (id: number) => void;
  onStartEditing: (id: number, e?: React.MouseEvent) => void;
  onTaskNameBlur: (id: number) => void;
  onEditTask: (task: DailyTask) => void;
  onSetReminder: (task: DailyTask) => void;
  onMoveTask: (task: DailyTask) => void;
  onCopyTask: (task: DailyTask) => void;
  onDeleteTask: (id: number) => void;
  onResetStreak: (id: number) => void;
  onCategoryClick: (task: DailyTask) => void;
  targetTimeSlot: string | null;
  isDragging: boolean;
  draggedTask: DailyTask | null;
  handleTimeSlotHover: (timeSlot: string) => void;
  handleDragEnd: () => void;
  handleDragStart: (task: DailyTask) => void;
  isMobile: boolean;
  isTouchDevice: boolean;
  scrollRef: React.RefObject<HTMLDivElement>;
}

const TimeSlots: React.FC<TimeSlotsProps> = ({
  currentDate,
  timeSlots,
  timeIncrement,
  getTasksForTimeSlot,
  handleQuickAddTask,
  editingTaskId,
  newTaskName,
  setNewTaskName,
  onToggleComplete,
  onStartEditing,
  onTaskNameBlur,
  onEditTask,
  onSetReminder,
  onMoveTask,
  onCopyTask,
  onDeleteTask,
  onResetStreak,
  onCategoryClick,
  targetTimeSlot,
  isDragging,
  draggedTask,
  handleTimeSlotHover,
  handleDragEnd,
  handleDragStart,
  isMobile,
  isTouchDevice,
  scrollRef
}) => {
  return (
    <ScrollArea className="h-[calc(100vh-200px)] rounded-lg border border-gray-800 bg-gray-900/80" ref={scrollRef}>
      {timeSlots.map((timeSlot) => {
        const tasksInSlot = getTasksForTimeSlot(timeSlot);
        const timeSlotId = `timeslot-${timeSlot}`;
        const now = new Date();
        const [slotTime, slotPeriod] = timeSlot.split(' ');
        const [slotHour, slotMinute] = slotTime.split(':');
        let slotHour24 = parseInt(slotHour);
        
        if (slotPeriod === 'PM' && slotHour24 !== 12) {
          slotHour24 += 12;
        } else if (slotPeriod === 'AM' && slotHour24 === 12) {
          slotHour24 = 0;
        }
        
        const isCurrentTimeSlot = isToday(currentDate) && 
          now.getHours() === slotHour24 && 
          now.getMinutes() >= parseInt(slotMinute) && 
          now.getMinutes() < parseInt(slotMinute) + timeIncrement;
        
        return (
          <div 
            key={timeSlot} 
            id={timeSlotId} 
            className={`border-b border-gray-800 last:border-b-0 ${
              isCurrentTimeSlot ? 'bg-purple-900/20' : ''
            } ${
              targetTimeSlot === timeSlot && isDragging ? 'bg-blue-900/30 border-blue-500/50' : ''
            }`} 
            onMouseEnter={() => handleTimeSlotHover(timeSlot)} 
            onMouseUp={handleDragEnd}
          >
            <div className="flex items-center p-3">
              <div className={`w-20 text-sm font-medium ${
                isCurrentTimeSlot ? 'text-purple-300' : 'text-gray-400'
              }`}>
                {timeSlot}
              </div>
              
              <div className="flex-1 ml-4">
                {tasksInSlot.length > 0 ? (
                  <div className="space-y-2">
                    {tasksInSlot.map(task => (
                      <TaskItem
                        key={task.id}
                        task={task}
                        editingTaskId={editingTaskId}
                        isEditing={editingTaskId === task.id}
                        newTaskName={newTaskName}
                        setNewTaskName={setNewTaskName}
                        onToggleComplete={onToggleComplete}
                        onStartEditing={onStartEditing}
                        onTaskNameBlur={onTaskNameBlur}
                        onEditTask={onEditTask}
                        onSetReminder={onSetReminder}
                        onMoveTask={onMoveTask}
                        onCopyTask={onCopyTask}
                        onDeleteTask={onDeleteTask}
                        onResetStreak={onResetStreak}
                        onCategoryClick={onCategoryClick}
                        isDragging={isDragging}
                        draggedTask={draggedTask}
                        isMobile={isMobile}
                        isTouchDevice={isTouchDevice}
                        handleDragStart={handleDragStart}
                        handleDragEnd={handleDragEnd}
                      />
                    ))}
                  </div>
                ) : (
                  <div 
                    className="h-8 flex items-center justify-center rounded-md border border-dashed border-gray-700 text-gray-500 text-sm hover:bg-gray-800/20 hover:border-gray-600 transition-all cursor-pointer" 
                    onClick={() => handleQuickAddTask(timeSlot)}
                  >
                    <Plus size={16} className="mr-1" /> Add task
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </ScrollArea>
  );
};

export default TimeSlots;

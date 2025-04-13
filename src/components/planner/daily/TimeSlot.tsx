
import React from 'react';
import { Plus } from 'lucide-react';
import { DailyTask } from '@/components/planner/DailyTasksTab';
import TaskItem from './TaskItem';

interface TimeSlotProps {
  timeSlot: string;
  timeSlotId: string;
  isCurrentTimeSlot: boolean;
  isTargetTimeSlot: boolean;
  isDragging: boolean;
  draggedTask: DailyTask | null;
  tasksInSlot: DailyTask[];
  editingTaskId: number | null;
  newTaskName: string;
  isMobile: boolean;
  isTouchDevice: boolean;
  onTimeSlotHover: (timeSlot: string) => void;
  onDragEnd: () => void;
  onQuickAddTask: (timeSlot: string) => void;
  onTaskToggle: (taskId: number) => void;
  onEditTask: (task: DailyTask) => void;
  onMoveTask: (task: DailyTask) => void;
  onDeleteTask: (taskId: number) => void;
  onNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onNameBlur: (taskId: number) => void;
  onDragStart: (task: DailyTask) => void;
}

const TimeSlot: React.FC<TimeSlotProps> = ({
  timeSlot,
  timeSlotId,
  isCurrentTimeSlot,
  isTargetTimeSlot,
  isDragging,
  draggedTask,
  tasksInSlot,
  editingTaskId,
  newTaskName,
  isMobile,
  isTouchDevice,
  onTimeSlotHover,
  onDragEnd,
  onQuickAddTask,
  onTaskToggle,
  onEditTask,
  onMoveTask,
  onDeleteTask,
  onNameChange,
  onNameBlur,
  onDragStart
}) => {
  return (
    <div 
      id={timeSlotId} 
      className={`border-b border-gray-800 last:border-b-0 ${
        isCurrentTimeSlot ? 'bg-purple-900/20' : ''
      } ${
        isTargetTimeSlot && isDragging ? 'bg-blue-900/30 border-blue-500/50' : ''
      }`} 
      onMouseEnter={() => onTimeSlotHover(timeSlot)} 
      onMouseUp={onDragEnd}
    >
      <div className="flex items-center p-3">
        <div className={`w-20 text-sm font-medium ${isCurrentTimeSlot ? 'text-purple-300' : 'text-gray-400'}`}>
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
                  newTaskName={newTaskName}
                  isMobile={isMobile}
                  isTouchDevice={isTouchDevice}
                  isDragging={isDragging}
                  draggedTask={draggedTask}
                  onTaskToggle={onTaskToggle}
                  onEditTask={onEditTask}
                  onMoveTask={onMoveTask}
                  onDeleteTask={onDeleteTask}
                  onNameChange={onNameChange}
                  onNameBlur={onNameBlur}
                  onDragStart={onDragStart}
                  onDragEnd={onDragEnd}
                />
              ))}
            </div>
          ) : (
            <div 
              className="h-8 flex items-center justify-center hover:bg-gray-800/30 rounded transition-colors cursor-pointer"
              onClick={() => onQuickAddTask(timeSlot)}
            >
              <Plus className="h-4 w-4 text-gray-500" />
              <span className="text-xs text-gray-500 ml-1">Add task</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TimeSlot;

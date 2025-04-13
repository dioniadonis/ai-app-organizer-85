
import React from 'react';
import { motion } from 'framer-motion';
import { Edit, Move, X, CheckCircle, Circle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DailyTask } from '@/components/planner/DailyTasksTab';

interface TaskItemProps {
  task: DailyTask;
  editingTaskId: number | null;
  newTaskName: string;
  isMobile: boolean;
  isTouchDevice: boolean;
  isDragging: boolean;
  draggedTask: DailyTask | null;
  onTaskToggle: (taskId: number) => void;
  onEditTask: (task: DailyTask) => void;
  onMoveTask: (task: DailyTask) => void;
  onDeleteTask: (taskId: number) => void;
  onNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onNameBlur: (taskId: number) => void;
  onDragStart: (task: DailyTask) => void;
  onDragEnd: () => void;
}

const TaskItem: React.FC<TaskItemProps> = ({
  task,
  editingTaskId,
  newTaskName,
  isMobile,
  isTouchDevice,
  isDragging,
  draggedTask,
  onTaskToggle,
  onEditTask,
  onMoveTask,
  onDeleteTask,
  onNameChange,
  onNameBlur,
  onDragStart,
  onDragEnd
}) => {
  return (
    <motion.div 
      key={task.id} 
      data-task-id={task.id} 
      className={`flex items-center gap-2 bg-gray-800/40 p-2 rounded-md border border-gray-700 hover:bg-gray-800/60 transition-all ${
        draggedTask?.id === task.id ? 'opacity-50 ring-2 ring-blue-500' : ''
      }`} 
      initial={{
        opacity: 0,
        y: 5
      }} 
      animate={{
        opacity: 1,
        y: 0
      }} 
      whileHover={{
        scale: 1.02
      }} 
      drag={isMobile || isTouchDevice ? true : false} 
      dragConstraints={{
        left: 0,
        right: 0,
        top: 0,
        bottom: 0
      }} 
      dragElastic={0} 
      dragMomentum={false} 
      onDragStart={() => isMobile || isTouchDevice ? onDragStart(task) : null} 
      onDragEnd={isMobile || isTouchDevice ? onDragEnd : null} 
      style={{
        cursor: (isMobile || isTouchDevice) && isDragging && draggedTask?.id === task.id ? 'grabbing' : 'auto'
      }}
    >                            
      {editingTaskId === task.id ? (
        <Input 
          value={newTaskName} 
          onChange={onNameChange} 
          onBlur={() => onNameBlur(task.id)} 
          className="bg-gray-700 border-gray-600 text-white focus:text-white active:text-white hover:text-white" 
          onClick={e => e.stopPropagation()}
          autoFocus
        />
      ) : (
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => onTaskToggle(task.id)}
              className="flex-shrink-0"
            >
              {task.completed ? (
                <CheckCircle className="h-5 w-5 text-purple-400" />
              ) : (
                <Circle className="h-5 w-5 text-gray-400" />
              )}
            </button>
            <div>
              <span 
                className={`text-sm ${task.completed ? 'line-through text-gray-400' : 'text-white'}`}
                style={task.color ? { color: task.color } : undefined}
              >
                {task.name}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon"
              className="h-8 w-8 rounded-full hover:bg-gray-700"
              onClick={(e) => {
                e.stopPropagation();
                onEditTask(task);
              }}
            >
              <Edit className="h-4 w-4" />
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon"
              className="h-8 w-8 rounded-full hover:bg-gray-700"
              onClick={(e) => {
                e.stopPropagation();
                onMoveTask(task);
              }}
            >
              <Move className="h-4 w-4" />
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon"
              className="h-8 w-8 rounded-full hover:bg-red-900/50 text-red-500"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteTask(task.id);
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default TaskItem;

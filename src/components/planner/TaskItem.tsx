
import React from 'react';
import { motion } from 'framer-motion';
import { Edit, Check, Circle, X, RotateCcw, CalendarClock, ClockIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import { DailyTask, getTaskCategoryBadgeClass } from './types';

interface TaskItemProps {
  task: DailyTask;
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
  isDragging: boolean;
  draggedTask: DailyTask | null;
  isMobile: boolean;
  isTouchDevice: boolean;
  handleDragStart: (task: DailyTask) => void;
  handleDragEnd: () => void;
}

const TaskItem: React.FC<TaskItemProps> = ({
  task,
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
  isDragging,
  draggedTask,
  isMobile,
  isTouchDevice,
  handleDragStart,
  handleDragEnd
}) => {
  const getStreakClassName = (streak: number) => {
    if (streak >= 10) return "bg-purple-500/20 text-purple-300";
    if (streak >= 5) return "bg-blue-500/20 text-blue-300";
    if (streak >= 1) return "bg-green-500/20 text-green-300";
    return "bg-gray-500/20 text-gray-300";
  };

  return (
    <motion.div
      data-task-id={task.id}
      className={`flex items-center gap-2 bg-gray-800/40 p-2 rounded-md border border-gray-700 hover:bg-gray-800/60 transition-all ${
        draggedTask?.id === task.id ? 'opacity-50 ring-2 ring-blue-500' : ''
      }`}
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      drag={isMobile || isTouchDevice ? true : false}
      dragConstraints={{
        left: 0,
        right: 0,
        top: 0,
        bottom: 0
      }}
      dragElastic={0}
      dragMomentum={false}
      onDragStart={() => isMobile || isTouchDevice ? handleDragStart(task) : null}
      onDragEnd={isMobile || isTouchDevice ? handleDragEnd : null}
      style={{
        cursor: (isMobile || isTouchDevice) && isDragging && draggedTask?.id === task.id ? 'grabbing' : 'auto'
      }}
    >                            
      {editingTaskId === task.id ? (
        <Input 
          value={newTaskName} 
          onChange={e => setNewTaskName(e.target.value)} 
          onBlur={() => onTaskNameBlur(task.id)} 
          className="bg-gray-700/50 border-gray-600 h-7 text-sm" 
          autoFocus 
          onKeyDown={e => {
            if (e.key === 'Enter') {
              if (newTaskName.trim()) {
                onTaskNameBlur(task.id);
              } else {
                toast({
                  title: "Task name required",
                  description: "Please enter a name for your task",
                  variant: "destructive"
                });
                e.preventDefault();
              }
            }
          }} 
        />
      ) : (
        <>
          <div 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: task.color || '#9b87f5' }}
          />
          <span 
            className="flex-1 text-white cursor-pointer" 
            onClick={e => {
              e.stopPropagation();
              onStartEditing(task.id, e);
            }}
          >
            {task.name || "Add task"}
          </span>
          
          {task.category && (
            <span 
              className={`text-xs px-1.5 py-0.5 rounded-full ${getTaskCategoryBadgeClass(task.category)} cursor-pointer`} 
              onClick={e => {
                e.stopPropagation();
                onCategoryClick(task);
              }}
            >
              {task.category}
            </span>
          )}
        </>
      )}
      
      <div className="flex items-center">
        <Popover>
          <PopoverTrigger asChild>
            <button 
              className="p-1 rounded-full hover:bg-gray-700/50" 
              onClick={e => e.stopPropagation()} 
              disabled={!task.name.trim()}
            >
              <Edit size={14} className={task.name.trim() ? "text-gray-400" : "text-gray-600"} />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto bg-gray-800 border-gray-700 rounded-lg p-2">
            <div className="flex flex-col gap-1">
              <Button 
                variant="ghost" 
                size="sm" 
                className="justify-start text-xs px-2" 
                onClick={e => {
                  e.stopPropagation();
                  if (!task.name.trim()) {
                    toast({
                      title: "Task name required",
                      description: "Please enter a name for your task",
                      variant: "destructive"
                    });
                    onStartEditing(task.id, e);
                    return;
                  }
                  onEditTask(task);
                }}
              >
                <Edit className="mr-2 h-3 w-3" /> Edit Task
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="justify-start text-xs px-2" 
                onClick={e => {
                  e.stopPropagation();
                  onSetReminder(task);
                }}
              >
                <ClockIcon className="mr-2 h-3 w-3" /> Set Time
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="justify-start text-xs px-2" 
                onClick={e => {
                  e.stopPropagation();
                  onMoveTask(task);
                }}
              >
                <CalendarClock className="mr-2 h-3 w-3" /> Move Task
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="justify-start text-xs px-2" 
                onClick={e => {
                  e.stopPropagation();
                  onCopyTask(task);
                }}
              >
                <Copy className="mr-2 h-3 w-3" /> Copy Task
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="justify-start text-xs px-2 text-red-400 hover:text-red-300 hover:bg-red-500/20" 
                onClick={e => {
                  e.stopPropagation();
                  onDeleteTask(task.id);
                }}
              >
                <X className="mr-2 h-3 w-3" /> Delete
              </Button>
            </div>
          </PopoverContent>
        </Popover>
        
        <button 
          onClick={e => {
            e.stopPropagation();
            onToggleComplete(task.id);
          }} 
          className="p-1 rounded-full hover:bg-gray-700/50 ml-1"
        >
          {task.completed ? (
            <Check size={16} className="text-green-400" />
          ) : (
            <Circle size={16} className="text-gray-400" />
          )}
        </button>
        
        {task.streak > 0 && (
          <Badge className={getStreakClassName(task.streak)}>
            <CalendarClock className="h-3 w-3 mr-1" />
            {task.streak} day{task.streak !== 1 ? 's' : ''}
          </Badge>
        )}
        
        {task.streak > 0 && (
          <Button 
            variant="ghost" 
            size="icon"
            className="h-6 w-6 rounded-full hover:bg-gray-700 text-orange-400"
            onClick={e => {
              e.stopPropagation();
              onResetStreak(task.id);
            }}
          >
            <RotateCcw className="h-3 w-3" />
          </Button>
        )}
      </div>
    </motion.div>
  );
};

export default TaskItem;


import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Edit, CheckCircle, Circle, X, Clock, RotateCcw, Copy as CopyIcon, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { DailyTask } from '@/components/planner/types';

interface TaskItemProps {
  task: DailyTask;
  editingTaskId?: number;
  isEditing: boolean;
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
  isDragging?: boolean;
  draggedTask?: DailyTask | null;
  isMobile?: boolean;
  isTouchDevice?: boolean;
  handleDragStart?: (task: DailyTask) => void;
  handleDragEnd?: () => void;
  onDragStart?: (task: DailyTask) => void;
  isDraggable?: boolean;
}

const TaskItem: React.FC<TaskItemProps> = ({
  task,
  editingTaskId,
  isEditing,
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
  handleDragStart,
  isDraggable = false
}) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const getStreakClassName = (streak: number) => {
    if (streak >= 10) return "bg-purple-500/20 text-purple-300";
    if (streak >= 5) return "bg-blue-500/20 text-blue-300";
    if (streak >= 1) return "bg-green-500/20 text-green-300";
    return "bg-gray-500/20 text-gray-300";
  };

  const getTaskCategoryBadgeClass = (category?: string) => {
    switch(category) {
      case 'Morning Routine': return 'bg-blue-500/20 text-blue-300 border-blue-500/50';
      case 'Work': return 'bg-purple-500/20 text-purple-300 border-purple-500/50';
      case 'Health': return 'bg-green-500/20 text-green-300 border-green-500/50';
      case 'Learning': return 'bg-orange-500/20 text-orange-300 border-orange-500/50';
      case 'Evening Routine': return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/50';
      case 'Wellness': return 'bg-pink-500/20 text-pink-300 border-pink-500/50';
      case 'Productivity': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/50';
    }
  };

  return (
    <motion.div
      data-task-id={task.id}
      className={`relative bg-gray-800/40 rounded-lg p-3 border border-gray-700 hover:bg-gray-800/60 transition-colors ${
        isDraggable ? 'cursor-grab active:cursor-grabbing' : ''
      }`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      draggable={isDraggable}
      onDragStart={() => handleDragStart && handleDragStart(task)}
    >
      {isEditing ? (
        <div>
          <Input 
            value={newTaskName}
            onChange={(e) => setNewTaskName(e.target.value)}
            className="bg-gray-700/50 border-gray-600"
            placeholder="Task name"
            onBlur={() => onTaskNameBlur(task.id)}
            autoFocus
          />
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => onToggleComplete(task.id)}
              className="flex-shrink-0"
            >
              {task.completed ? (
                <CheckCircle className="h-5 w-5 text-purple-400" />
              ) : (
                <Circle className="h-5 w-5 text-gray-400" />
              )}
            </button>
            
            <div>
              <div className="flex items-center">
                <span 
                  className={`mr-2 text-base ${task.completed ? 'line-through text-gray-400' : 'text-white'}`}
                  style={task.color ? { color: task.color } : undefined}
                >
                  {task.name}
                </span>
                
                {task.category && (
                  <Badge 
                    className={getTaskCategoryBadgeClass(task.category)}
                    onClick={() => onCategoryClick(task)}
                  >
                    {task.category}
                  </Badge>
                )}
              </div>
              
              {task.timeOfDay && (
                <div className="flex items-center mt-1 text-xs text-gray-400">
                  <Clock className="h-3 w-3 mr-1" />
                  <span>{task.timeOfDay}</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {task.streak > 0 && (
              <Badge className={getStreakClassName(task.streak)}>
                <Clock className="h-3 w-3 mr-1" />
                {task.streak} day{task.streak !== 1 ? 's' : ''}
              </Badge>
            )}
            
            <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-40 bg-gray-800 border-gray-700 text-gray-200">
                <DropdownMenuItem onClick={() => onEditTask(task)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onSetReminder(task)}>
                  <Clock className="h-4 w-4 mr-2" />
                  Set Time
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onMoveTask(task)}>
                  <Clock className="h-4 w-4 mr-2" />
                  Move to Date
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onCopyTask(task)}>
                  <CopyIcon className="h-4 w-4 mr-2" />
                  Copy to Date
                </DropdownMenuItem>
                {task.streak > 0 && (
                  <DropdownMenuItem onClick={() => onResetStreak(task.id)}>
                    <RotateCcw className="h-4 w-4 mr-2 text-orange-400" />
                    Reset Streak
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator className="bg-gray-700" />
                <DropdownMenuItem className="text-red-400" onClick={() => onDeleteTask(task.id)}>
                  <X className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default TaskItem;

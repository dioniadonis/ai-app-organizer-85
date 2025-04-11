
import React from 'react';
import { motion } from 'framer-motion';
import { Edit, Circle, Check, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { toast } from '@/components/ui/use-toast';
import { DailyTask } from '@/components/planner/DailyTasksTab';

interface TimeSlotProps {
  timeSlot: string;
  tasksInSlot: DailyTask[];
  isCurrentTimeSlot: boolean;
  isDragging: boolean;
  targetTimeSlot: string | null;
  editingTaskId: number | null;
  newTaskName: string;
  handleTimeSlotHover: (timeSlot: string) => void;
  handleDragEnd: () => void;
  handleQuickAddTask: (timeSlot: string) => void;
  handleTaskClick: (task: DailyTask) => void;
  handleCategoryClick: (task: DailyTask) => void;
  handleTaskNameBlur: (taskId: number) => void;
  handleTaskToggle: (taskId: number) => void;
  setNewTaskName: (name: string) => void;
  handleEditTask: (task: DailyTask) => void;
  handleSetReminder: (task: DailyTask) => void;
  handleMoveTask: (task: DailyTask) => void;
  handleDeleteTask: (taskId: number) => void;
  getTaskCategoryBadgeClass: (category?: string) => string;
}

const TimeSlot: React.FC<TimeSlotProps> = ({
  timeSlot,
  tasksInSlot,
  isCurrentTimeSlot,
  isDragging,
  targetTimeSlot,
  editingTaskId,
  newTaskName,
  handleTimeSlotHover,
  handleDragEnd,
  handleQuickAddTask,
  handleTaskClick,
  handleCategoryClick,
  handleTaskNameBlur,
  handleTaskToggle,
  setNewTaskName,
  handleEditTask,
  handleSetReminder,
  handleMoveTask,
  handleDeleteTask,
  getTaskCategoryBadgeClass,
}) => {
  const timeSlotId = `timeslot-${timeSlot}`;

  return (
    <div 
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
                  newTaskName={newTaskName}
                  handleTaskClick={handleTaskClick}
                  handleCategoryClick={handleCategoryClick}
                  handleTaskNameBlur={handleTaskNameBlur}
                  handleTaskToggle={handleTaskToggle}
                  setNewTaskName={setNewTaskName}
                  handleEditTask={handleEditTask}
                  handleSetReminder={handleSetReminder}
                  handleMoveTask={handleMoveTask}
                  handleDeleteTask={handleDeleteTask}
                  getTaskCategoryBadgeClass={getTaskCategoryBadgeClass}
                />
              ))}
            </div>
          ) : (
            <div 
              className="h-8 flex items-center justify-center rounded-md border border-dashed border-gray-700 text-gray-500 text-sm hover:bg-gray-800/20 hover:border-gray-600 transition-all cursor-pointer"
              onClick={() => handleQuickAddTask(timeSlot)}
            >
              <X className="h-4 w-4 mr-1" /> Add task
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface TaskItemProps {
  task: DailyTask;
  editingTaskId: number | null;
  newTaskName: string;
  handleTaskClick: (task: DailyTask) => void;
  handleCategoryClick: (task: DailyTask) => void;
  handleTaskNameBlur: (taskId: number) => void;
  handleTaskToggle: (taskId: number) => void;
  setNewTaskName: (name: string) => void;
  handleEditTask: (task: DailyTask) => void;
  handleSetReminder: (task: DailyTask) => void;
  handleMoveTask: (task: DailyTask) => void;
  handleDeleteTask: (taskId: number) => void;
  getTaskCategoryBadgeClass: (category?: string) => string;
}

const TaskItem: React.FC<TaskItemProps> = ({
  task,
  editingTaskId,
  newTaskName,
  handleTaskClick,
  handleCategoryClick,
  handleTaskNameBlur,
  handleTaskToggle,
  setNewTaskName,
  handleEditTask,
  handleSetReminder,
  handleMoveTask,
  handleDeleteTask,
  getTaskCategoryBadgeClass,
}) => {
  return (
    <motion.div 
      data-task-id={task.id}
      className={`flex items-center gap-2 bg-gray-800/40 p-2 rounded-md border border-gray-700 hover:bg-gray-800/60 transition-all`}
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
    >
      {editingTaskId === task.id ? (
        <Input
          value={newTaskName}
          onChange={(e) => setNewTaskName(e.target.value)}
          onBlur={() => handleTaskNameBlur(task.id)}
          className="bg-gray-700/50 border-gray-600 h-7 text-sm"
          autoFocus
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              if (newTaskName.trim()) {
                handleTaskNameBlur(task.id);
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
          ></div>
          <span 
            className="flex-1 text-white cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              handleTaskClick(task);
            }}
          >
            {task.name || "Add task"}
          </span>
          
          {task.category && (
            <span 
              className={`text-xs px-1.5 py-0.5 rounded-full ${getTaskCategoryBadgeClass(task.category)} cursor-pointer`}
              onClick={(e) => {
                e.stopPropagation();
                handleCategoryClick(task);
              }}
            >
              {task.category}
            </span>
          )}
        </>
      )}
      
      <div className="flex items-center">
        {/* Only enable the edit button if task has text */}
        {task.name.trim() ? (
          <Popover>
            <PopoverTrigger asChild>
              <button 
                className="p-1 rounded-full hover:bg-gray-700/50"
                onClick={(e) => e.stopPropagation()}
              >
                <Edit size={14} className="text-gray-400" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto bg-gray-800 border-gray-700 rounded-lg p-2">
              <TaskPopoverContent 
                task={task} 
                handleEditTask={handleEditTask}
                handleSetReminder={handleSetReminder}
                handleMoveTask={handleMoveTask}
                handleDeleteTask={handleDeleteTask}
              />
            </PopoverContent>
          </Popover>
        ) : (
          <button 
            className="p-1 rounded-full hover:bg-gray-700/50 opacity-50 cursor-not-allowed"
            onClick={(e) => {
              e.stopPropagation();
              toast({
                title: "Task name required",
                description: "Please enter a name for your task before editing",
                variant: "destructive"
              });
            }}
          >
            <Edit size={14} className="text-gray-400" />
          </button>
        )}
        
        <button 
          onClick={(e) => {
            e.stopPropagation();
            handleTaskToggle(task.id);
          }}
          className="p-1 rounded-full hover:bg-gray-700/50 ml-1"
        >
          {task.completed ? (
            <Check size={16} className="text-green-400" />
          ) : (
            <Circle size={16} className="text-gray-400" />
          )}
        </button>
      </div>
    </motion.div>
  );
};

interface TaskPopoverContentProps {
  task: DailyTask;
  handleEditTask: (task: DailyTask) => void;
  handleSetReminder: (task: DailyTask) => void;
  handleMoveTask: (task: DailyTask) => void;
  handleDeleteTask: (taskId: number) => void;
}

const TaskPopoverContent: React.FC<TaskPopoverContentProps> = ({
  task,
  handleEditTask,
  handleSetReminder,
  handleMoveTask,
  handleDeleteTask
}) => {
  return (
    <div className="flex flex-col gap-1">
      <Button 
        variant="ghost" 
        size="sm" 
        className="justify-start text-xs px-2"
        onClick={(e) => {
          e.stopPropagation();
          handleEditTask(task);
        }}
      >
        <Edit className="mr-2 h-3 w-3" /> Edit Task
      </Button>
      <Button 
        variant="ghost" 
        size="sm" 
        className="justify-start text-xs px-2"
        onClick={(e) => {
          e.stopPropagation();
          handleSetReminder(task);
        }}
      >
        <Circle className="mr-2 h-3 w-3" /> Set Time
      </Button>
      <Button 
        variant="ghost" 
        size="sm" 
        className="justify-start text-xs px-2"
        onClick={(e) => {
          e.stopPropagation();
          handleMoveTask(task);
        }}
      >
        <Circle className="mr-2 h-3 w-3" /> Move Task
      </Button>
      <Button 
        variant="ghost" 
        size="sm" 
        className="justify-start text-xs px-2 text-red-400 hover:text-red-300 hover:bg-red-500/20"
        onClick={(e) => {
          e.stopPropagation();
          handleDeleteTask(task.id);
        }}
      >
        <X className="mr-2 h-3 w-3" /> Delete
      </Button>
    </div>
  );
};

export default TimeSlot;

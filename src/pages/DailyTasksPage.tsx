import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Edit, Plus, Home, Calendar, X, Check, Clock, CalendarCheck, Circle, Settings, Copy, Move, Trash2, CalendarDays, CheckCircle } from 'lucide-react';
import { format, addDays, subDays, parseISO, isToday, isTomorrow, isSameDay } from 'date-fns';
import { DailyTask } from '@/components/planner/DailyTasksTab';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { useIsMobile, useTouchDevice } from '@/hooks/use-mobile';
import TimeInput from '@/components/TimeInput';
import { DatePicker } from '@/components/ui/date-picker';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface TimeIncrementOption {
  label: string;
  value: number;
}

const DailyTasksPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const isTouchDevice = useTouchDevice();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [dailyTasks, setDailyTasks] = useState<DailyTask[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [showClearTasksModal, setShowClearTasksModal] = useState(false);
  const [showClearTaskWarning, setShowClearTaskWarning] = useState(true);
  const [selectedTask, setSelectedTask] = useState<DailyTask | null>(null);
  const [newTaskName, setNewTaskName] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState('Personal');
  const [newTaskColor, setNewTaskColor] = useState('#9b87f5');
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [displayRange, setDisplayRange] = useState<'all' | 'morning' | 'afternoon' | 'evening'>('all');
  const [timeIncrement, setTimeIncrement] = useState<number>(30);
  const [copyToDate, setCopyToDate] = useState<Date | undefined>(undefined);
  const [moveToDate, setMoveToDate] = useState<Date | undefined>(undefined);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedTask, setDraggedTask] = useState<DailyTask | null>(null);
  const [targetTimeSlot, setTargetTimeSlot] = useState<string | null>(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showMoveTaskModal, setShowMoveTaskModal] = useState(false);

  const timeIncrementOptions: TimeIncrementOption[] = [
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
  const getFilteredTimeSlots = useCallback(() => {
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
          return period === 'PM' && (parseInt(hour) <= 5 || parseInt(hour) === 12);
        });
      case 'evening':
        return timeSlots.filter(slot => {
          const [time, period] = slot.split(' ');
          const [hour] = time.split(':');
          return period === 'PM' && parseInt(hour) >= 6 && parseInt(hour) !== 12;
        });
      default:
        return timeSlots;
    }
  }, [timeSlots, displayRange]);

  const displayTimeSlots = getFilteredTimeSlots();

  useEffect(() => {
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
  }, [displayRange, timeIncrement, currentDate]);

  useEffect(() => {
    const savedTasks = localStorage.getItem('dailyTasks');
    if (savedTasks) {
      try {
        const allTasks = JSON.parse(savedTasks);
        setDailyTasks(allTasks);
      } catch (e) {
        console.error('Failed to parse daily tasks', e);
        toast({
          title: "Error loading tasks",
          description: "There was a problem loading your daily tasks",
          variant: "destructive"
        });
      }
    }
    const warningPref = localStorage.getItem('showClearTaskWarning');
    if (warningPref !== null) {
      setShowClearTaskWarning(warningPref === 'true');
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('dailyTasks', JSON.stringify(dailyTasks));
  }, [dailyTasks]);

  useEffect(() => {
    localStorage.setItem('showClearTaskWarning', showClearTaskWarning.toString());
  }, [showClearTaskWarning]);

  const handlePreviousDay = () => {
    setCurrentDate(prev => subDays(prev, 1));
    setEditingTaskId(null);
  };

  const handleNextDay = () => {
    setCurrentDate(prev => addDays(prev, 1));
    setEditingTaskId(null);
  };

  const handleTaskToggle = (taskId: number) => {
    const task = dailyTasks.find(t => t.id === taskId);
    if (task && !task.name.trim()) {
      toast({
        title: "Task name required",
        description: "Please enter a name for your task before marking it complete",
        variant: "destructive"
      });
      if (editingTaskId !== taskId) {
        startEditing(taskId);
      }
      return;
    }

    setDailyTasks(prev => prev.map(task => {
      if (task.id === taskId) {
        const wasCompleted = task.completed;
        const today = format(currentDate, 'yyyy-MM-dd');
        let newStreak = task.streak;
        let lastCompleted = task.lastCompleted;

        if (!wasCompleted) {
          newStreak = task.streak + 1;
          lastCompleted = today;
          toast({
            title: "Task completed!",
            description: `You've completed "${task.name}" - ${newStreak} day streak! 🎉`
          });
        } else {
          if (task.lastCompleted === today) {
            newStreak = Math.max(0, task.streak - 1);
            toast({
              title: "Task marked incomplete",
              description: "The task has been marked as incomplete",
              variant: "destructive"
            });
          }
        }

        return {
          ...task,
          completed: !wasCompleted,
          streak: newStreak,
          lastCompleted
        };
      }
      return task;
    }));
  };

  const getTasksForCurrentDate = () => {
    const currentDateStr = format(currentDate, 'yyyy-MM-dd');
    return dailyTasks.filter(task => {
      if (task.lastCompleted) {
        return task.lastCompleted.split('T')[0] === currentDateStr;
      }
      if (task.id) {
        const taskDate = new Date(task.id);
        return isSameDay(taskDate, currentDate);
      }
      return false;
    });
  };

  const handleQuickAddTask = (timeSlot: string) => {
    const [time, period] = timeSlot.split(' ');
    const [hour, minute] = time.split(':');
    let hour24 = parseInt(hour);
    if (period === 'PM' && hour24 !== 12) {
      hour24 += 12;
    } else if (period === 'AM' && hour24 === 12) {
      hour24 = 0;
    }
    const timeString = `${hour24.toString().padStart(2, '0')}:${minute}`;
    const newTask: DailyTask = {
      id: Date.now(),
      name: "",
      completed: false,
      timeOfDay: timeString,
      streak: 0,
      lastCompleted: format(currentDate, 'yyyy-MM-dd'),
      color: newTaskColor,
      category: 'Personal'
    };

    setDailyTasks(prev => [...prev, newTask]);
    setSelectedTask(newTask);
    setEditingTaskId(newTask.id);
    setNewTaskName('');
    setTimeout(() => {
      const input = document.querySelector(`div[data-task-id="${newTask.id}"] input`);
      if (input instanceof HTMLInputElement) {
        input.focus();
      }
    }, 100);
  };

  const handleAddTask = () => {
    if (!newTaskName.trim()) {
      toast({
        title: "Task name required",
        description: "Please enter a name for your daily task",
        variant: "destructive"
      });
      return;
    }

    const newTask: DailyTask = {
      id: Date.now(),
      name: newTaskName,
      completed: false,
      timeOfDay: undefined,
      streak: 0,
      lastCompleted: format(currentDate, 'yyyy-MM-dd'),
      color: newTaskColor,
      category: newTaskCategory
    };

    setDailyTasks(prev => [...prev, newTask]);
    setNewTaskName('');
    setShowAddModal(false);
    toast({
      title: "Task added",
      description: `"${newTaskName}" has been added to your daily tasks`
    });
  };

  const startEditing = (taskId: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingTaskId(taskId);
    const task = dailyTasks.find(t => t.id === taskId);
    if (task) {
      setNewTaskName(task.name);
      setNewTaskCategory(task.category || 'Personal');
      setNewTaskColor(task.color || '#9b87f5');
    }
  };

  const handleEditTask = (task: DailyTask) => {
    if (!task.name.trim()) {
      toast({
        title: "Task name required",
        description: "Please enter a name for your task",
        variant: "destructive"
      });
      return;
    }
    setEditingTaskId(null);
    setNewTaskName(task.name);
    setNewTaskCategory(task.category || 'Personal');
    setNewTaskColor(task.color || '#9b87f5');
    setSelectedTask(task);
    setShowAddModal(true);
  };

  const handleUpdateTask = () => {
    if (!selectedTask) return;
    if (!newTaskName.trim()) {
      toast({
        title: "Task name required",
        description: "Please enter a name for your task",
        variant: "destructive"
      });
      return;
    }
    setDailyTasks(prev => prev.map(task => {
      if (task.id === selectedTask.id) {
        return {
          ...task,
          name: newTaskName,
          color: newTaskColor,
          category: newTaskCategory
        };
      }
      return task;
    }));
    setSelectedTask(null);
    setNewTaskName('');
    setShowAddModal(false);
    toast({
      title: "Task updated",
      description: `Your task has been updated successfully`
    });
  };

  const handleDeleteTask = (taskId: number) => {
    setDailyTasks(prev => prev.filter(task => task.id !== taskId));
    toast({
      title: "Task deleted",
      description: "The task has been removed from your list"
    });
  };

  const handleMoveTask = (task: DailyTask) => {
    setSelectedTask(task);
    setMoveToDate(undefined);
    setShowMoveTaskModal(true);
  };

  const handleMoveTaskToDate = () => {
    if (!selectedTask || !moveToDate) {
      toast({
        title: "Select a date",
        description: "Please select a date to move this task to",
        variant: "destructive"
      });
      return;
    }
    const movedTask: DailyTask = {
      ...selectedTask,
      id: Date.now() + Math.random() * 1000,
      completed: false
    };
    setDailyTasks(prev => [...prev, movedTask]);
    if (selectedTask) {
      setDailyTasks(prev => prev.filter(t => t.id !== selectedTask.id));
    }
    toast({
      title: "Task moved",
      description: `"${selectedTask.name}" moved to ${format(moveToDate, 'MMMM d, yyyy')}`
    });
    setShowMoveTaskModal(false);
    setSelectedTask(null);
    setMoveToDate(undefined);
  };

  const handleDragStart = (task: DailyTask) => {
    if (isMobile || isTouchDevice) {
      setIsDragging(true);
      setDraggedTask(task);
    }
  };

  const handleDragEnd = () => {
    if ((isMobile || isTouchDevice) && draggedTask && targetTimeSlot) {
      const [time, period] = targetTimeSlot.split(' ');
      const [hour, minute] = time.split(':');
      let hour24 = parseInt(hour);
      if (period === 'PM' && hour24 !== 12) {
        hour24 += 12;
      } else if (period === 'AM' && hour24 === 12) {
        hour24 = 0;
      }
      const timeString = `${hour24.toString().padStart(2, '0')}:${minute}`;
      setDailyTasks(prev => prev.map(task => {
        if (task.id === draggedTask.id) {
          return {
            ...task,
            timeOfDay: timeString
          };
        }
        return task;
      }));
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

  const handleTaskNameBlur = (taskId: number) => {
    const task = dailyTasks.find(t => t.id === taskId);
    if (task && !newTaskName.trim()) {
      setDailyTasks(prev => prev.filter(t => t.id !== taskId));
      setEditingTaskId(null);
      return;
    }
    if (newTaskName.trim()) {
      setDailyTasks(prev => prev.map(t => {
        if (t.id === taskId) {
          return {
            ...t,
            name: newTaskName
          };
        }
        return t;
      }));
      setEditingTaskId(null);
    }
  };

  const handleCategoryClick = (task: DailyTask) => {
    setSelectedTask(task);
    setNewTaskCategory(task.category || 'Personal');
    setNewTaskColor(task.color || '#9b87f5');
    setShowCategoryModal(true);
  };

  const saveCategory = () => {
    if (!selectedTask) return;
    setDailyTasks(prev => prev.map(task => {
      if (task.id === selectedTask.id) {
        return {
          ...task,
          category: newTaskCategory,
          color: newTaskColor
        };
      }
      return task;
    }));
    toast({
      title: "Category updated",
      description: `Task category has been updated to ${newTaskCategory}`
    });
    setShowCategoryModal(false);
    setSelectedTask(null);
  };

  const handleCopyTasks = () => {
    if (!copyToDate) {
      toast({
        title: "Select a date",
        description: "Please select a date to copy tasks to",
        variant: "destructive"
      });
      return;
    }

    const currentDateStr = format(currentDate, 'yyyy-MM-dd');
    const targetDateStr = format(copyToDate, 'yyyy-MM-dd');
    
    const tasksForCurrentDate = getTasksForCurrentDate();

    if (tasksForCurrentDate.length === 0) {
      toast({
        title: "No tasks to copy",
        description: "There are no tasks on the current day to copy",
        variant: "destructive"
      });
      return;
    }

    const existingTasksOnTargetDate = dailyTasks.filter(task => {
      const taskDate = task.lastCompleted ? task.lastCompleted.split('T')[0] : '';
      return taskDate === targetDateStr;
    });

    const tasksToAdd = tasksForCurrentDate.filter(currentTask => {
      return !existingTasksOnTargetDate.some(targetTask => 
        targetTask.name === currentTask.name && 
        targetTask.category === currentTask.category
      );
    });

    if (tasksToAdd.length === 0) {
      toast({
        title: "No new tasks to copy",
        description: "All tasks already exist on the target date",
        variant: "destructive"
      });
      return;
    }

    const copiedTasks = tasksToAdd.map(task => ({
      ...task,
      id: Date.now() + Math.random() * 1000,
      completed: false,
      lastCompleted: targetDateStr
    }));

    setDailyTasks(prev => [...prev, ...copiedTasks]);
    toast({
      title: "Tasks copied",
      description: `${copiedTasks.length} tasks copied to ${format(copyToDate, 'MMMM d, yyyy')}`
    });
    setCopyToDate(undefined);
    setShowCopyModal(false);
  };

  const handleClearTasks = () => {
    if (showClearTaskWarning) {
      setShowClearTasksModal(true);
    } else {
      clearTasksForCurrentDay();
    }
  };

  const clearTasksForCurrentDay = () => {
    const currentDateStr = format(currentDate, 'yyyy-MM-dd');
    const tasksToRemove = dailyTasks.filter(task => {
      const taskDay = task.lastCompleted ? task.lastCompleted.split('T')[0] : '';
      return taskDay === currentDateStr;
    });

    if (tasksToRemove.length === 0) {
      toast({
        title: "No tasks to clear",
        description: "There are no tasks for the current day to clear"
      });
      return;
    }

    setDailyTasks(prev => prev.filter(task => {
      const taskDay = task.lastCompleted ? task.lastCompleted.split('T')[0] : '';
      return taskDay !== currentDateStr;
    }));

    toast({
      title: "Tasks cleared",
      description: `${tasksToRemove.length} tasks have been cleared for ${format(currentDate, 'MMMM d, yyyy')}`
    });
    setShowClearTasksModal(false);
  };

  const handleTimeIncrementChange = (value: number) => {
    setTimeIncrement(value);
    toast({
      title: "Settings updated",
      description: `Time increment set to ${value} minutes`
    });
  };

  const getTasksForTimeSlot = (timeSlot: string) => {
    const [time, period] = timeSlot.split(' ');
    const [hour, minute] = time.split(':');
    let hour24 = parseInt(hour);
    if (period === 'PM' && hour24 !== 12) {
      hour24 += 12;
    } else if (period === 'AM' && hour24 === 12) {
      hour24 = 0;
    }
    const timeString = `${hour24.toString().padStart(2, '0')}:${minute}`;
    
    const currentDateStr = format(currentDate, 'yyyy-MM-dd');
    return dailyTasks.filter(task => {
      const isCorrectTime = task.timeOfDay === timeString;
      const isForCurrentDate = task.lastCompleted ? 
        task.lastCompleted.split('T')[0] === currentDateStr : 
        isSameDay(new Date(task.id), currentDate);
      
      return isCorrectTime && isForCurrentDate;
    });
  };

  const formattedDate = format(currentDate, 'MMMM d, yyyy');
  const dayName = format(currentDate, 'EEEE');
  const dateLabel = isToday(currentDate) ? 'Today' : isTomorrow(currentDate) ? 'Tomorrow' : dayName;

  const getTaskCategoryBadgeClass = (category?: string) => {
    switch (category) {
      case 'Morning Routine':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/50';
      case 'Work':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/50';
      case 'Health':
        return 'bg-green-500/20 text-green-300 border-green-500/50';
      case 'Learning':
        return 'bg-orange-500/20 text-orange-300 border-orange-500/50';
      case 'Evening Routine':
        return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/50';
      case 'Wellness':
        return 'bg-pink-500/20 text-pink-300 border-pink-500/50';
      case 'Productivity':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/50';
    }
  };

  const CATEGORIES = ['Morning Routine', 'Work', 'Health', 'Learning', 'Evening Routine', 'Wellness', 'Productivity', 'Personal', 'Custom'];
  const COLORS = ['#9b87f5',
    // Primary Purple
    '#6E56CF',
    // Vivid Purple
    '#0EA5E9',
    // Ocean Blue
    '#1EAEDB',
    // Bright Blue
    '#33C3F0',
    // Sky Blue
    '#D6BCFA',
    // Light Purple
    '#F97316',
    // Bright Orange
    '#D946EF' // Magenta Pink
  ];

  const [newTaskTime, setNewTaskTime] = useState('');

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-gray-100">
      <div className={`mx-auto p-2 ${isMobile ? 'max-w-md' : 'max-w-2xl'}`}>
        <div className="flex items-center justify-between mb-4 my-0 px-px mx-0 py-[3px]">
          <button onClick={() => navigate('/')} className="rounded-md p-2 hover:bg-gray-800 transition-colors">
            <Home size={24} className="text-blue-400" />
          </button>
          
          <div className="flex items-center absolute left-1/2 transform -translate-x-1/2 text-white">
            <div className="flex flex-col items-center">
              <button onClick={() => setShowCalendarModal(true)} className="flex items-center gap-2 text-2xl font-bold transition-colors">
                <CalendarCheck className="h-6 w-6 text-blue-400" />
                {dateLabel}
              </button>
            </div>
          </div>
          
          <div className="flex gap-1">
            <button onClick={() => setShowSettingsModal(true)} className="rounded-md p-2 hover:bg-gray-800 transition-colors">
              <Settings size={20} className="text-blue-400" />
            </button>
            
            <button onClick={() => setShowCopyModal(true)} className="rounded-md p-2 hover:bg-gray-800 transition-colors">
              <Copy size={20} className="text-blue-400" />
            </button>
            
            <button onClick={() => handleClearTasks()} className="rounded-md p-2 hover:bg-gray-800 transition-colors">
              <Trash2 size={20} className="text-red-400" />
            </button>
            
            <button onClick={e => {
              e.stopPropagation();
              setSelectedTask(null);
              setEditingTaskId(null);
              setNewTaskName('');
              setNewTaskCategory('Personal');
              setNewTaskColor('#9b87f5');
              setShowAddModal(true);
            }} className="rounded-md p-2 hover:bg-gray-800 transition-colors">
              <Plus size={20} className="text-blue-400" />
            </button>
          </div>
        </div>
        
        <div className="flex items-center justify-between mb-4 py-2 bg-gray-800/30 rounded-lg relative h-12 my-[10px] px-0 mx-0">
          <button onClick={handlePreviousDay} className="hover:bg-gray-800 p-2 rounded-full transition-colors absolute left-2 z-10">
            <ChevronLeft size={20} className="text-blue-400" />
          </button>
          
          <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full text-center">
            <span className="text-lg font-medium text-white">{formattedDate}</span>
          </div>
          
          <button onClick={handleNextDay} className="hover:bg-gray-800 p-2 rounded-full transition-colors absolute right-2 z-10">
            <ChevronRight size={20} className="text-blue-400" />
          </button>
        </div>
        
        <div className="flex items-center justify-between mb-4 space-x-2">
          {(['all', 'morning', 'afternoon', 'evening'] as const).map(range => (
            <button 
              key={range} 
              onClick={() => setDisplayRange(range)} 
              className={`flex-1 py-2 px-1 rounded-md text-sm transition-colors ${
                displayRange === range 
                  ? 'bg-purple-600/20 text-purple-300 border border-purple-600/30' 
                  : 'bg-gray-800/40 hover:bg-gray-800/60'
              }`}
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </button>
          ))}
        </div>
        
        <ScrollArea className="h-[calc(100vh-200px)] rounded-lg border border-gray-800 bg-gray-900/80" ref={scrollRef}>
          {displayTimeSlots.map((timeSlot, index) => {
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
            const isCurrentTimeSlot = isToday(currentDate) && now.getHours() === slotHour24 && now.getMinutes() >= parseInt(slotMinute) && now.getMinutes() < parseInt(slotMinute) + timeIncrement;
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
                  <div className={`w-20 text-sm font-medium ${isCurrentTimeSlot ? 'text-purple-300' : 'text-gray-400'}`}>
                    {timeSlot}
                  </div>
                  
                  <div className="flex-1 ml-4">
                    {tasksInSlot.length > 0 ? (
                      <div className="space-y-2">
                        {tasksInSlot.map(task => (
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
                                onBlur={() => handleTaskNameBlur(task.id)} 
                                className="bg-gray-700 border-gray-600"
                                onClick={e => e.stopPropagation()}
                              />
                            ) : (
                              <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-2">
                                  <button 
                                    onClick={() => handleTaskToggle(task.id)}
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
                                    >
                                      {task.name}
                                    </span>
                                    {task.category && (
                                      <span 
                                        className={`text-xs px-2 py-0.5 ml-2 rounded-full border ${getTaskCategoryBadgeClass(task.category)}`}
                                        onClick={() => handleCategoryClick(task)}
                                      >
                                        {task.category}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                
                                <div className="flex items-center gap-1">
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      startEditing(task.id, e);
                                    }}
                                    className="p-1 hover:bg-gray-700 rounded-full transition-colors"
                                  >
                                    <Edit size={14} className="text-gray-400 hover:text-gray-300" />
                                  </button>
                                  
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleMoveTask(task);
                                    }}
                                    className="p-1 hover:bg-gray-700 rounded-full transition-colors"
                                  >
                                    <Move size={14} className="text-gray-400 hover:text-gray-300" />
                                  </button>
                                  
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteTask(task.id);
                                    }}
                                    className="p-1 hover:bg-gray-700 rounded-full transition-colors"
                                  >
                                    <Trash2 size={14} className="text-gray-400 hover:text-red-400" />
                                  </button>
                                </div>
                              </div>
                            )}
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <motion.div 
                        className="flex items-center justify-center py-2 opacity-30 hover:opacity-100 transition-opacity cursor-pointer"
                        onClick={() => handleQuickAddTask(timeSlot)}
                        whileHover={{ scale: 1.03 }}
                      >
                        <Plus size={16} className="text-gray-400 mr-1" />
                        <span className="text-sm text-gray-400">Add task at {timeSlot}</span>
                      </motion.div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </ScrollArea>
      </div>
      
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="sm:max-w-md bg-gray-900 border-gray-800 text-gray-100">
          <DialogHeader>
            <DialogTitle>{selectedTask ? 'Edit Task' : 'Add Task'}</DialogTitle>
            <DialogDescription className="text-gray-400">
              {selectedTask ? 'Update your task details' : 'Add a new task to your schedule'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="taskName">Task Name</Label>
              <Input 
                id="taskName"
                value={newTaskName} 
                onChange={e => setNewTaskName(e.target.value)} 
                placeholder="Enter task name"
                className="bg-gray-800 border-gray-700"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Category</Label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map(category => (
                  <button
                    key={category}
                    onClick={() => setNewTaskCategory(category)}
                    className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
                      newTaskCategory === category 
                        ? 'bg-purple-900/30 border-purple-500/50 text-purple-300' 
                        : 'bg-gray-800/40 border-gray-700 text-gray-300 hover:bg-gray-800/80'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex flex-wrap gap-2">
                {COLORS.map(color => (
                  <button
                    key={color}
                    onClick={() => setNewTaskColor(color)}
                    className={`w-6 h-6 rounded-full transition-transform ${
                      newTaskColor === color 
                        ? 'ring-2 ring-white scale-125' 
                        : 'hover:scale-110'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <TimeInput
                value={selectedTask?.timeOfDay || ''}
                onChange={(time) => {
                  if (selectedTask) {
                    setSelectedTask({ ...selectedTask, timeOfDay: time });
                  }
                }}
                label="Time of Day (optional)"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="ghost" 
              onClick={() => {
                setShowAddModal(false);
                setSelectedTask(null);
              }}
              className="bg-gray-800 hover:bg-gray-700"
            >
              Cancel
            </Button>
            <Button 
              onClick={selectedTask ? handleUpdateTask : handleAddTask}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {selectedTask ? 'Update Task' : 'Add Task'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={showCalendarModal} onOpenChange={setShowCalendarModal}>
        <DialogContent className="sm:max-w-md bg-gray-900 border-gray-800 text-gray-100">
          <DialogHeader>
            <DialogTitle>Calendar</DialogTitle>
            <DialogDescription className="text-gray-400">
              Select a date to view or schedule tasks
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <DatePicker 
              date={currentDate}
              onDateChange={(date) => {
                if (date) {
                  setCurrentDate(date);
                  setShowCalendarModal(false);
                }
              }}
            />
          </div>
        </DialogContent>
      </Dialog>
      
      <Dialog open={showSettingsModal} onOpenChange={setShowSettingsModal}>
        <DialogContent className="sm:max-w-md bg-gray-900 border-gray-800 text-gray-100">
          <DialogHeader>
            <DialogTitle>Settings</DialogTitle>
            <DialogDescription className="text-gray-400">
              Customize your daily tasks view
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Time Increment</h3>
              <div className="flex flex-wrap gap-2">
                {timeIncrementOptions.map(option => (
                  <button
                    key={option.value}
                    onClick={() => handleTimeIncrementChange(option.value)}
                    className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
                      timeIncrement === option.value 
                        ? 'bg-purple-600/30 text-purple-300 border border-purple-500/50' 
                        : 'bg-gray-800 text-gray-300 border border-gray-700 hover:bg-gray-800/80'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch 
                id="clear-warning"
                checked={showClearTaskWarning}
                onCheckedChange={setShowClearTaskWarning}
              />
              <Label htmlFor="clear-warning" className="text-sm">Show warning when clearing tasks</Label>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              onClick={() => setShowSettingsModal(false)}
              className="bg-purple-600 hover:bg-purple-700"
            >
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={showCopyModal} onOpenChange={setShowCopyModal}>
        <DialogContent className="sm:max-w-md bg-gray-900 border-gray-800 text-gray-100">
          <DialogHeader>
            <DialogTitle>Copy Tasks</DialogTitle>
            <DialogDescription className="text-gray-400">
              Copy all tasks from {format(currentDate, 'MMMM d, yyyy')} to another date
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            <DatePicker 
              date={copyToDate}
              onDateChange={setCopyToDate}
              label="Select target date"
            />
          </div>
          
          <DialogFooter>
            <Button 
              variant="ghost" 
              onClick={() => setShowCopyModal(false)}
              className="bg-gray-800 hover:bg-gray-700"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCopyTasks}
              className="bg-purple-600 hover:bg-purple-700"
              disabled={!copyToDate}
            >
              Copy Tasks
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={showClearTasksModal} onOpenChange={setShowClearTasksModal}>
        <DialogContent className="sm:max-w-xs bg-gray-900 border-gray-800 text-gray-100">
          <DialogHeader>
            <DialogTitle>Clear Tasks</DialogTitle>
            <DialogDescription className="text-gray-400">
              Are you sure you want to clear all tasks for {format(currentDate, 'MMMM d, yyyy')}?
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button 
              variant="ghost" 
              onClick={() => setShowClearTasksModal(false)}
              className="bg-gray-800 hover:bg-gray-700"
            >
              Cancel
            </Button>
            <Button 
              onClick={clearTasksForCurrentDay}
              className="bg-red-600 hover:bg-red-700"
            >
              Clear Tasks
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={showCategoryModal} onOpenChange={setShowCategoryModal}>
        <DialogContent className="sm:max-w-md bg-gray-900 border-gray-800 text-gray-100">
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
            <DialogDescription className="text-gray-400">
              Update the category for this task
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map(category => (
                  <button
                    key={category}
                    onClick={() => setNewTaskCategory(category)}
                    className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
                      newTaskCategory === category 
                        ? 'bg-purple-900/30 border-purple-500/50 text-purple-300' 
                        : 'bg-gray-800/40 border-gray-700 text-gray-300 hover:bg-gray-800/80'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex flex-wrap gap-2">
                {COLORS.map(color => (
                  <button
                    key={color}
                    onClick={() => setNewTaskColor(color)}
                    className={`w-6 h-6 rounded-full transition-transform ${
                      newTaskColor === color 
                        ? 'ring-2 ring-white scale-125' 
                        : 'hover:scale-110'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="ghost" 
              onClick={() => setShowCategoryModal(false)}
              className="bg-gray-800 hover:bg-gray-700"
            >
              Cancel
            </Button>
            <Button 
              onClick={saveCategory}
              className="bg-purple-600 hover:bg-purple-700"
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={showMoveTaskModal} onOpenChange={setShowMoveTaskModal}>
        <DialogContent className="sm:max-w-md bg-gray-900 border-gray-800 text-gray-100">
          <DialogHeader>
            <DialogTitle>Move Task</DialogTitle>
            <DialogDescription className="text-gray-400">
              Move "{selectedTask?.name}" to another date
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            <DatePicker 
              date={moveToDate}
              onDateChange={setMoveToDate}
              label="Select target date"
            />
          </div>
          
          <DialogFooter>
            <Button 
              variant="ghost" 
              onClick={() => setShowMoveTaskModal(false)}
              className="bg-gray-800 hover:bg-gray-700"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleMoveTaskToDate}
              className="bg-purple-600 hover:bg-purple-700"
              disabled={!moveToDate}
            >
              Move Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DailyTasksPage;

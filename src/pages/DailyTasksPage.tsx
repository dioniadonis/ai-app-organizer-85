import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Edit, Plus, Bell, Home, Calendar, X, Check, AlarmClock, Clock, BellRing, CalendarCheck, Circle, Settings, Copy, Move, Trash2, CalendarDays } from 'lucide-react';
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
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [showClearTasksModal, setShowClearTasksModal] = useState(false);
  const [showClearTaskWarning, setShowClearTaskWarning] = useState(true);
  const [selectedTask, setSelectedTask] = useState<DailyTask | null>(null);
  const [newTaskName, setNewTaskName] = useState('');
  const [newTaskTime, setNewTaskTime] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState('Personal');
  const [newTaskColor, setNewTaskColor] = useState('#9b87f5');
  const [reminderTime, setReminderTime] = useState('');
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
  const timeIncrementOptions: TimeIncrementOption[] = [{
    label: '15 minutes',
    value: 15
  }, {
    label: '30 minutes',
    value: 30
  }, {
    label: '60 minutes',
    value: 60
  }];
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
          return period === 'PM' && parseInt(hour) < 6;
        });
      case 'evening':
        return timeSlots.filter(slot => {
          const [time, period] = slot.split(' ');
          const [hour] = time.split(':');
          return period === 'PM' && parseInt(hour) >= 5;
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
        const today = new Date().toISOString().split('T')[0];
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
      lastCompleted: undefined,
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
      timeOfDay: newTaskTime || undefined,
      streak: 0,
      lastCompleted: undefined,
      color: newTaskColor,
      category: newTaskCategory
    };
    setDailyTasks(prev => [...prev, newTask]);
    setNewTaskName('');
    setNewTaskTime('');
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
      setNewTaskTime(task.timeOfDay || '');
      setNewCategory(task.category || 'Personal');
      setNewColor(task.color || COLORS[0]);
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
    setNewTaskTime(task.timeOfDay || '');
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
          timeOfDay: newTaskTime || undefined,
          color: newTaskColor,
          category: newTaskCategory
        };
      }
      return task;
    }));
    setSelectedTask(null);
    setNewTaskName('');
    setNewTaskTime('');
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
  const handleSetReminder = (task: DailyTask) => {
    setSelectedTask(task);
    setReminderTime(task.timeOfDay || '');
    setShowReminderModal(true);
  };
  const saveReminder = () => {
    if (!selectedTask || !reminderTime) {
      toast({
        title: "Reminder time required",
        description: "Please select a time for the reminder",
        variant: "destructive"
      });
      return;
    }
    setDailyTasks(prev => prev.map(task => {
      if (task.id === selectedTask.id) {
        return {
          ...task,
          timeOfDay: reminderTime
        };
      }
      return task;
    }));
    toast({
      title: "Reminder set",
      description: `Reminder set for "${selectedTask.name}" at ${reminderTime}`
    });
    setShowReminderModal(false);
    setSelectedTask(null);
    setReminderTime('');
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
    const tasksForToday = dailyTasks.filter(task => {
      if (task.lastCompleted) {
        const taskDate = task.lastCompleted.split('T')[0];
        return taskDate === currentDateStr;
      }
      return isSameDay(new Date(task.id), currentDate);
    });
    const copiedTasks = tasksForToday.map(task => ({
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
    const today = format(currentDate, 'yyyy-MM-dd');
    const tasksToRemove = dailyTasks.filter(task => {
      const taskDay = task.lastCompleted ? task.lastCompleted.split('T')[0] : today;
      return taskDay === today;
    });
    if (tasksToRemove.length === 0) {
      toast({
        title: "No tasks to clear",
        description: "There are no tasks for the current day to clear"
      });
      return;
    }
    setDailyTasks(prev => prev.filter(task => {
      const taskDay = task.lastCompleted ? task.lastCompleted.split('T')[0] : today;
      return taskDay !== today;
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
    return dailyTasks.filter(task => task.timeOfDay === timeString);
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
  return <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-gray-100">
      <div className={`mx-auto p-2 ${isMobile ? 'max-w-md' : 'max-w-2xl'}`}>
        <div className="flex items-center justify-between mb-4 py-2">
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
            setNewTaskTime('');
            setNewTaskCategory('Personal');
            setNewTaskColor('#9b87f5');
            setShowAddModal(true);
          }} className="rounded-md p-2 hover:bg-gray-800 transition-colors">
              <Plus size={20} className="text-blue-400" />
            </button>
          </div>
        </div>
        
        <div className="flex items-center justify-between mb-4 px-4 py-2 bg-gray-800/30 rounded-lg relative h-12">
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
          {(['all', 'morning', 'afternoon', 'evening'] as const).map(range => <button key={range} onClick={() => setDisplayRange(range)} className={`flex-1 py-2 px-1 rounded-md text-sm transition-colors ${displayRange === range ? 'bg-purple-600/20 text-purple-300 border border-purple-600/30' : 'bg-gray-800/40 hover:bg-gray-800/60'}`}>
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </button>)}
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
          return <div key={timeSlot} id={timeSlotId} className={`border-b border-gray-800 last:border-b-0 ${isCurrentTimeSlot ? 'bg-purple-900/20' : ''} ${targetTimeSlot === timeSlot && isDragging ? 'bg-blue-900/30 border-blue-500/50' : ''}`} onMouseEnter={() => handleTimeSlotHover(timeSlot)} onMouseUp={handleDragEnd}>
                <div className="flex items-center p-3">
                  <div className={`w-20 text-sm font-medium ${isCurrentTimeSlot ? 'text-purple-300' : 'text-gray-400'}`}>
                    {timeSlot}
                  </div>
                  
                  <div className="flex-1 ml-4">
                    {tasksInSlot.length > 0 ? <div className="space-y-2">
                        {tasksInSlot.map(task => <motion.div key={task.id} data-task-id={task.id} className={`flex items-center gap-2 bg-gray-800/40 p-2 rounded-md border border-gray-700 hover:bg-gray-800/60 transition-all ${draggedTask?.id === task.id ? 'opacity-50 ring-2 ring-blue-500' : ''}`} initial={{
                    opacity: 0,
                    y: 5
                  }} animate={{
                    opacity: 1,
                    y: 0
                  }} whileHover={{
                    scale: 1.02
                  }} drag={isMobile || isTouchDevice ? true : false} dragConstraints={{
                    left: 0,
                    right: 0,
                    top: 0,
                    bottom: 0
                  }} dragElastic={0} dragMomentum={false} onDragStart={() => isMobile || isTouchDevice ? handleDragStart(task) : null} onDragEnd={isMobile || isTouchDevice ? handleDragEnd : null} style={{
                    cursor: (isMobile || isTouchDevice) && isDragging && draggedTask?.id === task.id ? 'grabbing' : 'auto'
                  }}>                            
                            {editingTaskId === task.id ? <Input value={newTaskName} onChange={e => setNewTaskName(e.target.value)} onBlur={() => handleTaskNameBlur(task.id)} className="bg-gray-700/50 border-gray-600 h-7 text-sm" autoFocus onKeyDown={e => {
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
                    }} /> : <>
                                <div className="w-3 h-3 rounded-full" style={{
                        backgroundColor: task.color || '#9b87f5'
                      }}></div>
                                <span className="flex-1 text-white cursor-pointer" onClick={e => {
                        e.stopPropagation();
                        startEditing(task.id, e);
                      }}>
                                  {task.name || "Add task"}
                                </span>
                                
                                {task.category && <span className={`text-xs px-1.5 py-0.5 rounded-full ${getTaskCategoryBadgeClass(task.category)} cursor-pointer`} onClick={e => {
                        e.stopPropagation();
                        handleCategoryClick(task);
                      }}>
                                    {task.category}
                                  </span>}
                              </>}
                            
                            <div className="flex items-center">
                              <Popover>
                                <PopoverTrigger asChild>
                                  <button className="p-1 rounded-full hover:bg-gray-700/50" onClick={e => e.stopPropagation()} disabled={!task.name.trim()}>
                                    <Edit size={14} className={task.name.trim() ? "text-gray-400" : "text-gray-600"} />
                                  </button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto bg-gray-800 border-gray-700 rounded-lg p-2">
                                  <div className="flex flex-col gap-1">
                                    <Button variant="ghost" size="sm" className="justify-start text-xs px-2" onClick={e => {
                              e.stopPropagation();
                              if (!task.name.trim()) {
                                toast({
                                  title: "Task name required",
                                  description: "Please enter a name for your task",
                                  variant: "destructive"
                                });
                                startEditing(task.id, e);
                                return;
                              }
                              handleEditTask(task);
                            }}>
                                      <Edit className="mr-2 h-3 w-3" /> Edit Task
                                    </Button>
                                    <Button variant="ghost" size="sm" className="justify-start text-xs px-2" onClick={e => {
                              e.stopPropagation();
                              handleSetReminder(task);
                            }}>
                                      <BellRing className="mr-2 h-3 w-3" /> Set Time
                                    </Button>
                                    <Button variant="ghost" size="sm" className="justify-start text-xs px-2" onClick={e => {
                              e.stopPropagation();
                              handleMoveTask(task);
                            }}>
                                      <Move className="mr-2 h-3 w-3" /> Move Task
                                    </Button>
                                    <Button variant="ghost" size="sm" className="justify-start text-xs px-2 text-red-400 hover:text-red-300 hover:bg-red-500/20" onClick={e => {
                              e.stopPropagation();
                              handleDeleteTask(task.id);
                            }}>
                                      <X className="mr-2 h-3 w-3" /> Delete
                                    </Button>
                                  </div>
                                </PopoverContent>
                              </Popover>
                              
                              <button onClick={e => {
                        e.stopPropagation();
                        handleTaskToggle(task.id);
                      }} className="p-1 rounded-full hover:bg-gray-700/50 ml-1">
                                {task.completed ? <Check size={16} className="text-green-400" /> : <Circle size={16} className="text-gray-400" />}
                              </button>
                            </div>
                          </motion.div>)}
                      </div> : <div className="h-8 flex items-center justify-center rounded-md border border-dashed border-gray-700 text-gray-500 text-sm hover:bg-gray-800/20 hover:border-gray-600 transition-all cursor-pointer" onClick={() => handleQuickAddTask(timeSlot)}>
                        <Plus size={16} className="mr-1" /> Add task
                      </div>}
                  </div>
                </div>
              </div>;
        })}
        </ScrollArea>
        
        <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
          <DialogContent className="bg-gray-800 border-gray-700 sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{selectedTask ? 'Edit Task' : 'Add New Task'}</DialogTitle>
              <DialogDescription className="text-gray-400">
                {selectedTask ? 'Update your daily task details' : 'Add a new daily task to your routine'}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <label htmlFor="name" className="text-sm font-medium text-gray-200">
                    Task Name
                  </label>
                  <Input id="name" placeholder="Enter task name" value={newTaskName} onChange={e => setNewTaskName(e.target.value)} className="bg-gray-700 border-gray-600" />
                </div>
                
                <div className="grid gap-2">
                  <label className="text-sm font-medium text-gray-200">
                    Time of Day
                  </label>
                  <TimeInput value={newTaskTime} onChange={setNewTaskTime} label="Time" />
                </div>
                
                <div className="grid gap-2">
                  <label htmlFor="category" className="text-sm font-medium text-gray-200">
                    Category
                  </label>
                  <Input id="category" placeholder="Enter custom category" value={newTaskCategory} onChange={e => setNewTaskCategory(e.target.value)} className="bg-gray-700 border-gray-600" />
                </div>
                
                <div className="grid gap-2">
                  <label className="text-sm font-medium text-gray-200">
                    Color
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {COLORS.map(color => <button key={color} className={`w-6 h-6 rounded-full ${newTaskColor === color ? 'ring-2 ring-white' : ''}`} style={{
                    backgroundColor: color
                  }} onClick={() => setNewTaskColor(color)} aria-label={`Select color ${color}`} />)}
                  </div>
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddModal(false)} className="border-gray-600 text-gray-300">
                Cancel
              </Button>
              <Button onClick={selectedTask ? handleUpdateTask : handleAddTask} className="bg-purple-600 hover:bg-purple-700">
                {selectedTask ? 'Update Task' : 'Add Task'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        <Dialog open={showReminderModal} onOpenChange={setShowReminderModal}>
          <DialogContent className="bg-gray-800 border-gray-700 sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Set Task Time</DialogTitle>
              <DialogDescription className="text-gray-400">
                Choose when you want to do this task
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium text-gray-200">
                  Time of Day
                </label>
                <TimeInput value={reminderTime} onChange={setReminderTime} label="Time" />
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowReminderModal(false)} className="border-gray-600 text-gray-300">
                Cancel
              </Button>
              <Button onClick={saveReminder} className="bg-purple-600 hover:bg-purple-700">
                Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        <Dialog open={showSettingsModal} onOpenChange={setShowSettingsModal}>
          <DialogContent className="bg-gray-800 border-gray-700 sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Settings</DialogTitle>
              <DialogDescription className="text-gray-400">
                Customize your daily tasks view
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium text-gray-200">
                  Time Increment
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {timeIncrementOptions.map(option => <Button key={option.value} variant={timeIncrement === option.value ? "default" : "outline"} className={timeIncrement === option.value ? "bg-purple-600 hover:bg-purple-700" : "border-gray-600 text-gray-300"} onClick={() => handleTimeIncrementChange(option.value)}>
                      {option.label}
                    </Button>)}
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-200">
                  Show Clear Tasks Warning
                </label>
                <Switch checked={showClearTaskWarning} onCheckedChange={setShowClearTaskWarning} />
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowSettingsModal(false)} className="border-gray-600 text-gray-300">
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        <Dialog open={showCalendarModal} onOpenChange={setShowCalendarModal}>
          <DialogContent className="bg-gray-800 border-gray-700 sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Select Date</DialogTitle>
              <DialogDescription className="text-gray-400">
                Choose a date to view tasks
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-4">
              <DatePicker date={currentDate} onDateChange={date => {
              if (date) {
                setCurrentDate(date);
                setShowCalendarModal(false);
              }
            }} disabled={false} className="border-gray-600 bg-gray-700" />
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCalendarModal(false)} className="border-gray-600 text-gray-300">
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        <Dialog open={showCopyModal} onOpenChange={setShowCopyModal}>
          <DialogContent className="bg-gray-800 border-gray-700 sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Copy Tasks</DialogTitle>
              <DialogDescription className="text-gray-400">
                Copy current tasks to another date
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium text-gray-200">
                  Select Target Date
                </label>
                <DatePicker date={copyToDate} onDateChange={setCopyToDate} disabled={false} className="border-gray-600 bg-gray-700" />
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCopyModal(false)} className="border-gray-600 text-gray-300">
                Cancel
              </Button>
              <Button onClick={handleCopyTasks} className="bg-purple-600 hover:bg-purple-700" disabled={!copyToDate}>
                Copy Tasks
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        <Dialog open={showMoveTaskModal} onOpenChange={setShowMoveTaskModal}>
          <DialogContent className="bg-gray-800 border-gray-700 sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Move Task to Another Date</DialogTitle>
              <DialogDescription className="text-gray-400">
                Choose which date to move this task to
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-4">
              <div className="grid gap-4">
                <div className="bg-gray-700/40 p-3 rounded-md">
                  <p className="font-medium">{selectedTask?.name}</p>
                  {selectedTask?.timeOfDay && <p className="text-sm text-gray-400 flex items-center mt-1">
                      <Clock className="h-3 w-3 mr-1" />
                      {selectedTask.timeOfDay}
                    </p>}
                </div>
                
                <div className="grid gap-2">
                  <label className="text-sm font-medium text-gray-200">
                    Select Date to Move To
                  </label>
                  <DatePicker date={moveToDate} onDateChange={setMoveToDate} disabled={false} className="border-gray-600 bg-gray-700" />
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowMoveTaskModal(false)} className="border-gray-600 text-gray-300">
                Cancel
              </Button>
              <Button onClick={handleMoveTaskToDate} className="bg-purple-600 hover:bg-purple-700" disabled={!moveToDate}>
                Move Task
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        <Dialog open={showCategoryModal} onOpenChange={setShowCategoryModal}>
          <DialogContent className="bg-gray-800 border-gray-700 sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Category</DialogTitle>
              <DialogDescription className="text-gray-400">
                Customize the category and color for this task
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="grid gap-2">
                <label htmlFor="categoryName" className="text-sm font-medium text-gray-200">
                  Category Name
                </label>
                <Input id="categoryName" placeholder="Enter category name" value={newTaskCategory} onChange={e => setNewTaskCategory(e.target.value)} className="bg-gray-700 border-gray-600" />
              </div>
              
              <div className="grid gap-2">
                <label className="text-sm font-medium text-gray-200">
                  Color
                </label>
                <div className="flex flex-wrap gap-2">
                  {COLORS.map(color => <button key={color} className={`w-8 h-8 rounded-full ${newTaskColor === color ? 'ring-2 ring-white' : ''}`} style={{
                  backgroundColor: color
                }} onClick={() => setNewTaskColor(color)} aria-label={`Select color ${color}`} />)}
                </div>
              </div>
              
              <div className="bg-gray-900/50 rounded-md p-3 mt-4">
                <h4 className="text-sm font-medium mb-2">Preview</h4>
                <div className="flex items-center gap-2 bg-gray-800/40 p-2 rounded-md border border-gray-700">
                  <div className="w-3 h-3 rounded-full" style={{
                  backgroundColor: newTaskColor
                }}></div>
                  <span className="flex-1 text-white">
                    Sample Task
                  </span>
                  <span className={`text-xs px-1.5 py-0.5 rounded-full bg-opacity-20 border border-opacity-50 cursor-pointer`} style={{
                  backgroundColor: `${newTaskColor}20`,
                  borderColor: `${newTaskColor}50`,
                  color: newTaskColor
                }}>
                    {newTaskCategory}
                  </span>
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCategoryModal(false)} className="border-gray-600 text-gray-300">
                Cancel
              </Button>
              <Button onClick={saveCategory} className="bg-purple-600 hover:bg-purple-700">
                Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        <Dialog open={showClearTasksModal} onOpenChange={setShowClearTasksModal}>
          <DialogContent className="bg-gray-800 border-gray-700 sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Clear All Tasks</DialogTitle>
              <DialogDescription className="text-gray-400">
                Are you sure you want to clear all tasks for {format(currentDate, 'MMMM d, yyyy')}? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setShowClearTasksModal(false)} className="border-gray-600 text-gray-300">
                Cancel
              </Button>
              <Button onClick={clearTasksForCurrentDay} className="bg-red-600 hover:bg-red-700">
                Clear Tasks
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>;
};
export default DailyTasksPage;
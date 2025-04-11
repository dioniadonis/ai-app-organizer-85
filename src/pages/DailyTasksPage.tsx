import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, ChevronRight, Edit, Plus, Bell, Home, Calendar, X, Check, 
  AlarmClock, Clock, BellRing, CalendarCheck, Circle, Settings, Copy, Move
} from 'lucide-react';
import { format, addDays, subDays, parseISO, isToday, isTomorrow, isSameDay } from 'date-fns';
import { DailyTask } from '@/components/planner/DailyTasksTab';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription 
} from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { useIsMobile, useTouchDevice } from '@/hooks/use-mobile';
import TimeInput from '@/components/TimeInput';
import { DatePicker } from '@/components/ui/date-picker';
import { Textarea } from '@/components/ui/textarea';

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
  const [selectedTask, setSelectedTask] = useState<DailyTask | null>(null);
  const [newTaskName, setNewTaskName] = useState('');
  const [newTaskTime, setNewTaskTime] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState('Personal');
  const [newTaskColor, setNewTaskColor] = useState('#9b87f5');
  const [reminderTime, setReminderTime] = useState('');
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [displayRange, setDisplayRange] = useState<'all' | 'morning' | 'afternoon' | 'evening'>('all');
  const [timeIncrement, setTimeIncrement] = useState<number>(30); // in minutes (15, 30, 60)
  const [copyToDate, setCopyToDate] = useState<Date | undefined>(undefined);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedTask, setDraggedTask] = useState<DailyTask | null>(null);
  const [targetTimeSlot, setTargetTimeSlot] = useState<string | null>(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  const timeIncrementOptions: TimeIncrementOption[] = [
    { label: '15 minutes', value: 15 },
    { label: '30 minutes', value: 30 },
    { label: '60 minutes', value: 60 }
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
          timeSlotElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
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
  }, []);

  useEffect(() => {
    localStorage.setItem('dailyTasks', JSON.stringify(dailyTasks));
  }, [dailyTasks]);

  const handlePreviousDay = () => {
    setCurrentDate(prev => subDays(prev, 1));
  };

  const handleNextDay = () => {
    setCurrentDate(prev => addDays(prev, 1));
  };

  const handleTaskToggle = (taskId: number) => {
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
            description: `You've completed "${task.name}" - ${newStreak} day streak! 🎉`,
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

  const handleEditTask = (task: DailyTask) => {
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
    setReminderTime(task.timeOfDay || '');
    setCopyToDate(undefined);
    setShowReminderModal(true);
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

  const handleTaskClick = (task: DailyTask) => {
    setEditingTaskId(task.id);
    setNewTaskName(task.name);
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

    const tasksForToday = dailyTasks;
    
    const copiedTasks = tasksForToday.map(task => ({
      ...task,
      id: Date.now() + Math.random() * 1000,
      completed: false
    }));
    
    setDailyTasks(prev => [...prev, ...copiedTasks]);
    
    toast({
      title: "Tasks copied",
      description: `${copiedTasks.length} tasks copied to ${format(copyToDate, 'MMMM d, yyyy')}`
    });
    
    setCopyToDate(undefined);
    setShowCopyModal(false);
  };

  const handleTimeIncrementChange = (value: number) => {
    setTimeIncrement(value);
    setShowSettingsModal(false);
    
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
  
  const dateLabel = isToday(currentDate) 
    ? 'Today' 
    : isTomorrow(currentDate) 
      ? 'Tomorrow' 
      : dayName;

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

  const CATEGORIES = [
    'Morning Routine',
    'Work',
    'Health',
    'Learning',
    'Evening Routine',
    'Wellness',
    'Productivity',
    'Personal',
    'Custom'
  ];

  const COLORS = [
    '#9b87f5', // Primary Purple
    '#6E56CF', // Vivid Purple
    '#0EA5E9', // Ocean Blue
    '#1EAEDB', // Bright Blue
    '#33C3F0', // Sky Blue
    '#D6BCFA', // Light Purple
    '#F97316', // Bright Orange
    '#D946EF', // Magenta Pink
  ];
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-gray-100">
      <div className={`mx-auto p-2 ${isMobile ? 'max-w-md' : 'max-w-2xl'}`}>
        <div className="flex items-center justify-between mb-4 py-2">
          <button 
            onClick={() => navigate('/')} 
            className="rounded-md p-2 hover:bg-gray-800 transition-colors"
          >
            <Home size={24} className="text-blue-400" />
          </button>
          
          <button 
            onClick={() => setShowCalendarModal(true)}
            className="flex items-center gap-2 text-2xl font-bold text-white hover:text-blue-300 transition-colors text-center mx-auto"
          >
            <CalendarCheck className="h-6 w-6 text-purple-400" />
            {dateLabel}
          </button>
          
          <div className="flex gap-1">
            <button
              onClick={() => setShowSettingsModal(true)}
              className="rounded-md p-2 hover:bg-gray-800 transition-colors"
            >
              <Settings size={20} className="text-blue-400" />
            </button>
            
            <button
              onClick={() => setShowCopyModal(true)}
              className="rounded-md p-2 hover:bg-gray-800 transition-colors"
            >
              <Copy size={20} className="text-blue-400" />
            </button>
            
            <button
              onClick={() => {
                setSelectedTask(null);
                setEditingTaskId(null);
                setNewTaskName('');
                setNewTaskTime('');
                setNewTaskCategory('Personal');
                setNewTaskColor('#9b87f5');
                setShowAddModal(true);
              }}
              className="rounded-md p-2 hover:bg-gray-800 transition-colors"
            >
              <Plus size={20} className="text-blue-400" />
            </button>
          </div>
        </div>
        
        <div className="flex items-center justify-between mb-4 px-4 py-2 bg-gray-800/30 rounded-lg">
          <button 
            onClick={handlePreviousDay}
            className="hover:bg-gray-800 p-2 rounded-full transition-colors"
          >
            <ChevronLeft size={20} className="text-blue-400" />
          </button>
          
          <button 
            onClick={() => setShowCalendarModal(true)}
            className="text-lg font-medium text-white hover:text-blue-300 transition-colors"
          >
            {formattedDate}
          </button>
          
          <button 
            onClick={handleNextDay}
            className="hover:bg-gray-800 p-2 rounded-full transition-colors"
          >
            <ChevronRight size={20} className="text-blue-400" />
          </button>
        </div>
        
        <div className="flex items-center justify-between mb-4 space-x-2">
          {(['all', 'morning', 'afternoon', 'evening'] as const).map((range) => (
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
        
        <ScrollArea className="h-[calc(100vh-240px)] rounded-lg border border-gray-800 bg-gray-900/80" ref={scrollRef}>
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
                          <motion.div 
                            key={task.id}
                            data-task-id={task.id}
                            className={`flex items-center gap-2 bg-gray-800/40 p-2 rounded-md border border-gray-700 hover:bg-gray-800/60 transition-all ${
                              draggedTask?.id === task.id ? 'opacity-50 ring-2 ring-blue-500' : ''
                            }`}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            whileHover={{ scale: 1.02 }}
                            drag={(isMobile || isTouchDevice) ? true : false}
                            dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                            dragElastic={0}
                            dragMomentum={false}
                            onDragStart={() => (isMobile || isTouchDevice) ? handleDragStart(task) : null}
                            onDragEnd={(isMobile || isTouchDevice) ? handleDragEnd : null}
                            style={{ cursor: (isMobile || isTouchDevice) && isDragging && draggedTask?.id === task.id ? 'grabbing' : 'auto' }}
                          >                            
                            {editingTaskId === task.id ? (
                              <Input
                                value={newTaskName}
                                onChange={(e) => setNewTaskName(e.target.value)}
                                onBlur={() => {
                                  if (editingTaskId) {
                                    setDailyTasks(prev => prev.map(t => {
                                      if (t.id === editingTaskId) {
                                        return { ...t, name: newTaskName };
                                      }
                                      return t;
                                    }));
                                    setEditingTaskId(null);
                                  }
                                }}
                                className="bg-gray-700/50 border-gray-600 h-7 text-sm"
                                autoFocus
                              />
                            ) : (
                              <>
                                <div 
                                  className="w-3 h-3 rounded-full"
                                  style={{ backgroundColor: task.color || '#9b87f5' }}
                                ></div>
                                <span 
                                  className="flex-1 text-white"
                                  onClick={() => {
                                    handleTaskClick(task);
                                    // Focus the input field that will appear after state update
                                    setTimeout(() => {
                                      const input = document.querySelector(`div[data-task-id="${task.id}"] input`);
                                      if (input instanceof HTMLInputElement) {
                                        input.focus();
                                      }
                                    }, 10);
                                  }}
                                >
                                  {task.name}
                                </span>
                                
                                {task.category && (
                                  <span 
                                    className={`text-xs px-1.5 py-0.5 rounded-full ${getTaskCategoryBadgeClass(task.category)} cursor-pointer`}
                                    onClick={() => handleCategoryClick(task)}
                                  >
                                    {task.category}
                                  </span>
                                )}
                              </>
                            )}
                            
                            <div className="flex items-center">
                              <Popover>
                                <PopoverTrigger asChild>
                                  <button className="p-1 rounded-full hover:bg-gray-700/50">
                                    <Edit size={14} className="text-gray-400" />
                                  </button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto bg-gray-800 border-gray-700 rounded-lg p-2">
                                  <div className="flex flex-col gap-1">
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      className="justify-start text-xs px-2"
                                      onClick={() => handleEditTask(task)}
                                    >
                                      <Edit className="mr-2 h-3 w-3" /> Edit Task
                                    </Button>
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      className="justify-start text-xs px-2"
                                      onClick={() => handleSetReminder(task)}
                                    >
                                      <BellRing className="mr-2 h-3 w-3" /> Set Time
                                    </Button>
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      className="justify-start text-xs px-2"
                                      onClick={() => handleMoveTask(task)}
                                    >
                                      <Move className="mr-2 h-3 w-3" /> Move Task
                                    </Button>
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      className="justify-start text-xs px-2 text-red-400 hover:text-red-300 hover:bg-red-500/20"
                                      onClick={() => handleDeleteTask(task.id)}
                                    >
                                      <X className="mr-2 h-3 w-3" /> Delete
                                    </Button>
                                  </div>
                                </PopoverContent>
                              </Popover>
                              
                              <button 
                                onClick={() => handleTaskToggle(task.id)}
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
        
        <div className="fixed bottom-0 left-0 right-0 flex justify-center p-4 bg-gray-900/90 border-t border-gray-800">
          <div className="flex gap-2">
            <Button 
              onClick={handlePreviousDay} 
              variant="outline" 
              size={isMobile ? "sm" : "default"}
              className="bg-gray-800/50 border-gray-700 text-blue-400"
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              Previous
            </Button>
            
            <Button
              onClick={() => navigate('/')}
              variant="outline"
              size={isMobile ? "sm" : "default"}
              className="bg-gray-800/50 border-gray-700 text-blue-400"
            >
              <Home className="mr-1 h-4 w-4" />
              Home
            </Button>
            
            <Button
              onClick={() => navigate('/planner?tab=dailyTasks')}
              variant="outline"
              size={isMobile ? "sm" : "default"}
              className="bg-gray-800/50 border-gray-700 text-purple-400"
            >
              <Calendar className="mr-1 h-4 w-4" />
              Manage Tasks
            </Button>
            
            <Button 
              onClick={handleNextDay} 
              variant="outline" 
              size={isMobile ? "sm" : "default"}
              className="bg-gray-800/50 border-gray-700 text-blue-400"
            >
              Next
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Add Task Dialog */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="bg-gray-800 border-gray-700 sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedTask ? 'Edit Task' : 'Add New Task'}</DialogTitle>
            <DialogDescription className="text-

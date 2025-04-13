import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { format, addDays, subDays, isToday, isTomorrow, isSameDay } from 'date-fns';
import { DailyTask } from '@/components/planner/DailyTasksTab';
import { Dialog } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from '@/components/ui/use-toast';
import { useIsMobile, useTouchDevice } from '@/hooks/use-mobile';

// Import our new components
import DailyTaskHeader from '@/components/planner/daily/DailyTaskHeader';
import DateNavigator from '@/components/planner/daily/DateNavigator';
import TimeRangeSelector from '@/components/planner/daily/TimeRangeSelector';
import TimeSlot from '@/components/planner/daily/TimeSlot';
import AddTaskModal from '@/components/planner/daily/modals/AddTaskModal';
import SettingsModal from '@/components/planner/daily/modals/SettingsModal';
import CalendarModal from '@/components/planner/daily/modals/CalendarModal';
import CopyTasksModal from '@/components/planner/daily/modals/CopyTasksModal';
import ClearTasksModal from '@/components/planner/daily/modals/ClearTasksModal';
import CategoryModal from '@/components/planner/daily/modals/CategoryModal';
import MoveTaskModal from '@/components/planner/daily/modals/MoveTaskModal';

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
  const [newTaskTime, setNewTaskTime] = useState('');
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

  const CATEGORIES = ['Morning Routine', 'Work', 'Health', 'Learning', 'Evening Routine', 'Wellness', 'Productivity', 'Personal', 'Custom'];
  const COLORS = [
    '#9b87f5', // Primary Purple
    '#6E56CF', // Vivid Purple
    '#0EA5E9', // Ocean Blue
    '#1EAEDB', // Bright Blue
    '#33C3F0', // Sky Blue
    '#D6BCFA', // Light Purple
    '#F97316', // Bright Orange
    '#D946EF'  // Magenta Pink
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
          const [hourStr] = time.split(':');
          const hour = parseInt(hourStr);
          
          // Afternoon is 12 PM to 4:59 PM
          return period === 'PM' && hour <= 4;
        });
      case 'evening':
        return timeSlots.filter(slot => {
          const [time, period] = slot.split(' ');
          const [hourStr] = time.split(':');
          const hour = parseInt(hourStr);
          
          // Evening is 5 PM onwards
          return period === 'PM' && hour >= 5;
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
      timeOfDay: newTaskTime || undefined,
      streak: 0,
      lastCompleted: format(currentDate, 'yyyy-MM-dd'),
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
      setNewTaskCategory(task.category || 'Personal');
      setNewTaskColor(task.color || '#9b87f5');
    }
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

  const formattedDate = format(currentDate, 'MMMM d, yyyy');
  const dayName = format(currentDate, 'EEEE');
  const dateLabel = isToday(currentDate) ? 'Today' : isTomorrow(currentDate) ? 'Tomorrow' : dayName;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-gray-100">
      <div className={`mx-auto p-2 ${isMobile ? 'max-w-md' : 'max-w-2xl'}`}>
        <DailyTaskHeader 
          dateLabel={dateLabel}
          openCalendarModal={() => setShowCalendarModal(true)}
          openSettingsModal={() => setShowSettingsModal(true)}
          openCopyModal={() => setShowCopyModal(true)}
          clearTasks={handleClearTasks}
          addNewTask={(e) => {
            e.stopPropagation();
            setSelectedTask(null);
            setEditingTaskId(null);
            setNewTaskName('');
            setNewTaskTime('');
            setNewTaskCategory('Personal');
            setNewTaskColor('#9b87f5');
            setShowAddModal(true);
          }}
          isMobile={isMobile}
        />
        
        <DateNavigator 
          formattedDate={formattedDate}
          onPreviousDay={handlePreviousDay}
          onNextDay={handleNextDay}
        />
        
        <TimeRangeSelector 
          displayRange={displayRange}
          onRangeChange={setDisplayRange}
        />
        
        <ScrollArea className="h-[calc(100vh-200px)] rounded-lg border border-gray-800 bg-gray-900/80" ref={scrollRef}>
          {displayTimeSlots.map((timeSlot) => {
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
              <TimeSlot 
                key={timeSlot}
                timeSlot={timeSlot}
                timeSlotId={timeSlotId}
                isCurrentTimeSlot={isCurrentTimeSlot}
                isTargetTimeSlot={targetTimeSlot === timeSlot}
                isDragging={isDragging}
                draggedTask={draggedTask}
                tasksInSlot={tasksInSlot}
                editingTaskId={editingTaskId}
                newTaskName={newTaskName}
                isMobile={isMobile}
                isTouchDevice={isTouchDevice}
                onTimeSlotHover={handleTimeSlotHover}
                onDragEnd={handleDragEnd}
                onQuickAddTask={handleQuickAddTask}
                onTaskToggle={handleTaskToggle}
                onEditTask={handleEditTask}
                onMoveTask={handleMoveTask}
                onDeleteTask={handleDeleteTask}
                onNameChange={(e) => setNewTaskName(e.target.value)}
                onNameBlur={handleTaskNameBlur}
                onDragStart={handleDragStart}
              />
            );
          })}
        </ScrollArea>
      </div>

      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <AddTaskModal 
          isEdit={!!selectedTask}
          taskName={newTaskName}
          taskTime={newTaskTime}
          taskCategory={newTaskCategory}
          taskColor={newTaskColor}
          categories={CATEGORIES}
          colors={COLORS}
          onNameChange={(e) => setNewTaskName(e.target.value)}
          onTimeChange={setNewTaskTime}
          onCategoryChange={(e) => setNewTaskCategory(e.target.value)}
          onColorChange={setNewTaskColor}
          onCancel={() => {
            setShowAddModal(false);
            setSelectedTask(null);
          }}
          onSave={selectedTask ? handleUpdateTask : handleAddTask}
        />
      </Dialog>

      <Dialog open={showSettingsModal} onOpenChange={setShowSettingsModal}>
        <SettingsModal 
          timeIncrement={timeIncrement}
          timeIncrementOptions={timeIncrementOptions}
          showClearTaskWarning={showClearTaskWarning}
          onTimeIncrementChange={handleTimeIncrementChange}
          onClearTaskWarningChange={setShowClearTaskWarning}
          onClose={() => setShowSettingsModal(false)}
        />
      </Dialog>

      <Dialog open={showCalendarModal} onOpenChange={setShowCalendarModal}>
        <CalendarModal 
          date={currentDate}
          onDateChange={setCurrentDate}
          onClose={() => setShowCalendarModal(false)}
        />
      </Dialog>

      <Dialog open={showCopyModal} onOpenChange={setShowCopyModal}>
        <CopyTasksModal 
          date={copyToDate}
          onDateChange={setCopyToDate}
          onCancel={() => {
            setShowCopyModal(false);
            setCopyToDate(undefined);
          }}
          onCopy={handleCopyTasks}
        />
      </Dialog>

      <Dialog open={showClearTasksModal} onOpenChange={setShowClearTasksModal}>
        <ClearTasksModal 
          date={formattedDate}
          showWarning={showClearTaskWarning}
          onShowWarningChange={setShowClearTaskWarning}
          onCancel={() => setShowClearTasksModal(false)}
          onClear={() => {
            clearTasksForCurrentDay();
            setShowClearTasksModal(false);
          }}
        />
      </Dialog>

      <Dialog open={showCategoryModal} onOpenChange={setShowCategoryModal}>
        <CategoryModal 
          category={newTaskCategory}
          color={newTaskColor}
          categories={CATEGORIES}
          colors={COLORS}
          onCategoryChange={(e) => setNewTaskCategory(e.target.value)}
          onColorChange={setNewTaskColor}
          onCancel={() => {
            setShowCategoryModal(false);
            setSelectedTask(null);
          }}
          onSave={saveCategory}
        />
      </Dialog>

      <Dialog open={showMoveTaskModal} onOpenChange={setShowMoveTaskModal}>
        <MoveTaskModal 
          date={moveToDate}
          onDateChange={setMoveToDate}
          onCancel={() => {
            setShowMoveTaskModal(false);
            setMoveToDate(undefined);
            setSelectedTask(null);
          }}
          onMove={handleMoveTaskToDate}
        />
      </Dialog>
    </div>
  );
};

export default DailyTasksPage;

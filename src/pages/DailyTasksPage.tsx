
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { format, addDays, subDays, isToday } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { useIsMobile, useTouchDevice } from '@/hooks/use-mobile';
import { DailyTask } from '@/components/planner/DailyTasksTab';

// Import refactored components
import PageHeader from '@/components/daily-tasks/PageHeader';
import DateNavigation from '@/components/daily-tasks/DateNavigation';
import DisplayRangeSelector from '@/components/daily-tasks/DisplayRangeSelector';
import TimeSlot from '@/components/daily-tasks/TimeSlot';
import PageFooter from '@/components/daily-tasks/PageFooter';
import TaskModals from '@/components/daily-tasks/TaskModals';

// Import custom hooks
import { useTimeSlots } from '@/hooks/use-time-slots';
import { useTaskManagement } from '@/hooks/use-task-management';

const DailyTasksPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const isTouchDevice = useTouchDevice();
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // State management
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showAddModal, setShowAddModal] = useState(false);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<DailyTask | null>(null);
  const [newTaskName, setNewTaskName] = useState('');
  const [newTaskTime, setNewTaskTime] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState('Personal');
  const [newTaskColor, setNewTaskColor] = useState('#9b87f5');
  const [reminderTime, setReminderTime] = useState('');
  const [displayRange, setDisplayRange] = useState<'all' | 'morning' | 'afternoon' | 'evening'>('all');
  const [timeIncrement, setTimeIncrement] = useState<number>(30);
  const [copyToDate, setCopyToDate] = useState<Date | undefined>(undefined);
  const [moveToDate, setMoveToDate] = useState<Date | undefined>(undefined);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedTask, setDraggedTask] = useState<DailyTask | null>(null);
  const [targetTimeSlot, setTargetTimeSlot] = useState<string | null>(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  
  // Custom hooks
  const { 
    dailyTasks, setDailyTasks, 
    editingTaskId, setEditingTaskId,
    handleTaskToggle, handleQuickAddTask, 
    handleTaskClick, handleTaskNameBlur, 
    handleDeleteTask, handleClearTasks,
    showClearWarning, setShowClearWarning
  } = useTaskManagement();
  
  const { 
    timeSlots, 
    getFilteredTimeSlots, 
    getTasksForTimeSlot,
    isCurrentTimeSlot
  } = useTimeSlots(timeIncrement);

  // Constants
  const timeIncrementOptions = [
    { label: '15 minutes', value: 15 },
    { label: '30 minutes', value: 30 },
    { label: '60 minutes', value: 60 }
  ];
  
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

  // Scroll to current time when viewing today
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

  // Day navigation functions
  const handlePreviousDay = () => {
    setCurrentDate(prev => subDays(prev, 1));
  };

  const handleNextDay = () => {
    setCurrentDate(prev => addDays(prev, 1));
  };

  // Task manipulation functions
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

  const handleMoveTask = (task: DailyTask) => {
    setSelectedTask(task);
    setMoveToDate(undefined);
    setShowMoveModal(true);
  };

  const handleMoveTaskToDate = () => {
    if (!selectedTask || !moveToDate) {
      toast({
        title: "Select a date",
        description: "Please select a date to move the task to",
        variant: "destructive"
      });
      return;
    }

    // Move the task to the new date
    toast({
      title: "Task moved",
      description: `"${selectedTask.name}" moved to ${format(moveToDate, 'MMMM d, yyyy')}`,
    });
    
    setMoveToDate(undefined);
    setShowMoveModal(false);
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

  // Drag and drop functionality
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

  // Utility functions
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

  // Filtered time slots based on selected display range
  const displayTimeSlots = getFilteredTimeSlots(displayRange);
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-gray-100">
      <div className={`mx-auto p-2 ${isMobile ? 'max-w-md' : 'max-w-2xl'}`}>
        <PageHeader 
          currentDate={currentDate}
          navigate={navigate}
          showClearWarning={showClearWarning}
          handleClearTasks={handleClearTasks}
          setShowSettingsModal={setShowSettingsModal}
          setShowCopyModal={setShowCopyModal}
          setShowAddModal={setShowAddModal}
          setSelectedTask={setSelectedTask}
          setEditingTaskId={setEditingTaskId}
          setNewTaskName={setNewTaskName}
          setNewTaskTime={setNewTaskTime}
          setNewTaskCategory={setNewTaskCategory}
          setNewTaskColor={setNewTaskColor}
        />
        
        <DateNavigation 
          currentDate={currentDate}
          handlePreviousDay={handlePreviousDay}
          handleNextDay={handleNextDay}
          setShowCalendarModal={setShowCalendarModal}
        />
        
        <DisplayRangeSelector 
          displayRange={displayRange} 
          setDisplayRange={setDisplayRange} 
        />
        
        <ScrollArea className="h-[calc(100vh-240px)] rounded-lg border border-gray-800 bg-gray-900/80" ref={scrollRef}>
          {displayTimeSlots.map((timeSlot) => {
            const tasksInSlot = getTasksForTimeSlot(timeSlot, dailyTasks);
            const isCurrentSlot = isCurrentTimeSlot(timeSlot, currentDate);
            
            return (
              <TimeSlot 
                key={timeSlot}
                timeSlot={timeSlot}
                tasksInSlot={tasksInSlot}
                isCurrentTimeSlot={isCurrentSlot}
                isDragging={isDragging}
                targetTimeSlot={targetTimeSlot}
                editingTaskId={editingTaskId}
                newTaskName={newTaskName}
                handleTimeSlotHover={handleTimeSlotHover}
                handleDragEnd={handleDragEnd}
                handleQuickAddTask={handleQuickAddTask}
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
            );
          })}
        </ScrollArea>
        
        <PageFooter 
          handlePreviousDay={handlePreviousDay}
          handleNextDay={handleNextDay}
          navigate={navigate}
        />
      </div>
      
      <TaskModals 
        showAddModal={showAddModal}
        setShowAddModal={setShowAddModal}
        showReminderModal={showReminderModal}
        setShowReminderModal={setShowReminderModal}
        showSettingsModal={showSettingsModal}
        setShowSettingsModal={setShowSettingsModal}
        showCalendarModal={showCalendarModal}
        setShowCalendarModal={setShowCalendarModal}
        showCopyModal={showCopyModal}
        setShowCopyModal={setShowCopyModal}
        showMoveModal={showMoveModal}
        setShowMoveModal={setShowMoveModal}
        showCategoryModal={showCategoryModal}
        setShowCategoryModal={setShowCategoryModal}
        selectedTask={selectedTask}
        newTaskName={newTaskName}
        setNewTaskName={setNewTaskName}
        newTaskTime={newTaskTime}
        setNewTaskTime={setNewTaskTime}
        newTaskCategory={newTaskCategory}
        setNewTaskCategory={setNewTaskCategory}
        newTaskColor={newTaskColor}
        setNewTaskColor={setNewTaskColor}
        reminderTime={reminderTime}
        setReminderTime={setReminderTime}
        timeIncrement={timeIncrement}
        setTimeIncrement={setTimeIncrement}
        copyToDate={copyToDate}
        setCopyToDate={setCopyToDate}
        moveToDate={moveToDate}
        setMoveToDate={setMoveToDate}
        showClearWarning={showClearWarning}
        setShowClearWarning={setShowClearWarning}
        currentDate={currentDate}
        setCurrentDate={setCurrentDate}
        handleAddTask={handleAddTask}
        handleUpdateTask={handleUpdateTask}
        saveReminder={saveReminder}
        saveCategory={saveCategory}
        handleCopyTasks={handleCopyTasks}
        handleMoveTaskToDate={handleMoveTaskToDate}
        CATEGORIES={CATEGORIES}
        COLORS={COLORS}
        timeIncrementOptions={timeIncrementOptions}
      />
    </div>
  );
};

export default DailyTasksPage;

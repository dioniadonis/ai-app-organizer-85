
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, addDays, subDays, isToday, isSameDay } from 'date-fns';
import { toast } from '@/components/ui/use-toast';
import { useIsMobile, useTouchDevice } from '@/hooks/use-mobile';
import { Copy, Plus } from 'lucide-react';

// Hooks
import { useDailyTasks } from '@/hooks/use-daily-tasks';
import { useTimeSlots } from '@/hooks/use-time-slots';

// Components
import DailyTasksHeader from '@/components/planner/DailyTasksHeader';
import TimeRangeSelector from '@/components/planner/TimeRangeSelector';
import TimeSlots from '@/components/planner/TimeSlots';

// Modals
import AddTaskModal from '@/components/planner/modals/AddTaskModal';
import ReminderModal from '@/components/planner/modals/ReminderModal';
import SettingsModal from '@/components/planner/modals/SettingsModal';
import CalendarModal from '@/components/planner/modals/CalendarModal';
import CopyTasksModal from '@/components/planner/modals/CopyTasksModal';
import MoveTaskModal from '@/components/planner/modals/MoveTaskModal';
import CopyTaskModal from '@/components/planner/modals/CopyTaskModal';
import ClearTasksModal from '@/components/planner/modals/ClearTasksModal';
import CategoryModal from '@/components/planner/modals/CategoryModal';

// Types
import { DailyTask } from '@/components/planner/types';

const DailyTasksPage: React.FC = () => {
  // Navigation and device detection
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const isTouchDevice = useTouchDevice();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Date state
  const [currentDate, setCurrentDate] = useState(new Date());

  // Custom hooks
  const { 
    dailyTasks,
    showMoveWarning,
    setShowMoveWarning,
    addTask,
    toggleComplete,
    updateTask,
    deleteTask,
    moveTask,
    copyTask,
    copyTasksToDate,
    clearTasksForDate,
    resetStreak,
    getTasksForDate,
    getTasksForTimeSlot
  } = useDailyTasks();
  
  const {
    timeIncrement,
    setTimeIncrement,
    displayRange,
    setDisplayRange,
    timeIncrementOptions,
    getFilteredTimeSlots
  } = useTimeSlots();

  // Task form state
  const [selectedTask, setSelectedTask] = useState<DailyTask | null>(null);
  const [newTaskName, setNewTaskName] = useState('');
  const [newTaskTime, setNewTaskTime] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState('Personal');
  const [newTaskColor, setNewTaskColor] = useState('#9b87f5');
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [reminderTime, setReminderTime] = useState('');

  // Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [showClearTasksModal, setShowClearTasksModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showMoveTaskModal, setShowMoveTaskModal] = useState(false);
  const [showCopyTaskModal, setShowCopyTaskModal] = useState(false);
  
  // Drag and drop state
  const [isDragging, setIsDragging] = useState(false);
  const [draggedTask, setDraggedTask] = useState<DailyTask | null>(null);
  const [targetTimeSlot, setTargetTimeSlot] = useState<string | null>(null);
  
  // Date selectors for copy/move operations
  const [copyToDate, setCopyToDate] = useState<Date | undefined>(undefined);
  const [moveToDate, setMoveToDate] = useState<Date | undefined>(undefined);

  // Filtered time slots based on display range
  const displayTimeSlots = getFilteredTimeSlots();

  // Scroll to current time on initial load if viewing today
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

  // Navigation handlers
  const handlePreviousDay = () => {
    setCurrentDate(prev => subDays(prev, 1));
    setEditingTaskId(null);
  };

  const handleNextDay = () => {
    setCurrentDate(prev => addDays(prev, 1));
    setEditingTaskId(null);
  };

  // Task handlers
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
    toggleComplete(taskId, currentDate);
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
    
    const newTask = addTask({
      name: "",
      timeOfDay: timeString,
      color: newTaskColor,
      category: 'Personal'
    }, currentDate);
    
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
    
    addTask({
      name: newTaskName,
      timeOfDay: newTaskTime || undefined,
      color: newTaskColor,
      category: newTaskCategory
    }, currentDate);
    
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
    
    updateTask(selectedTask.id, {
      name: newTaskName,
      timeOfDay: newTaskTime || undefined,
      color: newTaskColor,
      category: newTaskCategory
    });
    
    setSelectedTask(null);
    setNewTaskName('');
    setNewTaskTime('');
    setShowAddModal(false);
    
    toast({
      title: "Task updated",
      description: `Your task has been updated successfully`
    });
  };

  const handleTaskNameBlur = (taskId: number) => {
    const task = dailyTasks.find(t => t.id === taskId);
    
    if (task && !newTaskName.trim()) {
      deleteTask(taskId);
      setEditingTaskId(null);
      return;
    }
    
    if (newTaskName.trim()) {
      updateTask(taskId, { name: newTaskName });
      setEditingTaskId(null);
    }
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
    
    updateTask(selectedTask.id, { timeOfDay: reminderTime });
    
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

  const handleCopyTask = (task: DailyTask) => {
    setSelectedTask(task);
    setCopyToDate(undefined);
    setShowCopyTaskModal(true);
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
    
    const movedTask = moveTask(selectedTask.id, moveToDate);
    
    if (movedTask) {
      toast({
        title: "Task moved",
        description: `"${selectedTask.name}" moved to ${format(moveToDate, 'MMMM d, yyyy')}`
      });
    }
    
    setShowMoveTaskModal(false);
    setSelectedTask(null);
    setMoveToDate(undefined);
  };

  const handleCopyTaskToDate = () => {
    if (!selectedTask || !copyToDate) {
      toast({
        title: "Select a date",
        description: "Please select a date to copy this task to",
        variant: "destructive"
      });
      return;
    }
    
    const copiedTask = copyTask(selectedTask.id, copyToDate);
    
    if (copiedTask) {
      toast({
        title: "Task copied",
        description: `"${selectedTask.name}" copied to ${format(copyToDate, 'MMMM d, yyyy')}`
      });
    }
    
    setShowCopyTaskModal(false);
    setSelectedTask(null);
    setCopyToDate(undefined);
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
    
    const tasksForCurrentDate = getTasksForDate(currentDate);
    
    if (tasksForCurrentDate.length === 0) {
      toast({
        title: "No tasks to copy",
        description: "There are no tasks on the current day to copy",
        variant: "destructive"
      });
      return;
    }
    
    const copiedTasks = copyTasksToDate(currentDate, copyToDate);
    
    toast({
      title: "Tasks copied",
      description: `${copiedTasks.length} tasks copied to ${format(copyToDate, 'MMMM d, yyyy')}`
    });
    
    setCopyToDate(undefined);
    setShowCopyModal(false);
  };

  const handleClearTasks = () => {
    setShowClearTasksModal(true);
  };

  const clearTasksForCurrentDay = () => {
    const tasksRemoved = clearTasksForDate(currentDate);
    
    if (tasksRemoved === 0) {
      toast({
        title: "No tasks to clear",
        description: "There are no tasks for the current day to clear"
      });
      return;
    }
    
    toast({
      title: "Tasks cleared",
      description: `${tasksRemoved} tasks have been cleared for ${format(currentDate, 'MMMM d, yyyy')}`
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

  const handleCategoryClick = (task: DailyTask) => {
    setSelectedTask(task);
    setNewTaskCategory(task.category || 'Personal');
    setNewTaskColor(task.color || '#9b87f5');
    setShowCategoryModal(true);
  };

  const saveCategory = () => {
    if (!selectedTask) return;
    
    updateTask(selectedTask.id, {
      category: newTaskCategory,
      color: newTaskColor
    });
    
    toast({
      title: "Category updated",
      description: `Task category has been updated to ${newTaskCategory}`
    });
    
    setShowCategoryModal(false);
    setSelectedTask(null);
  };

  // Drag and drop handlers
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
      
      updateTask(draggedTask.id, { timeOfDay: timeString });
      
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

  // Helper for task retrieval
  const getCurrentTimeSlotTasks = useCallback((timeSlot: string) => {
    return getTasksForTimeSlot(timeSlot, currentDate);
  }, [getTasksForTimeSlot, currentDate]);

  // UI handlers
  const handleOpenAddModal = () => {
    setSelectedTask(null);
    setEditingTaskId(null);
    setNewTaskName('');
    setNewTaskTime('');
    setNewTaskCategory('Personal');
    setNewTaskColor('#9b87f5');
    setShowAddModal(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-gray-100">
      <div className={`mx-auto p-2 ${isMobile ? 'max-w-md' : 'max-w-2xl'}`}>
        {/* Header Area */}
        <DailyTasksHeader
          currentDate={currentDate}
          onPreviousDay={handlePreviousDay}
          onNextDay={handleNextDay}
          onOpenCalendar={() => setShowCalendarModal(true)}
          onOpenSettings={() => setShowSettingsModal(true)}
          onOpenCopyModal={() => setShowCopyModal(true)}
          onClearTasks={handleClearTasks}
          onAddTask={handleOpenAddModal}
        />
        
        {/* Time Range Selector */}
        <TimeRangeSelector
          displayRange={displayRange}
          setDisplayRange={setDisplayRange}
        />
        
        {/* Time Slots */}
        <TimeSlots
          currentDate={currentDate}
          timeSlots={displayTimeSlots}
          timeIncrement={timeIncrement}
          getTasksForTimeSlot={getCurrentTimeSlotTasks}
          handleQuickAddTask={handleQuickAddTask}
          editingTaskId={editingTaskId}
          newTaskName={newTaskName}
          setNewTaskName={setNewTaskName}
          onToggleComplete={handleTaskToggle}
          onStartEditing={startEditing}
          onTaskNameBlur={handleTaskNameBlur}
          onEditTask={handleEditTask}
          onSetReminder={handleSetReminder}
          onMoveTask={handleMoveTask}
          onCopyTask={handleCopyTask}
          onDeleteTask={deleteTask}
          onResetStreak={resetStreak}
          onCategoryClick={handleCategoryClick}
          targetTimeSlot={targetTimeSlot}
          isDragging={isDragging}
          draggedTask={draggedTask}
          handleTimeSlotHover={handleTimeSlotHover}
          handleDragEnd={handleDragEnd}
          handleDragStart={handleDragStart}
          isMobile={isMobile}
          isTouchDevice={isTouchDevice}
          scrollRef={scrollRef}
        />
        
        {/* Modals */}
        <AddTaskModal
          open={showAddModal}
          onOpenChange={setShowAddModal}
          selectedTask={selectedTask}
          newTaskName={newTaskName}
          setNewTaskName={setNewTaskName}
          newTaskTime={newTaskTime}
          setNewTaskTime={setNewTaskTime}
          newTaskCategory={newTaskCategory}
          setNewTaskCategory={setNewTaskCategory}
          newTaskColor={newTaskColor}
          setNewTaskColor={setNewTaskColor}
          onAddTask={handleAddTask}
          onUpdateTask={handleUpdateTask}
        />
        
        <ReminderModal
          open={showReminderModal}
          onOpenChange={setShowReminderModal}
          reminderTime={reminderTime}
          setReminderTime={setReminderTime}
          onSaveReminder={saveReminder}
        />
        
        <SettingsModal
          open={showSettingsModal}
          onOpenChange={setShowSettingsModal}
          timeIncrement={timeIncrement}
          handleTimeIncrementChange={handleTimeIncrementChange}
          timeIncrementOptions={timeIncrementOptions}
          showMoveWarning={showMoveWarning}
          setShowMoveWarning={setShowMoveWarning}
        />
        
        <CalendarModal
          open={showCalendarModal}
          onOpenChange={setShowCalendarModal}
          currentDate={currentDate}
          onDateSelect={setCurrentDate}
        />
        
        <CopyTasksModal
          open={showCopyModal}
          onOpenChange={setShowCopyModal}
          copyToDate={copyToDate}
          setCopyToDate={setCopyToDate}
          onCopyTasks={handleCopyTasks}
          currentDate={currentDate}
        />
        
        <MoveTaskModal
          open={showMoveTaskModal}
          onOpenChange={setShowMoveTaskModal}
          selectedTask={selectedTask}
          moveToDate={moveToDate}
          setMoveToDate={setMoveToDate}
          onMoveTask={handleMoveTaskToDate}
          currentDate={currentDate}
          showMoveWarning={showMoveWarning}
          setShowMoveWarning={setShowMoveWarning}
        />
        
        <CopyTaskModal
          open={showCopyTaskModal}
          onOpenChange={setShowCopyTaskModal}
          selectedTask={selectedTask}
          copyToDate={copyToDate}
          setCopyToDate={setCopyToDate}
          onCopyTask={handleCopyTaskToDate}
        />
        
        <ClearTasksModal
          open={showClearTasksModal}
          onOpenChange={setShowClearTasksModal}
          onClearTasks={clearTasksForCurrentDay}
          currentDate={currentDate}
        />
        
        <CategoryModal
          open={showCategoryModal}
          onOpenChange={setShowCategoryModal}
          selectedTask={selectedTask}
          newTaskCategory={newTaskCategory}
          setNewTaskCategory={setNewTaskCategory}
          newTaskColor={newTaskColor}
          setNewTaskColor={setNewTaskColor}
          onSaveCategory={saveCategory}
        />
      </div>
    </div>
  );
};

export default DailyTasksPage;

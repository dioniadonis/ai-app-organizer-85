import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { format, addDays, subDays, isToday, isTomorrow } from 'date-fns';
import { Dialog } from '@/components/ui/dialog';
import { useIsMobile, useTouchDevice } from '@/hooks/use-mobile';
import { toast } from '@/components/ui/use-toast';

// Import our components
import DailyTaskHeader from '@/components/planner/daily/DailyTaskHeader';
import DateNavigator from '@/components/planner/daily/DateNavigator';
import TimeRangeSelector from '@/components/planner/daily/TimeRangeSelector';
import TimeSlotsList from '@/components/planner/daily/TimeSlotsList';
import AddTaskModal from '@/components/planner/daily/modals/AddTaskModal';
import SettingsModal from '@/components/planner/daily/modals/SettingsModal';
import CalendarModal from '@/components/planner/daily/modals/CalendarModal';
import CopyTasksModal from '@/components/planner/daily/modals/CopyTasksModal';
import ClearTasksModal from '@/components/planner/daily/modals/ClearTasksModal';
import CategoryModal from '@/components/planner/daily/modals/CategoryModal';
import MoveTaskModal from '@/components/planner/daily/modals/MoveTaskModal';

// Import our hooks and utilities
import { useDailyTasks } from '@/hooks/useDailyTasks';
import { useDragAndDrop } from '@/hooks/useDragAndDrop';
import { 
  TIME_INCREMENT_OPTIONS, 
  generateTimeSlots, 
  filterTimeSlotsByRange,
  scrollToCurrentTimeSlot
} from '@/utils/timeUtils';
import { DailyTask } from '@/components/planner/DailyTasksTab';

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

const DailyTasksPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const isTouchDevice = useTouchDevice();
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // State
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [showClearTasksModal, setShowClearTasksModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showMoveTaskModal, setShowMoveTaskModal] = useState(false);
  const [newTaskTime, setNewTaskTime] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState('Personal');
  const [newTaskColor, setNewTaskColor] = useState('#9b87f5');
  const [displayRange, setDisplayRange] = useState<'all' | 'morning' | 'afternoon' | 'evening'>('all');
  const [timeIncrement, setTimeIncrement] = useState<number>(30);
  const [copyToDate, setCopyToDate] = useState<Date | undefined>(undefined);
  const [moveToDate, setMoveToDate] = useState<Date | undefined>(undefined);

  // Custom hooks
  const {
    dailyTasks,
    editingTaskId,
    newTaskName,
    selectedTask,
    showClearTaskWarning,
    setNewTaskName,
    setSelectedTask,
    setEditingTaskId,
    setShowClearTaskWarning,
    getTasksForTimeSlot,
    handleTaskToggle,
    handleQuickAddTask,
    handleAddTask,
    handleUpdateTask,
    handleDeleteTask,
    handleTaskNameBlur,
    handleMoveTaskToDate,
    handleCopyTasks,
    clearTasksForCurrentDay
  } = useDailyTasks(currentDate);

  // Create an adapter function that converts from (task: DailyTask) => void 
  // to (taskId: number, task: Partial<DailyTask>) => void
  const handleEditTaskAdapter = (task: DailyTask) => {
    if (task && task.id) {
      handleUpdateTask(task.id, { timeOfDay: task.timeOfDay });
    }
  };

  const {
    isDragging,
    draggedTask,
    targetTimeSlot,
    handleDragStart,
    handleDragEnd,
    handleTimeSlotHover
  } = useDragAndDrop(dailyTasks, handleUpdateTask);

  // Generate time slots based on current increment
  const timeSlots = generateTimeSlots(timeIncrement);
  const displayTimeSlots = filterTimeSlotsByRange(timeSlots, displayRange);

  // Scroll to current time on load
  useEffect(() => {
    scrollToCurrentTimeSlot(scrollRef, currentDate, timeIncrement);
  }, [displayRange, timeIncrement, currentDate]);

  const handlePreviousDay = () => {
    setCurrentDate(prev => subDays(prev, 1));
    setEditingTaskId(null);
  };

  const handleNextDay = () => {
    setCurrentDate(prev => addDays(prev, 1));
    setEditingTaskId(null);
  };

  const handleQuickAddTaskWrapper = (timeSlot: string) => {
    handleQuickAddTask(timeSlot, newTaskColor);
  };

  const handleClearTasks = () => {
    if (showClearTaskWarning) {
      setShowClearTasksModal(true);
    } else {
      clearTasksForCurrentDay();
    }
  };

  const handleMoveTask = (task: DailyTask) => {
    setSelectedTask(task);
    setMoveToDate(undefined);
    setShowMoveTaskModal(true);
  };

  const handleMoveTaskToDateWrapper = () => {
    if (selectedTask && moveToDate && handleMoveTaskToDate(selectedTask, moveToDate)) {
      setShowMoveTaskModal(false);
      setSelectedTask(null);
      setMoveToDate(undefined);
    }
  };

  const handleCopyTasksWrapper = () => {
    if (handleCopyTasks(copyToDate)) {
      setCopyToDate(undefined);
      setShowCopyModal(false);
    }
  };

  const handleAddTaskWrapper = () => {
    if (handleAddTask(newTaskName, newTaskTime, newTaskColor, newTaskCategory)) {
      setNewTaskName('');
      setNewTaskTime('');
      setShowAddModal(false);
    }
  };

  const handleUpdateTaskWrapper = () => {
    if (selectedTask && handleUpdateTask(selectedTask.id, { 
      name: newTaskName,
      timeOfDay: newTaskTime || undefined,
      color: newTaskColor,
      category: newTaskCategory
    })) {
      setNewTaskName('');
      setNewTaskTime('');
      setShowAddModal(false);
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
    
    handleUpdateTask(selectedTask.id, {
      color: newTaskColor,
      category: newTaskCategory
    });
    
    setShowCategoryModal(false);
    setSelectedTask(null);
  };

  const handleTimeIncrementChange = (value: number) => {
    setTimeIncrement(value);
    toast({
      title: "Settings updated",
      description: `Time increment set to ${value} minutes`
    });
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
        
        <TimeSlotsList
          displayTimeSlots={displayTimeSlots}
          currentDate={currentDate}
          timeIncrement={timeIncrement}
          isDragging={isDragging}
          draggedTask={draggedTask}
          targetTimeSlot={targetTimeSlot}
          editingTaskId={editingTaskId}
          newTaskName={newTaskName}
          isMobile={isMobile}
          isTouchDevice={isTouchDevice}
          scrollRef={scrollRef}
          getTasksForTimeSlot={getTasksForTimeSlot}
          onTimeSlotHover={handleTimeSlotHover}
          onDragEnd={handleDragEnd}
          onQuickAddTask={handleQuickAddTaskWrapper}
          onTaskToggle={handleTaskToggle}
          onMoveTask={handleMoveTask}
          onDeleteTask={handleDeleteTask}
          onNameChange={(e) => setNewTaskName(e.target.value)}
          onNameBlur={handleTaskNameBlur}
          onDragStart={handleDragStart}
          onEditTask={handleUpdateTask}
        />
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
          onSave={selectedTask ? handleUpdateTaskWrapper : handleAddTaskWrapper}
        />
      </Dialog>

      <Dialog open={showSettingsModal} onOpenChange={setShowSettingsModal}>
        <SettingsModal 
          timeIncrement={timeIncrement}
          timeIncrementOptions={TIME_INCREMENT_OPTIONS}
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
          onCopy={handleCopyTasksWrapper}
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
          onMove={handleMoveTaskToDateWrapper}
        />
      </Dialog>
    </div>
  );
};

export default DailyTasksPage;

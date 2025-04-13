
import { useState, useEffect } from 'react';
import { format, isSameDay } from 'date-fns';
import { DailyTask } from '@/components/planner/DailyTasksTab';
import { toast } from '@/components/ui/use-toast';

export const useDailyTasks = (currentDate: Date) => {
  const [dailyTasks, setDailyTasks] = useState<DailyTask[]>([]);
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [newTaskName, setNewTaskName] = useState('');
  const [selectedTask, setSelectedTask] = useState<DailyTask | null>(null);
  const [showClearTaskWarning, setShowClearTaskWarning] = useState(true);

  // Load tasks from localStorage
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

  // Save tasks to localStorage
  useEffect(() => {
    localStorage.setItem('dailyTasks', JSON.stringify(dailyTasks));
  }, [dailyTasks]);

  // Save warning preference to localStorage
  useEffect(() => {
    localStorage.setItem('showClearTaskWarning', showClearTaskWarning.toString());
  }, [showClearTaskWarning]);

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

  // Modified to handle partial updates
  const handleUpdateTask = (taskId: number, updates: Partial<DailyTask>) => {
    const task = dailyTasks.find(t => t.id === taskId);
    
    if (!task) return false;
    
    // If we're updating the name, validate it's not empty
    if (updates.name !== undefined && !updates.name.trim()) {
      toast({
        title: "Task name required",
        description: "Please enter a name for your task",
        variant: "destructive"
      });
      return false;
    }
    
    setDailyTasks(prev => prev.map(task => {
      if (task.id === taskId) {
        return {
          ...task,
          ...updates
        };
      }
      return task;
    }));
    
    if (updates.name) {
      toast({
        title: "Task updated",
        description: `Your task has been updated successfully`
      });
    }
    
    return true;
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
        handleTaskNameBlur(taskId);
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

  const handleQuickAddTask = (timeSlot: string, newTaskColor: string) => {
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

  const handleAddTask = (newTaskName: string, newTaskTime: string, newTaskColor: string, newTaskCategory: string) => {
    if (!newTaskName.trim()) {
      toast({
        title: "Task name required",
        description: "Please enter a name for your daily task",
        variant: "destructive"
      });
      return false;
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
    toast({
      title: "Task added",
      description: `"${newTaskName}" has been added to your daily tasks`
    });
    return true;
  };

  const handleDeleteTask = (taskId: number) => {
    setDailyTasks(prev => prev.filter(task => task.id !== taskId));
    toast({
      title: "Task deleted",
      description: "The task has been removed from your list"
    });
  };

  const handleTaskNameBlur = (taskId: number) => {
    if (editingTaskId === taskId) {
      const task = dailyTasks.find(t => t.id === taskId);
      if (task && !newTaskName.trim()) {
        setDailyTasks(prev => prev.filter(t => t.id !== taskId));
        setEditingTaskId(null);
        return;
      }
      if (newTaskName.trim()) {
        handleUpdateTask(taskId, { name: newTaskName });
        setEditingTaskId(null);
      }
    } else {
      const task = dailyTasks.find(t => t.id === taskId);
      if (task) {
        setNewTaskName(task.name);
        setEditingTaskId(taskId);
      }
    }
  };

  const handleMoveTaskToDate = (selectedTask: DailyTask | null, moveToDate: Date | undefined) => {
    if (!selectedTask || !moveToDate) {
      toast({
        title: "Select a date",
        description: "Please select a date to move this task to",
        variant: "destructive"
      });
      return false;
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
    return true;
  };

  const handleCopyTasks = (copyToDate: Date | undefined) => {
    if (!copyToDate) {
      toast({
        title: "Select a date",
        description: "Please select a date to copy tasks to",
        variant: "destructive"
      });
      return false;
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
      return false;
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
      return false;
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
    return true;
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
      return false;
    }

    setDailyTasks(prev => prev.filter(task => {
      const taskDay = task.lastCompleted ? task.lastCompleted.split('T')[0] : '';
      return taskDay !== currentDateStr;
    }));

    toast({
      title: "Tasks cleared",
      description: `${tasksToRemove.length} tasks have been cleared for ${format(currentDate, 'MMMM d, yyyy')}`
    });
    return true;
  };

  return {
    dailyTasks,
    editingTaskId,
    newTaskName,
    selectedTask,
    showClearTaskWarning,
    setNewTaskName,
    setSelectedTask,
    setEditingTaskId,
    setShowClearTaskWarning,
    getTasksForCurrentDate,
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
  };
};

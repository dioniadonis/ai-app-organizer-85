
import { useState, useEffect } from 'react';
import { format, isSameDay } from 'date-fns';
import { toast } from '@/components/ui/use-toast';
import { DailyTask } from '@/components/planner/types';

export const useDailyTasks = () => {
  const [dailyTasks, setDailyTasks] = useState<DailyTask[]>([]);
  const [showMoveWarning, setShowMoveWarning] = useState(true);

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

    const warningPref = localStorage.getItem('showMoveWarning');
    if (warningPref !== null) {
      setShowMoveWarning(warningPref === 'true');
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('dailyTasks', JSON.stringify(dailyTasks));
  }, [dailyTasks]);

  useEffect(() => {
    localStorage.setItem('showMoveWarning', showMoveWarning.toString());
  }, [showMoveWarning]);

  const addTask = (task: Omit<DailyTask, 'id' | 'streak' | 'completed'>, currentDate: Date) => {
    const newTask: DailyTask = {
      id: Date.now(),
      name: task.name,
      completed: false,
      timeOfDay: task.timeOfDay,
      streak: 0,
      lastCompleted: format(currentDate, 'yyyy-MM-dd'),
      color: task.color,
      category: task.category
    };
    
    setDailyTasks(prev => [...prev, newTask]);
    return newTask;
  };

  const toggleComplete = (taskId: number, currentDate: Date) => {
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

  const updateTask = (taskId: number, updates: Partial<DailyTask>) => {
    setDailyTasks(prev => prev.map(task => {
      if (task.id === taskId) {
        return {
          ...task,
          ...updates
        };
      }
      return task;
    }));
  };

  const deleteTask = (taskId: number) => {
    setDailyTasks(prev => prev.filter(task => task.id !== taskId));
  };

  const moveTask = (taskId: number, targetDate: Date) => {
    const task = dailyTasks.find(t => t.id === taskId);
    if (!task) return;
    
    const movedTask: DailyTask = {
      ...task,
      id: Date.now(),
      completed: false,
      lastCompleted: format(targetDate, 'yyyy-MM-dd')
    };
    
    setDailyTasks(prev => [
      ...prev.filter(t => t.id !== taskId),
      movedTask
    ]);

    return movedTask;
  };

  const copyTask = (taskId: number, targetDate: Date) => {
    const task = dailyTasks.find(t => t.id === taskId);
    if (!task) return;
    
    const copiedTask: DailyTask = {
      ...task,
      id: Date.now() + Math.random() * 1000,
      completed: false,
      lastCompleted: format(targetDate, 'yyyy-MM-dd')
    };
    
    setDailyTasks(prev => [...prev, copiedTask]);
    
    return copiedTask;
  };

  const copyTasksToDate = (currentDate: Date, targetDate: Date) => {
    const currentDateStr = format(currentDate, 'yyyy-MM-dd');
    const targetDateStr = format(targetDate, 'yyyy-MM-dd');
    
    const tasksForCurrentDate = dailyTasks.filter(task => {
      if (task.lastCompleted) {
        return task.lastCompleted.split('T')[0] === currentDateStr;
      }
      return isSameDay(new Date(task.id), currentDate);
    });
    
    if (tasksForCurrentDate.length === 0) return [];
    
    const copiedTasks = tasksForCurrentDate.map(task => ({
      ...task,
      id: Date.now() + Math.random() * 1000,
      completed: false,
      lastCompleted: targetDateStr
    }));
    
    setDailyTasks(prev => [...prev, ...copiedTasks]);
    
    return copiedTasks;
  };

  const clearTasksForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const tasksToRemove = dailyTasks.filter(task => {
      const taskDay = task.lastCompleted ? task.lastCompleted.split('T')[0] : '';
      return taskDay === dateStr;
    });
    
    if (tasksToRemove.length === 0) return 0;
    
    setDailyTasks(prev => prev.filter(task => {
      const taskDay = task.lastCompleted ? task.lastCompleted.split('T')[0] : '';
      return taskDay !== dateStr;
    }));
    
    return tasksToRemove.length;
  };

  const resetStreak = (taskId: number) => {
    setDailyTasks(prev => prev.map(task => {
      if (task.id === taskId) {
        return {
          ...task,
          streak: 0
        };
      }
      return task;
    }));
  };

  const getTasksForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return dailyTasks.filter(task => {
      if (task.lastCompleted) {
        return task.lastCompleted.split('T')[0] === dateStr;
      }
      if (task.id) {
        const taskDate = new Date(task.id);
        return isSameDay(taskDate, date);
      }
      return false;
    });
  };

  const getTasksForTimeSlot = (timeSlot: string, date: Date) => {
    const [time, period] = timeSlot.split(' ');
    const [hour, minute] = time.split(':');
    let hour24 = parseInt(hour);
    
    if (period === 'PM' && hour24 !== 12) {
      hour24 += 12;
    } else if (period === 'AM' && hour24 === 12) {
      hour24 = 0;
    }
    
    const timeString = `${hour24.toString().padStart(2, '0')}:${minute}`;
    const dateStr = format(date, 'yyyy-MM-dd');
    
    return dailyTasks.filter(task => {
      const isCorrectTime = task.timeOfDay === timeString;
      const isForDate = task.lastCompleted ? 
        task.lastCompleted.split('T')[0] === dateStr : 
        isSameDay(new Date(task.id), date);
      
      return isCorrectTime && isForDate;
    });
  };

  return {
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
  };
};

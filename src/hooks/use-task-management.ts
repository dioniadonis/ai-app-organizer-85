
import { useState, useEffect } from 'react';
import { toast } from '@/components/ui/use-toast';
import { DailyTask } from '@/components/planner/DailyTasksTab';

export const useTaskManagement = () => {
  const [dailyTasks, setDailyTasks] = useState<DailyTask[]>([]);
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [newTaskName, setNewTaskName] = useState('');
  const [showClearWarning, setShowClearWarning] = useState(true);

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
  }, []);

  // Save tasks to localStorage when they change
  useEffect(() => {
    localStorage.setItem('dailyTasks', JSON.stringify(dailyTasks));
  }, [dailyTasks]);

  const handleTaskToggle = (taskId: number) => {
    const task = dailyTasks.find(t => t.id === taskId);
    
    if (!task || !task.name.trim()) {
      toast({
        title: "Task name required",
        description: "Please enter a name for your task before marking it complete",
        variant: "destructive"
      });
      
      if (editingTaskId !== taskId) {
        handleTaskClick(task as DailyTask);
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
      color: '#9b87f5',
      category: 'Personal'
    };

    setDailyTasks(prev => [...prev, newTask]);
    
    setEditingTaskId(newTask.id);
    setNewTaskName('');
    
    setTimeout(() => {
      const input = document.querySelector(`div[data-task-id="${newTask.id}"] input`);
      if (input instanceof HTMLInputElement) {
        input.focus();
      }
    }, 100);
  };

  const handleTaskClick = (task: DailyTask) => {
    setEditingTaskId(task.id);
    setNewTaskName(task.name);
  };

  const handleTaskNameBlur = (taskId: number) => {
    if (newTaskName.trim()) {
      setDailyTasks(prev => prev.map(t => {
        if (t.id === taskId) {
          return { ...t, name: newTaskName };
        }
        return t;
      }));
      
      setTimeout(() => {
        setEditingTaskId(null);
        setNewTaskName('');
      }, 50);
    } else {
      toast({
        title: "Task name required",
        description: "Please enter a name for your task",
        variant: "destructive"
      });
    }
  };

  const handleDeleteTask = (taskId: number) => {
    setDailyTasks(prev => prev.filter(task => task.id !== taskId));
    
    toast({
      title: "Task deleted",
      description: "The task has been removed from your list"
    });
  };

  const handleClearTasks = () => {
    setDailyTasks([]);
    
    toast({
      title: "Tasks cleared",
      description: "All tasks have been cleared",
      variant: "destructive"
    });
  };

  return {
    dailyTasks,
    setDailyTasks,
    editingTaskId,
    setEditingTaskId,
    newTaskName,
    setNewTaskName,
    showClearWarning,
    setShowClearWarning,
    handleTaskToggle,
    handleQuickAddTask,
    handleTaskClick,
    handleTaskNameBlur,
    handleDeleteTask,
    handleClearTasks
  };
};

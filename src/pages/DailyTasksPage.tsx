import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DailyTasksTab, { DailyTask } from '@/components/planner/DailyTasksTab';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { toast } from '@/components/ui/use-toast';

const DailyTasksPage = () => {
  const navigate = useNavigate();
  const [dailyTasks, setDailyTasks] = useLocalStorage<DailyTask[]>('dailyTasks', []);
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [newTaskName, setNewTaskName] = useState('');

  const handleTaskNameBlur = (taskId: number) => {
    console.log('Blurring task:', taskId);
    
    if (!newTaskName.trim()) {
      setEditingTaskId(null);
      return;
    }
    
    setDailyTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        return { ...t, name: newTaskName };
      }
      return t;
    }));
    
    setEditingTaskId(null);
  };

  const handleAddTask = (taskData: Omit<DailyTask, 'id' | 'streak' | 'completed'>) => {
    const newTask: DailyTask = {
      id: Date.now(),
      ...taskData,
      completed: false,
      streak: 0
    };
    
    setDailyTasks([...dailyTasks, newTask]);
  };
  
  const handleToggleComplete = (id: number) => {
    setDailyTasks(prev => prev.map(task => {
      if (task.id === id) {
        const completed = !task.completed;
        let streak = task.streak;
        let lastCompleted = task.lastCompleted;
        
        if (completed) {
          const today = new Date().toISOString().split('T')[0];
          streak = (streak || 0) + 1;
          lastCompleted = today;
        }
        
        return { ...task, completed, streak, lastCompleted };
      }
      return task;
    }));
  };
  
  const handleEditTask = (id: number, taskData: Partial<DailyTask>) => {
    setDailyTasks(prev => prev.map(task => {
      if (task.id === id) {
        return { ...task, ...taskData };
      }
      return task;
    }));
    
    if (taskData.name) {
      setNewTaskName(taskData.name);
    }
  };
  
  const handleDeleteTask = (id: number) => {
    setDailyTasks(prev => prev.filter(task => task.id !== id));
    
    toast({
      title: "Task deleted",
      description: "The daily task has been removed",
      duration: 3000,
    });
  };
  
  const handleResetStreak = (id: number) => {
    setDailyTasks(prev => prev.map(task => {
      if (task.id === id) {
        return { ...task, streak: 0, lastCompleted: undefined };
      }
      return task;
    }));
    
    toast({
      title: "Streak reset",
      description: "The task streak has been reset to 0",
      duration: 3000,
    });
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Daily Tasks</h1>
          <p className="text-gray-400">Track your daily habits and recurring tasks</p>
        </div>
        <button 
          onClick={() => navigate('/planner')}
          className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
        >
          Back to Planner
        </button>
      </div>
      
      <DailyTasksTab
        tasks={dailyTasks}
        onAddTask={handleAddTask}
        onToggleComplete={handleToggleComplete}
        onEditTask={handleEditTask}
        onDeleteTask={handleDeleteTask}
        onResetStreak={handleResetStreak}
      />
    </div>
  );
};

export default DailyTasksPage;


import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageLayout from '@/components/PageLayout';
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
    
    // If no name is entered, simply cancel the editing state without saving changes
    if (!newTaskName.trim()) {
      setEditingTaskId(null);
      return;
    }
    
    // Update the task name if a non-empty name is provided
    setDailyTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        return { ...t, name: newTaskName };
      }
      return t;
    }));
    
    // Always clear the editing state
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
      description: "The daily task has been removed"
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
      description: "The task streak has been reset to 0"
    });
  };

  return (
    <PageLayout
      title="Daily Tasks"
      subtitle="Track your daily habits and recurring tasks"
      actionLabel="Back to Planner"
      onAction={() => navigate('/planner')}
    >
      <DailyTasksTab
        tasks={dailyTasks}
        onAddTask={handleAddTask}
        onToggleComplete={handleToggleComplete}
        onEditTask={handleEditTask}
        onDeleteTask={handleDeleteTask}
        onResetStreak={handleResetStreak}
      />
    </PageLayout>
  );
};

export default DailyTasksPage;

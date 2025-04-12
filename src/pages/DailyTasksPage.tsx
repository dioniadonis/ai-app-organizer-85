
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { DailyTask } from '@/components/planner/DailyTasksTab';
import DailyTasksTab from '@/components/planner/DailyTasksTab';

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

const DailyTasksPage = () => {
  const [dailyTasks, setDailyTasks] = useState<DailyTask[]>([]);
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [newTaskName, setNewTaskName] = useState<string>('');
  const [newTaskTime, setNewTaskTime] = useState<string>('');
  const [newTaskCategory, setNewTaskCategory] = useState<string>('Personal');
  const [newTaskColor, setNewTaskColor] = useState<string>(COLORS[0]);

  // Function to start editing a task
  const startEditing = (taskId: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingTaskId(taskId);
    const task = dailyTasks.find(t => t.id === taskId);
    if (task) {
      setNewTaskName(task.name);
      setNewTaskTime(task.timeOfDay || '');
      setNewTaskCategory(task.category || 'Personal');
      setNewTaskColor(task.color || COLORS[0]);
    }
  };

  // Handle adding a new task
  const handleAddTask = (task: Omit<DailyTask, 'id' | 'streak' | 'completed'>) => {
    const newTask: DailyTask = {
      id: Date.now(),
      name: task.name,
      completed: false,
      streak: 0,
      timeOfDay: task.timeOfDay,
      category: task.category,
      color: task.color
    };
    setDailyTasks([...dailyTasks, newTask]);
  };

  // Handle toggling task completion
  const handleToggleComplete = (id: number) => {
    setDailyTasks(dailyTasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  // Handle editing a task
  const handleEditTask = (id: number, updatedFields: Partial<DailyTask>) => {
    setDailyTasks(dailyTasks.map(task => 
      task.id === id ? { ...task, ...updatedFields } : task
    ));
  };

  // Handle deleting a task
  const handleDeleteTask = (id: number) => {
    setDailyTasks(dailyTasks.filter(task => task.id !== id));
  };

  // Handle resetting a task streak
  const handleResetStreak = (id: number) => {
    setDailyTasks(dailyTasks.map(task => 
      task.id === id ? { ...task, streak: 0 } : task
    ));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Daily Tasks</h1>
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

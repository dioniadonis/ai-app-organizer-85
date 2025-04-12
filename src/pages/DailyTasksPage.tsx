
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, addDays, subDays } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Plus, Calendar, Edit, Trash, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { DatePicker } from '@/components/ui/date-picker';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

interface DailyTask {
  id: number;
  name: string;
  completed: boolean;
  date: string;
  timeOfDay?: string;
  category?: 'Personal' | 'Work' | 'Health' | 'Finance' | 'Other';
  color?: string;
}

const COLORS = ['#9b87f5', '#33C3F0', '#ea384c', '#1EAEDB', '#7E69AB'];

const DailyTasksPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [dailyTasks, setDailyTasks] = useState<DailyTask[]>([]);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskName, setNewTaskName] = useState('');
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [newTaskTime, setNewTaskTime] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState<'Personal' | 'Work' | 'Health' | 'Finance' | 'Other'>('Personal');
  const [newTaskColor, setNewTaskColor] = useState(COLORS[0]);

  // Load tasks for the selected date
  useEffect(() => {
    loadTasksForDate(selectedDate);
    setIsAddingTask(false);
    setNewTaskName('');
  }, [selectedDate]);

  // Load initial tasks
  useEffect(() => {
    loadTasksFromStorage();
  }, []);

  const loadTasksFromStorage = () => {
    const savedTasks = localStorage.getItem('dailyTasks');
    if (savedTasks) {
      setDailyTasks(JSON.parse(savedTasks));
      loadTasksForDate(selectedDate);
    }
  };

  const loadTasksForDate = (date: Date) => {
    const dateString = format(date, 'yyyy-MM-dd');
    const savedTasks = localStorage.getItem('dailyTasks');
    
    if (savedTasks) {
      const allTasks: DailyTask[] = JSON.parse(savedTasks);
      const tasksForDate = allTasks.filter(task => task.date === dateString);
      setDailyTasks(tasksForDate);
    }
  };

  const saveTasks = (tasks: DailyTask[]) => {
    const savedTasks = localStorage.getItem('dailyTasks');
    let allTasks: DailyTask[] = [];
    
    if (savedTasks) {
      allTasks = JSON.parse(savedTasks);
      // Remove tasks for the current date
      const dateString = format(selectedDate, 'yyyy-MM-dd');
      allTasks = allTasks.filter(task => task.date !== dateString);
    }
    
    // Add the updated tasks for the current date
    allTasks = [...allTasks, ...tasks];
    localStorage.setItem('dailyTasks', JSON.stringify(allTasks));
  };

  const handleAddTask = () => {
    if (!newTaskName.trim()) {
      setIsAddingTask(false);
      return;
    }

    const dateString = format(selectedDate, 'yyyy-MM-dd');
    const newTask: DailyTask = {
      id: Date.now(),
      name: newTaskName,
      completed: false,
      date: dateString,
      timeOfDay: newTaskTime,
      category: newTaskCategory,
      color: newTaskColor
    };

    const updatedTasks = [...dailyTasks, newTask];
    setDailyTasks(updatedTasks);
    saveTasks(updatedTasks);
    setNewTaskName('');
    setIsAddingTask(false);
    
    toast({
      title: "Task added",
      description: `"${newTaskName}" has been added to your daily tasks.`,
    });
  };

  const handleTaskComplete = (taskId: number) => {
    const updatedTasks = dailyTasks.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    );
    
    setDailyTasks(updatedTasks);
    saveTasks(updatedTasks);
    
    const task = updatedTasks.find(t => t.id === taskId);
    if (task) {
      toast({
        title: task.completed ? "Task completed" : "Task uncompleted",
        description: `"${task.name}" ${task.completed ? 'marked as done' : 'marked as not done'}.`,
      });
    }
  };

  const handleTaskDelete = (taskId: number) => {
    const taskToDelete = dailyTasks.find(task => task.id === taskId);
    const updatedTasks = dailyTasks.filter(task => task.id !== taskId);
    setDailyTasks(updatedTasks);
    saveTasks(updatedTasks);
    
    if (taskToDelete) {
      toast({
        title: "Task deleted",
        description: `"${taskToDelete.name}" has been removed from your tasks.`,
      });
    }
  };

  const handleTaskUpdate = () => {
    if (!editingTaskId || !newTaskName.trim()) return;
    
    const updatedTasks = dailyTasks.map(task => 
      task.id === editingTaskId 
        ? { 
            ...task, 
            name: newTaskName,
            timeOfDay: newTaskTime,
            category: newTaskCategory,
            color: newTaskColor
          } 
        : task
    );
    
    setDailyTasks(updatedTasks);
    saveTasks(updatedTasks);
    setEditingTaskId(null);
    setNewTaskName('');
    
    toast({
      title: "Task updated",
      description: `Task has been updated successfully.`,
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
      setNewTaskColor(task.color || COLORS[0]);
    }
  };

  const handlePreviousDay = () => {
    setSelectedDate(prevDate => subDays(prevDate, 1));
  };

  const handleNextDay = () => {
    setSelectedDate(prevDate => addDays(prevDate, 1));
  };

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      setIsCalendarOpen(false);
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (editingTaskId) {
        handleTaskUpdate();
      } else {
        handleAddTask();
      }
    } else if (e.key === 'Escape') {
      if (editingTaskId) {
        setEditingTaskId(null);
        setNewTaskName('');
      } else {
        setIsAddingTask(false);
        setNewTaskName('');
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="py-4 px-6 flex items-center justify-between border-b border-gray-800">
        <h1 className="text-2xl font-bold">Daily Tasks</h1>
        <Button
          variant="ghost" 
          size="icon"
          onClick={() => setIsCalendarOpen(!isCalendarOpen)}
        >
          <Calendar className="h-5 w-5" />
        </Button>
      </header>
      
      {isCalendarOpen && (
        <div className="p-4 bg-gray-900 rounded-lg shadow-xl absolute top-20 right-6 z-10">
          <DatePicker date={selectedDate} onDateChange={handleDateChange} />
        </div>
      )}
      
      <div className="flex-1 p-4">
        {/* Date Navigation - Centered Header */}
        <div className="date-nav relative text-center py-4 mb-6">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handlePreviousDay}
            className="prev-arrow absolute left-0"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          
          <h2 className="date-label absolute left-1/2 transform -translate-x-1/2 text-xl font-semibold">
            {format(selectedDate, 'MMMM d, yyyy')}
          </h2>
          
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleNextDay}
            className="next-arrow absolute right-0"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
        
        {/* Tasks List */}
        <div className="space-y-3 mt-8">
          <AnimatePresence>
            {dailyTasks.map(task => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`p-4 rounded-lg flex items-center justify-between ${
                  task.completed ? 'bg-gray-800/50' : 'bg-gray-800'
                }`}
                style={{ borderLeft: `4px solid ${task.color || '#9b87f5'}` }}
              >
                {editingTaskId === task.id ? (
                  <div className="flex-1">
                    <Input
                      value={newTaskName}
                      onChange={(e) => setNewTaskName(e.target.value)}
                      onKeyDown={handleInputKeyDown}
                      autoFocus
                      className="bg-gray-700"
                    />
                    <div className="mt-2 flex space-x-2">
                      <Button size="sm" onClick={handleTaskUpdate}>
                        Save
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => setEditingTaskId(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div 
                      className="flex items-center flex-1"
                      onClick={() => handleTaskComplete(task.id)}
                    >
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-3 cursor-pointer ${
                        task.completed 
                          ? 'bg-green-500 border-green-500' 
                          : 'border-gray-400'
                      }`}>
                        {task.completed && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <div className="flex-1">
                        <p className={`${task.completed ? 'line-through text-gray-400' : 'text-white'}`}>
                          {task.name}
                        </p>
                        {task.timeOfDay && (
                          <p className="text-xs text-gray-400 mt-1">
                            {task.timeOfDay}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => startEditing(task.id, e)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleTaskDelete(task.id)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
          
          {/* Add Task Input or Button - Fixed Auto-population */}
          {isAddingTask ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-lg bg-gray-800"
            >
              <Input
                placeholder="Enter task name..."
                value={newTaskName}
                onChange={(e) => setNewTaskName(e.target.value)}
                onKeyDown={handleInputKeyDown}
                autoFocus
                className="bg-gray-700"
                onBlur={() => {
                  if (!newTaskName.trim()) {
                    setIsAddingTask(false);
                    setNewTaskName("");
                  }
                }}
              />
              <div className="mt-3 flex justify-end space-x-2">
                <Button size="sm" onClick={handleAddTask}>
                  Add Task
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => {
                    setIsAddingTask(false);
                    setNewTaskName('');
                  }}
                >
                  Cancel
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="w-full p-3 rounded-lg border border-dashed border-gray-600 
                text-gray-400 hover:border-purple-500 hover:text-purple-500 
                transition-colors flex items-center justify-center"
              onClick={() => setIsAddingTask(true)}
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Task
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DailyTasksPage;

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Check, X, Edit, Trash, CalendarIcon, Clock, AlertCircle } from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter 
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { toast } from '@/components/ui/use-toast';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

// Add activeTab to the interface
interface PlannerProps {
  activeTab: string;
  plannerData: {
    tasks: any[];
    goals: any[];
    recurringTasks: any[];
  };
  setPlannerData: React.Dispatch<React.SetStateAction<{
    tasks: any[];
    goals: any[];
    recurringTasks: any[];
  }>>;
}

interface Task {
  id: string | number;
  title: string;
  description?: string;
  dueDate?: string;
  completed: boolean;
  priority?: 'low' | 'medium' | 'high';
}

interface Goal {
  id: string | number;
  title: string;
  targetDate?: string;
  progress: number;
  completedSteps: number;
  totalSteps: number;
  type: 'daily' | 'short' | 'long';
}

interface RecurringTask {
  id: string | number;
  title: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  nextDue: string;
  priority?: 'low' | 'medium' | 'high';
  createdAt: string;
}

const Planner: React.FC<PlannerProps> = ({ activeTab, plannerData, setPlannerData }) => {
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [isGoalDialogOpen, setIsGoalDialogOpen] = useState(false);
  const [isRecurringTaskDialogOpen, setIsRecurringTaskDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskDueDate, setNewTaskDueDate] = useState<Date | undefined>(undefined);
  const [newTaskPriority, setNewTaskPriority] = useState<Task['priority']>('medium');
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalTargetDate, setNewGoalTargetDate] = useState<Date | undefined>(undefined);
  const [newGoalTotalSteps, setNewGoalTotalSteps] = useState(5);
  const [editMode, setEditMode] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isGoalDatePickerOpen, setIsGoalDatePickerOpen] = useState(false);
  const [newRecurringTaskTitle, setNewRecurringTaskTitle] = useState('');
  const [newRecurringTaskFrequency, setNewRecurringTaskFrequency] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [newRecurringTaskNextDue, setNewRecurringTaskNextDue] = useState<Date | undefined>(undefined);
  const [isRecurringTaskDatePickerOpen, setIsRecurringTaskDatePickerOpen] = useState(false);
  const [newRecurringTaskPriority, setNewRecurringTaskPriority] = useState<Task['priority']>('medium');

  useEffect(() => {
    // Load data from localStorage on component mount
    const storedData = localStorage.getItem('plannerData');
    if (storedData) {
      setPlannerData(JSON.parse(storedData));
    }
  }, [setPlannerData]);

  useEffect(() => {
    // Save data to localStorage whenever plannerData changes
    localStorage.setItem('plannerData', JSON.stringify(plannerData));
  }, [plannerData]);

  const addTask = () => {
    if (!newTaskTitle.trim()) return;

    const newTask: Task = {
      id: Date.now(),
      title: newTaskTitle,
      description: newTaskDescription,
      dueDate: newTaskDueDate ? newTaskDueDate.toISOString() : undefined,
      completed: false,
      priority: newTaskPriority
    };

    setPlannerData({
      ...plannerData,
      tasks: [...plannerData.tasks, newTask]
    });

    setNewTaskTitle('');
    setNewTaskDescription('');
    setNewTaskDueDate(undefined);
    setNewTaskPriority('medium');
    setIsTaskDialogOpen(false);

    toast({
      title: "Task added",
      description: `"${newTask.title}" added to your task list`,
    });
  };

  const addGoal = () => {
    if (!newGoalTitle.trim()) return;

    const newGoal: Goal = {
      id: Date.now(),
      title: newGoalTitle,
      targetDate: newGoalTargetDate ? newGoalTargetDate.toISOString() : undefined,
      progress: 0,
      completedSteps: 0,
      totalSteps: newGoalTotalSteps
    };

    setPlannerData({
      ...plannerData,
      goals: [...plannerData.goals, newGoal]
    });

    setNewGoalTitle('');
    setNewGoalTargetDate(undefined);
    setNewGoalTotalSteps(5);
    setIsGoalDialogOpen(false);

    toast({
      title: "Goal added",
      description: `"${newGoal.title}" added to your goals`,
    });
  };

  const addRecurringTask = () => {
    if (!newRecurringTaskTitle.trim()) return;
  
    if (!newRecurringTaskNextDue) {
      toast({
        title: "Error",
        description: "Please select the next due date for the recurring task.",
        variant: "destructive",
      });
      return;
    }
  
    const newRecurringTask: RecurringTask = {
      id: Date.now(),
      title: newRecurringTaskTitle,
      frequency: newRecurringTaskFrequency,
      nextDue: newRecurringTaskNextDue.toISOString(),
      priority: newRecurringTaskPriority,
      createdAt: new Date().toISOString()
    };
  
    setPlannerData({
      ...plannerData,
      recurringTasks: [...plannerData.recurringTasks, newRecurringTask]
    });
  
    setNewRecurringTaskTitle('');
    setNewRecurringTaskFrequency('daily');
    setNewRecurringTaskNextDue(undefined);
    setNewRecurringTaskPriority('medium');
    setIsRecurringTaskDialogOpen(false);
  
    toast({
      title: "Recurring task added",
      description: `"${newRecurringTask.title}" will repeat ${newRecurringTask.frequency}`,
    });
  };

  const toggleTaskCompletion = (id: string | number) => {
    const updatedTasks = plannerData.tasks.map(task =>
      task.id === id ? { ...task, completed: !task.completed } : task
    );

    setPlannerData({
      ...plannerData,
      tasks: updatedTasks
    });

    const task = updatedTasks.find(task => task.id === id);
    if (task) {
      toast({
        title: `Task ${task.completed ? 'completed' : 'uncompleted'}`,
        description: `"${task.title}" marked as ${task.completed ? 'completed' : 'uncompleted'}`,
      });
    }
  };

  const updateGoalProgress = (id: string | number, increment: number) => {
    const updatedGoals = plannerData.goals.map(goal => {
      if (goal.id === id) {
        const newCompletedSteps = Math.max(0, Math.min(goal.totalSteps, goal.completedSteps + increment));
        const newProgress = (newCompletedSteps / goal.totalSteps) * 100;
        return { ...goal, completedSteps: newCompletedSteps, progress: newProgress };
      }
      return goal;
    });

    setPlannerData({
      ...plannerData,
      goals: updatedGoals
    });
  };

  const startEditTask = (task: Task) => {
    setSelectedTask(task);
    setNewTaskTitle(task.title);
    setNewTaskDescription(task.description || '');
    setNewTaskDueDate(task.dueDate ? new Date(task.dueDate) : undefined);
    setNewTaskPriority(task.priority || 'medium');
    setEditMode(true);
    setIsTaskDialogOpen(true);
  };

  const startEditGoal = (goal: Goal) => {
    setSelectedGoal(goal);
    setNewGoalTitle(goal.title);
    setNewGoalTargetDate(goal.targetDate ? new Date(goal.targetDate) : undefined);
    setNewGoalTotalSteps(goal.totalSteps);
    setEditMode(true);
    setIsGoalDialogOpen(true);
  };

  const updateTask = () => {
    if (!selectedTask) return;

    const updatedTasks = plannerData.tasks.map(task => {
      if (task.id === selectedTask.id) {
        return {
          ...task,
          title: newTaskTitle,
          description: newTaskDescription,
          dueDate: newTaskDueDate ? newTaskDueDate.toISOString() : undefined,
          priority: newTaskPriority
        };
      }
      return task;
    });

    setPlannerData({
      ...plannerData,
      tasks: updatedTasks
    });

    setNewTaskTitle('');
    setNewTaskDescription('');
    setNewTaskDueDate(undefined);
    setNewTaskPriority('medium');
    setIsTaskDialogOpen(false);
    setEditMode(false);
    setSelectedTask(null);

    toast({
      title: "Task updated",
      description: `"${newTaskTitle}" updated successfully`,
    });
  };

  const updateGoal = () => {
    if (!selectedGoal) return;

    const updatedGoals = plannerData.goals.map(goal => {
      if (goal.id === selectedGoal.id) {
        return {
          ...goal,
          title: newGoalTitle,
          targetDate: newGoalTargetDate ? newGoalTargetDate.toISOString() : undefined,
          totalSteps: newGoalTotalSteps
        };
      }
      return goal;
    });

    setPlannerData({
      ...plannerData,
      goals: updatedGoals
    });

    setNewGoalTitle('');
    setNewGoalTargetDate(undefined);
    setNewGoalTotalSteps(5);
    setIsGoalDialogOpen(false);
    setEditMode(false);
    setSelectedGoal(null);

    toast({
      title: "Goal updated",
      description: `"${newGoalTitle}" updated successfully`,
    });
  };

  const deleteTask = (id: string | number) => {
    const taskToDelete = plannerData.tasks.find(task => task.id === id);
    if (!taskToDelete) return;

    const updatedTasks = plannerData.tasks.filter(task => task.id !== id);

    setPlannerData({
      ...plannerData,
      tasks: updatedTasks
    });

    toast({
      title: "Task deleted",
      description: `"${taskToDelete.title}" deleted from your task list`,
    });
  };

  const deleteGoal = (id: string | number) => {
    const goalToDelete = plannerData.goals.find(goal => goal.id === id);
    if (!goalToDelete) return;

    const updatedGoals = plannerData.goals.filter(goal => goal.id !== id);

    setPlannerData({
      ...plannerData,
      goals: updatedGoals
    });

    toast({
      title: "Goal deleted",
      description: `"${goalToDelete.title}" deleted from your goals`,
    });
  };

  const deleteRecurringTask = (id: string | number) => {
    const taskToDelete = plannerData.recurringTasks.find(task => task.id === id);
    if (!taskToDelete) return;

    const updatedTasks = plannerData.recurringTasks.filter(task => task.id !== id);

    setPlannerData({
      ...plannerData,
      recurringTasks: updatedTasks
    });

    toast({
      title: "Recurring task deleted",
      description: `"${taskToDelete.title}" deleted from your recurring task list`,
    });
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    try {
      return format(new Date(dateString), 'yyyy-MM-dd');
    } catch (error) {
      console.error("Error formatting date:", error);
      return '';
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    },
    exit: {
      opacity: 0,
      transition: {
        duration: 0.2
      }
    }
  };

  return (
    <>
      {activeTab === 'tasks' && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <div className="mb-4 flex justify-end">
            <Button onClick={() => setIsTaskDialogOpen(true)} className="bg-purple-600 hover:bg-purple-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Task
            </Button>
          </div>

          {plannerData.tasks.length > 0 ? (
            <div className="space-y-3">
              {plannerData.tasks.map(task => (
                <motion.div
                  key={task.id}
                  className="bg-gray-700/50 rounded-lg p-3 flex items-center justify-between"
                  whileHover={{ scale: 1.03 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-full h-8 w-8 hover:bg-gray-600/50"
                      onClick={() => toggleTaskCompletion(task.id)}
                    >
                      {task.completed ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Circle className="w-4 h-4 text-gray-400" />
                      )}
                    </Button>
                    <span className={task.completed ? "line-through text-gray-400" : ""}>{task.title}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {task.dueDate && (
                      <span className="text-gray-500 text-sm">
                        <CalendarIcon className="w-3 h-3 mr-1 inline-block" />
                        {formatDate(task.dueDate)}
                      </span>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-full h-8 w-8 hover:bg-gray-600/50"
                      onClick={() => startEditTask(task)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-full h-8 w-8 hover:bg-red-600/50 text-red-500"
                      onClick={() => deleteTask(task.id)}
                    >
                      <Trash className="w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-4">
              No tasks added yet.
            </div>
          )}
        </motion.div>
      )}

      {activeTab === 'goals' && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <div className="mb-4 flex justify-end">
            <Button onClick={() => setIsGoalDialogOpen(true)} className="bg-purple-600 hover:bg-purple-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Goal
            </Button>
          </div>

          {plannerData.goals.length > 0 ? (
            <div className="space-y-4">
              {plannerData.goals.map(goal => (
                <motion.div
                  key={goal.id}
                  className="bg-gray-700/50 rounded-lg p-4"
                  whileHover={{ scale: 1.03 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-semibold">{goal.title}</h3>
                    <div className="text-gray-500 text-sm">
                      {goal.completedSteps}/{goal.totalSteps} Steps
                    </div>
                  </div>
                  <div className="w-full bg-gray-600 rounded-full h-2.5">
                    <div
                      className="bg-purple-500 h-2.5 rounded-full"
                      style={{ width: `${goal.progress}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <div className="text-gray-500 text-sm">
                      Progress: {Math.round(goal.progress)}%
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="hover:bg-gray-600/50 text-gray-400"
                        onClick={() => updateGoalProgress(goal.id, -1)}
                        disabled={goal.completedSteps <= 0}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="hover:bg-gray-600/50 text-gray-400"
                        onClick={() => updateGoalProgress(goal.id, 1)}
                        disabled={goal.completedSteps >= goal.totalSteps}
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-full h-8 w-8 hover:bg-gray-600/50"
                        onClick={() => startEditGoal(goal)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-full h-8 w-8 hover:bg-red-600/50 text-red-500"
                        onClick={() => deleteGoal(goal.id)}
                      >
                        <Trash className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-4">
              No goals added yet.
            </div>
          )}
        </motion.div>
      )}

      {activeTab === 'recurring' && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <div className="mb-4 flex justify-end">
            <Button onClick={() => setIsRecurringTaskDialogOpen(true)} className="bg-purple-600 hover:bg-purple-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Recurring Task
            </Button>
          </div>

          {plannerData.recurringTasks.length > 0 ? (
            <div className="space-y-3">
              {plannerData.recurringTasks.map(task => (
                <motion.div
                  key={task.id}
                  className="bg-gray-700/50 rounded-lg p-3 flex items-center justify-between"
                  whileHover={{ scale: 1.03 }}
                  transition={{ duration: 0.2 }}
                >
                  <div>
                    <h4 className="font-medium">{task.title}</h4>
                    <div className="text-sm text-gray-400">
                      Repeats {task.frequency}
                    </div>
                    <div className="text-sm text-gray-400">
                      Next Due: {formatDate(task.nextDue)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-full h-8 w-8 hover:bg-red-600/50 text-red-500"
                      onClick={() => deleteRecurringTask(task.id)}
                    >
                      <Trash className="w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-4">
              No recurring tasks added yet.
            </div>
          )}
        </motion.div>
      )}

      {/* Task Dialog */}
      <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
        <DialogContent className="bg-gray-800 text-white border-gray-700">
          <DialogHeader>
            <DialogTitle>{editMode ? "Edit Task" : "Add Task"}</DialogTitle>
            <DialogDescription className="text-gray-400">
              {editMode ? "Update the task details below" : "Enter the details for your new task"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="name" className="text-right text-sm font-medium">
                Task Title
              </label>
              <Input
                id="name"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                className="col-span-3 bg-gray-700 border-gray-600"
              />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <label htmlFor="description" className="text-right text-sm font-medium">
                Description
              </label>
              <Textarea
                id="description"
                value={newTaskDescription}
                onChange={(e) => setNewTaskDescription(e.target.value)}
                className="col-span-3 bg-gray-700 border-gray-600"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="dueDate" className="text-right text-sm font-medium">
                Due Date
              </label>
              <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={
                      "col-span-3 pl-3.5 font-normal bg-gray-700 border-gray-600 justify-start text-left" +
                      (newTaskDueDate ? " text-foreground" : " text-muted-foreground")
                    }
                  >
                    {newTaskDueDate ? (
                      format(newTaskDueDate, "yyyy-MM-dd")
                    ) : (
                      <span>Pick a date</span>
                    )}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-gray-800 border-gray-700" align="start">
                  <Calendar
                    mode="single"
                    selected={newTaskDueDate}
                    onSelect={setNewTaskDueDate}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="priority" className="text-right text-sm font-medium">
                Priority
              </label>
              <select
                id="priority"
                value={newTaskPriority}
                onChange={(e) => setNewTaskPriority(e.target.value as Task['priority'])}
                className="col-span-3 p-2 rounded-md bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => {
              setIsTaskDialogOpen(false);
              setEditMode(false);
              setSelectedTask(null);
              setNewTaskTitle('');
              setNewTaskDescription('');
              setNewTaskDueDate(undefined);
              setNewTaskPriority('medium');
            }}>
              Cancel
            </Button>
            <Button type="submit" onClick={editMode ? updateTask : addTask} className="bg-purple-600 hover:bg-purple-700">
              {editMode ? "Update Task" : "Add Task"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Goal Dialog */}
      <Dialog open={isGoalDialogOpen} onOpenChange={setIsGoalDialogOpen}>
        <DialogContent className="bg-gray-800 text-white border-gray-700">
          <DialogHeader>
            <DialogTitle>{editMode ? "Edit Goal" : "Add Goal"}</DialogTitle>
            <DialogDescription className="text-gray-400">
              {editMode ? "Update the goal details below" : "Enter the details for your new goal"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="goalTitle" className="text-right text-sm font-medium">
                Goal Title
              </label>
              <Input
                type="text"
                id="goalTitle"
                value={newGoalTitle}
                onChange={(e) => setNewGoalTitle(e.target.value)}
                className="col-span-3 bg-gray-700 border-gray-600"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="goalTargetDate" className="text-right text-sm font-medium">
                Target Date
              </label>
              <Popover open={isGoalDatePickerOpen} onOpenChange={setIsGoalDatePickerOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={
                      "col-span-3 pl-3.5 font-normal bg-gray-700 border-gray-600 justify-start text-left" +
                      (newGoalTargetDate ? " text-foreground" : " text-muted-foreground")
                    }
                  >
                    {newGoalTargetDate ? (
                      format(newGoalTargetDate, "yyyy-MM-dd")
                    ) : (
                      <span>Pick a date</span>
                    )}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-gray-800 border-gray-700" align="start">
                  <Calendar
                    mode="single"
                    selected={newGoalTargetDate}
                    onSelect={setNewGoalTargetDate}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="goalTotalSteps" className="text-right text-sm font-medium">
                Total Steps
              </label>
              <Input
                type="number"
                id="goalTotalSteps"
                value={newGoalTotalSteps}
                onChange={(e) => setNewGoalTotalSteps(parseInt(e.target.value))}
                className="col-span-3 bg-gray-700 border-gray-600"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => {
              setIsGoalDialogOpen(false);
              setEditMode(false);
              setSelectedGoal(null);
              setNewGoalTitle('');
              setNewGoalTargetDate(undefined);
              setNewGoalTotalSteps(5);
            }}>
              Cancel
            </Button>
            <Button type="submit" onClick={editMode ? updateGoal : addGoal} className="bg-purple-600 hover:bg-purple-700">
              {editMode ? "Update Goal" : "Add Goal"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Recurring Task Dialog */}
      <Dialog open={isRecurringTaskDialogOpen} onOpenChange={setIsRecurringTaskDialogOpen}>
        <DialogContent className="bg-gray-800 text-white border-gray-700">
          <DialogHeader>
            <DialogTitle>Add Recurring Task</DialogTitle>
            <DialogDescription className="text-gray-400">
              Enter the details for your new recurring task
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="recurringTaskTitle" className="text-right text-sm font-medium">
                Task Title
              </label>
              <Input
                type="text"
                id="recurringTaskTitle"
                value={newRecurringTaskTitle}
                onChange={(e) => setNewRecurringTaskTitle(e.target.value)}
                className="col-span-3 bg-gray-700 border-gray-600"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="recurringTaskFrequency" className="text-right text-sm font-medium">
                Frequency
              </label>
              <select
                id="recurringTaskFrequency"
                value={newRecurringTaskFrequency}
                onChange={(e) => setNewRecurringTaskFrequency(e.target.value as 'daily' | 'weekly' | 'monthly')}
                className="col-span-3 p-2 rounded-md bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="recurringTaskNextDue" className="text-right text-sm font-medium">
                Next Due
              </label>
              <Popover open={isRecurringTaskDatePickerOpen} onOpenChange={setIsRecurringTaskDatePickerOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={
                      "col-span-3 pl-3.5 font-normal bg-gray-700 border-gray-600 justify-start text-left" +
                      (newRecurringTaskNextDue ? " text-foreground" : " text-muted-foreground")
                    }
                  >
                    {newRecurringTaskNextDue ? (
                      format(newRecurringTaskNextDue, "yyyy-MM-dd")
                    ) : (
                      <span>Pick a date</span>
                    )}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-gray-800 border-gray-700" align="start">
                  <Calendar
                    mode="single"
                    selected={newRecurringTaskNextDue}
                    onSelect={setNewRecurringTaskNextDue}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="recurringTaskPriority" className="text-right text-sm font-medium">
                Priority
              </label>
              <select
                id="recurringTaskPriority"
                value={newRecurringTaskPriority}
                onChange={(e) => setNewRecurringTaskPriority(e.target.value as Task['priority'])}
                className="col-span-3 p-2 rounded-md bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => {
              setIsRecurringTaskDialogOpen(false);
              setNewRecurringTaskTitle('');
              setNewRecurringTaskFrequency('daily');
              setNewRecurringTaskNextDue(undefined);
              setNewRecurringTaskPriority('medium');
            }}>
              Cancel
            </Button>
            <Button type="submit" onClick={addRecurringTask} className="bg-purple-600 hover:bg-purple-700">
              Add Recurring Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Planner;

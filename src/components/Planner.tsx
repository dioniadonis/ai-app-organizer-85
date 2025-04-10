
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Calendar, Bell, Check, Flag, List, X, Clock, Edit, Trash2, CheckCircle2, Target, LayoutGrid, CalendarDays, Bookmark, Star, ChevronUp, ChevronDown, Clock3, AlertCircle, BrainCircuit, Tag, Timer, BarChart2, CalendarRange, DollarSign, MessageSquare, PencilRuler, ArrowUp, AlarmClock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { format, differenceInDays, isToday, isPast } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

// Define our task types and interfaces
interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate?: string;
  dueTime?: string;
  completed: boolean;
  notify: boolean;
  priority: 'low' | 'medium' | 'high';
  category: string;
  tags: string[];
}

interface Goal {
  id: string;
  title: string;
  targetDate?: string;
  progress: number;
  completedSteps: number;
  totalSteps: number;
  type: 'daily' | 'short' | 'long';
  steps: GoalStep[];
  linkedExpense?: ExpenseGoal;
}

interface GoalStep {
  id: string;
  description: string;
  completed: boolean;
}

interface ExpenseGoal {
  id: string;
  title: string;
  currentAmount: number;
  targetAmount: number;
  currency: string;
}

interface AIAssistantPrompt {
  taskPrompts: string[];
  goalPrompts: string[];
}

const Planner: React.FC = () => {
  // States for tasks and goals
  const [tasks, setTasks] = useState<Task[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [newTask, setNewTask] = useState<Partial<Task>>({
    priority: 'medium',
    category: 'personal',
    tags: []
  });
  const [newGoal, setNewGoal] = useState<Partial<Goal>>({
    steps: []
  });
  const [activeTab, setActiveTab] = useState('tasks');
  const [taskView, setTaskView] = useState<'list' | 'grid'>('list');
  const [goalView, setGoalView] = useState<'list' | 'grid'>('list');
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [newTag, setNewTag] = useState('');
  const [newStep, setNewStep] = useState('');
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [assistantInput, setAssistantInput] = useState('');
  const [assistantProcessing, setAssistantProcessing] = useState(false);
  const { toast } = useToast();
  
  // Categories and tags
  const categories = ['personal', 'work', 'health', 'finance', 'education', 'other'];
  
  // AI Assistant prompts
  const aiAssistantPrompts: AIAssistantPrompt = {
    taskPrompts: [
      "Schedule a meeting with the team on Friday at 2pm",
      "Add a high priority task to finish the presentation by tomorrow",
      "Create a health task to exercise for 30 minutes daily",
      "Plan my weekly grocery shopping for Sunday morning"
    ],
    goalPrompts: [
      "Create a financial goal to save $5000 by end of year",
      "Set a daily goal to read for 30 minutes",
      "Start a long-term goal to learn Spanish with 20 lessons",
      "Add a health goal to lose 10 pounds in 3 months"
    ]
  };
  
  // Helper to get current date in YYYY-MM-DD format for the date input
  const getCurrentDate = () => {
    const today = new Date();
    return format(today, 'yyyy-MM-dd');
  };

  // Helper to get current time in HH:MM format
  const getCurrentTime = () => {
    const now = new Date();
    return format(now, 'HH:mm');
  };

  // Calculate days remaining
  const getDaysRemaining = (targetDate?: string) => {
    if (!targetDate) return null;
    
    const today = new Date();
    const target = new Date(targetDate);
    const days = differenceInDays(target, today);
    
    if (days < 0) {
      return `Overdue by ${Math.abs(days)} days`;
    } else if (days === 0) {
      return 'Due today';
    } else {
      return `${days} days remaining`;
    }
  };

  // Reset forms
  const resetTaskForm = () => {
    setNewTask({
      priority: 'medium',
      category: 'personal',
      tags: []
    });
  };
  
  const resetGoalForm = () => {
    setNewGoal({
      steps: []
    });
  };

  // Add a new task
  const addTask = () => {
    if (!newTask.title) return;
    
    const task: Task = {
      id: Date.now().toString(),
      title: newTask.title || '',
      description: newTask.description,
      dueDate: newTask.dueDate,
      dueTime: newTask.dueTime,
      completed: false,
      notify: Boolean(newTask.notify),
      priority: newTask.priority as 'low' | 'medium' | 'high' || 'medium',
      category: newTask.category || 'personal',
      tags: newTask.tags || [],
    };
    
    setTasks([...tasks, task]);
    resetTaskForm();
    
    if (task.notify) {
      toast({
        title: "Notification Set",
        description: `You'll be notified about: ${task.title}`,
      });
    } else {
      toast({
        title: "Task Added",
        description: `${task.title} has been added to your tasks`,
      });
    }
  };

  // Add a new goal
  const addGoal = () => {
    if (!newGoal.title || !newGoal.type) return;
    
    const goal: Goal = {
      id: Date.now().toString(),
      title: newGoal.title || '',
      targetDate: newGoal.targetDate,
      progress: 0,
      completedSteps: 0,
      totalSteps: newGoal.totalSteps || 1,
      type: newGoal.type as 'daily' | 'short' | 'long',
      steps: newGoal.steps || [],
      linkedExpense: newGoal.linkedExpense,
    };
    
    setGoals([...goals, goal]);
    resetGoalForm();
    
    toast({
      title: "Goal Created",
      description: `New ${goal.type} term goal added successfully!`,
    });
  };

  // Toggle task completion
  const toggleTaskCompletion = (id: string) => {
    setTasks(tasks.map(task => {
      if (task.id === id) {
        const updatedTask = { ...task, completed: !task.completed };
        
        if (updatedTask.completed) {
          toast({
            title: "Task Completed",
            description: "Great job completing your task!",
            variant: "default",
          });
        }
        
        return updatedTask;
      }
      return task;
    }));
  };

  // Update goal progress
  const updateGoalProgress = (id: string, steps: number) => {
    setGoals(goals.map(goal => {
      if (goal.id === id) {
        const completedSteps = Math.min(Math.max(0, steps), goal.totalSteps);
        const progress = (completedSteps / goal.totalSteps) * 100;
        
        if (completedSteps === goal.totalSteps && goal.progress < 100) {
          toast({
            title: "Goal Achieved!",
            description: "Congratulations on achieving your goal!",
            variant: "default",
          });
        }
        
        return {
          ...goal,
          completedSteps,
          progress
        };
      }
      return goal;
    }));
  };

  // Toggle goal step completion
  const toggleGoalStep = (goalId: string, stepId: string) => {
    setGoals(goals.map(goal => {
      if (goal.id === goalId) {
        const updatedSteps = goal.steps.map(step => 
          step.id === stepId ? { ...step, completed: !step.completed } : step
        );
        
        const completedStepsCount = updatedSteps.filter(step => step.completed).length;
        const progress = updatedSteps.length > 0 
          ? (completedStepsCount / updatedSteps.length) * 100
          : 0;
        
        return {
          ...goal,
          steps: updatedSteps,
          completedSteps: completedStepsCount,
          progress: progress
        };
      }
      return goal;
    }));
  };

  // Delete a task
  const deleteTask = (id: string) => {
    setTasks(tasks.filter(task => task.id !== id));
    toast({
      title: "Task Deleted",
      description: "Task has been removed",
    });
  };

  // Delete a goal
  const deleteGoal = (id: string) => {
    setGoals(goals.filter(goal => goal.id !== id));
    toast({
      title: "Goal Deleted",
      description: "Goal has been removed",
    });
  };

  // Edit task
  const saveTaskEdit = () => {
    if (editingTask) {
      setTasks(tasks.map(task => 
        task.id === editingTask.id ? editingTask : task
      ));
      setEditingTask(null);
      toast({
        title: "Task Updated",
        description: "Your changes have been saved"
      });
    }
  };

  // Edit goal
  const saveGoalEdit = () => {
    if (editingGoal) {
      setGoals(goals.map(goal => 
        goal.id === editingGoal.id ? editingGoal : goal
      ));
      setEditingGoal(null);
      toast({
        title: "Goal Updated",
        description: "Your changes have been saved"
      });
    }
  };

  // Add tag to new task
  const addTagToNewTask = () => {
    if (!newTag.trim()) return;
    setNewTask({
      ...newTask,
      tags: [...(newTask.tags || []), newTag.trim()]
    });
    setNewTag('');
  };

  // Remove tag from new task
  const removeTagFromNewTask = (tagToRemove: string) => {
    setNewTask({
      ...newTask,
      tags: (newTask.tags || []).filter(tag => tag !== tagToRemove)
    });
  };

  // Add step to new goal
  const addStepToNewGoal = () => {
    if (!newStep.trim()) return;
    const step: GoalStep = {
      id: Date.now().toString(),
      description: newStep.trim(),
      completed: false
    };
    setNewGoal({
      ...newGoal,
      steps: [...(newGoal.steps || []), step]
    });
    setNewStep('');
  };

  // Remove step from new goal
  const removeStepFromNewGoal = (stepId: string) => {
    setNewGoal({
      ...newGoal,
      steps: (newGoal.steps || []).filter(step => step.id !== stepId)
    });
  };

  // AI Assistant processing
  const processAIAssistant = () => {
    if (!assistantInput.trim()) return;
    
    setAssistantProcessing(true);
    
    // Simulate AI processing
    setTimeout(() => {
      // This is a simple simulation of AI assistant
      // In a real app, this would be connected to an AI service
      const input = assistantInput.toLowerCase();
      
      if (input.includes('task') || input.includes('schedule') || input.includes('to-do')) {
        // Create a task
        const newTaskFromAI: Task = {
          id: Date.now().toString(),
          title: assistantInput,
          description: "Created by AI Assistant",
          dueDate: getCurrentDate(),
          dueTime: getCurrentTime(),
          completed: false,
          notify: true,
          priority: 'medium',
          category: 'personal',
          tags: ['ai-generated']
        };
        
        setTasks([...tasks, newTaskFromAI]);
        toast({
          title: "AI Assistant",
          description: "Created a new task for you"
        });
      } else if (input.includes('goal') || input.includes('target') || input.includes('achieve')) {
        // Create a goal
        const newGoalFromAI: Goal = {
          id: Date.now().toString(),
          title: assistantInput,
          targetDate: getCurrentDate(),
          progress: 0,
          completedSteps: 0,
          totalSteps: 3,
          type: 'short',
          steps: [
            {
              id: 'step1',
              description: "First step toward your goal",
              completed: false
            },
            {
              id: 'step2',
              description: "Continue making progress",
              completed: false
            },
            {
              id: 'step3',
              description: "Final step to complete your goal",
              completed: false
            }
          ]
        };
        
        setGoals([...goals, newGoalFromAI]);
        toast({
          title: "AI Assistant",
          description: "Created a new goal for you"
        });
      } else {
        toast({
          title: "AI Assistant",
          description: "I'm not sure how to help with that. Try asking about tasks or goals.",
          variant: "destructive"
        });
      }
      
      setAssistantProcessing(false);
      setAssistantInput('');
      setAssistantOpen(false);
    }, 1500);
  };

  // Priority color mapping
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500/20 text-red-400';
      case 'medium': return 'bg-amber-500/20 text-amber-400';
      case 'low': return 'bg-green-500/20 text-green-400';
      default: return 'bg-blue-500/20 text-blue-400';
    }
  };

  // Get priority icon
  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <ArrowUp className="w-3 h-3" />;
      case 'medium': return <ChevronUp className="w-3 h-3" />;
      case 'low': return <ChevronDown className="w-3 h-3" />;
      default: return null;
    }
  };

  // Format goal type for display
  const formatGoalType = (type: 'daily' | 'short' | 'long') => {
    switch (type) {
      case 'daily': return 'Daily Goal';
      case 'short': return 'Short-term Goal';
      case 'long': return 'Long-term Goal';
      default: return 'Goal';
    }
  };

  // Get goal type icon
  const getGoalTypeIcon = (type: 'daily' | 'short' | 'long') => {
    switch (type) {
      case 'daily': return <CalendarDays className="w-4 h-4" />;
      case 'short': return <Bookmark className="w-4 h-4" />;
      case 'long': return <Target className="w-4 h-4" />;
      default: return <Flag className="w-4 h-4" />;
    }
  };

  // Get color class based on progress
  const getProgressColorClass = (progress: number) => {
    if (progress < 25) return "from-red-500 to-red-400";
    if (progress < 50) return "from-yellow-500 to-orange-400";
    if (progress < 75) return "from-blue-500 to-indigo-400";
    return "from-green-500 to-emerald-400";
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 5 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        type: "spring", 
        stiffness: 100,
        damping: 15
      }
    }
  };

  return (
    <div className="py-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex justify-between items-center mb-4">
          <TabsList className="justify-start bg-transparent">
            <TabsTrigger value="tasks" className="flex items-center gap-1 data-[state=active]:bg-purple-500/20">
              <List className="w-4 h-4" />
              Tasks
            </TabsTrigger>
            <TabsTrigger value="goals" className="flex items-center gap-1 data-[state=active]:bg-purple-500/20">
              <Flag className="w-4 h-4" />
              Goals
            </TabsTrigger>
          </TabsList>
          
          <div className="flex items-center">
            {activeTab === 'tasks' && (
              <div className="flex gap-2 mr-3">
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className={`px-2 ${taskView === 'list' ? 'bg-gray-800/70' : ''}`} 
                  onClick={() => setTaskView('list')}
                >
                  <List className="w-4 h-4" />
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className={`px-2 ${taskView === 'grid' ? 'bg-gray-800/70' : ''}`} 
                  onClick={() => setTaskView('grid')}
                >
                  <LayoutGrid className="w-4 h-4" />
                </Button>
              </div>
            )}
            
            {activeTab === 'goals' && (
              <div className="flex gap-2 mr-3">
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className={`px-2 ${goalView === 'list' ? 'bg-gray-800/70' : ''}`} 
                  onClick={() => setGoalView('list')}
                >
                  <List className="w-4 h-4" />
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className={`px-2 ${goalView === 'grid' ? 'bg-gray-800/70' : ''}`} 
                  onClick={() => setGoalView('grid')}
                >
                  <LayoutGrid className="w-4 h-4" />
                </Button>
              </div>
            )}
            
            <Dialog open={assistantOpen} onOpenChange={setAssistantOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 bg-purple-500/20 border-purple-500/30 hover:bg-purple-500/30">
                  <BrainCircuit className="w-4 h-4" />
                  <span className="hidden sm:inline">AI Assistant</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <BrainCircuit className="w-5 h-5 text-purple-400" />
                    AI Planning Assistant
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-2">
                  <Textarea 
                    placeholder="Describe a task or goal you want to add..."
                    value={assistantInput}
                    onChange={(e) => setAssistantInput(e.target.value)}
                    className="min-h-[120px]"
                  />
                  
                  <div className="text-sm text-gray-400">
                    <p className="mb-2 font-medium">Try saying something like:</p>
                    <div className="grid grid-cols-1 gap-2">
                      {activeTab === 'tasks' 
                        ? aiAssistantPrompts.taskPrompts.map((prompt, idx) => (
                            <Button 
                              key={idx} 
                              variant="ghost" 
                              className="justify-start h-auto py-1.5 text-left text-xs"
                              onClick={() => setAssistantInput(prompt)}
                            >
                              "{prompt}"
                            </Button>
                          ))
                        : aiAssistantPrompts.goalPrompts.map((prompt, idx) => (
                            <Button 
                              key={idx} 
                              variant="ghost" 
                              className="justify-start h-auto py-1.5 text-left text-xs"
                              onClick={() => setAssistantInput(prompt)}
                            >
                              "{prompt}"
                            </Button>
                          ))
                      }
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DialogClose>
                  <Button 
                    onClick={processAIAssistant} 
                    disabled={!assistantInput.trim() || assistantProcessing}
                    className="gap-2"
                  >
                    {assistantProcessing ? (
                      <>Processing...</>
                    ) : (
                      <>
                        <MessageSquare className="w-4 h-4" />
                        Create with AI
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        {/* Tasks Tab */}
        <TabsContent value="tasks" className="animate-fade-in">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-1 bg-gray-800/30 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5 text-purple-400" />
                  New Task
                </CardTitle>
                <CardDescription>Plan and organize your activities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="task-title">Task Title</Label>
                    <Input 
                      id="task-title"
                      placeholder="Enter task title" 
                      value={newTask.title || ''}
                      onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                      className="bg-gray-800/50 border-gray-700"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="task-description">Description (Optional)</Label>
                    <Textarea 
                      id="task-description"
                      placeholder="Enter description" 
                      value={newTask.description || ''}
                      onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                      className="bg-gray-800/50 border-gray-700 min-h-[80px]"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="task-due-date">Due Date</Label>
                      <Input 
                        id="task-due-date"
                        type="date" 
                        value={newTask.dueDate || ''}
                        onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
                        className="bg-gray-800/50 border-gray-700"
                        min={getCurrentDate()}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="task-due-time">Due Time</Label>
                      <Input 
                        id="task-due-time"
                        type="time" 
                        value={newTask.dueTime || ''}
                        onChange={(e) => setNewTask({...newTask, dueTime: e.target.value})}
                        className="bg-gray-800/50 border-gray-700"
                      />
                    </div>
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="task-priority">Priority</Label>
                    <Select
                      value={newTask.priority as string || 'medium'}
                      onValueChange={(value) => setNewTask({...newTask, priority: value as 'low' | 'medium' | 'high'})}
                    >
                      <SelectTrigger id="task-priority" className="bg-gray-800/50 border-gray-700">
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="task-category">Category</Label>
                    <Select
                      value={newTask.category || 'personal'}
                      onValueChange={(value) => setNewTask({...newTask, category: value})}
                    >
                      <SelectTrigger id="task-category" className="bg-gray-800/50 border-gray-700">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(category => (
                          <SelectItem key={category} value={category}>
                            {category.charAt(0).toUpperCase() + category.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid gap-2">
                    <Label>Tags</Label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {(newTask.tags || []).map(tag => (
                        <Badge key={tag} variant="secondary" className="flex items-center gap-1 px-2 py-1">
                          {tag}
                          <button 
                            onClick={() => removeTagFromNewTask(tag)}
                            className="text-gray-400 hover:text-gray-200"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add a tag"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        className="bg-gray-800/50 border-gray-700"
                        onKeyDown={(e) => e.key === 'Enter' && addTagToNewTask()}
                      />
                      <Button
                        type="button"
                        variant="secondary"
                        size="icon"
                        onClick={addTagToNewTask}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="task-notify"
                      checked={Boolean(newTask.notify)}
                      onCheckedChange={(checked) => setNewTask({...newTask, notify: checked})}
                    />
                    <Label htmlFor="task-notify">Enable notifications</Label>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={addTask} className="w-full bg-purple-600 hover:bg-purple-700">
                  <Plus className="w-4 h-4 mr-2" /> Add Task
                </Button>
              </CardFooter>
            </Card>
            
            {/* Task List */}
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="lg:col-span-2"
            >
              <div className="bg-gray-800/30 rounded-lg border border-gray-700 p-4">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-purple-400" />
                  Your Tasks
                </h3>
                
                <ScrollArea className="h-[500px] pr-4">
                  {tasks.length === 0 ? (
                    <div className="text-center text-gray-400 py-8">
                      <Calendar className="w-12 h-12 mx-auto mb-2 opacity-30" />
                      <p>No tasks yet. Add some tasks to get started!</p>
                    </div>
                  ) : taskView === 'list' ? (
                    <AnimatePresence>
                      {tasks.map((task) => (
                        <motion.div 
                          key={task.id}
                          variants={itemVariants}
                          className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 mb-3 rounded-lg border ${
                            task.completed ? 'bg-green-500/10 border-green-500/30' : 'bg-gray-800/50 border-gray-700'
                          }`}
                          layoutId={task.id}
                        >
                          <div className="flex items-start gap-3 mb-3 sm:mb-0">
                            <Button
                              size="icon"
                              variant={task.completed ? "default" : "outline"}
                              className={`h-6 w-6 rounded-full flex-shrink-0 ${
                                task.completed ? 'bg-green-500 hover:bg-green-600 border-0' : 'border-gray-600'
                              }`}
                              onClick={() => toggleTaskCompletion(task.id)}
                            >
                              {task.completed && <Check className="h-3 w-3" />}
                            </Button>
                            <div className={`${task.completed ? 'line-through text-gray-400' : ''}`}>
                              <p className="font-medium">{task.title}</p>
                              {task.description && (
                                <p className="text-sm text-gray-400 mt-1">{task.description}</p>
                              )}
                              <div className="flex flex-wrap gap-2 mt-2">
                                <Badge variant="outline" className={`text-xs ${getPriorityColor(task.priority)} flex items-center gap-1`}>
                                  {getPriorityIcon(task.priority)}
                                  {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                                </Badge>
                                
                                {task.category && (
                                  <Badge variant="outline" className="text-xs bg-blue-500/10 text-blue-400">
                                    {task.category.charAt(0).toUpperCase() + task.category.slice(1)}
                                  </Badge>
                                )}
                                
                                {task.tags && task.tags.map(tag => (
                                  <Badge key={tag} variant="outline" className="text-xs bg-purple-500/10 text-purple-400">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 ml-9 sm:ml-0">
                            {task.dueDate && (
                              <span className="text-xs bg-gray-700/70 px-2 py-1 rounded-full flex items-center">
                                <Calendar className="w-3 h-3 mr-1" />
                                {task.dueDate}
                              </span>
                            )}
                            {task.dueTime && (
                              <span className="text-xs bg-gray-700/70 px-2 py-1 rounded-full flex items-center">
                                <Clock className="w-3 h-3 mr-1" />
                                {task.dueTime}
                              </span>
                            )}
                            {task.notify && (
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full bg-purple-500/20 hover:bg-purple-500/30">
                                    <Bell className="w-3 h-3 text-purple-400" />
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-60">
                                  <div className="space-y-2">
                                    <h4 className="font-medium">Notification settings</h4>
                                    <div className="space-y-1">
                                      <div className="flex items-center justify-between">
                                        <Label htmlFor={`notify-before-${task.id}`}>Notify before due</Label>
                                        <Switch id={`notify-before-${task.id}`} defaultChecked={true} />
                                      </div>
                                      <div className="flex items-center justify-between">
                                        <Label htmlFor={`notify-on-${task.id}`}>Notify on due</Label>
                                        <Switch id={`notify-on-${task.id}`} defaultChecked={true} />
                                      </div>
                                    </div>
                                  </div>
                                </PopoverContent>
                              </Popover>
                            )}
                            
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-7 w-7 text-gray-400 hover:text-gray-200"
                                >
                                  <Edit className="h-3.5 w-3.5" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Edit Task</DialogTitle>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                  <div className="grid gap-2">
                                    <Label htmlFor="edit-title">Title</Label>
                                    <Input
                                      id="edit-title"
                                      value={editingTask?.title || task.title}
                                      onChange={(e) => setEditingTask({...task, title: e.target.value})}
                                      className="bg-gray-800/50 border-gray-700"
                                    />
                                  </div>
                                  <div className="grid gap-2">
                                    <Label htmlFor="edit-description">Description</Label>
                                    <Textarea
                                      id="edit-description"
                                      value={editingTask?.description || task.description || ''}
                                      onChange={(e) => setEditingTask({...task, description: e.target.value})}
                                      className="bg-gray-800/50 border-gray-700"
                                    />
                                  </div>
                                  <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                      <Label htmlFor="edit-date">Due Date</Label>
                                      <Input
                                        id="edit-date"
                                        type="date"
                                        value={editingTask?.dueDate || task.dueDate || ''}
                                        onChange={(e) => setEditingTask({...task, dueDate: e.target.value})}
                                        className="bg-gray-800/50 border-gray-700"
                                      />
                                    </div>
                                    <div className="grid gap-2">
                                      <Label htmlFor="edit-time">Due Time</Label>
                                      <Input
                                        id="edit-time"
                                        type="time"
                                        value={editingTask?.dueTime || task.dueTime || ''}
                                        onChange={(e) => setEditingTask({...task, dueTime: e.target.value})}
                                        className="bg-gray-800/50 border-gray-700"
                                      />
                                    </div>
                                  </div>
                                </div>
                                <DialogFooter>
                                  <Button 
                                    variant="outline" 
                                    onClick={() => setEditingTask(null)}
                                  >
                                    Cancel
                                  </Button>
                                  <Button onClick={saveTaskEdit}>Save Changes</Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                            
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7 text-red-400 hover:text-red-300 hover:bg-red-500/20"
                              onClick={() => deleteTask(task.id)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <AnimatePresence>
                        {tasks.map((task) => (
                          <motion.div 
                            key={task.id}
                            variants={itemVariants}
                            layoutId={`grid-${task.id}`}
                            className={`p-4 rounded-lg border ${
                              task.completed ? 'bg-green-500/10 border-green-500/30' : 'bg-gray-800/50 border-gray-700'
                            }`}
                          >
                            <div className="flex justify-between items-start mb-3">
                              <h4 className={`font-medium ${task.completed ? 'line-through text-gray-400' : ''}`}>
                                {task.title}
                              </h4>
                              <Button
                                size="icon"
                                variant={task.completed ? "default" : "outline"}
                                className={`h-6 w-6 rounded-full flex-shrink-0 ${
                                  task.completed ? 'bg-green-500 hover:bg-green-600 border-0' : 'border-gray-600'
                                }`}
                                onClick={() => toggleTaskCompletion(task.id)}
                              >
                                {task.completed && <Check className="h-3 w-3" />}
                              </Button>
                            </div>
                            
                            {task.description && (
                              <p className={`text-sm mb-3 ${task.completed ? 'text-gray-500' : 'text-gray-400'}`}>
                                {task.description}
                              </p>
                            )}
                            
                            <div className="flex flex-wrap gap-1.5 mb-3">
                              <Badge variant="outline" className={`text-xs ${getPriorityColor(task.priority)} flex items-center gap-1`}>
                                {getPriorityIcon(task.priority)}
                                {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                              </Badge>
                              
                              {task.category && (
                                <Badge variant="outline" className="text-xs bg-blue-500/10 text-blue-400">
                                  {task.category.charAt(0).toUpperCase() + task.category.slice(1)}
                                </Badge>
                              )}
                            </div>
                            
                            {task.tags && task.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 mb-3">
                                {task.tags.map(tag => (
                                  <Badge key={tag} variant="outline" className="text-xs bg-purple-500/10 text-purple-400">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            )}
                            
                            <div className="flex items-center justify-between mt-2">
                              <div className="flex gap-2">
                                {task.dueDate && (
                                  <span className="text-xs bg-gray-700/70 px-2 py-1 rounded-full flex items-center">
                                    <Calendar className="w-3 h-3 mr-1" />
                                    {task.dueDate}
                                  </span>
                                )}
                                {task.dueTime && (
                                  <span className="text-xs bg-gray-700/70 px-2 py-1 rounded-full flex items-center">
                                    <Clock className="w-3 h-3 mr-1" />
                                    {task.dueTime}
                                  </span>
                                )}
                                {task.notify && (
                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full bg-purple-500/20 hover:bg-purple-500/30">
                                        <Bell className="w-3 h-3 text-purple-400" />
                                      </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-60">
                                      <div className="space-y-2">
                                        <h4 className="font-medium">Notification settings</h4>
                                        <div className="space-y-1">
                                          <div className="flex items-center justify-between">
                                            <Label htmlFor={`grid-notify-before-${task.id}`}>Notify before due</Label>
                                            <Switch id={`grid-notify-before-${task.id}`} defaultChecked={true} />
                                          </div>
                                          <div className="flex items-center justify-between">
                                            <Label htmlFor={`grid-notify-on-${task.id}`}>Notify on due</Label>
                                            <Switch id={`grid-notify-on-${task.id}`} defaultChecked={true} />
                                          </div>
                                        </div>
                                      </div>
                                    </PopoverContent>
                                  </Popover>
                                )}
                              </div>
                              <div className="flex gap-1">
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      className="h-7 w-7 text-gray-400 hover:text-gray-200"
                                    >
                                      <Edit className="h-3.5 w-3.5" />
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>Edit Task</DialogTitle>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-4">
                                      <div className="grid gap-2">
                                        <Label htmlFor={`grid-edit-title-${task.id}`}>Title</Label>
                                        <Input
                                          id={`grid-edit-title-${task.id}`}
                                          value={editingTask?.title || task.title}
                                          onChange={(e) => setEditingTask({...task, title: e.target.value})}
                                          className="bg-gray-800/50 border-gray-700"
                                        />
                                      </div>
                                      <div className="grid gap-2">
                                        <Label htmlFor={`grid-edit-description-${task.id}`}>Description</Label>
                                        <Textarea
                                          id={`grid-edit-description-${task.id}`}
                                          value={editingTask?.description || task.description || ''}
                                          onChange={(e) => setEditingTask({...task, description: e.target.value})}
                                          className="bg-gray-800/50 border-gray-700"
                                        />
                                      </div>
                                      <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                          <Label htmlFor={`grid-edit-date-${task.id}`}>Due Date</Label>
                                          <Input
                                            id={`grid-edit-date-${task.id}`}
                                            type="date"
                                            value={editingTask?.dueDate || task.dueDate || ''}
                                            onChange={(e) => setEditingTask({...task, dueDate: e.target.value})}
                                            className="bg-gray-800/50 border-gray-700"
                                          />
                                        </div>
                                        <div className="grid gap-2">
                                          <Label htmlFor={`grid-edit-time-${task.id}`}>Due Time</Label>
                                          <Input
                                            id={`grid-edit-time-${task.id}`}
                                            type="time"
                                            value={editingTask?.dueTime || task.dueTime || ''}
                                            onChange={(e) => setEditingTask({...task, dueTime: e.target.value})}
                                            className="bg-gray-800/50 border-gray-700"
                                          />
                                        </div>
                                      </div>
                                    </div>
                                    <DialogFooter>
                                      <Button 
                                        variant="outline" 
                                        onClick={() => setEditingTask(null)}
                                      >
                                        Cancel
                                      </Button>
                                      <Button onClick={saveTaskEdit}>Save Changes</Button>
                                    </DialogFooter>
                                  </DialogContent>
                                </Dialog>
                                
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-7 w-7 text-red-400 hover:text-red-300 hover:bg-red-500/20"
                                  onClick={() => deleteTask(task.id)}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  )}
                </ScrollArea>
              </div>
            </motion.div>
          </div>
        </TabsContent>
        
        {/* Goals Tab */}
        <TabsContent value="goals" className="animate-fade-in">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-1 bg-gray-800/30 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-amber-400" />
                  New Goal
                </CardTitle>
                <CardDescription>Track progress towards your objectives</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="goal-title">Goal Title</Label>
                    <Input 
                      id="goal-title"
                      placeholder="Enter goal title" 
                      value={newGoal.title || ''}
                      onChange={(e) => setNewGoal({...newGoal, title: e.target.value})}
                      className="bg-gray-800/50 border-gray-700"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="goal-type">Goal Type</Label>
                    <Select
                      value={newGoal.type || ''}
                      onValueChange={(value) => setNewGoal({...newGoal, type: value as 'daily' | 'short' | 'long'})}
                    >
                      <SelectTrigger id="goal-type" className="bg-gray-800/50 border-gray-700">
                        <SelectValue placeholder="Select a type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily Goal</SelectItem>
                        <SelectItem value="short">Short-term Goal</SelectItem>
                        <SelectItem value="long">Long-term Goal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="goal-steps">Define Steps</Label>
                    <div className="space-y-2 mb-2">
                      {(newGoal.steps || []).map(step => (
                        <div key={step.id} className="flex items-center justify-between bg-gray-800/50 rounded-md p-2">
                          <span className="text-sm">{step.description}</span>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6 text-gray-400 hover:text-white"
                            onClick={() => removeStepFromNewGoal(step.id)}
                          >
                            <X className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add a step"
                        value={newStep}
                        onChange={(e) => setNewStep(e.target.value)}
                        className="bg-gray-800/50 border-gray-700"
                        onKeyDown={(e) => e.key === 'Enter' && addStepToNewGoal()}
                      />
                      <Button
                        type="button"
                        variant="secondary"
                        size="icon"
                        onClick={addStepToNewGoal}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="goal-target-date">Target Date</Label>
                    <Input 
                      id="goal-target-date"
                      type="date" 
                      value={newGoal.targetDate || ''}
                      onChange={(e) => setNewGoal({...newGoal, targetDate: e.target.value})}
                      className="bg-gray-800/50 border-gray-700"
                      min={getCurrentDate()}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Link to Expense Goal (Optional)</Label>
                    <div className="flex items-center gap-2">
                      <Switch
                        id="link-expense"
                        checked={Boolean(newGoal.linkedExpense)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setNewGoal({
                              ...newGoal,
                              linkedExpense: {
                                id: Date.now().toString(),
                                title: newGoal.title || 'Expense Goal',
                                currentAmount: 0,
                                targetAmount: 1000,
                                currency: 'USD'
                              }
                            });
                          } else {
                            setNewGoal({
                              ...newGoal,
                              linkedExpense: undefined
                            });
                          }
                        }}
                      />
                      <Label htmlFor="link-expense">Create expense tracking for this goal</Label>
                    </div>
                    
                    {newGoal.linkedExpense && (
                      <div className="mt-2 space-y-3 p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                        <div className="grid gap-2">
                          <Label htmlFor="expense-target">Target Amount</Label>
                          <div className="flex">
                            <Select
                              value={newGoal.linkedExpense.currency}
                              onValueChange={(value) => setNewGoal({
                                ...newGoal,
                                linkedExpense: { ...newGoal.linkedExpense!, currency: value }
                              })}
                            >
                              <SelectTrigger className="w-20 bg-gray-700/50 border-gray-600 rounded-r-none">
                                <SelectValue placeholder="$" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="USD">USD</SelectItem>
                                <SelectItem value="EUR">EUR</SelectItem>
                                <SelectItem value="GBP">GBP</SelectItem>
                              </SelectContent>
                            </Select>
                            <Input
                              id="expense-target"
                              type="number"
                              placeholder="1000"
                              className="bg-gray-700/50 border-gray-600 rounded-l-none"
                              value={newGoal.linkedExpense.targetAmount || ''}
                              onChange={(e) => setNewGoal({
                                ...newGoal,
                                linkedExpense: { ...newGoal.linkedExpense!, targetAmount: Number(e.target.value) }
                              })}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={addGoal} className="w-full bg-amber-600 hover:bg-amber-700">
                  <Plus className="w-4 h-4 mr-2" /> Create Goal
                </Button>
              </CardFooter>
            </Card>
            
            {/* Goals List */}
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="lg:col-span-2"
            >
              <div className="bg-gray-800/30 rounded-lg border border-gray-700 p-4">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Target className="w-5 h-5 text-amber-400" />
                  Your Goals
                </h3>
                
                <ScrollArea className="h-[500px] pr-4">
                  {goals.length === 0 ? (
                    <div className="text-center text-gray-400 py-8">
                      <Flag className="w-12 h-12 mx-auto mb-2 opacity-30" />
                      <p>No goals yet. Create some goals to track your progress!</p>
                    </div>
                  ) : goalView === 'list' ? (
                    <AnimatePresence>
                      {goals.map((goal) => (
                        <motion.div 
                          key={goal.id}
                          variants={itemVariants}
                          layoutId={goal.id}
                          className="p-4 mb-3 rounded-lg border border-gray-700 bg-gray-800/50"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="font-semibold">{goal.title}</h4>
                              <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full flex items-center gap-1 w-fit mt-1">
                                {getGoalTypeIcon(goal.type)}
                                {formatGoalType(goal.type)}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-7 w-7 text-gray-400 hover:text-gray-200"
                                  >
                                    <Edit className="h-3.5 w-3.5" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Edit Goal</DialogTitle>
                                  </DialogHeader>
                                  <div className="grid gap-4 py-4">
                                    <div className="grid gap-2">
                                      <Label htmlFor={`edit-goal-title-${goal.id}`}>Title</Label>
                                      <Input
                                        id={`edit-goal-title-${goal.id}`}
                                        value={editingGoal?.title || goal.title}
                                        onChange={(e) => setEditingGoal({...goal, title: e.target.value})}
                                        className="bg-gray-800/50 border-gray-700"
                                      />
                                    </div>
                                    <div className="grid gap-2">
                                      <Label htmlFor={`edit-goal-date-${goal.id}`}>Target Date</Label>
                                      <Input
                                        id={`edit-goal-date-${goal.id}`}
                                        type="date"
                                        value={editingGoal?.targetDate || goal.targetDate || ''}
                                        onChange={(e) => setEditingGoal({...goal, targetDate: e.target.value})}
                                        className="bg-gray-800/50 border-gray-700"
                                      />
                                    </div>
                                  </div>
                                  <DialogFooter>
                                    <Button 
                                      variant="outline" 
                                      onClick={() => setEditingGoal(null)}
                                    >
                                      Cancel
                                    </Button>
                                    <Button onClick={saveGoalEdit}>Save Changes</Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                              
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7 text-red-400 hover:text-red-300 hover:bg-red-500/20"
                                onClick={() => deleteGoal(goal.id)}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between my-2">
                            {goal.targetDate && (
                              <div className="flex items-center gap-1 text-xs text-gray-300">
                                <CalendarRange className="w-3.5 h-3.5 text-amber-400" />
                                <span>Due: {goal.targetDate}</span>
                                {getDaysRemaining(goal.targetDate) && (
                                  <Badge variant="outline" className={
                                    `ml-1 ${isPast(new Date(goal.targetDate)) && !isToday(new Date(goal.targetDate)) 
                                      ? 'bg-red-500/20 text-red-400' 
                                      : isToday(new Date(goal.targetDate)) 
                                        ? 'bg-amber-500/20 text-amber-400' 
                                        : 'bg-blue-500/20 text-blue-400'}`
                                  }>
                                    {getDaysRemaining(goal.targetDate)}
                                  </Badge>
                                )}
                              </div>
                            )}
                            
                            {goal.linkedExpense && (
                              <Badge variant="outline" className="bg-green-500/20 text-green-400 flex items-center gap-1">
                                <DollarSign className="w-3 h-3" />
                                {goal.linkedExpense.currency} 
                                {goal.linkedExpense.currentAmount} / {goal.linkedExpense.targetAmount}
                              </Badge>
                            )}
                          </div>
                          
                          <div className="mb-3">
                            <div className="flex justify-between text-xs mb-1">
                              <span>Progress</span>
                              <span>{Math.round(goal.progress)}%</span>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-2">
                              <div 
                                className={`bg-gradient-to-r ${getProgressColorClass(goal.progress)} h-2 rounded-full transition-all duration-500 ease-out`}
                                style={{ width: `${goal.progress}%` }}
                              ></div>
                            </div>
                          </div>
                          
                          {goal.steps && goal.steps.length > 0 && (
                            <div className="mt-3 space-y-1">
                              <Label className="text-xs text-gray-400">Steps:</Label>
                              {goal.steps.map(step => (
                                <div key={step.id} className="flex items-center gap-2 py-1">
                                  <Button
                                    size="icon"
                                    variant={step.completed ? "default" : "outline"}
                                    className={`h-5 w-5 rounded-full ${
                                      step.completed ? 'bg-green-500 hover:bg-green-600 border-0' : 'border-gray-600'
                                    }`}
                                    onClick={() => toggleGoalStep(goal.id, step.id)}
                                  >
                                    {step.completed && <Check className="h-2.5 w-2.5" />}
                                  </Button>
                                  <span className={`text-sm ${step.completed ? 'line-through text-gray-500' : ''}`}>
                                    {step.description}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                          
                          <div className="flex items-center justify-between mt-3">
                            <div className="text-sm">
                              <span>{goal.completedSteps}</span>
                              <span className="text-gray-400"> / {goal.totalSteps} steps</span>
                            </div>
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => updateGoalProgress(goal.id, Math.max(0, goal.completedSteps - 1))}
                                disabled={goal.completedSteps <= 0}
                                className="bg-transparent"
                              >
                                -
                              </Button>
                              <Button 
                                size="sm"
                                onClick={() => updateGoalProgress(goal.id, goal.completedSteps + 1)}
                                disabled={goal.completedSteps >= goal.totalSteps}
                                className={goal.progress === 100 ? "bg-green-600 hover:bg-green-700" : ""}
                              >
                                +
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <AnimatePresence>
                        {goals.map((goal) => (
                          <motion.div 
                            key={goal.id}
                            variants={itemVariants}
                            layoutId={`grid-${goal.id}`}
                            className="p-4 rounded-lg border border-gray-700 bg-gray-800/50"
                          >
                            <div className="flex justify-between items-start">
                              <div className="mb-2">
                                <h4 className="font-semibold mb-1">{goal.title}</h4>
                                <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full flex items-center gap-1 w-fit">
                                  {getGoalTypeIcon(goal.type)}
                                  {formatGoalType(goal.type)}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      className="h-7 w-7 text-gray-400 hover:text-gray-200"
                                    >
                                      <Edit className="h-3.5 w-3.5" />
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>Edit Goal</DialogTitle>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-4">
                                      <div className="grid gap-2">
                                        <Label htmlFor={`grid-edit-goal-title-${goal.id}`}>Title</Label>
                                        <Input
                                          id={`grid-edit-goal-title-${goal.id}`}
                                          value={editingGoal?.title || goal.title}
                                          onChange={(e) => setEditingGoal({...goal, title: e.target.value})}
                                          className="bg-gray-800/50 border-gray-700"
                                        />
                                      </div>
                                      <div className="grid gap-2">
                                        <Label htmlFor={`grid-edit-goal-date-${goal.id}`}>Target Date</Label>
                                        <Input
                                          id={`grid-edit-goal-date-${goal.id}`}
                                          type="date"
                                          value={editingGoal?.targetDate || goal.targetDate || ''}
                                          onChange={(e) => setEditingGoal({...goal, targetDate: e.target.value})}
                                          className="bg-gray-800/50 border-gray-700"
                                        />
                                      </div>
                                    </div>
                                    <DialogFooter>
                                      <Button 
                                        variant="outline" 
                                        onClick={() => setEditingGoal(null)}
                                      >
                                        Cancel
                                      </Button>
                                      <Button onClick={saveGoalEdit}>Save Changes</Button>
                                    </DialogFooter>
                                  </DialogContent>
                                </Dialog>
                                
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-7 w-7 text-red-400 hover:text-red-300 hover:bg-red-500/20"
                                  onClick={() => deleteGoal(goal.id)}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2 my-2 text-xs text-gray-300">
                              {goal.targetDate && (
                                <>
                                  <CalendarRange className="w-3.5 h-3.5 text-amber-400" />
                                  <span>{goal.targetDate}</span>
                                  <Badge variant="outline" className={
                                    `ml-1 ${isPast(new Date(goal.targetDate)) && !isToday(new Date(goal.targetDate)) 
                                      ? 'bg-red-500/20 text-red-400' 
                                      : isToday(new Date(goal.targetDate)) 
                                        ? 'bg-amber-500/20 text-amber-400' 
                                        : 'bg-blue-500/20 text-blue-400'}`
                                  }>
                                    {getDaysRemaining(goal.targetDate)}
                                  </Badge>
                                </>
                              )}
                            </div>
                            
                            {goal.linkedExpense && (
                              <div className="my-2">
                                <Badge variant="outline" className="bg-green-500/20 text-green-400 flex items-center gap-1">
                                  <DollarSign className="w-3 h-3" />
                                  {goal.linkedExpense.currency} 
                                  {goal.linkedExpense.currentAmount} / {goal.linkedExpense.targetAmount}
                                </Badge>
                              </div>
                            )}
                            
                            <div className="mb-3">
                              <div className="flex justify-between text-xs mb-1">
                                <span>Progress</span>
                                <span>{Math.round(goal.progress)}%</span>
                              </div>
                              <div className="w-full bg-gray-700 rounded-full h-2">
                                <div 
                                  className={`bg-gradient-to-r ${getProgressColorClass(goal.progress)} h-2 rounded-full transition-all duration-500 ease-out`}
                                  style={{ width: `${goal.progress}%` }}
                                ></div>
                              </div>
                            </div>
                            
                            {goal.steps && goal.steps.length > 0 && (
                              <div className="mt-3 space-y-1">
                                <Label className="text-xs text-gray-400">Steps:</Label>
                                {goal.steps.map(step => (
                                  <div key={step.id} className="flex items-center gap-2 py-1">
                                    <Button
                                      size="icon"
                                      variant={step.completed ? "default" : "outline"}
                                      className={`h-5 w-5 rounded-full ${
                                        step.completed ? 'bg-green-500 hover:bg-green-600 border-0' : 'border-gray-600'
                                      }`}
                                      onClick={() => toggleGoalStep(goal.id, step.id)}
                                    >
                                      {step.completed && <Check className="h-2.5 w-2.5" />}
                                    </Button>
                                    <span className={`text-sm ${step.completed ? 'line-through text-gray-500' : ''}`}>
                                      {step.description}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                            
                            <div className="flex justify-between items-center mt-3">
                              <div className="text-xs">
                                <span>{goal.completedSteps}</span>
                                <span className="text-gray-400"> / {goal.totalSteps} steps</span>
                              </div>
                              <div className="flex gap-1">
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => updateGoalProgress(goal.id, Math.max(0, goal.completedSteps - 1))}
                                  disabled={goal.completedSteps <= 0}
                                  className="h-7 w-7 p-0 bg-transparent"
                                >
                                  <ChevronDown className="h-4 w-4" />
                                </Button>
                                <Button 
                                  size="sm"
                                  onClick={() => updateGoalProgress(goal.id, goal.completedSteps + 1)}
                                  disabled={goal.completedSteps >= goal.totalSteps}
                                  className={`h-7 w-7 p-0 ${goal.progress === 100 ? "bg-green-600 hover:bg-green-700" : ""}`}
                                >
                                  <ChevronUp className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  )}
                </ScrollArea>
              </div>
            </motion.div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Planner;

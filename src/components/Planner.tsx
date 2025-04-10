
import React, { useState, useEffect } from 'react';
import { format, isToday, isThisWeek, isThisMonth, addDays } from 'date-fns';
import { 
  CalendarCheck, 
  CalendarClock, 
  CalendarDays, 
  CheckSquare, 
  Circle, 
  Clock, 
  Edit3, 
  Flag, 
  MoreHorizontal, 
  Plus, 
  Search, 
  Target, 
  Trash2, 
  X 
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import { useIsMobile } from '@/hooks/use-mobile';

interface Task {
  id: number;
  title: string;
  description?: string;
  dueDate?: string;
  completed: boolean;
  notify?: boolean;
  notifyInterval?: 'daily' | 'weekly' | '3days' | 'custom';
  priority?: 'low' | 'medium' | 'high';
}

interface Goal {
  id: number;
  title: string;
  description?: string;
  targetDate?: string;
  progress: number;
  completedSteps: number;
  totalSteps: number;
  type: 'daily' | 'short' | 'long';
}

interface PlannerProps {
  activeTab?: string;
}

const Planner: React.FC<PlannerProps> = ({ activeTab = "tasks" }) => {
  const isMobile = useIsMobile();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [activeTabState, setActiveTabState] = useState(activeTab);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [isAddGoalOpen, setIsAddGoalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterTime, setFilterTime] = useState<string>('all');
  
  const [newTask, setNewTask] = useState<Partial<Task>>({
    title: '',
    description: '',
    dueDate: '',
    completed: false,
    notify: false,
    priority: 'medium',
  });

  const [newGoal, setNewGoal] = useState<Partial<Goal>>({
    title: '',
    description: '',
    targetDate: '',
    progress: 0,
    completedSteps: 0,
    totalSteps: 1,
    type: 'short',
  });

  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  
  // Load tasks and goals from localStorage
  useEffect(() => {
    const savedTasks = localStorage.getItem('tasks');
    const savedGoals = localStorage.getItem('goals');
    
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    } else {
      // Set some default tasks for demo
      const defaultTasks = [
        {
          id: 1,
          title: 'Complete the AI marketplace project',
          description: 'Finish building the AI marketplace dashboard with all features',
          dueDate: addDays(new Date(), 7).toISOString().split('T')[0],
          completed: false,
          notify: true,
          priority: 'high',
        } as Task,
        {
          id: 2,
          title: 'Research AI tools for content generation',
          dueDate: addDays(new Date(), 2).toISOString().split('T')[0],
          completed: true,
          priority: 'medium',
        } as Task,
        {
          id: 3,
          title: 'Review subscription costs',
          dueDate: addDays(new Date(), 14).toISOString().split('T')[0],
          completed: false,
          priority: 'low',
        } as Task,
      ];
      setTasks(defaultTasks);
      localStorage.setItem('tasks', JSON.stringify(defaultTasks));
    }
    
    if (savedGoals) {
      setGoals(JSON.parse(savedGoals));
    } else {
      // Set some default goals for demo
      const defaultGoals = [
        {
          id: 1,
          title: 'Reduce AI tool costs by 20%',
          description: 'Review all AI subscriptions and optimize usage',
          targetDate: addDays(new Date(), 30).toISOString().split('T')[0],
          progress: 35,
          completedSteps: 7,
          totalSteps: 20,
          type: 'short',
        } as Goal,
        {
          id: 2,
          title: 'Complete AI certification',
          targetDate: addDays(new Date(), 90).toISOString().split('T')[0],
          progress: 15,
          completedSteps: 3,
          totalSteps: 20,
          type: 'long',
        } as Goal,
      ];
      setGoals(defaultGoals);
      localStorage.setItem('goals', JSON.stringify(defaultGoals));
    }
  }, []);
  
  // Save tasks and goals to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);
  
  useEffect(() => {
    localStorage.setItem('goals', JSON.stringify(goals));
  }, [goals]);
  
  const addTask = () => {
    if (!newTask.title) {
      toast({
        title: "Task title required",
        description: "Please enter a title for your task",
        variant: "destructive",
      });
      return;
    }
    
    const taskToAdd: Task = {
      id: Date.now(),
      title: newTask.title,
      description: newTask.description,
      dueDate: newTask.dueDate,
      completed: false,
      notify: newTask.notify,
      notifyInterval: newTask.notifyInterval,
      priority: newTask.priority,
    } as Task;
    
    setTasks(prev => [...prev, taskToAdd]);
    setNewTask({
      title: '',
      description: '',
      dueDate: '',
      completed: false,
      notify: false,
      priority: 'medium',
    });
    setIsAddTaskOpen(false);
    
    toast({
      title: "Task added",
      description: "Your task has been added successfully",
    });
  };
  
  const updateTask = () => {
    if (!editingTask) return;
    
    setTasks(prev => 
      prev.map(task => 
        task.id === editingTask.id ? editingTask : task
      )
    );
    
    setEditingTask(null);
    setIsAddTaskOpen(false);
    
    toast({
      title: "Task updated",
      description: "Your task has been updated successfully",
    });
  };
  
  const deleteTask = (id: number) => {
    setTasks(prev => prev.filter(task => task.id !== id));
    
    toast({
      title: "Task deleted",
      description: "Your task has been deleted",
    });
  };
  
  const toggleTaskComplete = (id: number) => {
    setTasks(prev => 
      prev.map(task => 
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };
  
  const addGoal = () => {
    if (!newGoal.title || !newGoal.totalSteps || newGoal.totalSteps < 1) {
      toast({
        title: "Goal information required",
        description: "Please enter a title and steps for your goal",
        variant: "destructive",
      });
      return;
    }
    
    const goalToAdd: Goal = {
      id: Date.now(),
      title: newGoal.title || '',
      description: newGoal.description,
      targetDate: newGoal.targetDate,
      progress: 0,
      completedSteps: 0,
      totalSteps: newGoal.totalSteps || 1,
      type: newGoal.type || 'short',
    };
    
    setGoals(prev => [...prev, goalToAdd]);
    setNewGoal({
      title: '',
      description: '',
      targetDate: '',
      progress: 0,
      completedSteps: 0,
      totalSteps: 1,
      type: 'short',
    });
    setIsAddGoalOpen(false);
    
    toast({
      title: "Goal added",
      description: "Your goal has been added successfully",
    });
  };
  
  const updateGoal = () => {
    if (!editingGoal) return;
    
    // Calculate progress
    const progress = Math.round((editingGoal.completedSteps / editingGoal.totalSteps) * 100);
    
    const updatedGoal = {
      ...editingGoal,
      progress
    };
    
    setGoals(prev => 
      prev.map(goal => 
        goal.id === editingGoal.id ? updatedGoal : goal
      )
    );
    
    setEditingGoal(null);
    setIsAddGoalOpen(false);
    
    toast({
      title: "Goal updated",
      description: "Your goal has been updated successfully",
    });
  };
  
  const deleteGoal = (id: number) => {
    setGoals(prev => prev.filter(goal => goal.id !== id));
    
    toast({
      title: "Goal deleted",
      description: "Your goal has been deleted",
    });
  };
  
  const updateGoalProgress = (id: number, completedSteps: number) => {
    setGoals(prev => 
      prev.map(goal => {
        if (goal.id === id) {
          const newCompletedSteps = Math.min(completedSteps, goal.totalSteps);
          const progress = Math.round((newCompletedSteps / goal.totalSteps) * 100);
          return {
            ...goal,
            completedSteps: newCompletedSteps,
            progress
          };
        }
        return goal;
      })
    );
  };
  
  // Filter tasks based on search term, priority, status, and time frame
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (task.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
    
    const matchesStatus = filterStatus === 'all' || 
                          (filterStatus === 'completed' && task.completed) ||
                          (filterStatus === 'active' && !task.completed);
    
    let matchesTime = true;
    if (filterTime !== 'all' && task.dueDate) {
      const dueDate = new Date(task.dueDate);
      if (filterTime === 'today') {
        matchesTime = isToday(dueDate);
      } else if (filterTime === 'week') {
        matchesTime = isThisWeek(dueDate);
      } else if (filterTime === 'month') {
        matchesTime = isThisMonth(dueDate);
      }
    }
    
    return matchesSearch && matchesPriority && matchesStatus && matchesTime;
  });
  
  // Filter goals based on search term and type
  const filteredGoals = goals.filter(goal => {
    const matchesSearch = goal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (goal.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterTime === 'all' || goal.type === filterTime;
    
    return matchesSearch && matchesType;
  });
  
  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return format(date, 'MMM d, yyyy');
    } catch (e) {
      return dateString;
    }
  };
  
  // Sort tasks by due date (most recent first)
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (!a.dueDate) return 1;
    if (!b.dueDate) return -1;
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });
  
  // Get priority color
  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high': return 'text-red-400 bg-red-500/20';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20';
      case 'low': return 'text-blue-400 bg-blue-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };
  
  // Get goal type badge color
  const getGoalTypeColor = (type: string) => {
    switch (type) {
      case 'daily': return 'bg-green-500/20 text-green-400';
      case 'short': return 'bg-blue-500/20 text-blue-400';
      case 'long': return 'bg-purple-500/20 text-purple-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };
  
  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Planner</h1>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input 
              placeholder="Search..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full sm:w-64 bg-gray-700/50 border-gray-600"
            />
          </div>
          
          <Button
            variant={isEditMode ? "default" : "outline"}
            size="sm"
            className={isEditMode ? "bg-purple-600" : ""}
            onClick={() => setIsEditMode(!isEditMode)}
          >
            <Edit3 className="h-4 w-4 mr-2" />
            {isEditMode ? "Done" : "Edit"}
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue={activeTabState} onValueChange={setActiveTabState} className="flex-1 flex flex-col">
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="tasks" className="data-[state=active]:bg-purple-500/20">
            <CheckSquare className="h-4 w-4 mr-2" />
            Tasks
          </TabsTrigger>
          <TabsTrigger value="goals" className="data-[state=active]:bg-purple-500/20">
            <Target className="h-4 w-4 mr-2" />
            Goals
          </TabsTrigger>
        </TabsList>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {activeTabState === 'tasks' && (
            <>
              <Select value={filterPriority} onValueChange={setFilterPriority}>
                <SelectTrigger className="w-28 h-8 text-xs">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-28 h-8 text-xs">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </>
          )}
          
          <Select value={filterTime} onValueChange={setFilterTime}>
            <SelectTrigger className={`w-28 h-8 text-xs ${activeTabState === 'goals' ? 'w-36' : ''}`}>
              <SelectValue placeholder={activeTabState === 'goals' ? 'Goal Type' : 'Time Frame'} />
            </SelectTrigger>
            <SelectContent>
              {activeTabState === 'tasks' ? (
                <>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                </>
              ) : (
                <>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="short">Short-term</SelectItem>
                  <SelectItem value="long">Long-term</SelectItem>
                </>
              )}
            </SelectContent>
          </Select>
        </div>
        
        <TabsContent value="tasks" className="flex-1 relative">
          <div className="space-y-2">
            {sortedTasks.length > 0 ? (
              sortedTasks.map(task => (
                <div 
                  key={task.id} 
                  className={`p-3 rounded-lg ${
                    task.completed ? 'bg-gray-800/30' : 'bg-gray-800/60'
                  } relative transition-all duration-200 ${
                    isEditMode ? 'hover:bg-gray-700/50 cursor-pointer' : ''
                  }`}
                  onClick={() => {
                    if (isEditMode) {
                      setEditingTask(task);
                      setIsAddTaskOpen(true);
                    }
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div 
                      className="mt-1 cursor-pointer transition-transform hover:scale-110"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleTaskComplete(task.id);
                      }}
                    >
                      {task.completed ? 
                        <CheckSquare className="h-5 w-5 text-green-400" /> : 
                        <Circle className="h-5 w-5 text-gray-400" />
                      }
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className={`font-medium ${task.completed ? 'line-through text-gray-500' : ''}`}>
                          {task.title}
                        </h3>
                        
                        {task.priority && (
                          <Badge variant="outline" className={`px-2 py-0 h-5 ${getPriorityColor(task.priority)}`}>
                            {task.priority}
                          </Badge>
                        )}
                        
                        {task.notify && (
                          <Badge variant="outline" className="px-2 py-0 h-5 bg-purple-500/20 text-purple-400">
                            notify
                          </Badge>
                        )}
                      </div>
                      
                      {task.description && (
                        <p className="text-sm text-gray-400 mt-1">
                          {task.description}
                        </p>
                      )}
                      
                      {task.dueDate && (
                        <div className="flex items-center text-xs text-gray-400 mt-2">
                          <CalendarDays className="h-3 w-3 mr-1" />
                          {formatDate(task.dueDate)}
                        </div>
                      )}
                    </div>
                    
                    {isEditMode && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 rounded-full text-red-400 hover:bg-red-500/20 hover:text-red-300"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteTask(task.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10 text-gray-400">
                {searchTerm || filterPriority !== 'all' || filterStatus !== 'all' || filterTime !== 'all' ? (
                  <p>No tasks match your filters</p>
                ) : (
                  <>
                    <p className="mb-3">No tasks yet</p>
                    <Button
                      onClick={() => {
                        setNewTask({
                          title: '',
                          description: '',
                          dueDate: '',
                          completed: false,
                          notify: false,
                          priority: 'medium',
                        });
                        setIsAddTaskOpen(true);
                      }}
                      className="bg-purple-600"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Your First Task
                    </Button>
                  </>
                )}
              </div>
            )}
          </div>
          
          <Button
            className="fixed bottom-6 right-6 rounded-full h-12 w-12 bg-purple-600 shadow-lg"
            onClick={() => {
              setNewTask({
                title: '',
                description: '',
                dueDate: '',
                completed: false,
                notify: false,
                priority: 'medium',
              });
              setIsAddTaskOpen(true);
            }}
          >
            <Plus className="h-6 w-6" />
          </Button>
        </TabsContent>
        
        <TabsContent value="goals" className="flex-1 relative">
          <div className="space-y-4">
            {filteredGoals.length > 0 ? (
              filteredGoals.map(goal => (
                <div 
                  key={goal.id} 
                  className={`p-3 rounded-lg bg-gray-800/60 relative transition-all duration-200 ${
                    isEditMode ? 'hover:bg-gray-700/50 cursor-pointer' : ''
                  }`}
                  onClick={() => {
                    if (isEditMode) {
                      setEditingGoal(goal);
                      setIsAddGoalOpen(true);
                    }
                  }}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium">{goal.title}</h3>
                        <Badge variant="outline" className={`px-2 py-0 h-5 ${getGoalTypeColor(goal.type)}`}>
                          {goal.type}
                        </Badge>
                      </div>
                      
                      {goal.description && (
                        <p className="text-sm text-gray-400 mb-2">
                          {goal.description}
                        </p>
                      )}
                    </div>
                    
                    {isEditMode && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 rounded-full text-red-400 hover:bg-red-500/20 hover:text-red-300"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteGoal(goal.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  
                  <div className="mt-2">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-gray-400">Progress: {goal.progress}%</span>
                      {goal.targetDate && (
                        <span className="text-xs text-gray-400 flex items-center">
                          <CalendarCheck className="h-3 w-3 mr-1" />
                          Target: {formatDate(goal.targetDate)}
                        </span>
                      )}
                    </div>
                    
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-purple-500 h-2 rounded-full" 
                        style={{ width: `${goal.progress}%` }}
                      ></div>
                    </div>
                    
                    <div className="flex justify-between items-center mt-3">
                      <span className="text-sm">{goal.completedSteps} of {goal.totalSteps} steps completed</span>
                      
                      {!isEditMode && (
                        <div className="flex items-center gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 w-7 p-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              updateGoalProgress(goal.id, Math.max(0, goal.completedSteps - 1));
                            }}
                          >
                            -
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 w-7 p-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              updateGoalProgress(goal.id, goal.completedSteps + 1);
                            }}
                          >
                            +
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10 text-gray-400">
                {searchTerm || filterTime !== 'all' ? (
                  <p>No goals match your filters</p>
                ) : (
                  <>
                    <p className="mb-3">No goals yet</p>
                    <Button
                      onClick={() => {
                        setNewGoal({
                          title: '',
                          description: '',
                          targetDate: '',
                          progress: 0,
                          completedSteps: 0,
                          totalSteps: 1,
                          type: 'short',
                        });
                        setIsAddGoalOpen(true);
                      }}
                      className="bg-purple-600"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Your First Goal
                    </Button>
                  </>
                )}
              </div>
            )}
          </div>
          
          <Button
            className="fixed bottom-6 right-6 rounded-full h-12 w-12 bg-purple-600 shadow-lg"
            onClick={() => {
              setNewGoal({
                title: '',
                description: '',
                targetDate: '',
                progress: 0,
                completedSteps: 0,
                totalSteps: 1,
                type: 'short',
              });
              setIsAddGoalOpen(true);
            }}
          >
            <Plus className="h-6 w-6" />
          </Button>
        </TabsContent>
      </Tabs>
      
      {/* Add/Edit Task Dialog */}
      <Dialog open={isAddTaskOpen} onOpenChange={setIsAddTaskOpen}>
        <DialogContent className="bg-gray-800 text-white border-gray-700">
          <DialogHeader>
            <DialogTitle>{editingTask ? "Edit Task" : "Add New Task"}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Title</label>
              <Input
                placeholder="Task title"
                value={editingTask ? editingTask.title : newTask.title}
                onChange={(e) => {
                  if (editingTask) {
                    setEditingTask({...editingTask, title: e.target.value});
                  } else {
                    setNewTask({...newTask, title: e.target.value});
                  }
                }}
                className="bg-gray-700 border-gray-600"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Description (optional)</label>
              <Input
                placeholder="Task description"
                value={editingTask ? editingTask.description || '' : newTask.description || ''}
                onChange={(e) => {
                  if (editingTask) {
                    setEditingTask({...editingTask, description: e.target.value});
                  } else {
                    setNewTask({...newTask, description: e.target.value});
                  }
                }}
                className="bg-gray-700 border-gray-600"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Due Date (optional)</label>
              <Input
                type="date"
                value={editingTask ? editingTask.dueDate || '' : newTask.dueDate || ''}
                onChange={(e) => {
                  if (editingTask) {
                    setEditingTask({...editingTask, dueDate: e.target.value});
                  } else {
                    setNewTask({...newTask, dueDate: e.target.value});
                  }
                }}
                className="bg-gray-700 border-gray-600"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Priority</label>
              <Select
                value={editingTask ? editingTask.priority : newTask.priority}
                onValueChange={(value: 'low' | 'medium' | 'high') => {
                  if (editingTask) {
                    setEditingTask({...editingTask, priority: value});
                  } else {
                    setNewTask({...newTask, priority: value});
                  }
                }}
              >
                <SelectTrigger className="bg-gray-700 border-gray-600">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="notify"
                checked={editingTask ? !!editingTask.notify : !!newTask.notify}
                onChange={(e) => {
                  if (editingTask) {
                    setEditingTask({...editingTask, notify: e.target.checked});
                  } else {
                    setNewTask({...newTask, notify: e.target.checked});
                  }
                }}
                className="rounded border-gray-600 bg-gray-700"
              />
              <label htmlFor="notify" className="text-sm">Notify me about this task</label>
            </div>
            
            {(editingTask?.notify || newTask.notify) && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Notification Interval</label>
                <Select
                  value={editingTask ? editingTask.notifyInterval : newTask.notifyInterval}
                  onValueChange={(value: 'daily' | 'weekly' | '3days' | 'custom') => {
                    if (editingTask) {
                      setEditingTask({...editingTask, notifyInterval: value});
                    } else {
                      setNewTask({...newTask, notifyInterval: value});
                    }
                  }}
                >
                  <SelectTrigger className="bg-gray-700 border-gray-600">
                    <SelectValue placeholder="Select interval" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="3days">Every 3 days</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          
          <DialogFooter className="sm:justify-between">
            {editingTask && (
              <Button
                variant="destructive"
                onClick={() => {
                  deleteTask(editingTask.id);
                  setEditingTask(null);
                  setIsAddTaskOpen(false);
                }}
              >
                Delete
              </Button>
            )}
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setEditingTask(null);
                  setIsAddTaskOpen(false);
                }}
              >
                Cancel
              </Button>
              <Button onClick={editingTask ? updateTask : addTask}>
                {editingTask ? "Update" : "Add"} Task
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Add/Edit Goal Dialog */}
      <Dialog open={isAddGoalOpen} onOpenChange={setIsAddGoalOpen}>
        <DialogContent className="bg-gray-800 text-white border-gray-700">
          <DialogHeader>
            <DialogTitle>{editingGoal ? "Edit Goal" : "Add New Goal"}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Title</label>
              <Input
                placeholder="Goal title"
                value={editingGoal ? editingGoal.title : newGoal.title}
                onChange={(e) => {
                  if (editingGoal) {
                    setEditingGoal({...editingGoal, title: e.target.value});
                  } else {
                    setNewGoal({...newGoal, title: e.target.value});
                  }
                }}
                className="bg-gray-700 border-gray-600"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Description (optional)</label>
              <Input
                placeholder="Goal description"
                value={editingGoal ? editingGoal.description || '' : newGoal.description || ''}
                onChange={(e) => {
                  if (editingGoal) {
                    setEditingGoal({...editingGoal, description: e.target.value});
                  } else {
                    setNewGoal({...newGoal, description: e.target.value});
                  }
                }}
                className="bg-gray-700 border-gray-600"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Target Date (optional)</label>
              <Input
                type="date"
                value={editingGoal ? editingGoal.targetDate || '' : newGoal.targetDate || ''}
                onChange={(e) => {
                  if (editingGoal) {
                    setEditingGoal({...editingGoal, targetDate: e.target.value});
                  } else {
                    setNewGoal({...newGoal, targetDate: e.target.value});
                  }
                }}
                className="bg-gray-700 border-gray-600"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Goal Type</label>
              <Select
                value={editingGoal ? editingGoal.type : newGoal.type}
                onValueChange={(value: 'daily' | 'short' | 'long') => {
                  if (editingGoal) {
                    setEditingGoal({...editingGoal, type: value});
                  } else {
                    setNewGoal({...newGoal, type: value});
                  }
                }}
              >
                <SelectTrigger className="bg-gray-700 border-gray-600">
                  <SelectValue placeholder="Select goal type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily Goal</SelectItem>
                  <SelectItem value="short">Short-term</SelectItem>
                  <SelectItem value="long">Long-term</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Total Steps</label>
              <Input
                type="number"
                min="1"
                value={editingGoal ? editingGoal.totalSteps : newGoal.totalSteps}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 1;
                  if (editingGoal) {
                    setEditingGoal({...editingGoal, totalSteps: value});
                  } else {
                    setNewGoal({...newGoal, totalSteps: value});
                  }
                }}
                className="bg-gray-700 border-gray-600"
              />
            </div>
            
            {editingGoal && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Completed Steps</label>
                <Input
                  type="number"
                  min="0"
                  max={editingGoal.totalSteps}
                  value={editingGoal.completedSteps}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 0;
                    const safeValue = Math.min(value, editingGoal.totalSteps);
                    setEditingGoal({...editingGoal, completedSteps: safeValue});
                  }}
                  className="bg-gray-700 border-gray-600"
                />
              </div>
            )}
          </div>
          
          <DialogFooter className="sm:justify-between">
            {editingGoal && (
              <Button
                variant="destructive"
                onClick={() => {
                  deleteGoal(editingGoal.id);
                  setEditingGoal(null);
                  setIsAddGoalOpen(false);
                }}
              >
                Delete
              </Button>
            )}
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setEditingGoal(null);
                  setIsAddGoalOpen(false);
                }}
              >
                Cancel
              </Button>
              <Button onClick={editingGoal ? updateGoal : addGoal}>
                {editingGoal ? "Update" : "Add"} Goal
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Planner;

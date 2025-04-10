
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Calendar, Bell, Check, Flag, List, X, Clock, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';

// Define our task types
interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate?: string;
  completed: boolean;
  notify: boolean;
}

interface Goal {
  id: string;
  title: string;
  targetDate?: string;
  progress: number;
  completedSteps: number;
  totalSteps: number;
  type: 'daily' | 'short' | 'long';
}

const Planner: React.FC = () => {
  // States for tasks and goals
  const [tasks, setTasks] = useState<Task[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [newTask, setNewTask] = useState<Partial<Task>>({});
  const [newGoal, setNewGoal] = useState<Partial<Goal>>({});
  const [activeTab, setActiveTab] = useState('tasks');
  const { toast } = useToast();

  // Add a new task
  const addTask = () => {
    if (!newTask.title) return;
    
    const task: Task = {
      id: Date.now().toString(),
      title: newTask.title,
      description: newTask.description,
      dueDate: newTask.dueDate,
      completed: false,
      notify: Boolean(newTask.notify),
    };
    
    setTasks([...tasks, task]);
    setNewTask({});
    
    if (task.notify) {
      toast({
        title: "Notification Set",
        description: `You'll be notified about: ${task.title}`,
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
    };
    
    setGoals([...goals, goal]);
    setNewGoal({});
    
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
        
        if (completedSteps === goal.totalSteps) {
          toast({
            title: "Goal Achieved!",
            description: "Congratulations on achieving your goal!",
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

  // Delete a task
  const deleteTask = (id: string) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  // Delete a goal
  const deleteGoal = (id: string) => {
    setGoals(goals.filter(goal => goal.id !== id));
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        type: "spring", 
        stiffness: 100 
      }
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

  return (
    <div className="py-6">
      <h2 className="text-2xl font-bold mb-6 ai-gradient-text">Planner</h2>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4 justify-start">
          <TabsTrigger value="tasks" className="flex items-center gap-1">
            <List className="w-4 h-4" />
            Tasks
          </TabsTrigger>
          <TabsTrigger value="goals" className="flex items-center gap-1">
            <Flag className="w-4 h-4" />
            Goals
          </TabsTrigger>
        </TabsList>
        
        {/* Tasks Tab */}
        <TabsContent value="tasks">
          <Card>
            <CardHeader>
              <CardTitle>Add New Task</CardTitle>
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
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="task-description">Description (Optional)</Label>
                  <Input 
                    id="task-description"
                    placeholder="Enter description" 
                    value={newTask.description || ''}
                    onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="task-due-date">Due Date (Optional)</Label>
                  <Input 
                    id="task-due-date"
                    type="date" 
                    value={newTask.dueDate || ''}
                    onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
                  />
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
              <Button onClick={addTask} className="w-full">
                <Plus className="w-4 h-4 mr-2" /> Add Task
              </Button>
            </CardFooter>
          </Card>
          
          {/* Task List */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="mt-6"
          >
            <h3 className="text-lg font-semibold mb-3">Your Tasks</h3>
            
            <ScrollArea className="h-[400px] rounded-md border p-4">
              {tasks.length === 0 ? (
                <div className="text-center text-gray-400 py-8">
                  <Calendar className="w-12 h-12 mx-auto mb-2 opacity-30" />
                  <p>No tasks yet. Add some tasks to get started!</p>
                </div>
              ) : (
                tasks.map((task) => (
                  <motion.div 
                    key={task.id}
                    variants={itemVariants}
                    className={`flex items-center justify-between p-3 mb-2 rounded-lg border ${
                      task.completed ? 'bg-green-500/10 border-green-500/30' : 'bg-white/5 border-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Button
                        size="icon"
                        variant={task.completed ? "default" : "outline"}
                        className={`h-6 w-6 rounded-full ${
                          task.completed ? 'bg-green-500 hover:bg-green-600' : ''
                        }`}
                        onClick={() => toggleTaskCompletion(task.id)}
                      >
                        {task.completed && <Check className="h-3 w-3" />}
                      </Button>
                      <div className={`${task.completed ? 'line-through text-gray-400' : ''}`}>
                        <p className="font-medium">{task.title}</p>
                        {task.description && (
                          <p className="text-sm text-gray-400">{task.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {task.dueDate && (
                        <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          {task.dueDate}
                        </span>
                      )}
                      {task.notify && (
                        <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded-full">
                          <Bell className="w-3 h-3" />
                        </span>
                      )}
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-500/20"
                        onClick={() => deleteTask(task.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))
              )}
            </ScrollArea>
          </motion.div>
        </TabsContent>
        
        {/* Goals Tab */}
        <TabsContent value="goals">
          <Card>
            <CardHeader>
              <CardTitle>Create New Goal</CardTitle>
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
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="goal-type">Goal Type</Label>
                  <select
                    id="goal-type"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    value={newGoal.type || ''}
                    onChange={(e) => setNewGoal({...newGoal, type: e.target.value as any})}
                  >
                    <option value="">Select a type</option>
                    <option value="daily">Daily Goal</option>
                    <option value="short">Short-term Goal</option>
                    <option value="long">Long-term Goal</option>
                  </select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="goal-steps">Total Steps to Complete</Label>
                  <Input 
                    id="goal-steps"
                    type="number" 
                    min="1"
                    placeholder="Number of steps" 
                    value={newGoal.totalSteps || ''}
                    onChange={(e) => setNewGoal({...newGoal, totalSteps: parseInt(e.target.value) || 1})}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="goal-target-date">Target Date (Optional)</Label>
                  <Input 
                    id="goal-target-date"
                    type="date" 
                    value={newGoal.targetDate || ''}
                    onChange={(e) => setNewGoal({...newGoal, targetDate: e.target.value})}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={addGoal} className="w-full">
                <Plus className="w-4 h-4 mr-2" /> Create Goal
              </Button>
            </CardFooter>
          </Card>
          
          {/* Goals List */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="mt-6"
          >
            <h3 className="text-lg font-semibold mb-3">Your Goals</h3>
            
            <ScrollArea className="h-[400px] rounded-md border p-4">
              {goals.length === 0 ? (
                <div className="text-center text-gray-400 py-8">
                  <Flag className="w-12 h-12 mx-auto mb-2 opacity-30" />
                  <p>No goals yet. Create some goals to track your progress!</p>
                </div>
              ) : (
                goals.map((goal) => (
                  <motion.div 
                    key={goal.id}
                    variants={itemVariants}
                    className="p-4 mb-3 rounded-lg border border-white/10 bg-white/5"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <div>
                        <h4 className="font-semibold">{goal.title}</h4>
                        <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">
                          {formatGoalType(goal.type)}
                        </span>
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-500/20"
                        onClick={() => deleteGoal(goal.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    {goal.targetDate && (
                      <div className="flex items-center text-xs text-gray-400 mb-2">
                        <Clock className="w-3 h-3 mr-1" />
                        Target: {goal.targetDate}
                      </div>
                    )}
                    
                    <div className="mb-3">
                      <div className="flex justify-between text-xs mb-1">
                        <span>Progress</span>
                        <span>{Math.round(goal.progress)}%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2.5">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-purple-500 h-2.5 rounded-full transition-all duration-500 ease-out"
                          style={{ width: `${goal.progress}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
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
                        >
                          -
                        </Button>
                        <Button 
                          size="sm"
                          onClick={() => updateGoalProgress(goal.id, goal.completedSteps + 1)}
                          disabled={goal.completedSteps >= goal.totalSteps}
                        >
                          +
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </ScrollArea>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Planner;

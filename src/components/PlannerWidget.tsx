
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarCheck, CheckCircle, Circle, Clock, ArrowRight, Pencil, Settings, X, ListTodo } from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";

interface Task {
  id: string | number;
  title: string;
  completed?: boolean;
  dueDate?: string;
  priority?: 'low' | 'medium' | 'high';
}

interface Goal {
  id: string | number;
  title: string;
  targetDate?: string;
  progress: number;
  completedSteps: number;
  totalSteps: number;
}

interface DailyTask {
  id: number;
  name: string;
  completed: boolean;
  timeOfDay?: string;
  streak: number;
  lastCompleted?: string;
  color?: string;
  category?: string;
}

interface PlannerWidgetProps {
  tasks?: Task[];
  goals?: Goal[];
  dailyTasks?: DailyTask[];
  onViewMore: () => void;
  onViewDailyTasks?: () => void;
  onToggleTaskComplete?: (taskId: string | number) => void;
  onEditTask?: (task: Task) => void;
  onEditGoal?: (goal: Goal) => void;
}

const PlannerWidget: React.FC<PlannerWidgetProps> = ({ 
  tasks = [], 
  goals = [],
  dailyTasks = [],
  onViewMore,
  onToggleTaskComplete,
  onEditTask,
  onEditGoal
}) => {
  const navigate = useNavigate();
  const [hoveredItemId, setHoveredItemId] = useState<string | number | null>(null);
  const [activeTaskId, setActiveTaskId] = useState<string | number | null>(null);
  const [showTaskRemoveConfirm, setShowTaskRemoveConfirm] = useState(false);
  const [taskToRemove, setTaskToRemove] = useState<string | number | null>(null);
  const [showRemoveConfirmation, setShowRemoveConfirmation] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'tasks' | 'goals' | 'daily'>('tasks');
  
  const tasksToShow = tasks.slice(0, 3);
  const goalsToShow = goals.slice(0, 3);
  const dailyTasksToShow = dailyTasks
    .filter(task => task.streak > 0)
    .sort((a, b) => b.streak - a.streak)
    .slice(0, 3);
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'No date';
    try {
      return format(new Date(dateString), 'MMM d');
    } catch (e) {
      return dateString;
    }
  };

  const priorityColors = {
    low: 'bg-blue-500/20 text-blue-300',
    medium: 'bg-yellow-500/20 text-yellow-300',
    high: 'bg-red-500/20 text-red-300'
  };

  const handleTaskCircleClick = (task: Task) => {
    if (onToggleTaskComplete) {
      onToggleTaskComplete(task.id);
    }
  };

  const handleTaskEditClick = (e: React.MouseEvent, task: Task) => {
    e.stopPropagation();
    if (onEditTask) {
      onEditTask(task);
    }
  };

  const handleGoalEditClick = (e: React.MouseEvent, goal: Goal) => {
    e.stopPropagation();
    if (onEditGoal) {
      onEditGoal(goal);
    }
  };

  const handleRemoveTask = (e: React.MouseEvent, taskId: string | number) => {
    e.stopPropagation();
    
    if (showRemoveConfirmation) {
      setTaskToRemove(taskId);
      setShowTaskRemoveConfirm(true);
    } else {
      confirmTaskRemoval();
    }
  };

  const confirmTaskRemoval = () => {
    if (taskToRemove && onEditTask) {
      const taskToDelete = tasks.find(t => t.id === taskToRemove);
      if (taskToDelete && onEditTask) {
        if (typeof onEditTask === 'function') {
          onEditTask({ ...taskToDelete });
          toast({
            title: "Task removed",
            description: "The task has been removed from your list"
          });
        }
      }
    }
    setShowTaskRemoveConfirm(false);
    setTaskToRemove(null);
  };

  const saveSettings = () => {
    localStorage.setItem('plannerSettings', JSON.stringify({
      showRemoveConfirmation
    }));
    setSettingsOpen(false);
    toast({
      title: "Settings saved",
      description: "Your planner settings have been updated"
    });
  };

  React.useEffect(() => {
    const savedSettings = localStorage.getItem('plannerSettings');
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        setShowRemoveConfirmation(settings.showRemoveConfirmation !== undefined ? 
          settings.showRemoveConfirmation : true);
      } catch (e) {
        console.error('Failed to parse planner settings', e);
      }
    }
  }, []);

  const getStreakClassName = (streak: number) => {
    if (streak >= 10) return "bg-purple-500/20 text-purple-300";
    if (streak >= 5) return "bg-blue-500/20 text-blue-300";
    if (streak >= 1) return "bg-green-500/20 text-green-300";
    return "bg-gray-500/20 text-gray-300";
  };

  return (
    <Card className="bg-gray-800/60 border-gray-700 text-white shadow-md">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium flex items-center gap-2">
            <CalendarCheck className="h-5 w-5 text-purple-400" />
            Planner Summary
          </CardTitle>
          <Popover open={settingsOpen} onOpenChange={setSettingsOpen}>
            <PopoverTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 rounded-full hover:bg-gray-700/50"
              >
                <Settings className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 bg-gray-800 border-gray-700 text-white">
              <div className="space-y-4">
                <h4 className="font-medium text-sm">Planner Settings</h4>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="text-sm">Confirm task removal</div>
                    <div className="text-xs text-gray-400">Show confirmation dialog when removing tasks</div>
                  </div>
                  <Switch 
                    checked={showRemoveConfirmation} 
                    onCheckedChange={setShowRemoveConfirmation}
                  />
                </div>
                <div className="flex justify-end">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={saveSettings}
                    className="mt-2"
                  >
                    Save Settings
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
        <CardDescription className="text-gray-400">Your upcoming tasks and goals</CardDescription>
        <div className="flex space-x-2 mt-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setActiveTab('tasks')}
            className={`px-3 py-1 ${activeTab === 'tasks' ? 'bg-gray-700' : 'hover:bg-gray-700/50'}`}
          >
            Tasks
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setActiveTab('goals')}
            className={`px-3 py-1 ${activeTab === 'goals' ? 'bg-gray-700' : 'hover:bg-gray-700/50'}`}
          >
            Goals
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setActiveTab('daily')}
            className={`px-3 py-1 ${activeTab === 'daily' ? 'bg-gray-700' : 'hover:bg-gray-700/50'} flex items-center gap-1`}
          >
            <ListTodo className="w-3 h-3" /> Daily
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {activeTab === 'tasks' && (
          <div>
            <h3 className="text-sm font-medium text-gray-300 mb-2">Tasks ({tasks.length})</h3>
            {tasksToShow.length > 0 ? (
              <div className="space-y-2">
                {tasksToShow.map(task => (
                  <div 
                    key={task.id} 
                    className="flex items-center justify-between p-2 rounded-lg bg-gray-700/30 relative group"
                    onMouseEnter={() => setHoveredItemId(task.id)}
                    onMouseLeave={() => setHoveredItemId(null)}
                  >
                    <div className="flex items-center gap-2">
                      <div 
                        className={`cursor-pointer transition-all ${task.completed ? 'bg-green-500 text-white rounded-full' : ''} hover:scale-110`}
                        onClick={() => handleTaskCircleClick(task)}
                      >
                        {task.completed ? 
                          <CheckCircle className="h-4 w-4 text-white" /> : 
                          <Circle className="h-4 w-4 text-gray-400" />
                        }
                      </div>
                      <span className={task.completed ? "line-through text-gray-400" : ""}>{task.title}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {task.priority && (
                        <span className={`text-xs px-2 py-0.5 rounded-full ${priorityColors[task.priority]}`}>
                          {task.priority}
                        </span>
                      )}
                      {task.dueDate && (
                        <span className="flex items-center gap-1 text-xs text-gray-400">
                          <Clock className="h-3 w-3" />
                          {formatDate(task.dueDate)}
                        </span>
                      )}
                      <div className="flex items-center">
                        {(hoveredItemId === task.id) && (
                          <>
                            <button 
                              className="p-1 rounded-full hover:bg-gray-600/50"
                              onClick={(e) => handleTaskEditClick(e, task)}
                            >
                              <Pencil className="h-3 w-3 text-gray-300" />
                            </button>
                            <button 
                              className="p-1 rounded-full hover:bg-red-600/50 ml-1"
                              onClick={(e) => handleRemoveTask(e, task.id)}
                            >
                              <X className="h-3 w-3 text-gray-300" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-3 text-gray-400 text-sm bg-gray-700/20 rounded-lg">
                No tasks yet
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'goals' && (
          <div>
            <h3 className="text-sm font-medium text-gray-300 mb-2">Goals ({goals.length})</h3>
            {goalsToShow.length > 0 ? (
              <div className="space-y-2">
                {goalsToShow.map(goal => (
                  <div 
                    key={goal.id} 
                    className="p-2 rounded-lg bg-gray-700/30 relative"
                    onMouseEnter={() => setHoveredItemId(goal.id)}
                    onMouseLeave={() => setHoveredItemId(null)}
                  >
                    <div className="flex justify-between mb-1">
                      <span>{goal.title}</span>
                      {hoveredItemId === goal.id && (
                        <div className="flex items-center">
                          <button 
                            className="p-1 rounded-full hover:bg-gray-600/50"
                            onClick={(e) => handleGoalEditClick(e, goal)}
                          >
                            <Pencil className="h-3 w-3 text-gray-300" />
                          </button>
                          <button 
                            className="p-1 rounded-full hover:bg-red-600/50 ml-1"
                          >
                            <X className="h-3 w-3 text-gray-300" />
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-purple-500 h-2 rounded-full" 
                        style={{ width: `${goal.progress}%` }}
                      ></div>
                    </div>
                    <div className="mt-1 text-xs text-gray-400 text-right">
                      {goal.completedSteps}/{goal.totalSteps} steps · {goal.progress}% complete
                      {goal.targetDate && (
                        <span className="ml-2">
                          Target: {formatDate(goal.targetDate)}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-3 text-gray-400 text-sm bg-gray-700/20 rounded-lg">
                No goals yet
              </div>
            )}
          </div>
        )}

        {activeTab === 'daily' && (
          <div>
            <h3 className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-1">
              <ListTodo className="w-4 h-4 text-purple-400" />
              Daily Tasks ({dailyTasks.length})
            </h3>
            {dailyTasksToShow.length > 0 ? (
              <div className="space-y-2">
                {dailyTasksToShow.map(task => (
                  <div 
                    key={task.id} 
                    className="flex items-center justify-between p-2 rounded-lg bg-gray-700/30 relative"
                    onMouseEnter={() => setHoveredItemId(task.id)}
                    onMouseLeave={() => setHoveredItemId(null)}
                  >
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: task.color || '#9b87f5' }}
                      ></div>
                      <span className={task.completed ? "line-through text-gray-400" : ""}>{task.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {task.timeOfDay && (
                        <span className="flex items-center gap-1 text-xs text-gray-400">
                          <Clock className="h-3 w-3" />
                          {task.timeOfDay}
                        </span>
                      )}
                      <span className={`text-xs px-2 py-0.5 rounded-full flex items-center gap-1 ${getStreakClassName(task.streak)}`}>
                        <Clock className="h-3 w-3" />
                        {task.streak} day{task.streak !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-3 text-gray-400 text-sm bg-gray-700/20 rounded-lg">
                No daily tasks with streaks yet
              </div>
            )}
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <Button 
          variant="ghost" 
          className="text-purple-400 hover:text-purple-300 hover:bg-purple-500/10"
          onClick={() => navigate('/goals')}
        >
          View Goals
        </Button>
        
        <Button 
          variant="ghost" 
          className="text-purple-400 hover:text-purple-300 hover:bg-purple-500/10"
          onClick={onViewMore}
        >
          View Planner <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>

      <Dialog open={showTaskRemoveConfirm} onOpenChange={setShowTaskRemoveConfirm}>
        <DialogContent className="bg-gray-800 border-gray-700 text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Remove Task?</DialogTitle>
            <DialogDescription className="text-gray-400">
              Are you sure you want to remove this task from your list?
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center space-x-2 py-3">
            <Switch
              id="dont-show-again"
              checked={!showRemoveConfirmation}
              onCheckedChange={(checked) => setShowRemoveConfirmation(!checked)}
            />
            <label
              htmlFor="dont-show-again"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Don't ask me again
            </label>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowTaskRemoveConfirm(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmTaskRemoval}>
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default PlannerWidget;

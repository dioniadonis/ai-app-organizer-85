
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarCheck, CheckCircle, Circle, Clock, ArrowRight, Pencil } from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

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

interface PlannerWidgetProps {
  tasks?: Task[];
  goals?: Goal[];
  onViewMore: () => void;
  onToggleTaskComplete?: (taskId: string | number) => void;
  onEditTask?: (task: Task) => void;
  onEditGoal?: (goal: Goal) => void;
}

const PlannerWidget: React.FC<PlannerWidgetProps> = ({ 
  tasks = [], 
  goals = [],
  onViewMore,
  onToggleTaskComplete,
  onEditTask,
  onEditGoal
}) => {
  const navigate = useNavigate();
  const [hoveredItemId, setHoveredItemId] = useState<string | number | null>(null);
  const [activeTaskId, setActiveTaskId] = useState<string | number | null>(null);
  
  // Show max 3 items
  const tasksToShow = tasks.slice(0, 3);
  const goalsToShow = goals.slice(0, 3);
  
  // Format date to display
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'No date';
    try {
      return format(new Date(dateString), 'MMM d');
    } catch (e) {
      return dateString;
    }
  };

  // Priority colors
  const priorityColors = {
    low: 'bg-blue-500/20 text-blue-300',
    medium: 'bg-yellow-500/20 text-yellow-300',
    high: 'bg-red-500/20 text-red-300'
  };

  const handleTaskCircleClick = (task: Task) => {
    setActiveTaskId(task.id);
    setTimeout(() => setActiveTaskId(null), 300);
    
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

  return (
    <Card className="bg-gray-800/60 border-gray-700 text-white shadow-md">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium flex items-center gap-2">
            <CalendarCheck className="h-5 w-5 text-purple-400" />
            Planner Summary
          </CardTitle>
        </div>
        <CardDescription className="text-gray-400">Your upcoming tasks and goals</CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Tasks Section */}
        <div>
          <h3 className="text-sm font-medium text-gray-300 mb-2">Tasks ({tasks.length})</h3>
          {tasksToShow.length > 0 ? (
            <div className="space-y-2">
              {tasksToShow.map(task => (
                <div 
                  key={task.id} 
                  className="flex items-center justify-between p-2 rounded-lg bg-gray-700/30 relative"
                  onMouseEnter={() => setHoveredItemId(task.id)}
                  onMouseLeave={() => setHoveredItemId(null)}
                >
                  <div className="flex items-center gap-2">
                    <div 
                      className={`cursor-pointer transition-all ${activeTaskId === task.id ? 'scale-125 bg-purple-500/20 rounded-full' : 'hover:scale-110'}`}
                      onClick={() => handleTaskCircleClick(task)}
                    >
                      {task.completed ? 
                        <CheckCircle className="h-4 w-4 text-green-400" /> : 
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
                    {hoveredItemId === task.id && onEditTask && (
                      <button 
                        className="p-1 rounded-full hover:bg-gray-600/50"
                        onClick={(e) => handleTaskEditClick(e, task)}
                      >
                        <Pencil className="h-3 w-3 text-gray-300" />
                      </button>
                    )}
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
        
        {/* Goals Section */}
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
                    {hoveredItemId === goal.id && onEditGoal && (
                      <button 
                        className="p-1 rounded-full hover:bg-gray-600/50"
                        onClick={(e) => handleGoalEditClick(e, goal)}
                      >
                        <Pencil className="h-3 w-3 text-gray-300" />
                      </button>
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
    </Card>
  );
};

export default PlannerWidget;


import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarCheck, CheckCircle, Circle, Clock, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';

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
}

const PlannerWidget: React.FC<PlannerWidgetProps> = ({ 
  tasks = [], 
  goals = [],
  onViewMore
}) => {
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
                <div key={task.id} className="flex items-center justify-between p-2 rounded-lg bg-gray-700/30">
                  <div className="flex items-center gap-2">
                    {task.completed ? 
                      <CheckCircle className="h-4 w-4 text-green-400" /> : 
                      <Circle className="h-4 w-4 text-gray-400" />
                    }
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
                <div key={goal.id} className="p-2 rounded-lg bg-gray-700/30">
                  <div className="flex justify-between mb-1">
                    <span>{goal.title}</span>
                    {goal.targetDate && (
                      <span className="text-xs text-gray-400">
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
                  <div className="mt-1 text-xs text-gray-400 text-right">
                    {goal.completedSteps}/{goal.totalSteps} steps · {goal.progress}% complete
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
      
      <CardFooter>
        <Button 
          variant="ghost" 
          className="w-full text-purple-400 hover:text-purple-300 hover:bg-purple-500/10"
          onClick={onViewMore}
        >
          View All <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PlannerWidget;

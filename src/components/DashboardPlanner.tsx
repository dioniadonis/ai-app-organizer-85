import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, CheckCircle, Clock, Flag, ListTodo, CalendarCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

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

interface DashboardPlannerProps {
  tasks: Task[];
  goals: Goal[];
  dailyTasks?: DailyTask[];
  onViewPlanner: () => void;
}

const DashboardPlanner: React.FC<DashboardPlannerProps> = ({ tasks, goals, dailyTasks = [], onViewPlanner }) => {
  const navigate = useNavigate();

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const sevenDaysLater = new Date();
  sevenDaysLater.setDate(today.getDate() + 7);
  
  const upcomingTasks = tasks
    .filter(task => {
      if (!task.dueDate || task.completed) return false;
      const dueDate = new Date(task.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      return dueDate >= today && dueDate <= sevenDaysLater;
    })
    .sort((a, b) => {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    })
    .slice(0, 3);
  
  const inProgressGoals = goals
    .filter(goal => goal.progress > 0 && goal.progress < 100)
    .sort((a, b) => b.progress - a.progress)
    .slice(0, 3);
  
  const dailyTasksWithStreaks = dailyTasks
    .filter(task => task.streak > 0)
    .sort((a, b) => b.streak - a.streak)
    .slice(0, 3);
  
  const completedTasks = tasks.filter(task => task.completed).length;
  const totalTasks = tasks.length;
  const completedGoals = goals.filter(goal => goal.progress === 100).length;
  const totalDailyTasks = dailyTasks.length;
  const completedDailyTasks = dailyTasks.filter(task => task.completed).length;
  
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="glass-card p-4 rounded-xl mb-8"
    >
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Calendar className="w-5 h-5 text-ai-pink" />
          Loop Space AI Organizer
        </h3>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onViewPlanner}
          className="text-sm bg-white/10 hover:bg-white/20 border-gray-700"
        >
          View Full Planner
        </Button>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <div className="flex flex-col justify-center items-center p-3 rounded-lg bg-white/5 border border-white/10">
          <div className="text-3xl font-bold">{completedTasks}</div>
          <div className="text-gray-400 text-sm">Completed Tasks</div>
        </div>
        
        <div className="flex flex-col justify-center items-center p-3 rounded-lg bg-white/5 border border-white/10">
          <div className="text-3xl font-bold">{totalTasks - completedTasks}</div>
          <div className="text-gray-400 text-sm">Pending Tasks</div>
        </div>
        
        <div className="flex flex-col justify-center items-center p-3 rounded-lg bg-white/5 border border-white/10">
          <div className="text-3xl font-bold">{completedGoals}</div>
          <div className="text-gray-400 text-sm">Achieved Goals</div>
        </div>
        
        <div className="flex flex-col justify-center items-center p-3 rounded-lg bg-white/5 border border-white/10">
          <div className="text-3xl font-bold">{dailyTasksWithStreaks.length}</div>
          <div className="text-gray-400 text-sm">Daily Streaks</div>
        </div>
      </div>
      
      {upcomingTasks.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium mb-2 text-gray-300">Upcoming Tasks</h4>
          <div className="space-y-2">
            {upcomingTasks.map(task => {
              const dueDate = new Date(task.dueDate || '');
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              dueDate.setHours(0, 0, 0, 0);
              
              const daysUntil = Math.round((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
              const dueText = daysUntil === 0 
                ? "Due today" 
                : daysUntil === 1 
                  ? "Due tomorrow" 
                  : `Due in ${daysUntil} days`;
                  
              return (
                <div key={task.id} className="flex justify-between items-center p-2 rounded bg-white/5 hover:bg-white/10 transition-colors">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${task.completed ? 'bg-green-500' : 'bg-ai-blue'}`}></div>
                    <span>{task.title}</span>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    daysUntil <= 1 ? 'bg-red-500/20 text-red-300' : 'bg-ai-blue/20 text-ai-blue'
                  }`}>
                    {dueText}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      {inProgressGoals.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium mb-2 text-gray-300">Goal Progress</h4>
          <div className="space-y-3">
            {inProgressGoals.map(goal => (
              <div key={goal.id} className="p-2 rounded bg-white/5">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm">{goal.title}</span>
                  <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">
                    {goal.type === 'daily' ? 'Daily' : goal.type === 'short' ? 'Short-term' : 'Long-term'}
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                    style={{ width: `${goal.progress}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs mt-1">
                  <span className="text-gray-400">{goal.completedSteps}/{goal.totalSteps} steps</span>
                  <span>{Math.round(goal.progress)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {dailyTasksWithStreaks.length > 0 && (
        <div>
          <h4 className="text-sm font-medium mb-2 text-gray-300 flex items-center gap-1">
            <ListTodo className="w-4 h-4 text-purple-400" />
            Daily Streaks
          </h4>
          <div className="space-y-2">
            {dailyTasksWithStreaks.map(task => (
              <div key={task.id} className="flex justify-between items-center p-2 rounded bg-white/5 hover:bg-white/10 transition-colors">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: task.color || '#9b87f5' }}></div>
                  <span>{task.name}</span>
                  {task.category && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-700/50 text-gray-300">
                      {task.category}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {task.timeOfDay && (
                    <span className="text-xs flex items-center">
                      <Clock className="w-3 h-3 mr-1 text-gray-400" />
                      {task.timeOfDay}
                    </span>
                  )}
                  <span className="flex items-center gap-1 text-xs bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full">
                    <CalendarCheck className="w-3 h-3" />
                    {task.streak} day{task.streak !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {upcomingTasks.length === 0 && inProgressGoals.length === 0 && dailyTasksWithStreaks.length === 0 && (
        <div className="text-center text-gray-400 py-3">
          <p>No upcoming tasks or goals. Start planning your activities!</p>
        </div>
      )}
    </motion.div>
  );
};

export default DashboardPlanner;

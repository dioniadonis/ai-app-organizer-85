
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import Planner from '@/components/Planner';
import DailyTasksTab, { DailyTask } from '@/components/planner/DailyTasksTab';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface PlannerTask {
  id: number;
  title: string;
  description?: string;
  dueDate?: string;
  completed: boolean;
  notify?: boolean;
  notifyInterval?: 'daily' | 'weekly' | '3days' | 'custom';
  priority?: 'low' | 'medium' | 'high';
}

interface PlannerGoal {
  id: number;
  title: string;
  description?: string;
  targetDate?: string;
  progress: number;
  completedSteps: number;
  totalSteps: number;
  type: 'daily' | 'short' | 'long';
}

interface PlannerContentProps {
  activeTab: string;
  setActiveTab: (value: string) => void;
  plannerData: {
    tasks: PlannerTask[];
    goals: PlannerGoal[];
    recurringTasks: any[];
    dailyTasks: DailyTask[];
  };
  setPlannerData: React.Dispatch<React.SetStateAction<{
    tasks: PlannerTask[];
    goals: PlannerGoal[];
    recurringTasks: any[];
    dailyTasks: DailyTask[];
  }>>;
}

const PlannerContent: React.FC<PlannerContentProps> = ({ 
  activeTab, 
  setActiveTab, 
  plannerData, 
  setPlannerData 
}) => {
  const handleTaskOperations = {
    onAddTask: (taskData: any) => {
      const newTasks = [...plannerData.tasks, {
        id: Date.now(),
        ...taskData,
        completed: false
      }];
      setPlannerData({
        ...plannerData,
        tasks: newTasks
      });
      return true;
    },
    onEditTask: (taskId: number, taskData: any) => {
      const taskIndex = plannerData.tasks.findIndex(t => t.id === taskId);
      if (taskIndex !== -1) {
        const updatedTasks = [...plannerData.tasks];
        updatedTasks[taskIndex] = {
          ...updatedTasks[taskIndex],
          ...taskData
        };
        setPlannerData({
          ...plannerData,
          tasks: updatedTasks
        });
        return true;
      }
      return false;
    },
    onDeleteTask: (taskId: number) => {
      setPlannerData({
        ...plannerData,
        tasks: plannerData.tasks.filter(t => t.id !== taskId)
      });
      return true;
    }
  };

  const handleGoalOperations = {
    onAddGoal: (goalData: any) => {
      const newGoals = [...plannerData.goals, {
        id: Date.now(),
        ...goalData,
        type: goalData.type || 'short',
        progress: 0,
        completedSteps: 0
      }];
      setPlannerData({
        ...plannerData,
        goals: newGoals
      });
      return true;
    },
    onEditGoal: (goalId: number, goalData: any) => {
      const goalIndex = plannerData.goals.findIndex(g => g.id === goalId);
      if (goalIndex !== -1) {
        const updatedGoals = [...plannerData.goals];
        updatedGoals[goalIndex] = {
          ...updatedGoals[goalIndex],
          ...goalData
        };
        setPlannerData({
          ...plannerData,
          goals: updatedGoals
        });
        return true;
      }
      return false;
    },
    onDeleteGoal: (goalId: number) => {
      setPlannerData({
        ...plannerData,
        goals: plannerData.goals.filter(g => g.id !== goalId)
      });
      return true;
    }
  };

  const handleDailyTaskOperations = {
    onAddTask: (taskData: Omit<DailyTask, 'id' | 'streak' | 'completed'>) => {
      setPlannerData({
        ...plannerData,
        dailyTasks: [...plannerData.dailyTasks, {
          id: Date.now(),
          ...taskData,
          completed: false,
          streak: 0
        }]
      });
    },
    onToggleComplete: (id: number) => {
      const taskIndex = plannerData.dailyTasks.findIndex(t => t.id === id);
      if (taskIndex === -1) return;

      const updatedTasks = [...plannerData.dailyTasks];
      const task = updatedTasks[taskIndex];
      const wasCompleted = task.completed;
      
      // Toggle completed status
      task.completed = !wasCompleted;
      
      // Update streak if it was just completed
      if (!wasCompleted) {
        const today = new Date().toISOString().split('T')[0];
        task.lastCompleted = today;
        task.streak = (task.streak || 0) + 1;
      }
      
      setPlannerData({
        ...plannerData,
        dailyTasks: updatedTasks
      });
    },
    onEditTask: (id: number, taskData: Partial<DailyTask>) => {
      const taskIndex = plannerData.dailyTasks.findIndex(t => t.id === id);
      if (taskIndex === -1) return;

      const updatedTasks = [...plannerData.dailyTasks];
      updatedTasks[taskIndex] = {
        ...updatedTasks[taskIndex],
        ...taskData
      };
      
      setPlannerData({
        ...plannerData,
        dailyTasks: updatedTasks
      });
    },
    onDeleteTask: (id: number) => {
      setPlannerData({
        ...plannerData,
        dailyTasks: plannerData.dailyTasks.filter(t => t.id !== id)
      });
    },
    onResetStreak: (id: number) => {
      const taskIndex = plannerData.dailyTasks.findIndex(t => t.id === id);
      if (taskIndex === -1) return;

      const updatedTasks = [...plannerData.dailyTasks];
      updatedTasks[taskIndex] = {
        ...updatedTasks[taskIndex],
        streak: 0,
        lastCompleted: undefined
      };
      
      setPlannerData({
        ...plannerData,
        dailyTasks: updatedTasks
      });
    }
  };

  return (
    <motion.div 
      className="bg-gray-800/20 rounded-xl p-6 shadow-lg border border-gray-700"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.3 }}
    >
      <div className="flex justify-between items-center mb-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-gray-800/40 rounded-lg p-1">
            <TabsTrigger 
              value="tasks" 
              className="data-[state=active]:bg-purple-600 data-[state=active]:text-white rounded-md"
            >
              Tasks
            </TabsTrigger>
            <TabsTrigger 
              value="goals" 
              className="data-[state=active]:bg-purple-600 data-[state=active]:text-white rounded-md"
            >
              Goals
            </TabsTrigger>
            <TabsTrigger 
              value="dailyTasks" 
              className="data-[state=active]:bg-purple-600 data-[state=active]:text-white rounded-md"
            >
              Daily Tasks
            </TabsTrigger>
          </TabsList>
        </Tabs>
        
        <Button 
          className="bg-purple-600 hover:bg-purple-700 bg-opacity-70"
          onClick={() => {
            if (activeTab === 'tasks') {
              const dummyTask = {
                title: "New Task",
                description: "",
                dueDate: new Date().toISOString().split('T')[0],
                priority: "medium"
              };
              handleTaskOperations.onAddTask(dummyTask);
            } else if (activeTab === 'goals') {
              const dummyGoal = {
                title: "New Goal",
                description: "",
                targetDate: new Date().toISOString().split('T')[0],
                totalSteps: 3,
                type: "short"
              };
              handleGoalOperations.onAddGoal(dummyGoal);
            }
          }}
          style={{ display: activeTab === 'dailyTasks' ? 'none' : 'flex' }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add New {activeTab === 'tasks' ? 'Task' : 'Goal'}
        </Button>
      </div>
      
      <div>
        {activeTab === 'tasks' && 
          <Planner 
            activeTab={activeTab}
            {...handleTaskOperations}
            {...handleGoalOperations}
          />
        }
        {activeTab === 'goals' && 
          <Planner 
            activeTab={activeTab}
            {...handleTaskOperations}
            {...handleGoalOperations}
          />
        }
        {activeTab === 'dailyTasks' && 
          <DailyTasksTab 
            tasks={plannerData.dailyTasks || []}
            {...handleDailyTaskOperations}
          />
        }
      </div>
    </motion.div>
  );
};

export default PlannerContent;


import React from 'react';
import { motion } from 'framer-motion';
import PlannerWidget from '../PlannerWidget';
import ExpensesWidget from '../ExpensesWidget';

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

interface DashboardWidgetsProps {
  widgetLayout: 'grid' | 'list';
  activeWidgets: {
    planner: boolean;
    expenses: boolean;
    renewals: boolean;
    categories: boolean;
  };
  tasks: Task[];
  goals: Goal[];
  expenses: any[];
  totalExpenses: number;
  monthlyExpenses: number;
  unpaidTotal: number;
  onViewPlanner: () => void;
  onToggleTaskComplete: (taskId: string | number) => void;
  onEditTask: (task: any) => void;
  onEditGoal: (goal: any) => void;
  onAddExpense: () => void;
  onViewAllExpenses: () => void;
}

const DashboardWidgets: React.FC<DashboardWidgetsProps> = ({
  widgetLayout,
  activeWidgets,
  tasks,
  goals,
  expenses,
  totalExpenses,
  monthlyExpenses,
  unpaidTotal,
  onViewPlanner,
  onToggleTaskComplete,
  onEditTask,
  onEditGoal,
  onAddExpense,
  onViewAllExpenses
}) => {
  return (
    <div className={`grid ${widgetLayout === 'grid' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'} gap-6 mb-8`}>
      {activeWidgets.planner && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <PlannerWidget 
            tasks={tasks} 
            goals={goals} 
            onViewMore={onViewPlanner}
            onToggleTaskComplete={onToggleTaskComplete}
            onEditTask={onEditTask}
            onEditGoal={onEditGoal}
          />
        </motion.div>
      )}
      
      {activeWidgets.expenses && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <ExpensesWidget 
            expenses={expenses}
            totalExpenses={totalExpenses} 
            monthlyExpenses={monthlyExpenses}
            unpaidTotal={unpaidTotal}
            onAddExpense={onAddExpense}
            onViewAllExpenses={onViewAllExpenses}
          />
        </motion.div>
      )}
    </div>
  );
};

export default DashboardWidgets;


import { AITool } from './AITool';

export interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate?: string;
  completed: boolean;
  notify: boolean;
}

export interface Goal {
  id: string;
  title: string;
  targetDate?: string;
  progress: number;
  completedSteps: number;
  totalSteps: number;
  type: 'daily' | 'short' | 'long';
}

export interface Renewal {
  id: string;
  name: string;
  category: string;
  subscriptionCost: number;
  renewalDate: string;
  isPaid?: boolean;
  isExpense?: boolean;
  frequency?: string;
}

export interface Insight {
  title: string;
  description: string;
  icon: React.ReactNode;
  action: () => void;
  color: string;
}

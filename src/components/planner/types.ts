
export interface DailyTask {
  id: number;
  name: string;
  completed: boolean;
  timeOfDay?: string;
  streak: number;
  lastCompleted?: string;
  color?: string;
  category?: string;
}

export interface TimeIncrementOption {
  label: string;
  value: number;
}

export const CATEGORIES = [
  'Morning Routine',
  'Work',
  'Health',
  'Learning',
  'Evening Routine',
  'Wellness',
  'Productivity',
  'Personal',
  'Custom'
];

export const COLORS = [
  '#9b87f5', // Primary Purple
  '#6E56CF', // Vivid Purple
  '#0EA5E9', // Ocean Blue
  '#1EAEDB', // Bright Blue
  '#33C3F0', // Sky Blue
  '#D6BCFA', // Light Purple
  '#F97316', // Bright Orange
  '#D946EF' // Magenta Pink
];

export const getTaskCategoryBadgeClass = (category?: string) => {
  switch (category) {
    case 'Morning Routine':
      return 'bg-blue-500/20 text-blue-300 border-blue-500/50';
    case 'Work':
      return 'bg-purple-500/20 text-purple-300 border-purple-500/50';
    case 'Health':
      return 'bg-green-500/20 text-green-300 border-green-500/50';
    case 'Learning':
      return 'bg-orange-500/20 text-orange-300 border-orange-500/50';
    case 'Evening Routine':
      return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/50';
    case 'Wellness':
      return 'bg-pink-500/20 text-pink-300 border-pink-500/50';
    case 'Productivity':
      return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50';
    default:
      return 'bg-gray-500/20 text-gray-300 border-gray-500/50';
  }
};

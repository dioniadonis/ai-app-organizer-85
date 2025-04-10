
import { AITool } from './AITool';
import { Dispatch, SetStateAction } from 'react';

export interface FilterBarProps {
  selectedCategories: string[];
  filterByRenewal: boolean;
  clearFilters: () => void;
  handleCategoryToggle: (category: string) => void;
  setFilterByRenewal: (value: boolean) => void;
}

export interface MobileMenuProps {
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  view: 'dashboard' | 'list';
  setView: (view: 'dashboard' | 'list') => void;
  clearFilters: () => void;
  navigateToPlanner: () => void;
  setShowAIDialog: (show: boolean) => void;
  showAddForm: boolean;
  setShowAddForm: (show: boolean) => void;
}

export interface HeaderProps extends MobileMenuProps, FilterBarProps {
  isMobile: boolean;
}

export interface AddFormProps {
  newTool: Omit<AITool, 'id' | 'isFavorite' | 'isPaid'>;
  handleInputChange: (field: keyof Omit<AITool, 'id' | 'isFavorite' | 'isPaid'>, value: string | number) => void;
  customCategory: string;
  setCustomCategory: (category: string) => void;
  showCustomCategoryInput: boolean;
  setShowCustomCategoryInput: (show: boolean) => void;
  customCategories: string[];
  allCategoriesForSelect: string[];
  handleAddCustomCategory: () => void;
  handleAddTool: () => void;
}

export interface AIToolCardProps {
  tool: AITool;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onTogglePaid: (id: string) => void;
  isEditing: boolean;
}

export interface DashboardProps {
  aiTools: AITool[];
  tasks: any[];
  goals: any[];
  selectedCategories: string[];
  filterByRenewal: boolean;
  handleRenewalFilter: () => void;
  handleCategoryToggle: (category: string) => void;
  customCategories: string[];
  navigateToPlanner: () => void;
  setShowAddForm: (show: boolean) => void;
  expandedCategories?: string[];
  toggleCategoryExpansion?: (category: string) => void;
  confirmCategoryDelete?: (category: string) => void;
  setShowAIDialog?: (show: boolean) => void;
}

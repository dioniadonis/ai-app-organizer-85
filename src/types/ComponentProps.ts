
import { AITool } from './AITool';

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

export interface HeaderProps extends MobileMenuProps, FilterBarProps {}

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

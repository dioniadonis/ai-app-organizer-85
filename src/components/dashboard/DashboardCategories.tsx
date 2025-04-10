
import React from 'react';
import { motion } from 'framer-motion';

interface DashboardCategoriesProps {
  categoryItems: React.ReactNode[];
  selectedCategories: string[];
  onCategoryClear: () => void;
  containerVariants: any;
}

const DashboardCategories: React.FC<DashboardCategoriesProps> = ({
  categoryItems,
  selectedCategories,
  onCategoryClear,
  containerVariants
}) => {
  if (categoryItems.length === 0) return null;

  return (
    <motion.div variants={containerVariants} className="bg-gray-800/50 border border-gray-700/50 p-4 rounded-xl mb-8 overflow-x-auto">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-medium">Categories</h3>
        {selectedCategories.length > 0 && (
          <button 
            onClick={onCategoryClear}
            className="text-xs text-gray-400 hover:text-white"
          >
            Clear all
          </button>
        )}
      </div>
      <div className="flex flex-wrap gap-2 min-w-max">
        {categoryItems}
      </div>
    </motion.div>
  );
};

export default DashboardCategories;

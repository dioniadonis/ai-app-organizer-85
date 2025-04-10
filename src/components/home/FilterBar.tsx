
import React from 'react';
import { ArrowLeft, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FilterBarProps } from '@/types/ComponentProps';

const FilterBar: React.FC<FilterBarProps> = ({ 
  selectedCategories, 
  filterByRenewal, 
  clearFilters, 
  handleCategoryToggle, 
  setFilterByRenewal 
}) => (
  <div className="flex items-center gap-2 text-sm">
    <Button 
      variant="outline" 
      size="sm" 
      onClick={clearFilters} 
      className="h-8 px-2 gap-1 border-gray-700 hover:bg-gray-800"
    >
      <ArrowLeft className="w-3 h-3" />
      Back to All
    </Button>
    
    <span className="text-gray-400">Active Filters:</span>
    
    {selectedCategories.map(category => (
      <span 
        key={category} 
        className="bg-ai-purple/20 text-ai-purple rounded-full px-3 py-1 flex items-center gap-1 cursor-pointer" 
        onClick={() => handleCategoryToggle(category)}
      >
        {category === 'Favorites' ? 'Favorites' : category}
        <XCircle className="w-3 h-3" />
      </span>
    ))}
    
    {filterByRenewal && (
      <span 
        className="bg-ai-pink/20 text-ai-pink rounded-full px-3 py-1 flex items-center gap-1 cursor-pointer" 
        onClick={() => setFilterByRenewal(false)}
      >
        Upcoming Renewals
        <XCircle className="w-3 h-3" />
      </span>
    )}
  </div>
);

export default FilterBar;

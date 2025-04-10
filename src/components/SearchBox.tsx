
import React, { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { AITool } from '@/types/AITool';
import { Button } from './ui/button';
import { useNavigate } from 'react-router-dom';

interface SearchResult {
  id: string;
  title: string;
  type: 'expense' | 'task' | 'goal';
  category?: string;
  dueDate?: string;
  cost?: number;
}

interface SearchBoxProps {
  onSearch?: (term: string) => void;
  className?: string;
  aiTools?: AITool[];
  tasks?: any[];
  goals?: any[];
}

const SearchBox: React.FC<SearchBoxProps> = ({ 
  onSearch, 
  className, 
  aiTools = [], 
  tasks = [], 
  goals = []
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Handle click outside to close results
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Search functionality
  useEffect(() => {
    if (searchTerm.trim().length < 1) {
      setSearchResults([]);
      return;
    }

    const term = searchTerm.toLowerCase();
    const results: SearchResult[] = [];

    // Search in expenses
    aiTools.forEach(tool => {
      if (tool.name.toLowerCase().includes(term) || 
          tool.description.toLowerCase().includes(term) ||
          tool.category.toLowerCase().includes(term)) {
        results.push({
          id: tool.id,
          title: tool.name,
          type: 'expense',
          category: tool.category,
          cost: tool.subscriptionCost
        });
      }
    });

    // Search in tasks
    tasks.forEach(task => {
      if (task.title.toLowerCase().includes(term) || 
         (task.description && task.description.toLowerCase().includes(term))) {
        results.push({
          id: task.id,
          title: task.title,
          type: 'task',
          dueDate: task.dueDate
        });
      }
    });

    // Search in goals
    goals.forEach(goal => {
      if (goal.title.toLowerCase().includes(term) || 
         (goal.description && goal.description.toLowerCase().includes(term))) {
        results.push({
          id: goal.id,
          title: goal.title,
          type: 'goal',
          dueDate: goal.targetDate
        });
      }
    });

    setSearchResults(results);
  }, [searchTerm, aiTools, tasks, goals]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    setShowResults(value.trim().length > 0);
    if (onSearch) onSearch(value);
  };

  const handleClear = () => {
    setSearchTerm('');
    setShowResults(false);
    if (onSearch) onSearch('');
  };

  const handleResultClick = (result: SearchResult) => {
    setShowResults(false);
    
    // Navigate based on result type
    if (result.type === 'expense') {
      // Filter to the specific expense
      navigate('/');
      // We'll let the main page handle the filtering
    } else if (result.type === 'task' || result.type === 'goal') {
      navigate('/planner');
      // The planner page will handle showing tasks/goals
    }
  };

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input 
          value={searchTerm}
          onChange={handleChange}
          placeholder="Search expenses, tasks, goals..."
          className="pl-10 pr-10 bg-gray-700/50 border-gray-600 rounded-lg text-white h-9"
          onFocus={() => setShowResults(searchTerm.trim().length > 0)}
        />
        {searchTerm && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 hover:text-white"
            onClick={handleClear}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {showResults && searchResults.length > 0 && (
        <div className="absolute z-50 mt-1 w-full max-h-[70vh] overflow-y-auto rounded-md bg-gray-800/95 backdrop-blur-sm border border-gray-700 shadow-lg">
          <div className="py-2">
            {searchResults.map((result) => (
              <div 
                key={`${result.type}-${result.id}`}
                className="px-4 py-2 hover:bg-gray-700/70 cursor-pointer flex items-center"
                onClick={() => handleResultClick(result)}
              >
                <div className="mr-3">
                  {result.type === 'expense' && (
                    <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                      <span className="text-blue-400 text-xs">$</span>
                    </div>
                  )}
                  {result.type === 'task' && (
                    <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                      <span className="text-green-400 text-xs">T</span>
                    </div>
                  )}
                  {result.type === 'goal' && (
                    <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                      <span className="text-purple-400 text-xs">G</span>
                    </div>
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="text-white font-medium">{result.title}</span>
                  <div className="text-xs text-gray-400 flex items-center space-x-2">
                    <span className="capitalize">{result.type}</span>
                    {result.category && <span>• {result.category}</span>}
                    {result.cost !== undefined && <span>• ${result.cost}/mo</span>}
                    {result.dueDate && <span>• Due: {result.dueDate}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBox;

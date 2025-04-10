
import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface SearchBoxProps {
  onSearch: (term: string) => void;
  className?: string;
}

const SearchBox: React.FC<SearchBoxProps> = ({ onSearch, className }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    onSearch(value);
  };

  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
      <Input 
        value={searchTerm}
        onChange={handleChange}
        placeholder="Search"
        className="pl-10 bg-gray-700/50 border-gray-600 rounded-lg text-white"
      />
    </div>
  );
};

export default SearchBox;

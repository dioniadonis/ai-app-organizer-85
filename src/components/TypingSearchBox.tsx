
import React, { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface TypingSearchBoxProps {
  onSearch: (term: string) => void;
  className?: string;
}

const TypingSearchBox: React.FC<TypingSearchBoxProps> = ({ onSearch, className }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [placeholderText, setPlaceholderText] = useState('Search');
  const searchOptions = ['Search', 'Search tasks...', 'Search goals...', 'Search expenses...'];
  const currentIndexRef = useRef(0);
  const isTypingRef = useRef(true);
  const textIndexRef = useRef(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      if (isTypingRef.current) {
        // Typing forward
        const currentOption = searchOptions[currentIndexRef.current];
        if (textIndexRef.current < currentOption.length) {
          textIndexRef.current += 1;
          setPlaceholderText(currentOption.substring(0, textIndexRef.current));
        } else {
          // Reached end of current text
          isTypingRef.current = false;
          setTimeout(() => {
            isTypingRef.current = false;
          }, 1500); // Pause at full text
        }
      } else {
        // Backspacing
        if (textIndexRef.current > 0) {
          textIndexRef.current -= 1;
          setPlaceholderText(searchOptions[currentIndexRef.current].substring(0, textIndexRef.current));
        } else {
          // Move to next option
          currentIndexRef.current = (currentIndexRef.current + 1) % searchOptions.length;
          isTypingRef.current = true;
        }
      }
    }, 100); // Controls typing speed
  
    return () => clearInterval(interval);
  }, []);
  
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
        placeholder={placeholderText}
        className="pl-10 bg-gray-700/50 border-gray-600 rounded-lg text-white"
      />
    </div>
  );
};

export default TypingSearchBox;

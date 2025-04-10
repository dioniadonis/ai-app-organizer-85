
import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface SearchBoxProps {
  onSearch: (term: string) => void;
  className?: string;
}

const SearchBox: React.FC<SearchBoxProps> = ({ onSearch, className }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [startTyping, setStartTyping] = useState(true);
  
  const placeholders = [
    'Search expenses...',
    'Search tasks...',
    'Search goals...',
  ];

  useEffect(() => {
    const textAnimation = () => {
      const currentPlaceholder = placeholders[placeholderIndex];
      
      if (startTyping) {
        if (displayText === currentPlaceholder) {
          // Finished typing current text, wait before deleting
          setTimeout(() => {
            setIsDeleting(true);
            setStartTyping(false);
          }, 2000);
          return;
        }
        
        // Add next character
        setDisplayText(currentPlaceholder.substring(0, displayText.length + 1));
        setTimeout(textAnimation, 150);
      } else if (isDeleting) {
        if (displayText === '') {
          // Finished deleting, move to next placeholder
          setIsDeleting(false);
          setStartTyping(true);
          setPlaceholderIndex((placeholderIndex + 1) % placeholders.length);
          return;
        }
        
        // Remove last character
        setDisplayText(displayText.substring(0, displayText.length - 1));
        setTimeout(textAnimation, 100);
      }
    };

    const animationTimeout = setTimeout(textAnimation, 500);
    return () => clearTimeout(animationTimeout);
  }, [displayText, isDeleting, placeholderIndex, startTyping, placeholders]);

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
        placeholder={displayText}
        className="pl-10 bg-gray-700/50 border-gray-600 rounded-lg text-white"
      />
    </div>
  );
};

export default SearchBox;

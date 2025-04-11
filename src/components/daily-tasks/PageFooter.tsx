
import React from 'react';
import { ChevronLeft, ChevronRight, Home, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';

interface PageFooterProps {
  handlePreviousDay: () => void;
  handleNextDay: () => void;
  navigate: ReturnType<typeof useNavigate>;
}

const PageFooter: React.FC<PageFooterProps> = ({
  handlePreviousDay,
  handleNextDay,
  navigate
}) => {
  const isMobile = useIsMobile();

  return (
    <div className="fixed bottom-0 left-0 right-0 flex justify-center p-4 bg-gray-900/90 border-t border-gray-800">
      <div className="flex gap-2">
        <Button 
          onClick={handlePreviousDay} 
          variant="outline" 
          size={isMobile ? "sm" : "default"}
          className="bg-gray-800/50 border-gray-700 text-blue-400"
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Previous
        </Button>
        
        <Button
          onClick={() => navigate('/')}
          variant="outline"
          size={isMobile ? "sm" : "default"}
          className="bg-gray-800/50 border-gray-700 text-blue-400"
        >
          <Home className="mr-1 h-4 w-4" />
          Home
        </Button>
        
        <Button
          onClick={() => navigate('/planner?tab=dailyTasks')}
          variant="outline"
          size={isMobile ? "sm" : "default"}
          className="bg-gray-800/50 border-gray-700 text-purple-400"
        >
          <Calendar className="mr-1 h-4 w-4" />
          Manage Tasks
        </Button>
        
        <Button 
          onClick={handleNextDay} 
          variant="outline" 
          size={isMobile ? "sm" : "default"}
          className="bg-gray-800/50 border-gray-700 text-blue-400"
        >
          Next
          <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default PageFooter;

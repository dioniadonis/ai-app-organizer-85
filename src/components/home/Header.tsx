
import React from 'react';
import { Grid, Calendar, MessageSquareDot, PlusCircle, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import HolographicTitle from '../HolographicTitle';
import MobileMenu from './MobileMenu';
import FilterBar from './FilterBar';
import { HeaderProps } from '@/types/ComponentProps';

const Header: React.FC<HeaderProps> = ({ 
  isMobile, 
  mobileMenuOpen, 
  setMobileMenuOpen, 
  view, 
  setView, 
  clearFilters, 
  navigateToPlanner, 
  setShowAIDialog, 
  showAddForm, 
  setShowAddForm, 
  selectedCategories, 
  filterByRenewal, 
  handleCategoryToggle, 
  setFilterByRenewal 
}) => (
  <header className="mb-8">
    <HolographicTitle title="Loop Space AI Organizer" />
    <p className="text-center text-gray-400 mb-6">
      Organize, track, and manage your expenses in one place
    </p>
    
    {isMobile ? (
      <div className="mb-6">
        <MobileMenu 
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
          view={view}
          setView={setView}
          clearFilters={clearFilters}
          navigateToPlanner={navigateToPlanner}
          setShowAIDialog={setShowAIDialog}
          showAddForm={showAddForm}
          setShowAddForm={setShowAddForm}
        />
      </div>
    ) : (
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
        <div className="flex gap-2">
          <Button 
            variant={view === 'dashboard' ? 'default' : 'outline'} 
            onClick={() => {
              setView('dashboard');
              clearFilters();
            }} 
            className={view === 'dashboard' ? 'bg-ai-purple hover:bg-ai-purple/90' : 'border-gray-700'}
          >
            <LayoutDashboard className="w-4 h-4 mr-2" />
            Dashboard
          </Button>
          <Button 
            variant={view === 'list' ? 'default' : 'outline'} 
            onClick={() => setView('list')} 
            className={view === 'list' ? 'bg-ai-purple hover:bg-ai-purple/90' : 'border-gray-700'}
          >
            <Grid className="w-4 h-4 mr-2" />
            List View
          </Button>
          <Button 
            variant="outline" 
            onClick={navigateToPlanner} 
            className="border-ai-pink bg-ai-pink/10 text-ai-pink hover:bg-ai-pink/20"
          >
            <Calendar className="w-4 h-4 mr-2" />
            Planner
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setShowAIDialog(true)} 
            className="border-ai-cyan bg-ai-cyan/10 text-ai-cyan hover:bg-ai-cyan/20"
          >
            <MessageSquareDot className="w-4 h-4 mr-2" />
            AI Assistant
          </Button>
        </div>
        
        <div className="w-full sm:w-auto">
          <Button 
            variant="outline" 
            onClick={() => setShowAddForm(!showAddForm)} 
            className="w-full sm:w-auto bg-ai-blue/20 text-ai-blue hover:bg-ai-blue/30 hover:text-ai-blue border-ai-blue/50"
          >
            <PlusCircle className="w-4 h-4 mr-2" />
            {showAddForm ? 'Cancel' : 'Add Expense'}
          </Button>
        </div>
      </div>
    )}
    
    <div className="space-y-4">
      {(selectedCategories.length > 0 || filterByRenewal) && (
        <FilterBar 
          selectedCategories={selectedCategories}
          filterByRenewal={filterByRenewal}
          clearFilters={clearFilters}
          handleCategoryToggle={handleCategoryToggle}
          setFilterByRenewal={setFilterByRenewal}
        />
      )}
    </div>
  </header>
);

export default Header;

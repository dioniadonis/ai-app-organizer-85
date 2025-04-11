
import React from 'react';
import { Grid, Calendar, MessageSquareDot, PlusCircle, Menu, X, LayoutDashboard, ListTodo } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { MobileMenuProps } from '@/types/ComponentProps';

const MobileMenu: React.FC<MobileMenuProps> = ({ 
  mobileMenuOpen, 
  setMobileMenuOpen, 
  view, 
  setView, 
  clearFilters, 
  navigateToPlanner,
  navigateToDailyTasks,
  setShowAIDialog, 
  showAddForm, 
  setShowAddForm 
}) => (
  <Collapsible 
    open={mobileMenuOpen} 
    onOpenChange={setMobileMenuOpen}
    className="w-full"
  >
    <div className="flex justify-between items-center">
      <div className="flex gap-2 overflow-x-auto pb-2 max-w-[75%] scrollbar-thin">
        <Button 
          variant={view === 'dashboard' ? 'default' : 'outline'} 
          onClick={() => {
            setView('dashboard');
            clearFilters();
          }} 
          className={cn(
            "whitespace-nowrap min-w-fit", 
            view === 'dashboard' ? 'bg-ai-purple hover:bg-ai-purple/90' : 'border-gray-700'
          )}
        >
          <LayoutDashboard className="w-4 h-4 mr-2" />
          Dashboard
        </Button>
        
        <Button 
          variant={view === 'list' ? 'default' : 'outline'} 
          onClick={() => setView('list')} 
          className={cn(
            "whitespace-nowrap min-w-fit",
            view === 'list' ? 'bg-ai-purple hover:bg-ai-purple/90' : 'border-gray-700'
          )}
        >
          <Grid className="w-4 h-4 mr-2" />
          List View
        </Button>
      </div>

      <CollapsibleTrigger asChild>
        <Button size="sm" variant="ghost" className="px-2">
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </CollapsibleTrigger>
    </div>

    <CollapsibleContent className="space-y-2 mt-2">
      <Button 
        variant="outline" 
        onClick={navigateToPlanner} 
        className="border-ai-pink bg-ai-pink/10 text-ai-pink hover:bg-ai-pink/20 w-full justify-start"
      >
        <Calendar className="w-4 h-4 mr-2" />
        Planner
      </Button>
      
      <Button 
        variant="outline" 
        onClick={navigateToDailyTasks} 
        className="border-ai-cyan bg-ai-cyan/10 text-ai-cyan hover:bg-ai-cyan/20 w-full justify-start"
      >
        <ListTodo className="w-4 h-4 mr-2" />
        Daily Tasks
      </Button>
      
      <Button 
        variant="outline" 
        onClick={() => setShowAIDialog(true)} 
        className="border-ai-cyan bg-ai-cyan/10 text-ai-cyan hover:bg-ai-cyan/20 w-full justify-start"
      >
        <MessageSquareDot className="w-4 h-4 mr-2" />
        AI Assistant
      </Button>
      
      <Button 
        variant="outline" 
        onClick={() => setShowAddForm(!showAddForm)} 
        className="w-full bg-ai-blue/20 text-ai-blue hover:bg-ai-blue/30 hover:text-ai-blue border-ai-blue/50 justify-start"
      >
        <PlusCircle className="w-4 h-4 mr-2" />
        {showAddForm ? 'Cancel' : 'Add Expense'}
      </Button>
    </CollapsibleContent>
  </Collapsible>
);

export default MobileMenu;

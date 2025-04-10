import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusCircle, Grid, ChevronDown, ChevronUp, ArrowLeft, Trash2, ExternalLink, CheckCircle, XCircle, MessageSquareDot, Calendar, Menu, X, LayoutDashboard, Layout } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import AIToolCard from '@/components/AIToolCard';
import EditableAIToolCard from '@/components/EditableAIToolCard';
import Dashboard from '@/components/Dashboard';
import { AITool } from '@/types/AITool';
import { cn } from '@/lib/utils';
import { getAIToolIcon } from '@/utils/iconUtils';
import { toast } from '@/components/ui/use-toast';
import HolographicTitle from '@/components/HolographicTitle';
import { useNavigate } from 'react-router-dom';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useIsMobile } from '@/hooks/use-mobile';
import { DatePicker } from '@/components/ui/date-picker';

// Types
import { 
  AddFormProps, 
  HeaderProps, 
  MobileMenuProps,
  FilterBarProps
} from '@/types/ComponentProps';

const initialAITools: AITool[] = [];

interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate?: string;
  completed: boolean;
  notify: boolean;
}

interface Goal {
  id: string;
  title: string;
  targetDate?: string;
  progress: number;
  completedSteps: number;
  totalSteps: number;
  type: 'daily' | 'short' | 'long';
}

// Component for the Filter Bar
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

// Component for Mobile Menu
const MobileMenu: React.FC<MobileMenuProps> = ({ 
  mobileMenuOpen, 
  setMobileMenuOpen, 
  view, 
  setView, 
  clearFilters, 
  navigateToPlanner, 
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
        {showAddForm ? 'Cancel' : 'Add New Expense'}
      </Button>
    </CollapsibleContent>
  </Collapsible>
);

// Component for the Header
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
      Organize, track, and manage your subscriptions in one place
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
            {showAddForm ? 'Cancel' : 'Add New Expense'}
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

// Add Form Component
const AddForm: React.FC<AddFormProps> = ({
  newTool,
  handleInputChange,
  customCategory,
  setCustomCategory,
  showCustomCategoryInput,
  setShowCustomCategoryInput,
  customCategories,
  allCategoriesForSelect,
  handleAddCustomCategory,
  handleAddTool
}) => (
  <motion.div 
    initial={{
      opacity: 0,
      height: 0
    }} 
    animate={{
      opacity: 1,
      height: 'auto'
    }} 
    exit={{
      opacity: 0,
      height: 0
    }} 
    transition={{
      duration: 0.3
    }} 
    className="mb-8 p-5 rounded-xl glass-card"
  >
    <h2 className="text-xl font-semibold mb-4 ai-gradient-text">Add New Expense</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label htmlFor="new-name" className="block text-sm font-medium text-gray-300 mb-1">
          Name <span className="text-red-400">*</span>
        </label>
        <Input 
          id="new-name" 
          value={newTool.name} 
          onChange={e => handleInputChange('name', e.target.value)} 
          className="bg-black/20 text-white border-gray-700 focus:border-ai-purple" 
          placeholder="Subscription Name" 
        />
      </div>

      <div>
        <label htmlFor="new-category" className="block text-sm font-medium text-gray-300 mb-1">
          Category
        </label>
        {showCustomCategoryInput ? (
          <div className="flex gap-2">
            <Input 
              id="custom-category" 
              value={customCategory}
              onChange={e => setCustomCategory(e.target.value)}
              className="bg-black/20 text-white border-gray-700 focus:border-ai-purple flex-1"
              placeholder="New Category Name"
            />
            <Button 
              variant="outline" 
              size="icon" 
              onClick={handleAddCustomCategory}
              className="border-green-500 text-green-500 hover:bg-green-500/20"
            >
              <CheckCircle className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => setShowCustomCategoryInput(false)}
              className="border-red-500 text-red-500 hover:bg-red-500/20"
            >
              <XCircle className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="flex gap-2">
            <Select 
              value={newTool.category} 
              onValueChange={value => handleInputChange('category', value)}
            >
              <SelectTrigger className="bg-black/20 text-white border-gray-700 focus:border-ai-purple flex-1">
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent>
                {["General AI", "Writing", "Image Generation", "Code Generation", "Chatbots", "Video Generation", ...customCategories].map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => setShowCustomCategoryInput(true)}
              className="border-blue-500 text-blue-500 hover:bg-blue-500/20"
            >
              <PlusCircle className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      <div>
        <label htmlFor="new-cost" className="block text-sm font-medium text-gray-300 mb-1">
          Monthly Cost
        </label>
        <Input 
          id="new-cost" 
          type="number" 
          min="0" 
          step="0.01" 
          value={newTool.subscriptionCost} 
          onChange={e => handleInputChange('subscriptionCost', parseFloat(e.target.value) || 0)}
          className="bg-black/20 text-white border-gray-700 focus:border-ai-purple"
          placeholder="0.00"
        />
      </div>

      <div>
        <label htmlFor="new-renewal" className="block text-sm font-medium text-gray-300 mb-1">
          Renewal Date {newTool.subscriptionCost > 0 && <span className="text-red-400">*</span>}
        </label>
        <DatePicker
          date={newTool.renewalDate ? new Date(newTool.renewalDate) : undefined}
          onDateChange={(date) => {
            if (date) {
              handleInputChange('renewalDate', date.toISOString().split('T')[0]);
            } else {
              handleInputChange('renewalDate', '');
            }
          }}
          showLabel={false}
          className="w-full"
          placeholder="Select renewal date"
        />
      </div>

      <div>
        <label htmlFor="new-website" className="block text-sm font-medium text-gray-300 mb-1">
          Website URL
        </label>
        <Input 
          id="new-website" 
          value={newTool.website} 
          onChange={e => handleInputChange('website', e.target.value)}
          className="bg-black/20 text-white border-gray-700 focus:border-ai-purple"
          placeholder="https://example.com"
        />
      </div>

      <div className="md:col-span-2">
        <label htmlFor="new-description" className="block text-sm font-medium text-gray-300 mb-1">
          Description <span className="text-red-400">*</span>
        </label>
        <Textarea 
          id="new-description" 
          value={newTool.description} 
          onChange={e => handleInputChange('description', e.target.value)}
          className="bg-black/20 text-white border-gray-700 focus:border-ai-purple min-h-[100px]"
          placeholder="Add details about this subscription"
        />
      </div>

      <div className="md:col-span-2 flex justify-end">
        <Button 
          onClick={handleAddTool}
          className="bg-ai-blue hover:bg-ai-blue/90 text-white"
        >
          Add Subscription
        </Button>
      </div>
    </div>
  </motion.div>
);

// Main component
const Index = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [aiTools, setAiTools] = useState<AITool[]>(() => {
    if (typeof window !== 'undefined') {
      const savedTools = localStorage.getItem('aiTools');
      return savedTools ? JSON.parse(savedTools) : initialAITools;
    }
    return initialAITools;
  });
  const [tasks, setTasks] = useState<Task[]>(() => {
    if (typeof window !== 'undefined') {
      const savedTasks = localStorage.getItem('tasks');
      return savedTasks ? JSON.parse(savedTasks) : [];
    }
    return [];
  });
  const [goals, setGoals] = useState<Goal[]>(() => {
    if (typeof window !== 'undefined') {
      const savedGoals = localStorage.getItem('goals');
      return savedGoals ? JSON.parse(savedGoals) : [];
    }
    return [];
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTool, setNewTool] = useState<Omit<AITool, 'id' | 'isFavorite' | 'isPaid'>>({
    name: '',
    description: '',
    category: 'General AI',
    subscriptionCost: 0,
    renewalDate: '',
    website: ''
  });
  const [isDragging, setIsDragging] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['Favorites']);
  const [editedTools, setEditedTools] = useState<{
    [id: string]: Partial<AITool>;
  }>({});
  const [view, setView] = useState<'dashboard' | 'list'>('dashboard');
  const [customCategory, setCustomCategory] = useState('');
  const [showCustomCategoryInput, setShowCustomCategoryInput] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [toolToDelete, setToolToDelete] = useState<string | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [filterByRenewal, setFilterByRenewal] = useState<boolean>(false);
  const [showCategoryDeleteConfirm, setShowCategoryDeleteConfirm] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);

  const [showAIDialog, setShowAIDialog] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [customCategories, setCustomCategories] = useState<string[]>(() => {
    const defaultCategories = ["General AI", "Writing", "Image Generation", "Code Generation", "Chatbots", "Video Generation"];
    const allCategories = Array.from(new Set(aiTools.map(tool => tool.category)));
    return allCategories.filter(cat => !defaultCategories.includes(cat));
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('aiTools', JSON.stringify(aiTools));
    }
    const defaultCategories = ["General AI", "Writing", "Image Generation", "Code Generation", "Chatbots", "Video Generation"];
    const allCategories = Array.from(new Set(aiTools.map(tool => tool.category)));
    setCustomCategories(allCategories.filter(cat => !defaultCategories.includes(cat)));
  }, [aiTools]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('tasks', JSON.stringify(tasks));
    }
  }, [tasks]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('goals', JSON.stringify(goals));
    }
  }, [goals]);

  useEffect(() => {
    if (selectedCategories.length > 0 && !expandedCategories.includes('Favorites')) {
      setExpandedCategories(prev => [...prev, 'Favorites']);
    }
    selectedCategories.forEach(category => {
      if (!expandedCategories.includes(category)) {
        setExpandedCategories(prev => [...prev, category]);
      }
    });
  }, [selectedCategories, expandedCategories]);

  const handleAddTool = () => {
    if (!newTool.name.trim() || !newTool.description.trim() || newTool.subscriptionCost > 0 && !newTool.renewalDate) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }
    const newId = crypto.randomUUID();
    const completeNewTool: AITool = {
      id: newId,
      isFavorite: false,
      isPaid: false,
      ...newTool
    };
    setAiTools(prevTools => [...prevTools, completeNewTool]);
    setNewTool({
      name: '',
      description: '',
      category: 'General AI',
      subscriptionCost: 0,
      renewalDate: '',
      website: ''
    });
    setShowAddForm(false);
    toast({
      title: "Success",
      description: `${completeNewTool.name} has been added.`,
      variant: "default"
    });
  };

  const handleEdit = (id: string) => {
    setEditingId(id);
  };

  const handleSave = (id: string) => {
    const toolToSave = editedTools[id] || aiTools.find(t => t.id === id);
    if (toolToSave && toolToSave.subscriptionCost > 0 && !toolToSave.renewalDate) {
      toast({
        title: "Missing Information",
        description: "Please provide a renewal date for paid subscriptions.",
        variant: "destructive"
      });
      return;
    }
    setAiTools(prevTools => prevTools.map(tool => tool.id === id ? {
      ...tool,
      ...editedTools[id]
    } : tool));
    setEditingId(null);
    setEditedTools({});
    toast({
      title: "Updated",
      description: "Subscription information has been updated.",
      variant: "default"
    });
  };

  const handleCancel = (id: string) => {
    setEditingId(null);
    setEditedTools({});
  };

  const confirmDelete = (id: string) => {
    setToolToDelete(id);
    setShowDeleteConfirm(true);
  };

  const handleDelete = () => {
    if (toolToDelete) {
      const toolName = aiTools.find(t => t.id === toolToDelete)?.name;
      setAiTools(prevTools => prevTools.filter(tool => tool.id !== toolToDelete));
      setShowDeleteConfirm(false);
      setToolToDelete(null);
      toast({
        title: "Deleted",
        description: `${toolName} has been removed.`,
        variant: "default"
      });
    }
  };

  const confirmCategoryDelete = (category: string) => {
    setCategoryToDelete(category);
    setShowCategoryDeleteConfirm(true);
  };

  const handleCategoryDelete = () => {
    if (categoryToDelete) {
      setAiTools(prevTools => prevTools.map(tool => tool.category === categoryToDelete ? {
        ...tool,
        category: "General AI"
      } : tool));
      setExpandedCategories(prev => prev.filter(cat => cat !== categoryToDelete));
      if (selectedCategories.includes(categoryToDelete)) {
        setSelectedCategories(prev => prev.filter(cat => cat !== categoryToDelete));
      }
      setShowCategoryDeleteConfirm(false);
      setCategoryToDelete(null);
      toast({
        title: "Category Deleted",
        description: `Category "${categoryToDelete}" has been removed and its subscriptions moved to General AI.`,
        variant: "default"
      });
    }
  };

  const handleUpdate = (id: string, updates: Partial<AITool>) => {
    setEditedTools(prev => ({
      ...prev,
      [id]: {
        ...(prev[id] || aiTools.find(t => t.id === id)),
        ...updates
      }
    }));
  };

  const handleToggleFavorite = (id: string) => {
    setAiTools(prevTools => prevTools.map(tool => tool.id === id ? {
      ...tool,
      isFavorite: !tool.isFavorite
    } : tool));
    const tool = aiTools.find(t => t.id === id);
    const action = !tool?.isFavorite ? "added to" : "removed from";
    toast({
      title: `${action === "added to" ? "Added to Favorites" : "Removed from Favorites"}`,
      description: `${tool?.name} has been ${action} favorites.`,
      variant: "default"
    });
  };

  const handleTogglePaid = (id: string) => {
    setAiTools(prevTools => prevTools.map(tool => tool.id === id ? {
      ...tool,
      isPaid: !tool.isPaid
    } : tool));
    const tool = aiTools.find(t => t.id === id);
    const newStatus = !tool?.isPaid ? "Paid" : "Unpaid";
    toast({
      title: `Status Updated`,
      description: `${tool?.name} is now marked as ${newStatus}.`,
      variant: "default"
    });
  };

  const handleInputChange = (field: keyof Omit<AITool, 'id' | 'isFavorite' | 'isPaid'>, value: string | number) => {
    setNewTool(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const toggleCategoryExpansion = (category: string) => {
    setExpandedCategories(prev => prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]);
  };

  const processAIPrompt = () => {
    if (!aiPrompt.trim()) return;
    setIsAiProcessing(true);

    setTimeout(() => {
      let result = '';

      if (aiPrompt.toLowerCase().includes('total') || aiPrompt.toLowerCase().includes('sum')) {
        const total = aiTools.reduce((sum, tool) => sum + tool.subscriptionCost, 0);
        result = `Your total monthly subscription cost is $${total}.`;
      } else if (aiPrompt.toLowerCase().includes('category') || aiPrompt.toLowerCase().includes('categories')) {
        const categoryCounts = {};
        const categoryTotals = {};
        aiTools.forEach(tool => {
          categoryCounts[tool.category] = (categoryCounts[tool.category] || 0) + 1;
          categoryTotals[tool.category] = (categoryTotals[tool.category] || 0) + tool.subscriptionCost;
        });
        result = 'Category breakdown:\n';
        Object.keys(categoryCounts).forEach(category => {
          result += `- ${category}: ${categoryCounts[category]} subscriptions ($${categoryTotals[category]}/month)\n`;
        });
      } else if (aiPrompt.toLowerCase().includes('renewal') || aiPrompt.toLowerCase().includes('due')) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const thirtyDaysLater = new Date();
        thirtyDaysLater.setDate(today.getDate() + 30);
        const upcoming = aiTools.filter(tool => {
          if (!tool.renewalDate) return false;
          const renewalDate = new Date(tool.renewalDate);
          return renewalDate >= today && renewalDate <= thirtyDaysLater;
        });
        if (upcoming.length === 0) {
          result = 'You have no upcoming renewals in the next 30 days.';
        } else {
          result = 'Upcoming renewals in the next 30 days:\n';
          upcoming.forEach(tool => {
            const renewalDate = new Date(tool.renewalDate);
            const daysUntil = Math.round((renewalDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            const daysText = daysUntil === 0 ? 'today' : daysUntil === 1 ? 'tomorrow' : `in ${daysUntil} days`;
            result += `- ${tool.name} ($${tool.subscriptionCost}/month) - due ${daysText} (${tool.renewalDate})\n`;
          });
        }
      } else if (aiPrompt.toLowerCase().includes('paid') || aiPrompt.toLowerCase().includes('unpaid')) {
        const paid = aiTools.filter(tool => tool.isPaid);
        const unpaid = aiTools.filter(tool => tool.subscriptionCost > 0 && !tool.isPaid);
        result = `Payment status summary:\n- Paid: ${paid.length} subscriptions\n- Unpaid: ${unpaid.length} subscriptions`;
        if (unpaid.length > 0) {
          result += '\n\nUnpaid subscriptions:\n';
          unpaid.forEach(tool => {
            result += `- ${tool.name} ($${tool.subscriptionCost}/month) - due on ${tool.renewalDate}\n`;
          });
        }
      } else if (aiPrompt.toLowerCase().includes('add task') || aiPrompt.toLowerCase().includes('create task') || aiPrompt.toLowerCase().includes('schedule task')) {
        let title = aiPrompt.replace(/add task|create task|schedule task/i, '').trim();
        let dueDate = '';

        const datePatterns = [/on\s+(\d{4}-\d{2}-\d{2})/i, /on\s+(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i, /for\s+(\d{4}-\d{2}-\d{2})/i, /for\s+(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i, /by\s+(\d{4}-\d{2}-\d{2})/i, /by\s+(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i];
        for (const pattern of datePatterns) {
          const match = aiPrompt.match(pattern);
          if (match && match[1]) {
            dueDate = match[1];
            title = title.replace(pattern, '').trim();
            break;
          }
        }

        if (aiPrompt.toLowerCase().includes('today')) {
          const today = new Date();
          dueDate = today.toISOString().split('T')[0];
          title = title.replace(/today/i, '').trim();
        } else if (aiPrompt.toLowerCase().includes('tomorrow')) {
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          dueDate = tomorrow.toISOString().split('T')[0];
          title = title.replace(/tomorrow/i, '').trim();
        }
        if (title) {
          const newTask: Task = {
            id: crypto.randomUUID(),
            title: title,
            dueDate: dueDate,
            completed: false,
            notify: true
          };
          setTasks(prev => [...prev, newTask]);
          result = `Task created: "${title}"${dueDate ? ` due on ${dueDate}` : ''}`;
        } else {
          result = "I couldn't understand the task details. Please try again with a clearer description.";
        }
      } else if (aiPrompt.toLowerCase().includes('add subscription') || aiPrompt.toLowerCase().includes('add expense')) {
        const costPattern = /\$(\d+(\.\d{1,2})?)/;
        const costMatch = aiPrompt.match(costPattern);
        let name = aiPrompt.replace(/add subscription|add expense/i, '').trim();
        let cost = 0;
        let category = 'General AI';
        let renewalDate = '';

        if (costMatch && costMatch[1]) {
          cost = parseFloat(costMatch[1]);
          name = name.replace(costPattern, '').trim();
        }

        const datePatterns = [/on\s+(\d{4}-\d{2}-\d{2})/i, /on\s+(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i, /due\s+(\d{4}-\d{2}-\d{2})/i, /due\s+(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i];
        for (const pattern of datePatterns) {
          const match = aiPrompt.match(pattern);
          if (match && match[1]) {
            renewalDate = match[1];
            name = name.replace(pattern, '').trim();
            break;
          }
        }

        const categoryPattern = /in\s+(\w+(\s+\w+)*)\s+category/i;
        const categoryMatch = aiPrompt.match(categoryPattern);
        if (categoryMatch && categoryMatch[1]) {
          category = categoryMatch[1];
          name = name.replace(categoryPattern, '').trim();
        }
        if (name) {
          const newSubscription: AITool = {
            id: crypto.randomUUID(),
            name: name,
            description: `Added via AI Assistant: ${aiPrompt}`,
            category: category,
            subscriptionCost: cost,
            renewalDate: renewalDate,
            isFavorite: false,
            isPaid: false
          };
          setAiTools(prev => [...prev, newSubscription]);
          result = `Subscription added: "${name}" ($${cost}/month)${renewalDate ? ` due on ${renewalDate}` : ''} in category "${category}"`;
        } else {
          result = "I couldn't understand the subscription details. Please try again with a clearer description.";
        }
      } else {
        result = "I can help you analyze your subscriptions and tasks. Try asking about:\n\n" + 
                "- Total monthly costs\n" + 
                "- Category breakdown\n" + 
                "- Upcoming renewals\n" + 
                "- Payment status of your subscriptions\n" + 
                "- Add task [task name] on [date]\n" + 
                "- Add subscription [name] $[amount] on [date] in [category] category";
      }
      setAiResponse(result);
      setIsAiProcessing(false);
    }, 1500);
  };

  const handleDragStart = (index: number) => {
    setIsDragging(true);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    setDraggedIndex(null);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>, targetIndex: number, category: string) => {
    event.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) return;
    const currentCategoryTools = [...(category === 'Favorites' ? favoriteTools : categorizedTools[category] || [])];
    const newTools = [...aiTools];
    let draggedItem: AITool;
    if (draggedIndex < favoriteTools.length && category === 'Favorites') {
      draggedItem = favoriteTools[draggedIndex];
    } else if (draggedIndex < favoriteTools.length) {
      draggedItem = favoriteTools[draggedIndex];
      const oldIndex = newTools.findIndex(t => t.id === draggedItem.id);
      newTools.splice(oldIndex, 1);
    } else {
      const sourceCategory = Object.keys(categorizedTools).find(cat => {
        const start = favoriteTools.length + (sortedCategories.indexOf(cat) > -1 ? sortedCategories.indexOf(cat) : 0);
        const end = start + categorizedTools[cat].length;
        return draggedIndex >= start && draggedIndex < end;
      });
      if (!sourceCategory) return;
      const sourceIndex = categorizedTools[sourceCategory].findIndex(tool => newTools.indexOf(tool) === draggedIndex);
      draggedItem = categorizedTools[sourceCategory][sourceIndex];
      const oldIndex = newTools.findIndex(t => t.id === draggedItem.id);
      newTools.splice(oldIndex, 1);
    }
    const targetAbsoluteIndex = category === 'Favorites' ? targetIndex : favoriteTools.length + sortedCategories.indexOf(category) + targetIndex;
    newTools.splice(targetAbsoluteIndex, 0, draggedItem);
    if (category === 'Favorites') {
      newTools[targetAbsoluteIndex].isFavorite = true;
    } else if (draggedIndex < favoriteTools.length) {
      newTools[targetAbsoluteIndex].isFavorite = false;
    }
    setAiTools(newTools);
    setDraggedIndex(targetIndex);
  };

  const handleAddCustomCategory = () => {
    if (customCategory.trim()) {
      setNewTool(prev => ({
        ...prev,
        category: customCategory.trim()
      }));
      setCustomCategory("");
      setShowCustomCategoryInput(false);
      if (!customCategories.includes(customCategory.trim())) {
        setCustomCategories(prev => [...prev, customCategory.trim()]);
      }
      toast({
        title: "New Category",
        description: `Category "${customCategory.trim()}" has been created and selected.`,
        variant: "default"
      });
    }
  };

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories(prev => prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]);

    if (!selectedCategories.includes(category)) {
      setView('list');
    }

    setFilterByRenewal(false);
  };

  const handleRenewalFilter = () => {
    setFilterByRenewal(true);
    setSelectedCategories([]);
    setView('list');
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setFilterByRenewal(false);
  };

  const navigateToPlanner = () => {
    navigate('/planner');
  };

  let filteredTools = aiTools.filter(tool => tool.name.toLowerCase().includes(searchTerm.toLowerCase()) || tool.description.toLowerCase().includes(searchTerm.toLowerCase()));

  if (selectedCategories.includes('Favorites')) {
    filteredTools = filteredTools.filter(tool => tool.isFavorite);
  }
  if (selectedCategories.length > 0 && !selectedCategories.includes('Favorites')) {
    filteredTools = filteredTools.filter(tool => selectedCategories.includes(tool.category));
  }
  if (filterByRenewal) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const thirtyDaysLater = new Date();
    thirtyDaysLater.setDate(today.getDate() + 30);
    filteredTools = filteredTools.filter(tool => {
      if (!tool.renewalDate) return false;
      const renewalDate = new Date(tool.renewalDate);
      renewalDate.setHours(0, 0, 0, 0);
      return renewalDate >= today && renewalDate <= thirtyDaysLater;
    });
  }

  const favoriteTools = filteredTools.filter(tool => tool.isFavorite);
  const categorizedTools = filteredTools.reduce((acc, tool) => {
    if (!tool.isFavorite) {
      (acc[tool.category] = acc[tool.category] || []).push(tool);
    }
    return acc;
  }, {} as {
    [category: string]: AITool[];
  });
  const sortedCategories = Object.keys(categorizedTools).sort();
  const allCategoriesForSelect = Array.from(new Set(aiTools.map(tool => tool.category))).sort();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-gray-100">
      <div className="max-w-6xl mx-auto p-4 sm:p-6">
        <Header 
          isMobile={isMobile}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
          view={view}
          setView={setView}
          clearFilters={clearFilters}
          navigateToPlanner={navigateToPlanner}
          setShowAIDialog={setShowAIDialog}
          showAddForm={showAddForm}
          setShowAddForm={setShowAddForm}
          selectedCategories={selectedCategories}
          filterByRenewal={filterByRenewal}
          handleCategoryToggle={handleCategoryToggle}
          setFilterByRenewal={setFilterByRenewal}
        />

        <AnimatePresence>
          {showAddForm && (
            <AddForm 
              newTool={newTool}
              handleInputChange={handleInputChange}
              customCategory={customCategory}
              setCustomCategory={setCustomCategory}
              showCustomCategoryInput={showCustomCategoryInput}
              setShowCustomCategoryInput={setShowCustomCategoryInput}
              customCategories={customCategories}
              allCategoriesForSelect={allCategoriesForSelect}
              handleAddCustomCategory={handleAddCustomCategory}
              handleAddTool={handleAddTool}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {view === 'dashboard' ? (
            <Dashboard 
              aiTools={aiTools}
              tasks={tasks}
              goals={goals}
              selectedCategories={selectedCategories}
              filterByRenewal={filterByRenewal}
              handleRenewalFilter={handleRenewalFilter}
              handleCategoryToggle={handleCategoryToggle}
              customCategories={customCategories}
              navigateToPlanner={navigateToPlanner}
              setShowAddForm={setShowAddForm}
              expandedCategories={expandedCategories}
              toggleCategoryExpansion={toggleCategoryExpansion}
              confirmCategoryDelete={confirmCategoryDelete}
              setShowAIDialog={setShowAIDialog}
            />
          ) : (
            <div className="space-y-4">
              {filteredTools.length === 0 ? (
                <div className="text-center py-12 glass-card">
                  <h3 className="text-xl font-semibold mb-2">No subscriptions found</h3>
                  {searchTerm ? (
                    <p className="text-gray-400">No results for "{searchTerm}"</p>
                  ) : (
                    <>
                      <p className="text-gray-400 mb-4">Add your first subscription to get started</p>
                      <Button 
                        onClick={() => setShowAddForm(true)}
                        className="bg-ai-purple hover:bg-ai-purple/90"
                      >
                        <PlusCircle className="w-4 h-4 mr-2" />
                        Add New Subscription
                      </Button>
                    </>
                  )}
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {favoriteTools.length > 0 && (
                    <div className="mb-8">
                      <div 
                        className="flex items-center cursor-pointer mb-2" 
                        onClick={() => toggleCategoryExpansion('Favorites')}
                      >
                        <h2 className="text-xl font-semibold">⭐ Favorites</h2>
                        {expandedCategories.includes('Favorites') ? (
                          <ChevronUp className="ml-2 w-5 h-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="ml-2 w-5 h-5 text-gray-400" />
                        )}
                      </div>
                      
                      {expandedCategories.includes('Favorites') && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {favoriteTools.map((tool, index) => (
                            <div 
                              key={tool.id}
                              draggable={!editingId}
                              onDragStart={() => handleDragStart(index)}
                              onDragEnd={handleDragEnd}
                              onDragOver={(e) => handleDragOver(e, index, 'Favorites')}
                              className={`${isDragging && draggedIndex === index ? 'opacity-50' : 'opacity-100'}`}
                            >
                              {editingId === tool.id ? (
                                <EditableAIToolCard
                                  tool={tool}
                                  onSave={handleSave}
                                  onCancel={handleCancel}
                                  onUpdate={handleUpdate}
                                  customCategories={customCategories}
                                />
                              ) : (
                                <AIToolCard
                                  tool={tool}
                                  onEdit={handleEdit}
                                  onDelete={confirmDelete}
                                  onToggleFavorite={handleToggleFavorite}
                                  onTogglePaid={handleTogglePaid}
                                  isEditing={false}
                                />
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  
                  {sortedCategories.map((category) => (
                    <div key={category} className="mb-8">
                      <div className="flex items-center justify-between mb-2">
                        <div 
                          className="flex items-center cursor-pointer" 
                          onClick={() => toggleCategoryExpansion(category)}
                        >
                          <h2 className="text-xl font-semibold">
                            {getAIToolIcon(category)}
                            {category}
                          </h2>
                          {expandedCategories.includes(category) ? (
                            <ChevronUp className="ml-2 w-5 h-5 text-gray-400" />
                          ) : (
                            <ChevronDown className="ml-2 w-5 h-5 text-gray-400" />
                          )}
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCategoryToggle(category);
                            }}
                            className="ml-2 h-7 text-xs"
                          >
                            Filter
                          </Button>
                        </div>
                        
                        {!["General AI", "Writing", "Image Generation", "Code Generation", "Chatbots", "Video Generation"].includes(category) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => confirmCategoryDelete(category)}
                            className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                      
                      {expandedCategories.includes(category) && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {categorizedTools[category].map((tool, index) => {
                            const absoluteIndex = favoriteTools.length + 
                              sortedCategories.slice(0, sortedCategories.indexOf(category)).reduce(
                                (sum, cat) => sum + categorizedTools[cat].length, 0
                              ) + index;
                            
                            return (
                              <div 
                                key={tool.id}
                                draggable={!editingId}
                                onDragStart={() => handleDragStart(absoluteIndex)}
                                onDragEnd={handleDragEnd}
                                onDragOver={(e) => handleDragOver(e, index, category)}
                                className={`${isDragging && draggedIndex === absoluteIndex ? 'opacity-50' : 'opacity-100'}`}
                              >
                                {editingId === tool.id ? (
                                  <EditableAIToolCard
                                    tool={tool}
                                    onSave={handleSave}
                                    onCancel={handleCancel}
                                    onUpdate={handleUpdate}
                                    customCategories={customCategories}
                                  />
                                ) : (
                                  <AIToolCard
                                    tool={tool}
                                    onEdit={handleEdit}
                                    onDelete={confirmDelete}
                                    onToggleFavorite={handleToggleFavorite}
                                    onTogglePaid={handleTogglePaid}
                                    isEditing={false}
                                  />
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                </motion.div>
              )}
            </div>
          )}
        </AnimatePresence>

        <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this subscription? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>Cancel</Button>
              <Button variant="destructive" onClick={handleDelete}>Delete</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <AlertDialog open={showCategoryDeleteConfirm} onOpenChange={setShowCategoryDeleteConfirm}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Category</AlertDialogTitle>
              <AlertDialogDescription>
                This will move all subscriptions in the "{categoryToDelete}" category to "General AI". 
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setShowCategoryDeleteConfirm(false)}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleCategoryDelete} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Dialog open={showAIDialog} onOpenChange={setShowAIDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="ai-gradient-text flex items-center gap-2">
                <MessageSquareDot className="h-5 w-5 text-ai-cyan" />
                AI Assistant
              </DialogTitle>
              <DialogDescription>
                Ask questions about your subscriptions or add new items using natural language
              </DialogDescription>
            </DialogHeader>
            
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 max-h-[300px] overflow-y-auto">
              {aiResponse ? (
                <div className="whitespace-pre-line">{aiResponse}</div>
              ) : (
                <div className="text-gray-400 text-center">
                  Ask me about your subscriptions, tasks, or to add new items
                </div>
              )}
            </div>
            
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <Input
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="Ask a question or give a command..."
                  className="bg-black/20 border-gray-700 text-white"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      processAIPrompt();
                    }
                  }}
                />
                <div className="text-xs text-gray-500 mt-1">
                  Try: "What's my total monthly cost?" or "Add subscription Netflix $15.99 on 2023-04-15"
                </div>
              </div>
              <Button 
                disabled={isAiProcessing || !aiPrompt.trim()} 
                onClick={processAIPrompt}
                className="bg-ai-cyan hover:bg-ai-cyan/90"
              >
                {isAiProcessing ? "Processing..." : "Send"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Index;

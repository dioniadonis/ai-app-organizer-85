import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { toast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import { AITool } from '@/types/AITool';

// Import refactored components
import Header from '@/components/home/Header';
import AddForm from '@/components/home/AddForm';
import AIToolList from '@/components/home/AIToolList';
import AIAssistantDialog from '@/components/home/AIAssistantDialog';
import ConfirmationDialogs from '@/components/home/ConfirmationDialogs';
import Dashboard from '@/components/Dashboard';

const initialAITools: AITool[] = [];
const DEFAULT_CATEGORIES = ["General AI", "Writing", "Image Generation", "Code Generation", "Chatbots", "Video Generation"];

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
  const [tasks, setTasks] = useState<any[]>(() => {
    if (typeof window !== 'undefined') {
      const savedTasks = localStorage.getItem('tasks');
      return savedTasks ? JSON.parse(savedTasks) : [];
    }
    return [];
  });
  const [goals, setGoals] = useState<any[]>(() => {
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
    const allCategories = Array.from(new Set(aiTools.map(tool => tool.category)));
    return allCategories.filter(cat => !DEFAULT_CATEGORIES.includes(cat));
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('aiTools', JSON.stringify(aiTools));
    }
    const allCategories = Array.from(new Set(aiTools.map(tool => tool.category)));
    setCustomCategories(allCategories.filter(cat => !DEFAULT_CATEGORIES.includes(cat)));
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
            result += `- ${tool.name} ($${tool.subscriptionCost}/month) - due on ${tool.renewalDate}\n`;
          });
        }
      } else if (aiPrompt.toLowerCase().includes('paid') || aiPrompt.toLowerCase().includes('unpaid')) {
        const paid = aiTools.filter(tool => tool.isPaid);
        const unpaid = aiTools.filter(tool => !tool.isPaid);
        result = `Payment status summary:\n- Paid: ${paid.length} subscriptions\n- Unpaid: ${unpaid.length} subscriptions`;
      } else {
        result = "I can help you analyze your subscriptions. Try asking about:\n\n" + 
                "- Total monthly costs\n" + 
                "- Category breakdown\n" + 
                "- Upcoming renewals\n" + 
                "- Payment status of your subscriptions";
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
            <AIToolList
              filteredTools={filteredTools}
              favoriteTools={favoriteTools}
              categorizedTools={categorizedTools}
              sortedCategories={sortedCategories}
              expandedCategories={expandedCategories}
              toggleCategoryExpansion={toggleCategoryExpansion}
              handleCategoryToggle={handleCategoryToggle}
              confirmCategoryDelete={confirmCategoryDelete}
              defaultCategories={DEFAULT_CATEGORIES}
              editingId={editingId}
              isDragging={isDragging}
              draggedIndex={draggedIndex}
              handleDragStart={handleDragStart}
              handleDragEnd={handleDragEnd}
              handleDragOver={handleDragOver}
              handleEdit={handleEdit}
              handleSave={handleSave}
              handleCancel={handleCancel}
              handleUpdate={handleUpdate}
              confirmDelete={confirmDelete}
              handleToggleFavorite={handleToggleFavorite}
              handleTogglePaid={handleTogglePaid}
              customCategories={customCategories}
              setShowAddForm={setShowAddForm}
            />
          )}
        </AnimatePresence>

        <ConfirmationDialogs
          showDeleteConfirm={showDeleteConfirm}
          setShowDeleteConfirm={setShowDeleteConfirm}
          handleDelete={handleDelete}
          showCategoryDeleteConfirm={showCategoryDeleteConfirm}
          setShowCategoryDeleteConfirm={setShowCategoryDeleteConfirm}
          categoryToDelete={categoryToDelete}
          handleCategoryDelete={handleCategoryDelete}
        />

        <AIAssistantDialog
          open={showAIDialog}
          onOpenChange={setShowAIDialog}
          aiPrompt={aiPrompt}
          setAiPrompt={setAiPrompt}
          aiResponse={aiResponse}
          isAiProcessing={isAiProcessing}
          processAIPrompt={processAIPrompt}
        />
      </div>
    </div>
  );
};

export default Index;

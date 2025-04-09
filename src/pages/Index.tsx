
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PlusCircle,
  Search,
  LayoutDashboard,
  Grid,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  Trash2,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import AIToolCard from '@/components/AIToolCard';
import EditableAIToolCard from '@/components/EditableAIToolCard';
import Dashboard from '@/components/Dashboard';
import { AITool } from '@/types/AITool';
import { cn } from '@/lib/utils';
import { getAIToolIcon } from '@/utils/iconUtils';
import { toast } from '@/components/ui/use-toast';

const initialAITools: AITool[] = [
  {
    id: '1',
    name: 'ChatGPT Plus',
    description: 'Advanced AI chatbot for natural language processing and generation',
    category: 'Chatbots',
    subscriptionCost: 20,
    renewalDate: '2025-05-15',
    isFavorite: true,
    website: 'https://chat.openai.com/',
  },
  {
    id: '2',
    name: 'Midjourney',
    description: 'AI image generation platform creating detailed illustrations from text prompts',
    category: 'Image Generation',
    subscriptionCost: 10,
    renewalDate: '2025-04-20',
    isFavorite: false,
    website: 'https://www.midjourney.com/',
  },
  {
    id: '3',
    name: 'GitHub Copilot',
    description: 'AI pair programming assistant that suggests code in real-time',
    category: 'Code Generation',
    subscriptionCost: 10,
    renewalDate: '2025-04-18',
    isFavorite: true,
    website: 'https://github.com/features/copilot',
  },
  {
    id: '4',
    name: 'Jasper',
    description: 'AI writing assistant for marketing copy and creative content',
    category: 'Writing',
    subscriptionCost: 59,
    renewalDate: '2025-09-10',
    isFavorite: false,
    website: 'https://www.jasper.ai/',
  },
  {
    id: '5',
    name: 'DALL-E 2',
    description: 'AI system that creates realistic images and art from natural language descriptions',
    category: 'Image Generation',
    subscriptionCost: 15,
    renewalDate: '2025-10-01',
    isFavorite: true,
    website: 'https://openai.com/dall-e-2/',
  },
  {
    id: '6',
    name: 'Bard',
    description: 'Experimental conversational AI service powered by Google',
    category: 'Chatbots',
    subscriptionCost: 0,
    renewalDate: '',
    isFavorite: false,
    website: 'https://bard.google.com/',
  },
  {
    id: '7',
    name: 'Synthesia',
    description: 'AI video generation platform for creating videos with virtual avatars',
    category: 'Video Generation',
    subscriptionCost: 30,
    renewalDate: '2025-05-22',
    isFavorite: false,
    website: 'https://www.synthesia.io/',
  },
  {
    id: '8',
    name: 'Stable Diffusion',
    description: 'Open-source image generation model that creates images from text descriptions',
    category: 'Image Generation',
    subscriptionCost: 0,
    renewalDate: '',
    isFavorite: true,
    website: 'https://stability.ai/',
  },
  {
    id: '9',
    name: 'Copy.ai',
    description: 'AI-powered copywriting tool for marketing content and creative writing',
    category: 'Writing',
    subscriptionCost: 49,
    renewalDate: '2025-06-28',
    isFavorite: false,
    website: 'https://www.copy.ai/',
  },
  {
    id: '10',
    name: 'Amazon CodeWhisperer',
    description: 'AI coding companion that helps developers write code with real-time suggestions',
    category: 'Code Generation',
    subscriptionCost: 19,
    renewalDate: '2025-05-10',
    isFavorite: false,
    website: 'https://aws.amazon.com/codewhisperer/',
  },
];

const Index = () => {
  const [aiTools, setAiTools] = useState<AITool[]>(() => {
    if (typeof window !== 'undefined') {
      const savedTools = localStorage.getItem('aiTools');
      return savedTools ? JSON.parse(savedTools) : initialAITools;
    }
    return initialAITools;
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTool, setNewTool] = useState<Omit<AITool, 'id' | 'isFavorite'>>({
    name: '',
    description: '',
    category: 'General AI',
    subscriptionCost: 0,
    renewalDate: '',
    website: '',
  });
  const [isDragging, setIsDragging] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['Favorites']);
  const [editedTools, setEditedTools] = useState<{ [id: string]: Partial<AITool> }>({});
  const [view, setView] = useState<'dashboard' | 'list'>('dashboard');
  const [customCategory, setCustomCategory] = useState('');
  const [showCustomCategoryInput, setShowCustomCategoryInput] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [toolToDelete, setToolToDelete] = useState<string | null>(null);
  const [filterByCategory, setFilterByCategory] = useState<string | null>(null);
  const [filterByRenewal, setFilterByRenewal] = useState<boolean>(false);
  const [showCategoryDeleteConfirm, setShowCategoryDeleteConfirm] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  
  // Extract all custom categories
  const [customCategories, setCustomCategories] = useState<string[]>(() => {
    const defaultCategories = ["General AI", "Writing", "Image Generation", "Code Generation", "Chatbots", "Video Generation"];
    const allCategories = Array.from(new Set(aiTools.map(tool => tool.category)));
    return allCategories.filter(cat => !defaultCategories.includes(cat));
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('aiTools', JSON.stringify(aiTools));
    }
    
    // Update custom categories whenever tools change
    const defaultCategories = ["General AI", "Writing", "Image Generation", "Code Generation", "Chatbots", "Video Generation"];
    const allCategories = Array.from(new Set(aiTools.map(tool => tool.category)));
    setCustomCategories(allCategories.filter(cat => !defaultCategories.includes(cat)));
  }, [aiTools]);

  // Ensure favorites are expanded when filtering
  useEffect(() => {
    if (filterByCategory === 'Favorites' && !expandedCategories.includes('Favorites')) {
      setExpandedCategories(prev => [...prev, 'Favorites']);
    }
    
    // Auto-expand filtered category
    if (filterByCategory && !expandedCategories.includes(filterByCategory)) {
      setExpandedCategories(prev => [...prev, filterByCategory]);
    }
  }, [filterByCategory, expandedCategories]);

  const handleAddTool = () => {
    if (
      !newTool.name.trim() ||
      !newTool.description.trim() ||
      (newTool.subscriptionCost > 0 && !newTool.renewalDate)
    ) {
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
      ...newTool,
    };
    setAiTools((prevTools) => [...prevTools, completeNewTool]);
    setNewTool({
      name: '',
      description: '',
      category: 'General AI',
      subscriptionCost: 0,
      renewalDate: '',
      website: '',
    });
    setShowAddForm(false);
    
    toast({
      title: "Success",
      description: `${completeNewTool.name} has been added.`,
      variant: "default",
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

    setAiTools((prevTools) =>
      prevTools.map((tool) => (tool.id === id ? { ...tool, ...editedTools[id] } : tool))
    );
    setEditingId(null);
    setEditedTools({});
    
    toast({
      title: "Updated",
      description: "Tool information has been updated.",
      variant: "default",
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
      setAiTools((prevTools) => prevTools.filter((tool) => tool.id !== toolToDelete));
      setShowDeleteConfirm(false);
      setToolToDelete(null);
      
      toast({
        title: "Deleted",
        description: `${toolName} has been removed.`,
        variant: "default",
      });
    }
  };

  const confirmCategoryDelete = (category: string) => {
    setCategoryToDelete(category);
    setShowCategoryDeleteConfirm(true);
  };

  const handleCategoryDelete = () => {
    if (categoryToDelete) {
      // Change the category of all tools in this category to "General AI"
      setAiTools(prevTools => 
        prevTools.map(tool => 
          tool.category === categoryToDelete 
            ? { ...tool, category: "General AI" } 
            : tool
        )
      );
      
      // Remove from expanded categories
      setExpandedCategories(prev => prev.filter(cat => cat !== categoryToDelete));
      
      // Reset filter if it was set to this category
      if (filterByCategory === categoryToDelete) {
        setFilterByCategory(null);
      }
      
      setShowCategoryDeleteConfirm(false);
      setCategoryToDelete(null);
      
      toast({
        title: "Category Deleted",
        description: `Category "${categoryToDelete}" has been removed and its tools moved to General AI.`,
        variant: "default",
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
    setAiTools((prevTools) =>
      prevTools.map((tool) =>
        tool.id === id ? { ...tool, isFavorite: !tool.isFavorite } : tool
      )
    );
    
    const tool = aiTools.find(t => t.id === id);
    const action = !tool?.isFavorite ? "added to" : "removed from";
    
    toast({
      title: `${action === "added to" ? "Added to Favorites" : "Removed from Favorites"}`,
      description: `${tool?.name} has been ${action} favorites.`,
      variant: "default",
    });
  };

  const handleInputChange = (
    field: keyof Omit<AITool, 'id' | 'isFavorite'>,
    value: string | number
  ) => {
    setNewTool((prev) => ({ ...prev, [field]: value }));
  };

  const toggleCategoryExpansion = (category: string) => {
    setExpandedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
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
    }
    else {
      const sourceCategory = Object.keys(categorizedTools).find(cat => {
        const start = favoriteTools.length + (sortedCategories.indexOf(cat) > -1 ? sortedCategories.indexOf(cat) : 0);
        const end = start + categorizedTools[cat].length;
        return draggedIndex >= start && draggedIndex < end;
      });

      if (!sourceCategory) return;

      const sourceIndex = categorizedTools[sourceCategory].findIndex((tool) => newTools.indexOf(tool) === draggedIndex);
      draggedItem = categorizedTools[sourceCategory][sourceIndex];

      const oldIndex = newTools.findIndex(t => t.id === draggedItem.id);
      newTools.splice(oldIndex, 1);
    }

    const targetAbsoluteIndex = category === 'Favorites'
      ? targetIndex
      : favoriteTools.length + sortedCategories.indexOf(category) + targetIndex;

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
      // Update newTool with the custom category
      setNewTool(prev => ({ ...prev, category: customCategory.trim() }));
      setCustomCategory("");
      setShowCustomCategoryInput(false);
      
      // Add to custom categories if not already present
      if (!customCategories.includes(customCategory.trim())) {
        setCustomCategories(prev => [...prev, customCategory.trim()]);
      }
      
      toast({
        title: "New Category",
        description: `Category "${customCategory.trim()}" has been created and selected.`,
        variant: "default",
      });
    }
  };

  const handleCategoryFilter = (category: string) => {
    setFilterByCategory(category);
    setFilterByRenewal(false);
    setView('list');
    
    // Make sure the category is expanded
    if (category && !expandedCategories.includes(category)) {
      setExpandedCategories(prev => [...prev, category]);
    }
  };

  const handleRenewalFilter = () => {
    setFilterByRenewal(true);
    setFilterByCategory(null);
    setView('list');
  };

  const clearFilters = () => {
    setFilterByCategory(null);
    setFilterByRenewal(false);
  };

  let filteredTools = aiTools.filter((tool) =>
    tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tool.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Apply category filter if it's set
  if (filterByCategory === 'Favorites') {
    filteredTools = filteredTools.filter(tool => tool.isFavorite);
  } else if (filterByCategory) {
    filteredTools = filteredTools.filter(tool => tool.category === filterByCategory);
  }

  // Apply upcoming renewals filter if it's set
  if (filterByRenewal) {
    const today = new Date();
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
    if (!tool.isFavorite) { // Only include non-favorites in categories
      (acc[tool.category] = acc[tool.category] || []).push(tool);
    }
    return acc;
  }, {} as { [category: string]: AITool[] });

  const sortedCategories = Object.keys(categorizedTools).sort();

  // For dashboard display
  const allCategoriesForSelect = Array.from(
    new Set(aiTools.map(tool => tool.category))
  ).sort();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-gray-100">
      <div className="max-w-6xl mx-auto p-4 sm:p-6">
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-2 text-center ai-gradient-text">
            AI Tool Manager
          </h1>
          <p className="text-center text-gray-400 mb-6">
            Organize, track, and manage your AI tool subscriptions in one place
          </p>
          
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
            </div>
            
            <div className="w-full sm:w-auto">
              <Button
                variant="outline"
                onClick={() => setShowAddForm(!showAddForm)}
                className="w-full sm:w-auto bg-ai-blue/20 text-ai-blue hover:bg-ai-blue/30 hover:text-ai-blue border-ai-blue/50"
              >
                <PlusCircle className="w-4 h-4 mr-2" />
                {showAddForm ? 'Cancel' : 'Add New Tool'}
              </Button>
            </div>
          </div>
          
          {/* Filter bar with active filters */}
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="Search AI tools..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-black/20 border-gray-700 focus:border-ai-purple focus:ring-ai-purple"
              />
            </div>
            
            {(filterByCategory || filterByRenewal) && (
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
                
                <span className="text-gray-400">Active Filter:</span>
                
                {filterByCategory && (
                  <span className="bg-ai-purple/20 text-ai-purple rounded-full px-3 py-1">
                    {filterByCategory === 'Favorites' ? 'Favorites' : `Category: ${filterByCategory}`}
                  </span>
                )}
                
                {filterByRenewal && (
                  <span className="bg-ai-pink/20 text-ai-pink rounded-full px-3 py-1">
                    Upcoming Renewals
                  </span>
                )}
              </div>
            )}
          </div>
        </header>

        <AnimatePresence>
          {showAddForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mb-8 p-5 rounded-xl glass-card"
            >
              <h2 className="text-xl font-semibold mb-4 ai-gradient-text">Add New AI Tool</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="new-name" className="block text-sm font-medium text-gray-300 mb-1">
                    Name <span className="text-red-400">*</span>
                  </label>
                  <Input
                    id="new-name"
                    value={newTool.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="bg-black/20 text-white border-gray-700 focus:border-ai-purple"
                    placeholder="Tool Name"
                  />
                </div>

                <div>
                  <label htmlFor="new-category" className="block text-sm font-medium text-gray-300 mb-1">
                    Category <span className="text-red-400">*</span>
                  </label>
                  {showCustomCategoryInput ? (
                    <div className="flex gap-2">
                      <Input
                        value={customCategory}
                        onChange={(e) => setCustomCategory(e.target.value)}
                        className="bg-black/20 text-white border-gray-700 focus:border-ai-purple"
                        placeholder="Enter custom category"
                      />
                      <Button 
                        onClick={handleAddCustomCategory}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Add
                      </Button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Select
                        value={newTool.category}
                        onValueChange={(value) => handleInputChange('category', value)}
                      >
                        <SelectTrigger className="w-full bg-black/20 text-white border-gray-700">
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700">
                          <SelectItem value="General AI" className="hover:bg-gray-700/50 text-white">General AI</SelectItem>
                          <SelectItem value="Writing" className="hover:bg-gray-700/50 text-white">Writing</SelectItem>
                          <SelectItem value="Image Generation" className="hover:bg-gray-700/50 text-white">Image Generation</SelectItem>
                          <SelectItem value="Code Generation" className="hover:bg-gray-700/50 text-white">Code Generation</SelectItem>
                          <SelectItem value="Chatbots" className="hover:bg-gray-700/50 text-white">Chatbots</SelectItem>
                          <SelectItem value="Video Generation" className="hover:bg-gray-700/50 text-white">Video Generation</SelectItem>
                          {customCategories.filter(cat => 
                            !["General AI", "Writing", "Image Generation", "Code Generation", "Chatbots", "Video Generation"].includes(cat)
                          ).map(cat => (
                            <SelectItem key={cat} value={cat} className="hover:bg-gray-700/50 text-white">{cat}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button 
                        onClick={() => setShowCustomCategoryInput(true)}
                        className="bg-ai-purple hover:bg-ai-purple/90"
                      >
                        Custom
                      </Button>
                    </div>
                  )}
                </div>

                <div className="col-span-full">
                  <label htmlFor="new-description" className="block text-sm font-medium text-gray-300 mb-1">
                    Description <span className="text-red-400">*</span>
                  </label>
                  <Textarea
                    id="new-description"
                    value={newTool.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    className="bg-black/20 text-white border-gray-700 focus:border-ai-purple"
                    rows={3}
                    placeholder="Tool Description"
                  />
                </div>

                <div>
                  <label htmlFor="new-website" className="block text-sm font-medium text-gray-300 mb-1">
                    Website URL
                  </label>
                  <Input
                    id="new-website"
                    type="url"
                    value={newTool.website}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                    className="bg-black/20 text-white border-gray-700 focus:border-ai-purple"
                    placeholder="https://example.com"
                  />
                </div>

                <div>
                  <label htmlFor="new-cost" className="block text-sm font-medium text-gray-300 mb-1">
                    Subscription Cost ($/mo)
                  </label>
                  <Input
                    id="new-cost"
                    type="number"
                    value={newTool.subscriptionCost > 0 ? newTool.subscriptionCost : ''}
                    onChange={(e) =>
                      handleInputChange(
                        'subscriptionCost',
                        e.target.value === '' ? 0 : parseFloat(e.target.value)
                      )
                    }
                    className="bg-black/20 text-white border-gray-700 focus:border-ai-purple"
                    placeholder="e.g., 10"
                  />
                </div>

                <div>
                  <label htmlFor="new-renewal" className="block text-sm font-medium text-gray-300 mb-1">
                    Renewal Date {newTool.subscriptionCost > 0 && <span className="text-red-400">*</span>}
                  </label>
                  <Input
                    id="new-renewal"
                    type="date"
                    value={newTool.renewalDate}
                    onChange={(e) => handleInputChange('renewalDate', e.target.value)}
                    className="bg-black/20 text-white border-gray-700 focus:border-ai-purple"
                  />
                  {newTool.subscriptionCost > 0 && !newTool.renewalDate && (
                    <p className="text-red-400 text-xs mt-1">Required for paid subscriptions</p>
                  )}
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <Button
                  variant="default"
                  onClick={handleAddTool}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Add Tool
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {view === 'dashboard' && <Dashboard 
          aiTools={aiTools} 
          onCategoryClick={handleCategoryFilter}
          onRenewalClick={handleRenewalFilter}
        />}

        {view === 'list' && (
          <div className="space-y-6">
            {/* Show back button if filtering */}
            {(filterByCategory || filterByRenewal) && (
              <div className="mb-2">
                <Button 
                  variant="outline" 
                  onClick={clearFilters}
                  className="border-gray-700 hover:bg-gray-800"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to All Tools
                </Button>
              </div>
            )}
            
            {/* Favorites Section */}
            {(!filterByCategory || filterByCategory === 'Favorites') && (
              <div className="mb-6">
                <div
                  className="tool-category-header"
                  onClick={() => toggleCategoryExpansion('Favorites')}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-yellow-400"
                  >
                    <path d="m12 2 3.09 6.26 6.91.9-5.22 5.04 1.18 6.88L12 17.77l-5.96 3.1 1.18-6.88-5.22-5.04 6.91-.9L12 2z" />
                  </svg>
                  <span>Favorites</span>
                  <span className="ml-2 bg-yellow-400/20 text-yellow-400 text-xs px-2 py-1 rounded-full">
                    {favoriteTools.length}
                  </span>
                  <div className="ml-auto">
                    {expandedCategories.includes('Favorites') ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </div>
                {expandedCategories.includes('Favorites') && (
                  <AnimatePresence>
                    {favoriteTools.length > 0 ? (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
                        {favoriteTools.map((tool, index) => (
                          <div
                            key={tool.id}
                            draggable={true}
                            onDragStart={() => handleDragStart(index)}
                            onDragOver={(e) => handleDragOver(e, index, 'Favorites')}
                            onDragEnd={handleDragEnd}
                            className={cn(
                              isDragging && draggedIndex === index ? 'opacity-0' : 'opacity-100',
                              'transition-opacity'
                            )}
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
                                isEditing={editingId === null}
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-400 mt-2 pl-2">No favorites yet. Star an AI tool to add it here.</p>
                    )}
                  </AnimatePresence>
                )}
              </div>
            )}

            {/* Categories */}
            {sortedCategories
              .filter(category => !filterByCategory || filterByCategory === category)
              .map((category) => (
                <div key={category} className="mb-6">
                  <div
                    className="tool-category-header"
                    onClick={() => toggleCategoryExpansion(category)}
                  >
                    <div className="w-6 h-6 flex items-center justify-center">
                      {getAIToolIcon(category)}
                    </div>
                    <span>{category}</span>
                    <span className="ml-2 bg-white/10 text-white text-xs px-2 py-1 rounded-full">
                      {categorizedTools[category].length}
                    </span>
                    <div className="ml-auto flex items-center gap-2">
                      {/* Delete category button - only for custom categories */}
                      {customCategories.includes(category) && (
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            confirmCategoryDelete(category);
                          }}
                          className="h-6 w-6 text-red-400 hover:text-red-300 hover:bg-red-500/20"
                          title="Delete Category"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      )}
                      
                      {expandedCategories.includes(category) ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                  
                  {expandedCategories.includes(category) && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
                      {categorizedTools[category].map((tool, index) => {
                        const absoluteIndex = favoriteTools.length + sortedCategories.indexOf(category) + index;
                        return (
                          <div
                            key={tool.id}
                            draggable={true}
                            onDragStart={() => handleDragStart(absoluteIndex)}
                            onDragOver={(e) => handleDragOver(e, index, category)}
                            onDragEnd={handleDragEnd}
                            className={cn(
                              isDragging && draggedIndex === absoluteIndex ? 'opacity-0' : 'opacity-100',
                              'transition-opacity'
                            )}
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
                                isEditing={editingId === null}
                              />
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              ))}
            
            {/* No results message */}
            {filteredTools.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-400 text-lg">No tools found matching your search criteria.</p>
                <Button 
                  variant="outline" 
                  onClick={clearFilters}
                  className="mt-4 border-gray-700 hover:bg-gray-800"
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Delete Tool Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="bg-gray-800 text-white border-gray-700">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription className="text-gray-400">
              Are you sure you want to delete this AI tool? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-end gap-2 mt-4">
            <Button 
              variant="outline" 
              onClick={() => setShowDeleteConfirm(false)}
              className="bg-transparent hover:bg-gray-700 border-gray-600"
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Category Confirmation Dialog */}
      <AlertDialog open={showCategoryDeleteConfirm} onOpenChange={setShowCategoryDeleteConfirm}>
        <AlertDialogContent className="bg-gray-800 text-white border-gray-700">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Are you sure you want to delete this category? All tools in this category 
              will be moved to "General AI". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex justify-end gap-2 mt-4">
            <AlertDialogCancel className="bg-transparent hover:bg-gray-700 border-gray-600 text-white">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleCategoryDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete Category
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <footer className="py-6 text-center text-gray-500 mt-12">
        <p>AI Tool Manager &copy; {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
};

export default Index;

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusCircle, Search, LayoutDashboard, Grid, ChevronDown, ChevronUp, ArrowLeft, Trash2, ExternalLink, CheckCircle, XCircle, MessageSquareDot, Calendar } from 'lucide-react';
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
import Planner from '@/components/Planner';

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

const Index = () => {
  const navigate = useNavigate();
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
        result = "I can help you analyze your subscriptions and tasks. Try asking about:\n\n" + "- Total monthly costs\n" + "- Category breakdown\n" + "- Upcoming renewals\n" + "- Payment status of your subscriptions\n" + "- Add task [task name] on [date]\n" + "- Add subscription [name] $[amount] on [date] in [category] category";
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

  return <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-gray-100">
      <div className="max-w-6xl mx-auto p-4 sm:p-6">
        <header className="mb-8">
          <HolographicTitle title="Loop Space AI Organizer" />
          <p className="text-center text-gray-400 mb-6">
            Organize, track, and manage your subscriptions in one place
          </p>
          
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
            <div className="flex gap-2">
              <Button variant={view === 'dashboard' ? 'default' : 'outline'} onClick={() => {
              setView('dashboard');
              clearFilters();
            }} className={view === 'dashboard' ? 'bg-ai-purple hover:bg-ai-purple/90' : 'border-gray-700'}>
                <LayoutDashboard className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
              <Button variant={view === 'list' ? 'default' : 'outline'} onClick={() => setView('list')} className={view === 'list' ? 'bg-ai-purple hover:bg-ai-purple/90' : 'border-gray-700'}>
                <Grid className="w-4 h-4 mr-2" />
                List View
              </Button>
              <Button variant="outline" onClick={navigateToPlanner} className="border-ai-pink bg-ai-pink/10 text-ai-pink hover:bg-ai-pink/20">
                <Calendar className="w-4 h-4 mr-2" />
                Planner
              </Button>
              <Button variant="outline" onClick={() => setShowAIDialog(true)} className="border-ai-cyan bg-ai-cyan/10 text-ai-cyan hover:bg-ai-cyan/20">
                <MessageSquareDot className="w-4 h-4 mr-2" />
                AI Assistant
              </Button>
            </div>
            
            <div className="w-full sm:w-auto">
              <Button variant="outline" onClick={() => setShowAddForm(!showAddForm)} className="w-full sm:w-auto bg-ai-blue/20 text-ai-blue hover:bg-ai-blue/30 hover:text-ai-blue border-ai-blue/50">
                <PlusCircle className="w-4 h-4 mr-2" />
                {showAddForm ? 'Cancel' : 'Add New Subscription'}
              </Button>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input type="text" placeholder="Search subscriptions..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10 bg-black/20 border-gray-700 focus:border-ai-purple focus:ring-ai-purple py-[20px] px-[41px] my-0 mx-0" />
            </div>
            
            {(selectedCategories.length > 0 || filterByRenewal) && <div className="flex items-center gap-2 text-sm">
                <Button variant="outline" size="sm" onClick={clearFilters} className="h-8 px-2 gap-1 border-gray-700 hover:bg-gray-800">
                  <ArrowLeft className="w-3 h-3" />
                  Back to All
                </Button>
                
                <span className="text-gray-400">Active Filters:</span>
                
                {selectedCategories.map(category => <span key={category} className="bg-ai-purple/20 text-ai-purple rounded-full px-3 py-1 flex items-center gap-1 cursor-pointer" onClick={() => handleCategoryToggle(category)}>
                    {category === 'Favorites' ? 'Favorites' : category}
                    <XCircle className="w-3 h-3" />
                  </span>)}
                
                {filterByRenewal && <span className="bg-ai-pink/20 text-ai-pink rounded-full px-3 py-1 flex items-center gap-1 cursor-pointer" onClick={() => setFilterByRenewal(false)}>
                    Upcoming Renewals
                    <XCircle className="w-3 h-3" />
                  </span>}
              </div>}
          </div>
        </header>

        <AnimatePresence>
          {showAddForm && <motion.div initial={{
          opacity: 0,
          height: 0
        }} animate={{
          opacity: 1,
          height: 'auto'
        }} exit={{
          opacity: 0,
          height: 0
        }} transition={{
          duration: 0.3
        }} className="mb-8 p-5 rounded-xl glass-card">
              <h2 className="text-xl font-semibold mb-4 ai-gradient-text">Add New Subscription</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="new-name" className="block text-sm font-medium text-gray-300 mb-1">
                    Name <span className="text-red-400">*</span>
                  </label>
                  <Input id="new-name" value={newTool.name} onChange={e => handleInputChange('name', e.target.value)} className="bg-black/20 text-white border-gray-700 focus:border-ai-purple" placeholder="Subscription Name" />
                </div>

                <div>
                  <label htmlFor="new-category" className="block text-sm font-medium text-gray-300 mb-1">
                    Category <span className="text-red-400">*</span>
                  </label>
                  {showCustomCategoryInput ? <div className="flex gap-2">
                      <Input value={customCategory} onChange={e => setCustomCategory(e.target.value)} className="bg-black/20 text-white border-gray-700 focus:border-ai-purple" placeholder="Enter custom category" />
                      <Button onClick={handleAddCustomCategory} className="bg-green-600 hover:bg-green-700">
                        Add
                      </Button>
                    </div> : <div className="flex gap-2">
                      <Select value={newTool.category} onValueChange={value => handleInputChange('category', value)}>
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
                          {customCategories.filter(cat => !["General AI", "Writing", "Image Generation", "Code Generation", "Chatbots", "Video Generation"].includes(cat)).map(cat => <SelectItem key={cat} value={cat} className="hover:bg-gray-700/50 text-white">{cat}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <Button onClick={() => setShowCustomCategoryInput(true)} className="bg-ai-purple hover:bg-ai-purple/90">
                        Custom
                      </Button>
                    </div>}
                </div>

                <div className="col-span-full">
                  <label htmlFor="new-description" className="block text-sm font-medium text-gray-300 mb-1">
                    Description <span className="text-red-400">*</span>
                  </label>
                  <Textarea id="new-description" value={newTool.description} onChange={e => handleInputChange('description', e.target.value)} className="bg-black/20 text-white border-gray-700 focus:border-ai-purple" rows={3} placeholder="Subscription Description" />
                </div>

                <div>
                  <label htmlFor="new-website" className="block text-sm font-medium text-gray-300 mb-1">
                    Website URL
                  </label>
                  <Input id="new-website" type="url" value={newTool.website} onChange={e => handleInputChange('website', e.target.value)} className="bg-black/20 text-white border-gray-700 focus:border-ai-purple" placeholder="https://example.com" />
                </div>

                <div>
                  <label htmlFor="new-cost" className="block text-sm font-medium text-gray-300 mb-1">
                    Subscription Cost ($/mo)
                  </label>
                  <Input id="new-cost" type="number" value={newTool.subscriptionCost > 0 ? newTool.subscriptionCost : ''} onChange={e => handleInputChange('subscriptionCost', e.target.value === '' ? 0 : parseFloat(e.target.value))} className="bg-black/20 text-white border-gray-700 focus:border-ai-purple" placeholder="e.g., 10" />
                </div>

                <div>
                  <label htmlFor="new-renewal" className="block text-sm font-medium text-gray-300 mb-1">
                    Renewal Date {newTool.subscriptionCost > 0 && <span className="text-red-400">*</span>}
                  </label>
                  <Input id="new-renewal" type="date" value={newTool.renewalDate} onChange={e => handleInputChange('renewalDate', e.target.value)} className="bg-black/20 text-white border-gray-700 focus:border-ai-purple" />
                  {newTool.subscriptionCost > 0 && !newTool.renewalDate && <p className="text-red-400 text-xs mt-1">Required for paid subscriptions</p>}
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <Button variant="default" onClick={handleAddTool} className="bg-green-600 hover:bg-green-700 text-white">
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Add Subscription
                </Button>
              </div>
            </motion.div>}
        </AnimatePresence>

        {view === 'dashboard' && <Dashboard 
          aiTools={aiTools} 
          onCategoryClick={handleCategoryToggle} 
          onRenewalClick={handleRenewalFilter} 
          onViewPlanner={navigateToPlanner} 
          tasks={tasks} 
          goals={goals} 
          selectedCategories={selectedCategories} 
          onCategoryToggle={handleCategoryToggle} 
        />}

        {view === 'list' && <div className="space-y-6">
            {!selectedCategories.includes('Favorites') && <div className="mb-6">
                <div className="tool-category-header" onClick={() => toggleCategoryExpansion('Favorites')}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-400">
                    <path d="m12 2 3.09 6.26 6.91.9-5.22 5.04 1.18 6.88L12 17.77l-5.96 3.1 1.18-6.88-5.22-5.04 6.91-.9L12 2z" />
                  </svg>
                  <span>Favorites</span>
                  <span className="ml-2 bg-yellow-400/20 text-yellow-400 text-xs px-2 py-1 rounded-full">
                    {favoriteTools.length}
                  </span>
                  <div className="ml-auto">
                    {expandedCategories.includes('Favorites') ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                  </div>
                </div>
                {expandedCategories.includes('Favorites') && <AnimatePresence>
                    {favoriteTools.length > 0 ? <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
                        {favoriteTools.map((tool, index) => <div key={tool.id} draggable={true} onDragStart={() => handleDragStart(index)} onDragOver={e => handleDragOver(e, index, 'Favorites')} onDragEnd={handleDragEnd} className={cn(isDragging && draggedIndex === index ? 'opacity-0' : 'opacity-100', 'transition-opacity')}>
                            {editingId === tool.id ? <EditableAIToolCard tool={tool} onSave={handleSave} onCancel={handleCancel} onUpdate={handleUpdate} customCategories={customCategories} /> : <AIToolCard tool={tool} onEdit={handleEdit} onDelete={confirmDelete} onToggleFavorite={handleToggleFavorite} onTogglePaid={handleTogglePaid} isEditing={editingId === null} />}
                          </div>)}
                      </div> : <p className="text-gray-400 mt-2 pl-2">No favorites yet. Star a subscription to add it here.</p>}
                  </AnimatePresence>}
              </div>}

            {sortedCategories.filter(category => !selectedCategories.length || selectedCategories.includes(category)).map(category => <div key={category} className="mb-6">
                  <div className="tool-category-header" onClick={() => toggleCategoryExpansion(category)}>
                    <div className="w-6 h-6 flex items-center justify-center">
                      {getAIToolIcon(category)}
                    </div>
                    <span>{category}</span>
                    <span className="ml-2 bg-white/10 text-white text-xs px-2 py-1 rounded-full">
                      {categorizedTools[category].length}
                    </span>
                    <div className="ml-auto flex items-center gap-2">
                      {customCategories.includes(category) && <Button size="icon" variant="ghost" onClick={e => {
                e.stopPropagation();
                confirmCategoryDelete(category);
              }} className="h-6 w-6 text-red-400 hover:text-red-300 hover:bg-red-500/20" title="Delete Category">
                          <Trash2 className="w-3 h-3" />
                        </Button>}
                      
                      {expandedCategories.includes(category) ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                    </div>
                  </div>
                  
                  {expandedCategories.includes(category) && <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
                      {categorizedTools[category].map((tool, index) => {
              const absoluteIndex = favoriteTools.length + sortedCategories.indexOf(category) + index;
              return <div key={tool.id} draggable={true} onDragStart={() => handleDragStart(absoluteIndex)} onDragOver={e => handleDragOver(e, index, category)} onDragEnd={handleDragEnd} className={cn(isDragging && draggedIndex === absoluteIndex ? 'opacity-0' : 'opacity-100', 'transition-opacity')}>
                            {editingId === tool.id ? <EditableAIToolCard tool={tool} onSave={handleSave} onCancel={handleCancel} onUpdate={handleUpdate} customCategories={customCategories} /> : <AIToolCard tool={tool} onEdit={handleEdit} onDelete={confirmDelete} onToggleFavorite={handleToggleFavorite} onTogglePaid={handleTogglePaid} isEditing={editingId === null} />}
                          </div>;
            })}
                    </div>}
                </div>)}
            
            {filteredTools.length === 0 && <div className="text-center py-8">
                <p className="text-gray-400 text-lg">No subscriptions found matching your search criteria.</p>
                <Button variant="outline" onClick={clearFilters} className="mt-4 border-gray-700 hover:bg-gray-800">
                  Clear Filters
                </Button>
              </div>}
          </div>}
      </div>

      <Dialog open={showAIDialog} onOpenChange={setShowAIDialog}>
        <DialogContent className="bg-gray-800 text-white border-gray-700 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquareDot className="w-5 h-5 text-ai-cyan" />
              Subscription Assistant
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Ask questions about your subscriptions, add tasks or expenses, or get insights.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-300">What would you like to do?</label>
              <div className="flex gap-2">
                <Input value={aiPrompt} onChange={e => setAiPrompt(e.target.value)} placeholder="e.g., What's my total monthly cost?" className="bg-black/20 text-white border-gray-700" onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  processAIPrompt();
                }
              }} />
                <Button onClick={processAIPrompt} disabled={isAiProcessing || !aiPrompt.trim()} className="bg-ai-cyan text-black hover:bg-ai-cyan/90">
                  Ask
                </Button>
              </div>
            </div>
            
            {(isAiProcessing || aiResponse) && <div className="p-4 bg-black/30 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-ai-cyan/20 flex items-center justify-center">
                    <MessageSquareDot className="w-5 h-5 text-ai-cyan" />
                  </div>
                  <div className="flex-1">
                    {isAiProcessing ? <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-ai-cyan rounded-full animate-pulse"></div>
                        <div className="w-2 h-2 bg-ai-cyan rounded-full animate-pulse delay-300"></div>
                        <div className="w-2 h-2 bg-ai-cyan rounded-full animate-pulse delay-600"></div>
                        <span className="text-gray-400 ml-1">Thinking...</span>
                      </div> : <div className="whitespace-pre-line">{aiResponse}</div>}
                  </div>
                </div>
              </div>}
            
            <div className="py-2 text-sm text-gray-400">
              <p>Try asking about:</p>
              <div className="flex flex-wrap gap-2 mt-2">
                <Button variant="outline" size="sm" className="bg-gray-700/50 border-gray-600 text-gray-300 hover:bg-gray-700" onClick={() => {
                setAiPrompt("What's my total monthly subscription cost?");
                processAIPrompt();
              }}>
                  Total costs
                </Button>
                <Button variant="outline" size="sm" className="bg-gray-700/50 border-gray-600 text-gray-300 hover:bg-gray-700" onClick={() => {
                setAiPrompt("Show me upcoming renewals");
                processAIPrompt();
              }}>
                  Upcoming renewals
                </Button>
                <Button variant="outline" size="sm" className="bg-gray-700/50 border-gray-600 text-gray-300 hover:bg-gray-700" onClick={() => {
                setAiPrompt("Which subscriptions are unpaid?");
                processAIPrompt();
              }}>
                  Payment status
                </Button>
                <Button variant="outline" size="sm" className="bg-gray-700/50 border-gray-600 text-gray-300 hover:bg-gray-700" onClick={() => {
                setAiPrompt("Add task Send invoice to client tomorrow");
                processAIPrompt();
              }}>
                  Add task
                </Button>
                <Button variant="outline" size="sm" className="bg-gray-700/50 border-gray-600 text-gray-300 hover:bg-gray-700" onClick={() => {
                setAiPrompt("Add subscription Netflix $15.99 on 2023-05-21");
                processAIPrompt();
              }}>
                  Add subscription
                </Button>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAIDialog(false)} className="border-gray-600 hover:bg-gray-700">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="bg-gray-800 text-white border-gray-700">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription className="text-gray-400">
              Are you sure you want to delete this subscription? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setShowDeleteConfirm(false)} className="bg-transparent hover:bg-gray-700 border-gray-600">
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showCategoryDeleteConfirm} onOpenChange={setShowCategoryDeleteConfirm}>
        <AlertDialogContent className="bg-gray-800 text-white border-gray-700">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Are you sure you want to delete this category? All subscriptions in this category 
              will be moved to "General AI". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex justify-end gap-2 mt-4">
            <AlertDialogCancel className="bg-transparent hover:bg-gray-700 border-gray-600 text-white">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleCategoryDelete} className="bg-red-600 hover:bg-red-700 text-white">
              Delete Category
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <footer className="py-6 text-center text-gray-500 mt-12">
        <p>Loop Space AI Organizer &copy; {new Date().getFullYear()}</p>
      </footer>
    </div>;
};

export default Index;

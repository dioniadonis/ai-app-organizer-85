import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PlusCircle,
  Search,
  LayoutDashboard,
  Grid,
  ChevronDown,
  ChevronUp,
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
import AIToolCard from '@/components/AIToolCard';
import EditableAIToolCard from '@/components/EditableAIToolCard';
import Dashboard from '@/components/Dashboard';
import { AITool } from '@/types/AITool';
import { cn } from '@/lib/utils';
import { getAIToolIcon } from '@/utils/iconUtils';

const initialAITools: AITool[] = [
  {
    id: '1',
    name: 'ChatGPT Plus',
    description: 'Advanced AI chatbot for natural language processing and generation',
    category: 'Chatbots',
    subscriptionCost: 20,
    renewalDate: '2024-08-15',
    isFavorite: true,
  },
  {
    id: '2',
    name: 'Midjourney',
    description: 'AI image generation platform creating detailed illustrations from text prompts',
    category: 'Image Generation',
    subscriptionCost: 10,
    renewalDate: '2024-09-01',
    isFavorite: false,
  },
  {
    id: '3',
    name: 'GitHub Copilot',
    description: 'AI pair programming assistant that suggests code in real-time',
    category: 'Code Generation',
    subscriptionCost: 10,
    renewalDate: '2024-08-20',
    isFavorite: true,
  },
  {
    id: '4',
    name: 'Jasper',
    description: 'AI writing assistant for marketing copy and creative content',
    category: 'Writing',
    subscriptionCost: 59,
    renewalDate: '2024-09-10',
    isFavorite: false,
  },
  {
    id: '5',
    name: 'DALL-E 2',
    description: 'AI system that creates realistic images and art from natural language descriptions',
    category: 'Image Generation',
    subscriptionCost: 15,
    renewalDate: '2024-10-01',
    isFavorite: true,
  },
  {
    id: '6',
    name: 'Bard',
    description: 'Experimental conversational AI service powered by Google',
    category: 'Chatbots',
    subscriptionCost: 0,
    renewalDate: '',
    isFavorite: false,
  },
  {
    id: '7',
    name: 'Synthesia',
    description: 'AI video generation platform for creating videos with virtual avatars',
    category: 'General AI',
    subscriptionCost: 30,
    renewalDate: '2024-09-22',
    isFavorite: false,
  },
  {
    id: '8',
    name: 'Stable Diffusion',
    description: 'Open-source image generation model that creates images from text descriptions',
    category: 'Image Generation',
    subscriptionCost: 0,
    renewalDate: '',
    isFavorite: true,
  },
  {
    id: '9',
    name: 'Copy.ai',
    description: 'AI-powered copywriting tool for marketing content and creative writing',
    category: 'Writing',
    subscriptionCost: 49,
    renewalDate: '2024-08-28',
    isFavorite: false
  },
  {
    id: '10',
    name: 'Amazon CodeWhisperer',
    description: 'AI coding companion that helps developers write code with real-time suggestions',
    category: 'Code Generation',
    subscriptionCost: 19,
    renewalDate: '2024-09-05',
    isFavorite: false,
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
  });
  const [isDragging, setIsDragging] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['Favorites']);
  const [editedTools, setEditedTools] = useState<{ [id: string]: Partial<AITool> }>({});
  const [view, setView] = useState<'dashboard' | 'list'>('dashboard');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('aiTools', JSON.stringify(aiTools));
    }
  }, [aiTools]);

  const handleAddTool = () => {
    if (
      !newTool.name.trim() ||
      !newTool.description.trim() ||
      (newTool.subscriptionCost > 0 && !newTool.renewalDate)
    ) {
      alert('Please fill in all required fields!');
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
    });
    setShowAddForm(false);
  };

  const handleEdit = (id: string) => {
    setEditingId(id);
  };

  const handleSave = (id: string) => {
    const toolToSave = editedTools[id] || aiTools.find(t => t.id === id);
    if (toolToSave && toolToSave.subscriptionCost > 0 && !toolToSave.renewalDate) {
      alert("Please provide a renewal date for paid subscriptions.");
      return;
    }

    setAiTools((prevTools) =>
      prevTools.map((tool) => (tool.id === id ? { ...tool, ...editedTools[id] } : tool))
    );
    setEditingId(null);
    setEditedTools({});
  };

  const handleCancel = (id: string) => {
    setEditingId(null);
    setEditedTools({});
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this AI tool?")) {
      setAiTools((prevTools) => prevTools.filter((tool) => tool.id !== id));
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

  const filteredTools = aiTools.filter((tool) =>
    tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tool.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const favoriteTools = filteredTools.filter(tool => tool.isFavorite);
  const categorizedTools = filteredTools.reduce((acc, tool) => {
    (acc[tool.category] = acc[tool.category] || []).push(tool);
    return acc;
  }, {} as { [category: string]: AITool[] });

  const sortedCategories = Object.keys(categorizedTools).sort();

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
                onClick={() => setView('dashboard')}
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
                    </SelectContent>
                  </Select>
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
                  <label htmlFor="new-cost" className="block text-sm font-medium text-gray-300 mb-1">
                    Subscription Cost ($/mo)
                  </label>
                  <Input
                    id="new-cost"
                    type="number"
                    value={newTool.subscriptionCost}
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

        {view === 'dashboard' && <Dashboard aiTools={aiTools} />}

        {view === 'list' && (
          <div className="space-y-6">
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
                            />
                          ) : (
                            <AIToolCard
                              tool={tool}
                              onEdit={handleEdit}
                              onDelete={handleDelete}
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

            {sortedCategories.map((category) => (
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
                  <div className="ml-auto">
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
                            />
                          ) : (
                            <AIToolCard
                              tool={tool}
                              onEdit={handleEdit}
                              onDelete={handleDelete}
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
          </div>
        )}
      </div>
      <footer className="py-6 text-center text-gray-500 mt-12">
        <p>AI Tool Manager &copy; {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
};

export default Index;

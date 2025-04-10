
import React from 'react';
import { motion } from 'framer-motion';
import { ChevronUp, ChevronDown, Trash2, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AIToolCard from '../AIToolCard';
import EditableAIToolCard from '../EditableAIToolCard';
import { AITool } from '@/types/AITool';
import { getAIToolIcon } from '@/utils/iconUtils';

interface AIToolListProps {
  filteredTools: AITool[];
  favoriteTools: AITool[];
  categorizedTools: {
    [category: string]: AITool[];
  };
  sortedCategories: string[];
  expandedCategories: string[];
  toggleCategoryExpansion: (category: string) => void;
  handleCategoryToggle: (category: string) => void;
  confirmCategoryDelete: (category: string) => void;
  defaultCategories: string[];
  editingId: string | null;
  isDragging: boolean;
  draggedIndex: number | null;
  handleDragStart: (index: number) => void;
  handleDragEnd: () => void;
  handleDragOver: (event: React.DragEvent<HTMLDivElement>, targetIndex: number, category: string) => void;
  handleEdit: (id: string) => void;
  handleSave: (id: string) => void;
  handleCancel: (id: string) => void;
  handleUpdate: (id: string, updates: Partial<AITool>) => void;
  confirmDelete: (id: string) => void;
  handleToggleFavorite: (id: string) => void;
  handleTogglePaid: (id: string) => void;
  customCategories: string[];
  setShowAddForm: (show: boolean) => void;
}

const AIToolList: React.FC<AIToolListProps> = ({
  filteredTools,
  favoriteTools,
  categorizedTools,
  sortedCategories,
  expandedCategories,
  toggleCategoryExpansion,
  handleCategoryToggle,
  confirmCategoryDelete,
  defaultCategories,
  editingId,
  isDragging,
  draggedIndex,
  handleDragStart,
  handleDragEnd,
  handleDragOver,
  handleEdit,
  handleSave,
  handleCancel,
  handleUpdate,
  confirmDelete,
  handleToggleFavorite,
  handleTogglePaid,
  customCategories,
  setShowAddForm
}) => {
  if (filteredTools.length === 0) {
    return (
      <div className="text-center py-12 glass-card">
        <h3 className="text-xl font-semibold mb-2">No subscriptions found</h3>
        <p className="text-gray-400 mb-4">Add your first subscription to get started</p>
        <Button 
          onClick={() => setShowAddForm(true)}
          className="bg-ai-purple hover:bg-ai-purple/90"
        >
          <PlusCircle className="w-4 h-4 mr-2" />
          Add New Subscription
        </Button>
      </div>
    );
  }

  return (
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
            
            {!defaultCategories.includes(category) && (
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
  );
};

export default AIToolList;

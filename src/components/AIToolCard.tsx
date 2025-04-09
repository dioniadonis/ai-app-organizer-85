
import React from 'react';
import { motion } from 'framer-motion';
import { Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { AITool } from '@/types/AITool';
import { getAIToolIcon } from '@/utils/iconUtils';

interface AIToolCardProps {
  tool: AITool;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  isEditing: boolean;
}

const listItemVariants = {
  hidden: { opacity: 0, y: -10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, y: 10, transition: { duration: 0.2 } },
};

const AIToolCard: React.FC<AIToolCardProps> = ({
  tool,
  onEdit,
  onDelete,
  onToggleFavorite,
  isEditing,
}) => {
  return (
    <motion.div
      variants={listItemVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="tool-card p-4 rounded-lg relative group"
    >
      {/* Favorite Star */}
      <div className="absolute top-2 right-2 flex items-center gap-1 z-10">
        {/* Edit and Delete Buttons */}
        {isEditing && (
          <>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => onEdit(tool.id)}
              className="h-8 w-8 text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity"
              title="Edit"
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => onDelete(tool.id)}
              className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-500/20 opacity-0 group-hover:opacity-100 transition-opacity"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </>
        )}
        
        <button
          onClick={() => onToggleFavorite(tool.id)}
          className={cn(
            'p-1 rounded-full',
            'transition-colors duration-300',
            tool.isFavorite
              ? 'text-yellow-400'
              : 'text-gray-500 hover:text-yellow-400',
            'hover:bg-black/20'
          )}
          title={tool.isFavorite ? "Remove from Favorites" : "Add to Favorites"}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill={tool.isFavorite ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-star"
          >
            <path d="m12 2 3.09 6.26 6.91.9-5.22 5.04 1.18 6.88L12 17.77l-5.96 3.1 1.18-6.88-5.22-5.04 6.91-.9L12 2z" />
          </svg>
        </button>
      </div>

      {/* AI Tool Icon and Name */}
      <div className="flex items-center gap-4 mb-4">
        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-white/10">
          {getAIToolIcon(tool.category)}
        </div>
        <h3 className="text-lg font-semibold text-white">{tool.name}</h3>
      </div>

      {/* Description */}
      <p className="text-gray-400 mb-4 line-clamp-2">{tool.description}</p>

      {/* Category, Cost, Renewal Date */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-300">
        <div className="flex gap-1 items-center">
          <span className="font-medium">Category:</span>
          <span
            className="text-ai-cyan cursor-pointer hover:underline"
            onClick={() => isEditing && onEdit(tool.id)}
          >
            {tool.category}
          </span>
        </div>
        <div className="flex gap-1 items-center">
          <span className="font-medium">Cost:</span>
          <span
            className={cn("text-ai-emerald cursor-pointer hover:underline")}
            onClick={() => isEditing && onEdit(tool.id)}
          >
            {tool.subscriptionCost > 0 ? `$${tool.subscriptionCost}/mo` : 'Free'}
          </span>
        </div>
        {tool.subscriptionCost > 0 && tool.renewalDate && (
          <div className="flex gap-1 items-center">
            <span className="font-medium">Renewal:</span>
            <span
              className="text-ai-amber cursor-pointer hover:underline"
              onClick={() => isEditing && onEdit(tool.id)}
            >
              {tool.renewalDate}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default AIToolCard;


import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Save, XCircle, CheckCircle, X } from 'lucide-react';
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
import { Switch } from "@/components/ui/switch";
import { AITool } from '@/types/AITool';

interface EditableAIToolCardProps {
  tool: AITool;
  onSave: (id: string) => void;
  onCancel: (id: string) => void;
  onUpdate: (id: string, updates: Partial<AITool>) => void;
  customCategories: string[];
}

const EditableAIToolCard: React.FC<EditableAIToolCardProps> = ({
  tool,
  onSave,
  onCancel,
  onUpdate,
  customCategories,
}) => {
  const [localTool, setLocalTool] = useState<AITool>(tool);
  const [showCustomCategoryInput, setShowCustomCategoryInput] = useState(false);
  const [customCategory, setCustomCategory] = useState('');
  const renewalDateInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (field: keyof AITool, value: string | number | boolean) => {
    setLocalTool((prev) => ({ ...prev, [field]: value }));
    onUpdate(tool.id, { [field]: value });
  };

  const handleSave = () => {
    onSave(localTool.id);
  };

  const handleCancel = () => {
    setLocalTool(tool); // Reset to original values
    onCancel(localTool.id);
  };

  const handleAddCustomCategory = () => {
    if (customCategory.trim()) {
      // Update tool with the custom category
      handleInputChange('category', customCategory.trim());
      setCustomCategory('');
      setShowCustomCategoryInput(false);
    }
  };

  useEffect(() => {
    setLocalTool(tool);
  }, [tool]);

  // All available categories including built-in and custom ones
  const allCategories = [
    "General AI", 
    "Writing", 
    "Image Generation", 
    "Code Generation", 
    "Chatbots", 
    "Video Generation",
    ...customCategories.filter(cat => 
      !["General AI", "Writing", "Image Generation", "Code Generation", "Chatbots", "Video Generation"].includes(cat)
    )
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="glass-card p-4 rounded-lg space-y-4"
    >
      {/* Name Input */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
          Name
        </label>
        <Input
          id="name"
          value={localTool.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          className="bg-black/20 text-white border-gray-700"
        />
      </div>

      {/* Description Input */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">
          Description
        </label>
        <Textarea
          id="description"
          value={localTool.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          className="bg-black/20 text-white border-gray-700"
          rows={3}
        />
      </div>

      {/* Website Input */}
      <div>
        <label htmlFor="website" className="block text-sm font-medium text-gray-300 mb-1">
          Website URL
        </label>
        <Input
          id="website"
          type="url"
          value={localTool.website || ''}
          onChange={(e) => handleInputChange('website', e.target.value)}
          className="bg-black/20 text-white border-gray-700"
          placeholder="https://example.com"
        />
      </div>

      {/* Category Select */}
      <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-300 mb-1">
          Category
        </label>
        {showCustomCategoryInput ? (
          <div className="flex gap-2">
            <Input
              value={customCategory}
              onChange={(e) => setCustomCategory(e.target.value)}
              className="bg-black/20 text-white border-gray-700"
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
              value={localTool.category}
              onValueChange={(value) => handleInputChange('category', value)}
            >
              <SelectTrigger className="w-full bg-black/20 text-white border-gray-700">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                {allCategories.map(category => (
                  <SelectItem 
                    key={category} 
                    value={category} 
                    className="hover:bg-gray-700/50 text-white"
                  >
                    {category}
                  </SelectItem>
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

      {/* Subscription Cost Input */}
      <div>
        <label htmlFor="subscriptionCost" className="block text-sm font-medium text-gray-300 mb-1">
          Subscription Cost ($/mo)
        </label>
        <Input
          id="subscriptionCost"
          type="number"
          value={localTool.subscriptionCost > 0 ? localTool.subscriptionCost : ''}
          onChange={(e) =>
            handleInputChange(
              'subscriptionCost',
              e.target.value === '' ? 0 : parseFloat(e.target.value)
            )
          }
          className="bg-black/20 text-white border-gray-700"
          placeholder="Enter cost"
        />
      </div>

      {/* Renewal Date Input */}
      <div>
        <label htmlFor="renewalDate" className="block text-sm font-medium text-gray-300 mb-1">
          Renewal Date {localTool.subscriptionCost > 0 && <span className="text-red-400">*</span>}
        </label>
        <Input
          id="renewalDate"
          type="date"
          value={localTool.renewalDate}
          onChange={(e) => handleInputChange('renewalDate', e.target.value)}
          className="bg-black/20 text-white border-gray-700"
          ref={renewalDateInputRef}
        />
        {localTool.subscriptionCost > 0 && !localTool.renewalDate && (
          <p className="text-red-400 text-xs mt-1">Required for paid subscriptions</p>
        )}
      </div>

      {/* Paid Status */}
      {localTool.subscriptionCost > 0 && (
        <div className="flex items-center space-x-2">
          <label htmlFor="isPaid" className="block text-sm font-medium text-gray-300">
            Payment Status
          </label>
          <div className="flex-1"></div>
          <div className="flex items-center gap-1">
            <span className={!localTool.isPaid ? "text-red-400" : "text-gray-500"}>Unpaid</span>
            <Switch 
              id="isPaid"
              checked={localTool.isPaid || false}
              onCheckedChange={(checked) => handleInputChange('isPaid', checked)}
              className={localTool.isPaid ? "bg-green-600" : "bg-red-600"}
            />
            <span className={localTool.isPaid ? "text-green-400" : "text-gray-500"}>Paid</span>
          </div>
        </div>
      )}

      {/* Save and Cancel Buttons */}
      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          onClick={handleCancel}
          className="bg-gray-700 hover:bg-gray-600 text-white border-gray-600"
        >
          <XCircle className="w-4 h-4 mr-2" />
          Cancel
        </Button>
        <Button
          variant="default"
          onClick={handleSave}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          <Save className="w-4 h-4 mr-2" />
          Save
        </Button>
      </div>
    </motion.div>
  );
};

export default EditableAIToolCard;

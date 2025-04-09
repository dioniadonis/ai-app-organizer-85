
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Save, XCircle } from 'lucide-react';
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
import { AITool } from '@/types/AITool';

interface EditableAIToolCardProps {
  tool: AITool;
  onSave: (id: string) => void;
  onCancel: (id: string) => void;
  onUpdate: (id: string, updates: Partial<AITool>) => void;
}

const EditableAIToolCard: React.FC<EditableAIToolCardProps> = ({
  tool,
  onSave,
  onCancel,
  onUpdate,
}) => {
  const [localTool, setLocalTool] = useState<AITool>(tool);
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

  useEffect(() => {
    setLocalTool(tool);
  }, [tool]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
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

      {/* Category Select */}
      <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-300 mb-1">
          Category
        </label>
        <Select
          value={localTool.category}
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

      {/* Subscription Cost Input */}
      <div>
        <label htmlFor="subscriptionCost" className="block text-sm font-medium text-gray-300 mb-1">
          Subscription Cost ($/mo)
        </label>
        <Input
          id="subscriptionCost"
          type="number"
          value={localTool.subscriptionCost}
          onChange={(e) =>
            handleInputChange(
              'subscriptionCost',
              e.target.value === '' ? 0 : parseFloat(e.target.value)
            )
          }
          className="bg-black/20 text-white border-gray-700"
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

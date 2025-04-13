
import React from 'react';
import { DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

interface CategoryModalProps {
  category: string;
  color: string;
  categories: string[];
  colors: string[];
  onCategoryChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onColorChange: (color: string) => void;
  onCancel: () => void;
  onSave: () => void;
}

const CategoryModal: React.FC<CategoryModalProps> = ({
  category,
  color,
  categories,
  colors,
  onCategoryChange,
  onColorChange,
  onCancel,
  onSave
}) => {
  return (
    <DialogContent className="bg-gray-800 border-gray-700 text-white">
      <DialogHeader>
        <DialogTitle>Set Category</DialogTitle>
        <DialogDescription className="text-gray-400">
          Choose a category for this task
        </DialogDescription>
      </DialogHeader>
      
      <div className="space-y-4 my-4">
        <div>
          <Label htmlFor="category">Category</Label>
          <select 
            id="category"
            value={category}
            onChange={onCategoryChange}
            className="w-full px-3 py-2 mt-1 bg-gray-700 border border-gray-600 rounded-md text-white"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        
        <div>
          <Label>Color</Label>
          <div className="flex flex-wrap gap-2 mt-1">
            {colors.map(color => (
              <button
                key={color}
                onClick={() => onColorChange(color)}
                className={`w-8 h-8 rounded-full ${color === color ? 'ring-2 ring-white' : ''}`}
                style={{ backgroundColor: color }}
                aria-label={`Select color ${color}`}
              />
            ))}
          </div>
        </div>
      </div>
      
      <DialogFooter>
        <Button 
          variant="outline" 
          onClick={onCancel}
          className="border-gray-600 text-gray-300"
        >
          Cancel
        </Button>
        <Button 
          onClick={onSave}
          className="bg-purple-600 hover:bg-purple-700"
        >
          Save
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};

export default CategoryModal;

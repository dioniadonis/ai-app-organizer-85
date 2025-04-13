
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { COLORS, CATEGORIES, DailyTask } from '@/components/planner/types';

interface CategoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedTask: DailyTask | null;
  newTaskCategory: string;
  setNewTaskCategory: (category: string) => void;
  newTaskColor: string;
  setNewTaskColor: (color: string) => void;
  onSaveCategory: () => void;
}

const CategoryModal: React.FC<CategoryModalProps> = ({
  open,
  onOpenChange,
  selectedTask,
  newTaskCategory,
  setNewTaskCategory,
  newTaskColor,
  setNewTaskColor,
  onSaveCategory
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-800 border-gray-700 sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Category</DialogTitle>
          <DialogDescription className="text-gray-400">
            Customize the category and color for this task
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="grid gap-2">
            <label htmlFor="categoryName" className="text-sm font-medium text-gray-200">
              Category Name
            </label>
            <Input 
              id="categoryName" 
              placeholder="Enter category name" 
              value={newTaskCategory} 
              onChange={e => setNewTaskCategory(e.target.value)} 
              className="bg-gray-700 border-gray-600" 
            />
          </div>
          
          <div className="grid gap-2">
            <label className="text-sm font-medium text-gray-200">
              Color
            </label>
            <div className="flex flex-wrap gap-2">
              {COLORS.map(color => (
                <button 
                  key={color} 
                  className={`w-8 h-8 rounded-full ${newTaskColor === color ? 'ring-2 ring-white' : ''}`} 
                  style={{ backgroundColor: color }} 
                  onClick={() => setNewTaskColor(color)} 
                  aria-label={`Select color ${color}`} 
                />
              ))}
            </div>
          </div>
          
          <div className="bg-gray-900/50 rounded-md p-3 mt-4">
            <h4 className="text-sm font-medium mb-2">Preview</h4>
            <div className="flex items-center gap-2 bg-gray-800/40 p-2 rounded-md border border-gray-700">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: newTaskColor }}
              />
              <span className="flex-1 text-white">
                Sample Task
              </span>
              <span 
                className={`text-xs px-1.5 py-0.5 rounded-full bg-opacity-20 border border-opacity-50 cursor-pointer`} 
                style={{
                  backgroundColor: `${newTaskColor}20`,
                  borderColor: `${newTaskColor}50`,
                  color: newTaskColor
                }}
              >
                {newTaskCategory}
              </span>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)} 
            className="border-gray-600 text-gray-300"
          >
            Cancel
          </Button>
          <Button 
            onClick={onSaveCategory} 
            className="bg-purple-600 hover:bg-purple-700"
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CategoryModal;

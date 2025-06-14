
import React from 'react';
import { DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import TimeInput from '@/components/TimeInput';

interface AddTaskModalProps {
  isEdit: boolean;
  taskName: string;
  taskTime: string;
  taskCategory: string;
  taskColor: string;
  categories: string[];
  colors: string[];
  onNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onTimeChange: (time: string) => void;
  onCategoryChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onColorChange: (color: string) => void;
  onCancel: () => void;
  onSave: () => void;
}

const AddTaskModal: React.FC<AddTaskModalProps> = ({
  isEdit,
  taskName,
  taskTime,
  onNameChange,
  onTimeChange,
  onCancel,
  onSave
}) => {
  return (
    <DialogContent className="bg-gray-800 border-gray-700 text-white">
      <DialogHeader>
        <DialogTitle>{isEdit ? 'Edit Task' : 'Add New Task'}</DialogTitle>
        <DialogDescription className="text-gray-400">
          {isEdit ? 'Edit your daily task details' : 'Add a new task to your daily schedule'}
        </DialogDescription>
      </DialogHeader>
      
      <div className="space-y-4 my-4">
        <div>
          <Label htmlFor="taskName">Task Name</Label>
          <Input 
            id="taskName"
            value={taskName} 
            onChange={onNameChange} 
            placeholder="Enter task name" 
            className="bg-gray-700 border-gray-600 mt-1"
          />
        </div>
        
        <div>
          <Label>Time (Optional)</Label>
          <TimeInput 
            value={taskTime} 
            onChange={onTimeChange} 
            label="Time" 
          />
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
          {isEdit ? 'Update Task' : 'Add Task'}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};

export default AddTaskModal;

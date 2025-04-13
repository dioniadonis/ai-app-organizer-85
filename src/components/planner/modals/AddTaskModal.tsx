
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { TimeInput } from '@/components/TimeInput';
import { COLORS, CATEGORIES, DailyTask } from '@/components/planner/types';

interface AddTaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedTask: DailyTask | null;
  newTaskName: string;
  setNewTaskName: (name: string) => void;
  newTaskTime: string;
  setNewTaskTime: (time: string) => void;
  newTaskCategory: string;
  setNewTaskCategory: (category: string) => void;
  newTaskColor: string;
  setNewTaskColor: (color: string) => void;
  onAddTask: () => void;
  onUpdateTask: () => void;
}

const AddTaskModal: React.FC<AddTaskModalProps> = ({
  open,
  onOpenChange,
  selectedTask,
  newTaskName,
  setNewTaskName,
  newTaskTime,
  setNewTaskTime,
  newTaskCategory,
  setNewTaskCategory,
  newTaskColor,
  setNewTaskColor,
  onAddTask,
  onUpdateTask
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-800 border-gray-700 sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{selectedTask ? 'Edit Task' : 'Add New Task'}</DialogTitle>
          <DialogDescription className="text-gray-400">
            {selectedTask ? 'Update your daily task details' : 'Add a new daily task to your routine'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <label htmlFor="name" className="text-sm font-medium text-gray-200">
                Task Name
              </label>
              <Input 
                id="name" 
                placeholder="Enter task name" 
                value={newTaskName} 
                onChange={e => setNewTaskName(e.target.value)} 
                className="bg-gray-700 border-gray-600" 
              />
            </div>
            
            <div className="grid gap-2">
              <label className="text-sm font-medium text-gray-200">
                Time of Day
              </label>
              <TimeInput value={newTaskTime} onChange={setNewTaskTime} label="Time" />
            </div>
            
            <div className="grid gap-2">
              <label htmlFor="category" className="text-sm font-medium text-gray-200">
                Category
              </label>
              <Input 
                id="category" 
                placeholder="Enter custom category" 
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
                    className={`w-6 h-6 rounded-full ${newTaskColor === color ? 'ring-2 ring-white' : ''}`} 
                    style={{ backgroundColor: color }} 
                    onClick={() => setNewTaskColor(color)} 
                    aria-label={`Select color ${color}`} 
                  />
                ))}
              </div>
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
            onClick={selectedTask ? onUpdateTask : onAddTask} 
            className="bg-purple-600 hover:bg-purple-700"
          >
            {selectedTask ? 'Update Task' : 'Add Task'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddTaskModal;

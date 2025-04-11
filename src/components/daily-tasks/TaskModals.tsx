
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { DatePicker } from '@/components/ui/date-picker';
import TimeInput from '@/components/TimeInput';
import { format } from 'date-fns';
import { DailyTask } from '@/components/planner/DailyTasksTab';

interface TaskModalsProps {
  showAddModal: boolean;
  setShowAddModal: (show: boolean) => void;
  showReminderModal: boolean;
  setShowReminderModal: (show: boolean) => void;
  showSettingsModal: boolean;
  setShowSettingsModal: (show: boolean) => void;
  showCalendarModal: boolean;
  setShowCalendarModal: (show: boolean) => void;
  showCopyModal: boolean;
  setShowCopyModal: (show: boolean) => void;
  showMoveModal: boolean;
  setShowMoveModal: (show: boolean) => void;
  showCategoryModal: boolean;
  setShowCategoryModal: (show: boolean) => void;
  selectedTask: DailyTask | null;
  newTaskName: string;
  setNewTaskName: (name: string) => void;
  newTaskTime: string;
  setNewTaskTime: (time: string) => void;
  newTaskCategory: string;
  setNewTaskCategory: (category: string) => void;
  newTaskColor: string;
  setNewTaskColor: (color: string) => void;
  reminderTime: string;
  setReminderTime: (time: string) => void;
  timeIncrement: number;
  setTimeIncrement: (increment: number) => void;
  copyToDate: Date | undefined;
  setCopyToDate: (date: Date | undefined) => void;
  moveToDate: Date | undefined;
  setMoveToDate: (date: Date | undefined) => void;
  showClearWarning: boolean;
  setShowClearWarning: (show: boolean) => void;
  currentDate: Date;
  setCurrentDate: (date: Date) => void;
  handleAddTask: () => void;
  handleUpdateTask: () => void;
  saveReminder: () => void;
  saveCategory: () => void;
  handleCopyTasks: () => void;
  handleMoveTaskToDate: () => void;
  CATEGORIES: string[];
  COLORS: string[];
  timeIncrementOptions: { label: string; value: number }[];
}

const TaskModals: React.FC<TaskModalsProps> = ({
  showAddModal, setShowAddModal,
  showReminderModal, setShowReminderModal,
  showSettingsModal, setShowSettingsModal,
  showCalendarModal, setShowCalendarModal,
  showCopyModal, setShowCopyModal,
  showMoveModal, setShowMoveModal,
  showCategoryModal, setShowCategoryModal,
  selectedTask,
  newTaskName, setNewTaskName,
  newTaskTime, setNewTaskTime,
  newTaskCategory, setNewTaskCategory,
  newTaskColor, setNewTaskColor,
  reminderTime, setReminderTime,
  timeIncrement, setTimeIncrement,
  copyToDate, setCopyToDate,
  moveToDate, setMoveToDate,
  showClearWarning, setShowClearWarning,
  currentDate, setCurrentDate,
  handleAddTask,
  handleUpdateTask,
  saveReminder,
  saveCategory,
  handleCopyTasks,
  handleMoveTaskToDate,
  CATEGORIES,
  COLORS,
  timeIncrementOptions
}) => {
  return (
    <>
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="bg-gray-800 border-gray-700 sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedTask ? 'Edit Task' : 'Add New Task'}</DialogTitle>
            <DialogDescription className="text-gray-400">
              {selectedTask 
                ? 'Update your daily task details'
                : 'Add a new daily task to your routine'}
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
                  onChange={(e) => setNewTaskName(e.target.value)}
                  className="bg-gray-700 border-gray-600"
                />
              </div>
              
              <div className="grid gap-2">
                <label className="text-sm font-medium text-gray-200">
                  Time of Day
                </label>
                <TimeInput
                  value={newTaskTime}
                  onChange={setNewTaskTime}
                  label="Time"
                />
              </div>
              
              <div className="grid gap-2">
                <label htmlFor="category" className="text-sm font-medium text-gray-200">
                  Category
                </label>
                <Input
                  id="category"
                  placeholder="Enter custom category"
                  value={newTaskCategory}
                  onChange={(e) => setNewTaskCategory(e.target.value)}
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
              onClick={() => setShowAddModal(false)}
              className="border-gray-600 text-gray-300"
            >
              Cancel
            </Button>
            <Button 
              onClick={selectedTask ? handleUpdateTask : handleAddTask}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {selectedTask ? 'Update Task' : 'Add Task'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={showReminderModal} onOpenChange={setShowReminderModal}>
        <DialogContent className="bg-gray-800 border-gray-700 sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Set Task Time</DialogTitle>
            <DialogDescription className="text-gray-400">
              Choose when you want to do this task
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium text-gray-200">
                Time of Day
              </label>
              <TimeInput
                value={reminderTime}
                onChange={setReminderTime}
                label="Time"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowReminderModal(false)}
              className="border-gray-600 text-gray-300"
            >
              Cancel
            </Button>
            <Button 
              onClick={saveReminder}
              className="bg-purple-600 hover:bg-purple-700"
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={showSettingsModal} onOpenChange={setShowSettingsModal}>
        <DialogContent className="bg-gray-800 border-gray-700 sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Settings</DialogTitle>
            <DialogDescription className="text-gray-400">
              Customize your daily tasks view
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium text-gray-200">
                Time Increment
              </label>
              <div className="grid grid-cols-3 gap-2">
                {timeIncrementOptions.map(option => (
                  <Button
                    key={option.value}
                    variant={timeIncrement === option.value ? "default" : "outline"}
                    className={timeIncrement === option.value 
                      ? "bg-purple-600 hover:bg-purple-700" 
                      : "border-gray-600 text-gray-300"
                    }
                    onClick={() => setTimeIncrement(option.value)}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-4 border-t border-gray-700">
              <Switch 
                id="clear-warning" 
                checked={showClearWarning}
                onCheckedChange={setShowClearWarning}
              />
              <Label htmlFor="clear-warning" className="text-sm text-gray-300">
                Show warning when clearing tasks
              </Label>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowSettingsModal(false)}
              className="border-gray-600 text-gray-300"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showMoveModal} onOpenChange={setShowMoveModal}>
        <DialogContent className="bg-gray-800 border-gray-700 sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Move Task to Another Date</DialogTitle>
            <DialogDescription className="text-gray-400">
              Select a date to move "{selectedTask?.name}" to
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <DatePicker
              date={moveToDate}
              onDateChange={setMoveToDate}
              disabled={false}
              className="border-gray-600 bg-gray-700"
            />
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowMoveModal(false)}
              className="border-gray-600 text-gray-300"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleMoveTaskToDate}
              className="bg-purple-600 hover:bg-purple-700"
              disabled={!moveToDate}
            >
              Move Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={showCalendarModal} onOpenChange={setShowCalendarModal}>
        <DialogContent className="bg-gray-800 border-gray-700 sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Select Date</DialogTitle>
            <DialogDescription className="text-gray-400">
              Choose a date to view tasks
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <DatePicker
              date={currentDate}
              onDateChange={(date) => {
                if (date) {
                  setCurrentDate(date);
                  setShowCalendarModal(false);
                }
              }}
              disabled={false}
              className="border-gray-600 bg-gray-700"
            />
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowCalendarModal(false)}
              className="border-gray-600 text-gray-300"
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={showCopyModal} onOpenChange={setShowCopyModal}>
        <DialogContent className="bg-gray-800 border-gray-700 sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Copy Tasks</DialogTitle>
            <DialogDescription className="text-gray-400">
              Copy current tasks to another date
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium text-gray-200">
                Select Target Date
              </label>
              <DatePicker
                date={copyToDate}
                onDateChange={setCopyToDate}
                disabled={false}
                className="border-gray-600 bg-gray-700"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowCopyModal(false)}
              className="border-gray-600 text-gray-300"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCopyTasks}
              className="bg-purple-600 hover:bg-purple-700"
              disabled={!copyToDate}
            >
              Copy Tasks
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={showCategoryModal} onOpenChange={setShowCategoryModal}>
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
                onChange={(e) => setNewTaskCategory(e.target.value)}
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
                ></div>
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
              onClick={() => setShowCategoryModal(false)}
              className="border-gray-600 text-gray-300"
            >
              Cancel
            </Button>
            <Button 
              onClick={saveCategory}
              className="bg-purple-600 hover:bg-purple-700"
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TaskModals;

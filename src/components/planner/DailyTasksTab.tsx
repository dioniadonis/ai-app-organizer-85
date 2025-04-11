
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, X, Edit, CheckCircle, Circle, Clock, RotateCcw, Clock as ClockIcon, ListTodo, CalendarClock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import TimeInput from '@/components/TimeInput';
import { toast } from '@/components/ui/use-toast';

export interface DailyTask {
  id: number;
  name: string;
  completed: boolean;
  timeOfDay?: string;
  streak: number;
  lastCompleted?: string;
  color?: string;
  category?: string;
}

interface DailyTasksTabProps {
  tasks: DailyTask[];
  onAddTask: (task: Omit<DailyTask, 'id' | 'streak' | 'completed'>) => void;
  onToggleComplete: (id: number) => void;
  onEditTask: (id: number, task: Partial<DailyTask>) => void;
  onDeleteTask: (id: number) => void;
  onResetStreak: (id: number) => void;
}

const COLORS = [
  '#9b87f5', // Primary Purple
  '#6E56CF', // Vivid Purple
  '#0EA5E9', // Ocean Blue
  '#1EAEDB', // Bright Blue
  '#33C3F0', // Sky Blue
  '#D6BCFA', // Light Purple
  '#F97316', // Bright Orange
  '#D946EF', // Magenta Pink
];

const CATEGORIES = [
  'Morning Routine',
  'Work',
  'Health',
  'Learning',
  'Evening Routine',
  'Wellness',
  'Productivity',
  'Personal'
];

const DailyTasksTab: React.FC<DailyTasksTabProps> = ({
  tasks,
  onAddTask,
  onToggleComplete,
  onEditTask,
  onDeleteTask,
  onResetStreak
}) => {
  const [newTask, setNewTask] = useState<string>('');
  const [newTime, setNewTime] = useState<string>('');
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [newCategory, setNewCategory] = useState<string>('Personal');
  const [newColor, setNewColor] = useState<string>(COLORS[0]);
  const [editingTask, setEditingTask] = useState<number | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    if (editingTask === null) {
      setNewTask('');
      setNewTime('');
      setNewCategory('Personal');
      setNewColor(COLORS[0]);
    }
  }, [editingTask]);

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         (task.category && task.category.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (activeFilter === 'all') return matchesSearch;
    if (activeFilter === 'completed') return task.completed && matchesSearch;
    if (activeFilter === 'incomplete') return !task.completed && matchesSearch;
    if (activeFilter === 'streak') return task.streak > 0 && matchesSearch;
    
    return task.category === activeFilter && matchesSearch;
  });

  const categories = [...new Set(tasks.map(task => task.category).filter(Boolean))];

  const handleAddTask = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    
    if (!newTask.trim()) {
      toast({
        title: "Task name required",
        description: "Please enter a name for your daily task",
        variant: "destructive"
      });
      return;
    }

    onAddTask({
      name: newTask,
      timeOfDay: newTime || undefined,
      color: newColor,
      category: newCategory
    });

    setNewTask('');
    setNewTime('');
    setNewCategory('Personal');
    setNewColor(COLORS[0]);
    setIsAdding(false);
    
    toast({
      title: "Daily task added",
      description: `"${newTask}" has been added to your daily tasks`
    });
  };

  const handleEditSubmit = (id: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    
    if (!task.name.trim()) {
      toast({
        title: "Task name required",
        description: "Please enter a name for your daily task",
        variant: "destructive"
      });
      return;
    }

    setEditingTask(null);

    toast({
      title: "Task updated",
      description: `"${task.name}" has been updated`
    });
  };

  const startEditing = (id: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    
    const task = tasks.find(t => t.id === id);
    if (!task || !task.name.trim()) {
      toast({
        title: "Task name required",
        description: "Please enter a name for your daily task before editing",
        variant: "destructive"
      });
      return;
    }
    
    setEditingTask(id);
    const task2 = tasks.find(t => t.id === id);
    if (task2) {
      setNewTask(task2.name);
      setNewTime(task2.timeOfDay || '');
      setNewCategory(task2.category || 'Personal');
      setNewColor(task2.color || COLORS[0]);
    }
  };

  const cancelEditing = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    
    const task = tasks.find(t => t.id === editingTask);
    if (task && !task.name.trim()) {
      toast({
        title: "Task name required",
        description: "Please enter a name for your daily task",
        variant: "destructive"
      });
      return;
    }
    
    setEditingTask(null);
  };

  const getStreakClassName = (streak: number) => {
    if (streak >= 10) return "bg-purple-500/20 text-purple-300";
    if (streak >= 5) return "bg-blue-500/20 text-blue-300";
    if (streak >= 1) return "bg-green-500/20 text-green-300";
    return "bg-gray-500/20 text-gray-300";
  };

  const handleFilterChange = (value: string) => {
    setActiveFilter(value);
  };

  const getTaskCategoryBadgeClass = (category?: string) => {
    switch(category) {
      case 'Morning Routine': return 'bg-blue-500/20 text-blue-300 border-blue-500/50';
      case 'Work': return 'bg-purple-500/20 text-purple-300 border-purple-500/50';
      case 'Health': return 'bg-green-500/20 text-green-300 border-green-500/50';
      case 'Learning': return 'bg-orange-500/20 text-orange-300 border-orange-500/50';
      case 'Evening Routine': return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/50';
      case 'Wellness': return 'bg-pink-500/20 text-pink-300 border-pink-500/50';
      case 'Productivity': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/50';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <ListTodo className="w-5 h-5 text-purple-400" />
          <h2 className="text-xl font-semibold">Named Daily Tasks</h2>
        </div>
        <Button 
          onClick={(e) => {
            e.stopPropagation();
            setIsAdding(!isAdding);
            if (!isAdding) {
              setNewTask('');
              setNewTime('');
              setNewCategory('Personal');
              setNewColor(COLORS[0]);
            }
          }}
          variant="outline"
          className="bg-purple-600/20 text-purple-300 border-purple-500"
        >
          {isAdding ? <X className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
          {isAdding ? 'Cancel' : 'Add Task'}
        </Button>
      </div>

      {isAdding && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="p-4 rounded-lg bg-gray-800/40 border border-gray-700 mb-6"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Task Name</label>
              <Input 
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                placeholder="Enter task name"
                className="bg-gray-700/50 border-gray-600"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Time of Day (Optional)</label>
                <TimeInput 
                  value={newTime} 
                  onChange={(time) => setNewTime(time)} 
                  label="Time" 
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <select 
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-md text-white"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Color</label>
              <div className="flex flex-wrap gap-2">
                {COLORS.map(color => (
                  <button
                    key={color}
                    onClick={(e) => {
                      e.stopPropagation();
                      setNewColor(color);
                    }}
                    className={`w-6 h-6 rounded-full ${newColor === color ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-800' : ''}`}
                    style={{ backgroundColor: color }}
                    aria-label={`Select color ${color}`}
                  />
                ))}
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddTask();
                }}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Daily Task
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      <div className="mb-4">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <Input
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-xs bg-gray-700/50 border-gray-600"
          />
          
          <Tabs defaultValue="all" onValueChange={handleFilterChange} className="w-auto">
            <TabsList className="bg-gray-800/40">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
              <TabsTrigger value="incomplete">Incomplete</TabsTrigger>
              <TabsTrigger value="streak">Streaks</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {categories.map(category => (
              <Badge
                key={category}
                className={`cursor-pointer ${activeFilter === category ? getTaskCategoryBadgeClass(category) : 'bg-gray-700/50'}`}
                onClick={() => handleFilterChange(category || 'all')}
              >
                {category}
                {activeFilter === category && <X className="ml-1 h-3 w-3" onClick={(e) => {
                  e.stopPropagation();
                  handleFilterChange('all');
                }} />}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {filteredTasks.length > 0 ? (
        <div className="space-y-3">
          {filteredTasks.map(task => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
              className="bg-gray-800/40 rounded-lg p-3 border border-gray-700 hover:bg-gray-800/60 transition-colors"
            >
              {editingTask === task.id ? (
                <div className="space-y-3">
                  <Input 
                    value={task.name}
                    onChange={(e) => onEditTask(task.id, { name: e.target.value })}
                    className="bg-gray-700/50 border-gray-600"
                    onClick={(e) => e.stopPropagation()}
                  />
                  
                  <div className="grid grid-cols-2 gap-3">
                    <TimeInput 
                      value={task.timeOfDay || ''}
                      onChange={(time) => onEditTask(task.id, { timeOfDay: time })}
                      label="Time"
                    />
                    
                    <select 
                      value={task.category}
                      onChange={(e) => onEditTask(task.id, { category: e.target.value })}
                      className="px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-md text-white"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="flex gap-2">
                    {COLORS.map(color => (
                      <button
                        key={color}
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditTask(task.id, { color });
                        }}
                        className={`w-5 h-5 rounded-full ${task.color === color ? 'ring-2 ring-white ring-offset-1 ring-offset-gray-800' : ''}`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="ghost" 
                      onClick={(e) => {
                        e.stopPropagation();
                        cancelEditing();
                      }}
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditSubmit(task.id);
                      }} 
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      Save Changes
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleComplete(task.id);
                      }}
                      className="flex-shrink-0"
                    >
                      {task.completed ? (
                        <CheckCircle className="h-5 w-5 text-purple-400" />
                      ) : (
                        <Circle className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                    
                    <div>
                      <div className="flex items-center">
                        <span 
                          className={`mr-2 text-base ${task.completed ? 'line-through text-gray-400' : 'text-white'}`}
                          style={task.color ? { color: task.color } : undefined}
                        >
                          {task.name}
                        </span>
                        
                        {task.category && (
                          <Badge className={getTaskCategoryBadgeClass(task.category)}>
                            {task.category}
                          </Badge>
                        )}
                      </div>
                      
                      {task.timeOfDay && (
                        <div className="flex items-center mt-1 text-xs text-gray-400">
                          <ClockIcon className="h-3 w-3 mr-1" />
                          <span>{task.timeOfDay}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {task.streak > 0 && (
                      <Badge className={getStreakClassName(task.streak)}>
                        <CalendarClock className="h-3 w-3 mr-1" />
                        {task.streak} day{task.streak !== 1 ? 's' : ''}
                      </Badge>
                    )}
                    
                    <div className="flex gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="h-8 w-8 rounded-full hover:bg-gray-700"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!task.name.trim()) {
                            toast({
                              title: "Task name required",
                              description: "Please enter a name for your daily task before editing",
                              variant: "destructive"
                            });
                            return;
                          }
                          startEditing(task.id);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      
                      {task.streak > 0 && (
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="h-8 w-8 rounded-full hover:bg-gray-700 text-orange-400"
                          onClick={(e) => {
                            e.stopPropagation();
                            onResetStreak(task.id);
                          }}
                        >
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                      )}
                      
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="h-8 w-8 rounded-full hover:bg-red-900/50 text-red-500"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteTask(task.id);
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-400 bg-gray-800/30 rounded-lg">
          {searchTerm ? (
            <p>No tasks match your search. Try a different term.</p>
          ) : (
            <>
              <p className="mb-2">No daily tasks found in this category.</p>
              <Button 
                onClick={(e) => {
                  e.stopPropagation();
                  setIsAdding(true);
                }}
                className="bg-purple-600/20 text-purple-300 border border-purple-500"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add your first daily task
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default DailyTasksTab;

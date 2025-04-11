
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "@/components/ui/use-toast";

interface DailyTask {
  id: number;
  name: string;
  completed: boolean;
}

const DailyTasksPage: React.FC = () => {
  const [dailyTasks, setDailyTasks] = useState<DailyTask[]>([
    { id: 1, name: "Add task", completed: false },
    { id: 2, name: "Add task", completed: false },
    { id: 3, name: "Add task", completed: false },
    { id: 4, name: "Add task", completed: false },
  ]);
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [newTaskName, setNewTaskName] = useState<string>("");

  const handleTaskClick = (taskId: number) => {
    setEditingTaskId(taskId);
    const task = dailyTasks.find(t => t.id === taskId);
    if (task) {
      setNewTaskName(task.name === "Add task" ? "" : task.name);
    }
  };

  const handleTaskNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewTaskName(e.target.value);
  };

  const handleTaskNameBlur = (taskId: number) => {
    console.log('Blurring task:', taskId);
    
    if (!newTaskName.trim()) {
      // If no name is entered, remove the task completely
      setDailyTasks(prev => prev.filter(t => t.id !== taskId));
    } else {
      // Update the task name if a non-empty name is provided
      setDailyTasks(prev => prev.map(t => {
        if (t.id === taskId) {
          return { ...t, name: newTaskName };
        }
        return t;
      }));
    }
    
    // Always clear the editing state
    setEditingTaskId(null);
  };

  const handleTaskToggle = (taskId: number) => {
    setDailyTasks(prev => prev.map(task => {
      if (task.id === taskId) {
        const newCompletedState = !task.completed;
        
        // Show toast when task is completed or uncompleted
        toast({
          title: newCompletedState ? "Task completed" : "Task uncompleted",
          description: task.name,
        });
        
        return { ...task, completed: newCompletedState };
      }
      return task;
    }));
  };

  const addNewTask = () => {
    const newId = dailyTasks.length > 0 ? Math.max(...dailyTasks.map(t => t.id)) + 1 : 1;
    setDailyTasks([...dailyTasks, { id: newId, name: "Add task", completed: false }]);
  };

  return (
    <div className="container mx-auto p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-100">Daily Tasks</h1>
        
        <Card className="bg-gray-800 border-gray-700 p-6 mb-6">
          <ScrollArea className="h-[400px] pr-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {dailyTasks.map((task) => (
                <motion.div
                  key={task.id}
                  whileHover={{ scale: 1.02 }}
                  className={`p-4 rounded-lg cursor-pointer ${
                    task.completed ? 'bg-green-900/30 border border-green-700' : 'bg-gray-700/50 border border-gray-600'
                  }`}
                  onClick={() => handleTaskClick(task.id)}
                >
                  <div className="flex items-start justify-between">
                    {editingTaskId === task.id ? (
                      <input
                        type="text"
                        value={newTaskName}
                        onChange={handleTaskNameChange}
                        onBlur={() => handleTaskNameBlur(task.id)}
                        autoFocus
                        className="w-full bg-gray-600 text-white px-2 py-1 rounded outline-none"
                      />
                    ) : (
                      <div 
                        className={`flex-1 ${task.completed ? 'line-through text-green-400' : 'text-gray-100'}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (task.name !== "Add task") {
                            handleTaskToggle(task.id);
                          }
                        }}
                      >
                        {task.name}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="p-4 rounded-lg cursor-pointer bg-gray-700/30 border border-gray-600 flex items-center justify-center"
                onClick={addNewTask}
              >
                <span className="text-2xl mr-2">+</span>
                <span>Add new task</span>
              </motion.div>
            </div>
          </ScrollArea>
        </Card>
      </motion.div>
    </div>
  );
};

export default DailyTasksPage;

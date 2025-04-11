
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Edit, Plus } from 'lucide-react';
import { format, addDays, subDays } from 'date-fns';
import { DailyTask } from '@/components/planner/DailyTasksTab';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

const DailyTasksPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [dailyTasks, setDailyTasks] = useState<DailyTask[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Time slots for the timeline view
  const timeSlots = Array.from({ length: 24 }, (_, i) => {
    const hour = i % 12 === 0 ? 12 : i % 12;
    const period = i < 12 ? 'AM' : 'PM';
    return `${hour}:00 ${period}`;
  });
  
  // Also add half-hour slots
  const allTimeSlots = timeSlots.flatMap(slot => {
    const [hour, period] = slot.split(' ');
    const [hourNum] = hour.split(':');
    return [
      `${hour} ${period}`,
      `${hourNum}:30 ${period}`
    ];
  });
  
  // Filter to only show evening time slots by default (like in the image)
  const displayTimeSlots = allTimeSlots.filter(slot => {
    const [time, period] = slot.split(' ');
    const [hour] = time.split(':');
    return (period === 'PM' && parseInt(hour) >= 5) || (period === 'AM' && parseInt(hour) < 6);
  });

  useEffect(() => {
    const savedTasks = localStorage.getItem('dailyTasks');
    if (savedTasks) {
      setDailyTasks(JSON.parse(savedTasks));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('dailyTasks', JSON.stringify(dailyTasks));
  }, [dailyTasks]);

  const handlePreviousDay = () => {
    setCurrentDate(prev => subDays(prev, 1));
  };

  const handleNextDay = () => {
    setCurrentDate(prev => addDays(prev, 1));
  };

  const handleTaskToggle = (taskId: number) => {
    setDailyTasks(prev => prev.map(task => {
      if (task.id === taskId) {
        const wasCompleted = task.completed;
        const today = new Date().toISOString().split('T')[0];
        
        // Update the streak if completing the task
        let newStreak = task.streak;
        let lastCompleted = task.lastCompleted;
        
        if (!wasCompleted) {
          newStreak = task.streak + 1;
          lastCompleted = today;
        } else {
          // If uncompleting, reduce streak if it was completed today
          if (task.lastCompleted === today) {
            newStreak = Math.max(0, task.streak - 1);
          }
        }
        
        return {
          ...task,
          completed: !wasCompleted,
          streak: newStreak,
          lastCompleted
        };
      }
      return task;
    }));
    
    toast({
      title: "Task updated",
      description: "Task status has been updated"
    });
  };

  // Get tasks for the selected time slot
  const getTasksForTimeSlot = (timeSlot: string) => {
    // Convert timeSlot format (e.g., "7:00 PM") to 24-hour format (e.g., "19:00")
    const [time, period] = timeSlot.split(' ');
    const [hour, minute] = time.split(':');
    let hour24 = parseInt(hour);
    
    if (period === 'PM' && hour24 !== 12) {
      hour24 += 12;
    } else if (period === 'AM' && hour24 === 12) {
      hour24 = 0;
    }
    
    const timeString = `${hour24.toString().padStart(2, '0')}:${minute || '00'}`;
    
    return dailyTasks.filter(task => task.timeOfDay === timeString);
  };

  // Format for rendering
  const formattedDate = format(currentDate, 'MMMM d, yyyy');
  const dayName = format(currentDate, 'EEEE');
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-gray-100">
      <div className="max-w-md mx-auto p-2">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 py-2">
          <button 
            onClick={() => navigate(-1)} 
            className="rounded-md p-2 hover:bg-gray-800 transition-colors"
          >
            <ChevronLeft size={24} className="text-blue-400" />
          </button>
          
          <h1 className="text-2xl font-bold text-white">{dayName}</h1>
          
          <button
            onClick={() => setShowAddModal(true)}
            className="rounded-md p-2 hover:bg-gray-800 transition-colors"
          >
            <Edit size={24} className="text-blue-400" />
          </button>
        </div>
        
        {/* Date Navigation */}
        <div className="flex items-center justify-between mb-6 px-4 py-2 bg-gray-800/30 rounded-lg">
          <button onClick={handlePreviousDay}>
            <ChevronLeft size={20} className="text-blue-400" />
          </button>
          
          <h2 className="text-lg font-medium text-white">{formattedDate}</h2>
          
          <button onClick={handleNextDay}>
            <ChevronRight size={20} className="text-blue-400" />
          </button>
        </div>
        
        {/* Time Slots Timeline */}
        <div className="bg-gray-900/80 rounded-lg border border-gray-800">
          {displayTimeSlots.map((timeSlot, index) => {
            const tasksInSlot = getTasksForTimeSlot(timeSlot);
            
            return (
              <div key={timeSlot} className="border-b border-gray-800 last:border-b-0">
                <div className="flex items-center p-3">
                  <div className="w-20 text-gray-400 font-medium">{timeSlot}</div>
                  
                  <div className="flex-1 ml-4">
                    {tasksInSlot.length > 0 ? (
                      <div className="space-y-2">
                        {tasksInSlot.map(task => (
                          <div 
                            key={task.id}
                            className="flex items-center gap-2 bg-gray-800/40 p-2 rounded-md border border-gray-700"
                          >
                            <div 
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: task.color || '#9b87f5' }}
                            ></div>
                            <span 
                              className={`flex-1 ${task.completed ? 'line-through text-gray-500' : ''}`}
                              style={task.color ? { color: task.color } : undefined}
                            >
                              {task.name}
                            </span>
                            <input 
                              type="checkbox" 
                              checked={task.completed}
                              onChange={() => handleTaskToggle(task.id)}
                              className="h-4 w-4 rounded border-gray-500 text-purple-600 focus:ring-2 focus:ring-purple-500"
                            />
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 flex justify-center p-4 bg-gray-900/90 border-t border-gray-800">
          <div className="flex gap-4">
            <Button 
              onClick={handlePreviousDay} 
              variant="outline" 
              className="bg-gray-800/50 border-gray-700 text-blue-400"
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              Previous
            </Button>
            
            <Button
              onClick={() => navigate('/planner?tab=dailyTasks')}
              variant="outline"
              className="bg-gray-800/50 border-gray-700 text-purple-400"
            >
              <Plus className="mr-1 h-4 w-4" />
              Manage Tasks
            </Button>
            
            <Button 
              onClick={handleNextDay} 
              variant="outline" 
              className="bg-gray-800/50 border-gray-700 text-blue-400"
            >
              Next
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyTasksPage;

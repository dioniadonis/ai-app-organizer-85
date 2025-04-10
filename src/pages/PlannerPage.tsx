
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { toast } from '@/components/ui/use-toast';

// Import refactored components
import PlannerHeader from '@/components/planner/PlannerHeader';
import PlannerContent from '@/components/planner/PlannerContent';
import AIAssistantDialog from '@/components/planner/AIAssistantDialog';
import NotificationSettingsDialog from '@/components/planner/NotificationSettingsDialog';

interface PlannerDataType {
  tasks: any[];
  goals: any[];
  recurringTasks: any[];
}

const PlannerPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState<string>('planner');
  const [activeTab, setActiveTab] = useState('tasks');
  const [hasNotifications, setHasNotifications] = useState(true);
  const [isNotificationSettingsOpen, setIsNotificationSettingsOpen] = useState(false);
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);
  const [plannerData, setPlannerData] = useState<PlannerDataType>({
    tasks: [],
    goals: [],
    recurringTasks: []
  });

  const [notifications, setNotifications] = useState([
    { id: 1, title: "Task Due", message: "Complete project presentation", date: "2 hours ago" },
    { id: 2, title: "Goal Progress", message: "Daily exercise goal near completion", date: "Yesterday" }
  ]);

  const notificationForm = useForm({
    defaultValues: {
      frequency: 'daily',
      emailNotifications: true,
      pushNotifications: true,
      customRate: 'Every 6 hours'
    }
  });

  useEffect(() => {
    const savedData = localStorage.getItem('plannerData');
    if (savedData) {
      setPlannerData(JSON.parse(savedData));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('plannerData', JSON.stringify(plannerData));
  }, [plannerData]);

  const handleTabChange = (value: string) => {
    if (value === 'dashboard') {
      navigate('/');
    } else if (value === 'expenses') {
      navigate('/expenses');
    } else {
      setActiveView(value);
    }
  };

  const saveNotificationSettings = (data: any) => {
    toast({
      title: "Notification settings saved",
      description: `Frequency: ${data.frequency}, Custom Rate: ${data.customRate}`,
    });
    setIsNotificationSettingsOpen(false);
  };
  
  const handleTaskToggle = (taskId: number | string) => {
    const taskIndex = plannerData.tasks.findIndex(t => t.id === taskId);
    if (taskIndex !== -1) {
      const updatedTasks = [...plannerData.tasks];
      updatedTasks[taskIndex] = {
        ...updatedTasks[taskIndex],
        completed: !updatedTasks[taskIndex].completed
      };
      setPlannerData({
        ...plannerData,
        tasks: updatedTasks
      });
      
      toast({
        title: updatedTasks[taskIndex].completed ? "Task completed" : "Task marked incomplete",
        description: updatedTasks[taskIndex].title,
      });
    }
  };
  
  const handleTaskDelete = (taskId: number | string) => {
    setPlannerData({
      ...plannerData,
      tasks: plannerData.tasks.filter(task => task.id !== taskId)
    });
    
    toast({
      title: "Task deleted",
      description: "The task has been removed from your list"
    });
  };

  const handleGoalUpdate = (goalId: number | string, newData: any) => {
    const goalIndex = plannerData.goals.findIndex(g => g.id === goalId);
    if (goalIndex !== -1) {
      const updatedGoals = [...plannerData.goals];
      updatedGoals[goalIndex] = {
        ...updatedGoals[goalIndex],
        ...newData
      };
      setPlannerData({
        ...plannerData,
        goals: updatedGoals
      });
      
      toast({
        title: "Goal updated",
        description: `"${updatedGoals[goalIndex].title}" has been updated`
      });
    }
  };

  const addRecurringTask = (taskData: any) => {
    const newRecurringTasks = [...plannerData.recurringTasks, {
      id: Date.now(),
      title: taskData.title,
      frequency: taskData.frequency,
      nextDue: taskData.nextDue,
      priority: taskData.priority || 'medium',
      createdAt: new Date().toISOString()
    }];
    
    setPlannerData({
      ...plannerData,
      recurringTasks: newRecurringTasks
    });
    
    toast({
      title: "Recurring task added",
      description: `"${taskData.title}" will repeat ${taskData.frequency}`,
    });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    },
    exit: {
      opacity: 0,
      transition: {
        duration: 0.2
      }
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div 
        className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-gray-100"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        key={activeView}
      >
        <div className="max-w-6xl mx-auto p-4 sm:p-6">
          <PlannerHeader 
            activeView={activeView} 
            onViewChange={handleTabChange}
            hasNotifications={hasNotifications}
            notifications={notifications}
            setHasNotifications={setHasNotifications}
            setNotifications={setNotifications}
            openNotificationSettings={() => setIsNotificationSettingsOpen(true)}
            openAIAssistant={() => setIsAIAssistantOpen(true)}
          />
          
          <PlannerContent 
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            plannerData={plannerData}
            setPlannerData={setPlannerData}
          />
          
          <footer className="py-6 text-center text-gray-500 mt-12">
            <p>Loop Space AI Organizer &copy; {new Date().getFullYear()}</p>
          </footer>
        </div>
        
        <NotificationSettingsDialog 
          isOpen={isNotificationSettingsOpen}
          onOpenChange={setIsNotificationSettingsOpen}
          notificationForm={notificationForm}
          onSave={saveNotificationSettings}
        />
        
        <AIAssistantDialog 
          isOpen={isAIAssistantOpen}
          onOpenChange={setIsAIAssistantOpen}
        />
      </motion.div>
    </AnimatePresence>
  );
};

export default PlannerPage;

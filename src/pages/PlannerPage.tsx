
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Planner from '@/components/Planner';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import { 
  ChevronLeft, 
  Home, 
  CreditCard, 
  LayoutDashboard, 
  CalendarCheck, 
  Bell, 
  Settings,
  Repeat
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { toast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Form, FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';
import { useForm } from 'react-hook-form';

const PlannerPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState<string>('planner');
  const [activeTab, setActiveTab] = useState('tasks');
  const [hasNotifications, setHasNotifications] = useState(true);
  const [isNotificationSettingsOpen, setIsNotificationSettingsOpen] = useState(false);
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);
  const [aiAssistantInput, setAIAssistantInput] = useState('');
  const [aiAssistantConversation, setAIAssistantConversation] = useState<{role: 'user' | 'assistant', content: string}[]>([]);
  const [plannerData, setPlannerData] = useState<{
    tasks: any[],
    goals: any[],
    recurringTasks: any[]
  }>({
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
    }
  });

  useEffect(() => {
    // Persist data when switching between tabs
    const savedData = localStorage.getItem('plannerData');
    if (savedData) {
      setPlannerData(JSON.parse(savedData));
    }
  }, []);

  useEffect(() => {
    // Save data when it changes
    localStorage.setItem('plannerData', JSON.stringify(plannerData));
  }, [plannerData]);
  
  const handleTabChange = (value: string) => {
    if (value === 'dashboard') {
      navigate('/');
    } else if (value === 'expenses') {
      // Navigate to expenses page when implemented
      toast({
        title: "Expenses",
        description: "Expenses feature is being implemented",
      });
    } else {
      setActiveView(value);
    }
  };

  const handlePlannerTabChange = (tabValue: string) => {
    setActiveTab(tabValue);
  };

  const markNotificationAsRead = (id: number) => {
    setNotifications(notifications.filter(n => n.id !== id));
    if (notifications.length <= 1) {
      setHasNotifications(false);
    }
  };

  const saveNotificationSettings = (data: any) => {
    // Save notification settings
    toast({
      title: "Notification settings saved",
      description: `Frequency: ${data.frequency}`,
    });
    setIsNotificationSettingsOpen(false);
  };

  const handleAIAssistantSubmit = () => {
    if (!aiAssistantInput.trim()) return;
    
    // Add user message to conversation
    const updatedConversation = [
      ...aiAssistantConversation,
      { role: 'user', content: aiAssistantInput }
    ];
    setAIAssistantConversation(updatedConversation);
    
    // Clear input
    setAIAssistantInput('');
    
    // Simulate AI response
    setTimeout(() => {
      let response: string;
      
      // Simple logic to determine response based on user input
      if (aiAssistantInput.toLowerCase().includes('goal')) {
        response = "I can help you set up a goal. What's the title of your goal, and when would you like to complete it? Would you like to add any steps to track progress?";
      } else if (aiAssistantInput.toLowerCase().includes('task')) {
        response = "I'd be happy to help you create a task. What's the task title, due date, and priority level? Should this be a recurring task?";
      } else if (aiAssistantInput.toLowerCase().includes('recurring')) {
        response = "I can set up a recurring task for you. What task would you like to repeat, and how often? (Daily, Weekly, Monthly)";
      } else if (aiAssistantInput.toLowerCase().includes('expense')) {
        response = "I can help you track expenses related to your goals. What's the expense for, and what's the amount? Which goal is this expense related to?";
      } else {
        response = "I'm your AI assistant for planning. I can help you create tasks, set goals, manage recurring tasks, and track expenses. What would you like help with today?";
      }
      
      // Add AI response to conversation
      setAIAssistantConversation([
        ...updatedConversation,
        { role: 'assistant', content: response }
      ]);
    }, 800);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.4,
        ease: "easeOut"
      }
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

  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-gray-100"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="max-w-6xl mx-auto p-4 sm:p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">Planner & Goals</h1>
          
          <div className="flex items-center gap-3">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="w-5 h-5" />
                  {hasNotifications && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full"></span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0 bg-gray-800 border-gray-700" align="end">
                <div className="p-3 border-b border-gray-700">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium">Notifications</h3>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setIsNotificationSettingsOpen(true)}
                    >
                      <Settings className="h-4 w-4 mr-1" />
                      Settings
                    </Button>
                  </div>
                </div>
                <div className="max-h-80 overflow-auto">
                  {notifications.length > 0 ? (
                    notifications.map(notification => (
                      <div key={notification.id} className="p-3 border-b border-gray-700 hover:bg-gray-700/50 transition-colors">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium text-sm">{notification.title}</h4>
                            <p className="text-sm text-gray-400">{notification.message}</p>
                            <p className="text-xs text-gray-500 mt-1">{notification.date}</p>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6"
                            onClick={() => markNotificationAsRead(notification.id)}
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-gray-400">
                      <p>No new notifications</p>
                    </div>
                  )}
                </div>
                <div className="p-2 border-t border-gray-700">
                  <Button variant="ghost" size="sm" className="w-full text-xs">
                    Clear all notifications
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
            
            <button 
              onClick={() => navigate(-1)} 
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800/50 text-sm hover:bg-white/10 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          </div>
        </div>
        
        <div className="bg-gray-800/30 rounded-xl mb-6 backdrop-blur-sm">
          <Tabs value={activeView} onValueChange={handleTabChange} className="w-full">
            <TabsList className="w-full justify-start bg-transparent">
              <TabsTrigger 
                value="planner" 
                className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-white rounded-lg gap-2"
              >
                <CalendarCheck className="w-4 h-4" />
                Planner
              </TabsTrigger>
              <TabsTrigger 
                value="dashboard" 
                className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-white rounded-lg gap-2"
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger 
                value="expenses" 
                className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-white rounded-lg gap-2"
              >
                <CreditCard className="w-4 h-4" />
                Expenses
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        <div className="bg-gray-800/20 rounded-xl p-6 shadow-lg border border-gray-700">
          <div className="flex justify-between items-center mb-6">
            <Tabs value={activeTab} onValueChange={handlePlannerTabChange} className="w-full">
              <TabsList className="bg-gray-800/40 rounded-lg p-1">
                <TabsTrigger 
                  value="tasks" 
                  className="data-[state=active]:bg-purple-600 data-[state=active]:text-white rounded-md"
                >
                  Tasks
                </TabsTrigger>
                <TabsTrigger 
                  value="goals" 
                  className="data-[state=active]:bg-purple-600 data-[state=active]:text-white rounded-md"
                >
                  Goals
                </TabsTrigger>
                <TabsTrigger 
                  value="recurring" 
                  className="data-[state=active]:bg-purple-600 data-[state=active]:text-white rounded-md"
                >
                  <Repeat className="w-4 h-4 mr-1" />
                  Recurring
                </TabsTrigger>
              </TabsList>
            </Tabs>
            
            <Button 
              onClick={() => setIsAIAssistantOpen(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white transition-colors"
            >
              AI Assistant
            </Button>
          </div>
          
          <Planner activeTab={activeTab} plannerData={plannerData} setPlannerData={setPlannerData} />
        </div>
        
        <footer className="py-6 text-center text-gray-500 mt-12">
          <p>Loop Space AI Organizer &copy; {new Date().getFullYear()}</p>
        </footer>
      </div>
      
      {/* Notification Settings Dialog */}
      <Dialog open={isNotificationSettingsOpen} onOpenChange={setIsNotificationSettingsOpen}>
        <DialogContent className="bg-gray-800 text-white border-gray-700">
          <DialogHeader>
            <DialogTitle>Notification Settings</DialogTitle>
            <DialogDescription className="text-gray-400">
              Customize how and when you receive notifications
            </DialogDescription>
          </DialogHeader>
          
          <Form {...notificationForm}>
            <form onSubmit={notificationForm.handleSubmit(saveNotificationSettings)} className="space-y-4">
              <FormField
                control={notificationForm.control}
                name="frequency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notification Frequency</FormLabel>
                    <FormControl>
                      <select 
                        className="w-full p-2 rounded-md bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        {...field}
                      >
                        <option value="realtime">Real-time</option>
                        <option value="hourly">Hourly</option>
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                      </select>
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={notificationForm.control}
                name="emailNotifications"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2">
                    <FormControl>
                      <input 
                        type="checkbox" 
                        className="rounded-sm"
                        checked={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="m-0">Email Notifications</FormLabel>
                  </FormItem>
                )}
              />
              
              <FormField
                control={notificationForm.control}
                name="pushNotifications"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2">
                    <FormControl>
                      <input 
                        type="checkbox" 
                        className="rounded-sm"
                        checked={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="m-0">Push Notifications</FormLabel>
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsNotificationSettingsOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
                  Save Changes
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* AI Assistant Dialog */}
      <Dialog open={isAIAssistantOpen} onOpenChange={setIsAIAssistantOpen}>
        <DialogContent className="bg-gray-800 text-white border-gray-700 max-w-2xl">
          <DialogHeader>
            <DialogTitle>AI Planning Assistant</DialogTitle>
            <DialogDescription className="text-gray-400">
              I can help you create tasks, set goals, and manage your planning
            </DialogDescription>
          </DialogHeader>
          
          <div className="max-h-[60vh] overflow-y-auto flex flex-col space-y-4 p-4 my-2 bg-gray-900/50 rounded-md">
            {aiAssistantConversation.length === 0 ? (
              <div className="text-center text-gray-500 p-6">
                <p>Ask me to help with your planning needs!</p>
                <p className="text-sm mt-2">Examples:</p>
                <ul className="text-xs mt-1 space-y-1">
                  <li>"Create a new goal for my project"</li>
                  <li>"Add a recurring task for weekly reports"</li>
                  <li>"Help me plan my expenses for this month"</li>
                </ul>
              </div>
            ) : (
              aiAssistantConversation.map((message, index) => (
                <div 
                  key={index} 
                  className={`${
                    message.role === 'user' 
                      ? 'ml-auto bg-purple-600/80' 
                      : 'mr-auto bg-gray-700/80'
                  } p-3 rounded-xl max-w-[80%]`}
                >
                  {message.content}
                </div>
              ))
            )}
          </div>
          
          <div className="flex gap-2 mt-2">
            <Textarea 
              placeholder="Ask me about tasks, goals, or planning..."
              value={aiAssistantInput}
              onChange={(e) => setAIAssistantInput(e.target.value)}
              className="bg-gray-700 border-gray-600 focus:border-purple-500"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleAIAssistantSubmit();
                }
              }}
            />
            <Button 
              onClick={handleAIAssistantSubmit}
              className="bg-purple-600 hover:bg-purple-700"
            >
              Send
            </Button>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAIAssistantOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default PlannerPage;


import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Planner from '@/components/Planner';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import { ChevronLeft, Home, CreditCard, LayoutDashboard, CalendarCheck, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

const PlannerPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState<string>('planner');
  const [hasNotifications, setHasNotifications] = useState(true);
  const [notifications, setNotifications] = useState([
    { id: 1, title: "Task Due", message: "Complete project presentation", date: "2 hours ago" },
    { id: 2, title: "Goal Progress", message: "Daily exercise goal near completion", date: "Yesterday" }
  ]);
  
  const handleTabChange = (value: string) => {
    if (value === 'dashboard') {
      navigate('/');
    } else if (value === 'expenses') {
      // For future implementation - navigate to expenses page
      // For now, just stay on planner
      setActiveView('planner');
    } else {
      setActiveView(value);
    }
  };

  const markNotificationAsRead = (id: number) => {
    setNotifications(notifications.filter(n => n.id !== id));
    if (notifications.length <= 1) {
      setHasNotifications(false);
    }
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
              <PopoverContent className="w-80 p-0" align="end">
                <div className="p-3 border-b border-gray-800">
                  <h3 className="font-medium">Notifications</h3>
                </div>
                <div className="max-h-80 overflow-auto">
                  {notifications.length > 0 ? (
                    notifications.map(notification => (
                      <div key={notification.id} className="p-3 border-b border-gray-800 hover:bg-gray-800/50 transition-colors">
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
                <div className="p-2 border-t border-gray-800">
                  <Button variant="ghost" size="sm" className="w-full text-xs">
                    Manage Notification Settings
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
          <Planner />
        </div>
        
        <footer className="py-6 text-center text-gray-500 mt-12">
          <p>Loop Space AI Organizer &copy; {new Date().getFullYear()}</p>
        </footer>
      </div>
    </motion.div>
  );
};

export default PlannerPage;

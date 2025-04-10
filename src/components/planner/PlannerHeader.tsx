
import React from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bell, ChevronLeft, LayoutDashboard, CalendarClock, CreditCard, Settings, UserCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';
import NotificationPopover from './NotificationPopover';

interface PlannerHeaderProps {
  activeView: string;
  onViewChange: (value: string) => void;
  hasNotifications: boolean;
  notifications: any[];
  setHasNotifications: (value: boolean) => void;
  setNotifications: (notifications: any[]) => void;
  openNotificationSettings: () => void;
  openAIAssistant: () => void;
}

const PlannerHeader: React.FC<PlannerHeaderProps> = ({
  activeView,
  onViewChange,
  hasNotifications,
  notifications,
  setHasNotifications,
  setNotifications,
  openNotificationSettings,
  openAIAssistant
}) => {
  const navigate = useNavigate();

  const markNotificationAsRead = (id: number) => {
    setNotifications(notifications.filter(n => n.id !== id));
    if (notifications.length <= 1) {
      setHasNotifications(false);
    }
  };

  const navigateToAccount = () => {
    toast({
      title: "Account",
      description: "Account page is coming soon. Early adopters fee: $5 (Currently free)",
    });
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <motion.h1 
          className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.3 }}
        >
          Planner & Goals
        </motion.h1>
        
        <div className="flex items-center gap-3">
          <NotificationPopover 
            hasNotifications={hasNotifications}
            notifications={notifications}
            openSettings={openNotificationSettings}
            markAsRead={markNotificationAsRead}
          />
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="relative"
            onClick={navigateToAccount}
          >
            <UserCircle className="w-5 h-5" />
          </Button>
          
          <Button
            variant="ghost" 
            onClick={openAIAssistant}
            className="bg-purple-600/20 hover:bg-purple-700/30 text-white transition-colors"
          >
            AI Assistant
          </Button>
          
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800/30 text-sm hover:bg-white/10 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
        </div>
      </div>
      
      <motion.div 
        className="bg-gray-800/30 rounded-xl mb-6 backdrop-blur-sm"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.3 }}
      >
        <Tabs value={activeView} onValueChange={onViewChange} className="w-full">
          <TabsList className="w-full justify-start bg-transparent">
            <TabsTrigger 
              value="planner" 
              className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-white rounded-lg gap-2"
            >
              <CalendarClock className="w-4 h-4" />
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
      </motion.div>
    </>
  );
};

export default PlannerHeader;

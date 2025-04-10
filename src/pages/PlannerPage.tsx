
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Planner from '@/components/Planner';
import HolographicTitle from '@/components/HolographicTitle';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import { ChevronLeft, Home, CreditCard, LayoutDashboard, CalendarCheck } from 'lucide-react';

const PlannerPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState<string>('planner');
  
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
          <HolographicTitle title="Planner & Goals" />
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center gap-2 px-3 py-2 rounded-lg glass-card text-sm hover:bg-white/10 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
        </div>
        
        <div className="glass-card p-4 rounded-xl mb-6">
          <Tabs value={activeView} onValueChange={handleTabChange} className="w-full">
            <TabsList className="w-full justify-start border-b border-gray-800 pb-1 bg-transparent">
              <TabsTrigger 
                value="planner" 
                className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-purple-500 data-[state=active]:shadow-none rounded-none gap-2"
              >
                <CalendarCheck className="w-4 h-4" />
                Planner
              </TabsTrigger>
              <TabsTrigger 
                value="dashboard" 
                className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-purple-500 data-[state=active]:shadow-none rounded-none gap-2"
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger 
                value="expenses" 
                className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-purple-500 data-[state=active]:shadow-none rounded-none gap-2"
              >
                <CreditCard className="w-4 h-4" />
                Expenses
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        <div className="glass-card rounded-xl p-6 shadow-lg border border-purple-500/20">
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


import React from 'react';
import { AITool } from '@/types/AITool';
import { Banknote, Calendar, Package, Star, ExternalLink, CheckCircle, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { format, isToday, isTomorrow } from 'date-fns';

interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate?: string;
  completed: boolean;
  notify: boolean;
}

interface Goal {
  id: string;
  title: string;
  targetDate?: string;
  progress: number;
  completedSteps: number;
  totalSteps: number;
  type: 'daily' | 'short' | 'long';
}

interface DashboardProps {
  aiTools: AITool[];
  onCategoryClick: (category: string) => void;
  onRenewalClick: () => void;
  onViewPlanner: () => void;
  tasks?: Task[];
  goals?: Goal[];
  selectedCategories: string[];
  onCategoryToggle: (category: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  aiTools, 
  onCategoryClick, 
  onRenewalClick, 
  onViewPlanner,
  tasks = [],
  goals = [],
  selectedCategories,
  onCategoryToggle
}) => {
  // Calculate statistics
  const totalTools = aiTools.length;
  const favoriteTools = aiTools.filter(tool => tool.isFavorite).length;
  const totalMonthlyCost = aiTools.reduce((sum, tool) => sum + tool.subscriptionCost, 0);
  
  // Get upcoming renewals including those due today
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Set to beginning of day for comparison
  const thirtyDaysLater = new Date();
  thirtyDaysLater.setDate(today.getDate() + 30);
  
  const upcomingRenewals = aiTools.filter(tool => {
    if (!tool.renewalDate) return false;
    const renewalDate = new Date(tool.renewalDate);
    renewalDate.setHours(0, 0, 0, 0); // Set to beginning of day for comparison
    return renewalDate >= today && renewalDate <= thirtyDaysLater;
  });

  // Get category counts
  const categoryCount = aiTools.reduce((acc, tool) => {
    acc[tool.category] = (acc[tool.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const categoryItems = Object.entries(categoryCount)
    .sort((a, b) => b[1] - a[1])
    .map(([category, count], index) => (
      <div 
        key={category}
        className={`p-2 px-3 rounded-full text-sm flex items-center gap-2 cursor-pointer transition-colors ${
          selectedCategories.includes(category) 
            ? 'bg-ai-purple/30 text-ai-purple border border-ai-purple/50' 
            : 'glass-card hover:bg-white/10'
        }`}
        onClick={() => onCategoryToggle(category)}
      >
        <span>{category}</span>
        <span className="bg-white/20 rounded-full w-5 h-5 flex items-center justify-center text-xs">
          {count}
        </span>
      </div>
    ));

  // Single animation variant for smooth fade in
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="py-6"
    >
      <h2 className="text-2xl font-bold mb-6 ai-gradient-text">Dashboard</h2>
      
      <motion.div 
        variants={containerVariants}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
      >
        {/* Total Tools */}
        <motion.div 
          variants={containerVariants} 
          className="dashboard-stat-card cursor-pointer"
          onClick={() => onCategoryClick('')}
        >
          <Package className="w-8 h-8 mb-2 text-ai-blue" />
          <span className="text-gray-400 text-sm">Total Subscriptions</span>
          <span className="text-3xl font-bold">{totalTools}</span>
        </motion.div>
        
        {/* Favorite Tools */}
        <motion.div 
          variants={containerVariants} 
          className="dashboard-stat-card cursor-pointer"
          onClick={() => onCategoryClick('Favorites')}
        >
          <Star className="w-8 h-8 mb-2 text-ai-amber" />
          <span className="text-gray-400 text-sm">Favorites</span>
          <span className="text-3xl font-bold">{favoriteTools}</span>
        </motion.div>
        
        {/* Monthly Cost */}
        <motion.div 
          variants={containerVariants} 
          className="dashboard-stat-card cursor-pointer"
          onClick={() => onCategoryClick('')}
        >
          <Banknote className="w-8 h-8 mb-2 text-ai-emerald" />
          <span className="text-gray-400 text-sm">Monthly Cost</span>
          <span className="text-3xl font-bold">${totalMonthlyCost}</span>
        </motion.div>
        
        {/* Upcoming Renewals */}
        <motion.div 
          variants={containerVariants} 
          className="dashboard-stat-card cursor-pointer"
          onClick={onRenewalClick}
        >
          <Calendar className="w-8 h-8 mb-2 text-ai-purple" />
          <span className="text-gray-400 text-sm">Upcoming Renewals</span>
          <span className="text-3xl font-bold">{upcomingRenewals.length}</span>
        </motion.div>
      </motion.div>
      
      {/* Categories */}
      <motion.div variants={containerVariants} className="glass-card p-4 rounded-xl mb-8">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-semibold">Categories</h3>
          {selectedCategories.length > 0 && (
            <button 
              onClick={() => selectedCategories.forEach(cat => onCategoryToggle(cat))}
              className="text-xs text-gray-400 hover:text-white"
            >
              Clear all
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {categoryItems}
        </div>
      </motion.div>

      {/* Planner section - show if tasks or goals exist */}
      {(tasks.length > 0 || goals.length > 0) && (
        <motion.div
          variants={containerVariants}
          className="mb-8"
        >
          <DashboardPlanner 
            tasks={tasks} 
            goals={goals} 
            onViewPlanner={onViewPlanner} 
          />
        </motion.div>
      )}
      
      {/* Upcoming Renewals List */}
      {upcomingRenewals.length > 0 && (
        <motion.div 
          variants={containerVariants} 
          className="glass-card p-4 rounded-xl"
        >
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-ai-pink" />
            Upcoming Renewals
          </h3>
          <div className="space-y-2">
            {upcomingRenewals.map(tool => {
              // Calculate days remaining
              const now = new Date();
              now.setHours(0, 0, 0, 0);
              const renewalDate = new Date(tool.renewalDate);
              renewalDate.setHours(0, 0, 0, 0);
              
              const daysRemaining = Math.round((renewalDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
              
              let daysText = "";
              if (isToday(renewalDate)) {
                daysText = "Due today!";
              } else if (isTomorrow(renewalDate)) {
                daysText = "Due tomorrow";
              } else {
                daysText = `${daysRemaining} days left`;
              }
              
              return (
                <div 
                  key={tool.id} 
                  className="flex justify-between items-center p-2 rounded hover:bg-white/5 transition-colors cursor-pointer"
                  onClick={() => onCategoryClick(tool.category)}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-ai-pink animate-pulse"></div>
                    <span>{tool.name}</span>
                    {tool.isPaid !== undefined && (
                      <span className={`ml-2 ${tool.isPaid ? "text-green-400" : "text-red-400"} flex items-center`}>
                        {tool.isPaid ? <CheckCircle className="w-4 h-4 mr-1" /> : <XCircle className="w-4 h-4 mr-1" />}
                        {tool.isPaid ? "Paid" : "Unpaid"}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-ai-emerald">${tool.subscriptionCost}/mo</span>
                    <span className="text-gray-400">{tool.renewalDate}</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${daysRemaining <= 3 ? "bg-red-500/20 text-red-300" : "bg-ai-blue/20 text-ai-blue"}`}>
                      {daysText}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default Dashboard;

// Need to import this at the top
import DashboardPlanner from './DashboardPlanner';

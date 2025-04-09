
import React from 'react';
import { AITool } from '@/types/AITool';
import { Banknote, Calendar, Package, Star } from 'lucide-react';
import { motion } from 'framer-motion';

interface DashboardProps {
  aiTools: AITool[];
  onCategoryClick: (category: string) => void;
  onRenewalClick: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ aiTools, onCategoryClick, onRenewalClick }) => {
  // Calculate statistics
  const totalTools = aiTools.length;
  const favoriteTools = aiTools.filter(tool => tool.isFavorite).length;
  const totalMonthlyCost = aiTools.reduce((sum, tool) => sum + tool.subscriptionCost, 0);
  
  // Get upcoming renewals (next 30 days)
  const today = new Date();
  const thirtyDaysLater = new Date();
  thirtyDaysLater.setDate(today.getDate() + 30);
  
  const upcomingRenewals = aiTools.filter(tool => {
    if (!tool.renewalDate) return false;
    const renewalDate = new Date(tool.renewalDate);
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
        className="p-2 px-3 rounded-full glass-card text-sm flex items-center gap-2 cursor-pointer hover:bg-white/10 transition-colors"
        onClick={() => onCategoryClick(category)}
      >
        <span>{category}</span>
        <span className="bg-white/20 rounded-full w-5 h-5 flex items-center justify-center text-xs">
          {count}
        </span>
      </div>
    ));

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 }
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
          variants={itemVariants} 
          className="dashboard-stat-card cursor-pointer"
          onClick={() => onCategoryClick('')}
        >
          <Package className="w-8 h-8 mb-2 text-ai-blue" />
          <span className="text-gray-400 text-sm">Total Tools</span>
          <span className="text-3xl font-bold">{totalTools}</span>
        </motion.div>
        
        {/* Favorite Tools */}
        <motion.div 
          variants={itemVariants} 
          className="dashboard-stat-card cursor-pointer"
          onClick={() => onCategoryClick('Favorites')}
        >
          <Star className="w-8 h-8 mb-2 text-ai-amber" />
          <span className="text-gray-400 text-sm">Favorites</span>
          <span className="text-3xl font-bold">{favoriteTools}</span>
        </motion.div>
        
        {/* Monthly Cost */}
        <motion.div 
          variants={itemVariants} 
          className="dashboard-stat-card cursor-pointer"
          onClick={() => onCategoryClick('')}
        >
          <Banknote className="w-8 h-8 mb-2 text-ai-emerald" />
          <span className="text-gray-400 text-sm">Monthly Cost</span>
          <span className="text-3xl font-bold">${totalMonthlyCost}</span>
        </motion.div>
        
        {/* Upcoming Renewals */}
        <motion.div 
          variants={itemVariants} 
          className="dashboard-stat-card cursor-pointer"
          onClick={onRenewalClick}
        >
          <Calendar className="w-8 h-8 mb-2 text-ai-purple" />
          <span className="text-gray-400 text-sm">Upcoming Renewals</span>
          <span className="text-3xl font-bold">{upcomingRenewals.length}</span>
        </motion.div>
      </motion.div>
      
      {/* Categories */}
      <motion.div variants={itemVariants} className="glass-card p-4 rounded-xl mb-8">
        <h3 className="text-lg font-semibold mb-3">Categories</h3>
        <div className="flex flex-wrap gap-2">
          {categoryItems}
        </div>
      </motion.div>
      
      {/* Upcoming Renewals List */}
      {upcomingRenewals.length > 0 && (
        <motion.div 
          variants={itemVariants} 
          className="glass-card p-4 rounded-xl"
        >
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-ai-pink" />
            Upcoming Renewals
          </h3>
          <div className="space-y-2">
            {upcomingRenewals.map(tool => (
              <div 
                key={tool.id} 
                className="flex justify-between items-center p-2 rounded hover:bg-white/5 transition-colors cursor-pointer"
                onClick={() => onCategoryClick(tool.category)}
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-ai-pink animate-pulse"></div>
                  <span>{tool.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-ai-emerald">${tool.subscriptionCost}/mo</span>
                  <span className="text-gray-400">{tool.renewalDate}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default Dashboard;

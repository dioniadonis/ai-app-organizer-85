
import React from 'react';
import { motion } from 'framer-motion';
import { Package, Star, Banknote, Receipt } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface DashboardStatsProps {
  totalExpenses: number;
  favoriteTools: number;
  totalMonthlyCost: number;
  unpaidTotal: number;
  onCategoryClick: (category: string) => void;
  onUnpaidExpensesClick: () => void;
  containerVariants: any;
}

const DashboardStats: React.FC<DashboardStatsProps> = ({
  totalExpenses,
  favoriteTools,
  totalMonthlyCost,
  unpaidTotal,
  onCategoryClick,
  onUnpaidExpensesClick,
  containerVariants
}) => {
  const navigate = useNavigate();

  return (
    <motion.div 
      variants={containerVariants}
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
    >
      <motion.div 
        variants={containerVariants} 
        className="bg-gray-800/50 border border-gray-700/50 p-4 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-gray-700/30 transition-colors"
        onClick={() => navigate('/expenses')}
      >
        <Package className="w-8 h-8 mb-2 text-blue-400" />
        <span className="text-gray-400 text-sm">Total Expenses</span>
        <span className="text-3xl font-bold">${totalExpenses.toFixed(2)}</span>
      </motion.div>
      
      <motion.div 
        variants={containerVariants} 
        className="bg-gray-800/50 border border-gray-700/50 p-4 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-gray-700/30 transition-colors"
        onClick={() => onCategoryClick('Favorites')}
      >
        <Star className="w-8 h-8 mb-2 text-yellow-400" />
        <span className="text-gray-400 text-sm">Favorites</span>
        <span className="text-3xl font-bold">{favoriteTools}</span>
      </motion.div>
      
      <motion.div 
        variants={containerVariants} 
        className="bg-gray-800/50 border border-gray-700/50 p-4 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-gray-700/30 transition-colors"
        onClick={() => navigate('/expenses')}
      >
        <Banknote className="w-8 h-8 mb-2 text-green-400" />
        <span className="text-gray-400 text-sm">Monthly Cost</span>
        <span className="text-3xl font-bold">${totalMonthlyCost.toFixed(2)}</span>
      </motion.div>
      
      <motion.div 
        variants={containerVariants} 
        className="bg-gray-800/50 border border-gray-700/50 p-4 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-gray-700/30 transition-colors"
        onClick={onUnpaidExpensesClick}
      >
        <Receipt className="w-8 h-8 mb-2 text-red-400" />
        <span className="text-gray-400 text-sm">Unpaid Expenses</span>
        <span className="text-3xl font-bold">${unpaidTotal.toFixed(2)}</span>
      </motion.div>
    </motion.div>
  );
};

export default DashboardStats;

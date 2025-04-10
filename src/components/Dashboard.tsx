import React, { useState, useEffect } from 'react';
import { AITool } from '@/types/AITool';
import { Banknote, Calendar, Package, Star, CheckCircle, XCircle, Grid3X3, Layout, LayoutDashboard, Plus, CalendarClock, Clock, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { format, isToday, isTomorrow, isPast } from 'date-fns';
import PlannerWidget from './PlannerWidget';
import ExpensesWidget from './ExpensesWidget';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { toast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useNavigate } from 'react-router-dom';
import SearchBox from './SearchBox';
import { useIsMobile } from '@/hooks/use-mobile';
import HolographicTitle from './HolographicTitle';

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
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [widgetLayout, setWidgetLayout] = useState<'grid' | 'list'>('grid');
  const [showAddWidgetDialog, setShowAddWidgetDialog] = useState(false);
  const [activeWidgets, setActiveWidgets] = useState({
    planner: true,
    expenses: true,
    renewals: true,
    categories: true
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [expenses, setExpenses] = useState<any[]>([]);
  const [renewals, setRenewals] = useState<any[]>([]);
  
  useEffect(() => {
    const savedExpenses = localStorage.getItem('expenses');
    if (savedExpenses) {
      try {
        const parsedExpenses = JSON.parse(savedExpenses);
        setExpenses(parsedExpenses);
        
        const recurringExpenses = parsedExpenses.filter((expense: any) => expense.recurring);
        setRenewals(recurringExpenses);
      } catch (e) {
        console.error('Failed to parse expenses from localStorage', e);
      }
    }
    
    const timerID = setInterval(() => setCurrentDateTime(new Date()), 60000);
    return () => clearInterval(timerID);
  }, []);
  
  useEffect(() => {
    const renewalsFromStorage = localStorage.getItem('renewals');
    if (renewalsFromStorage) {
      try {
        setRenewals(JSON.parse(renewalsFromStorage));
      } catch (e) {
        console.error('Failed to parse renewals from localStorage', e);
      }
    }
  }, []);
  
  const totalTools = aiTools.length;
  const favoriteTools = aiTools.filter(tool => tool.isFavorite).length;
  
  const totalMonthlyCost = expenses.reduce((sum, expense) => {
    if (expense.recurring) {
      return sum + expense.amount;
    }
    return sum;
  }, 0);
  
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const thirtyDaysLater = new Date();
  thirtyDaysLater.setDate(today.getDate() + 30);
  
  const toolRenewals = aiTools.filter(tool => {
    if (!tool.renewalDate) return false;
    const renewalDate = new Date(tool.renewalDate);
    renewalDate.setHours(0, 0, 0, 0);
    return renewalDate >= today && renewalDate <= thirtyDaysLater;
  });
  
  const expenseRenewals = renewals.map(expense => {
    const date = expense.date || new Date().toISOString().split('T')[0];
    return {
      id: expense.id || `expense-${Date.now()}-${Math.random()}`,
      name: expense.category,
      category: expense.category,
      subscriptionCost: expense.amount,
      renewalDate: date,
      isPaid: false,
      isExpense: true,
      frequency: expense.frequency || 'monthly'
    };
  });
  
  const upcomingRenewals = [...toolRenewals, ...expenseRenewals];

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
            ? 'bg-purple-500/30 text-purple-300 border border-purple-500/50' 
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

  const toggleWidget = (widgetName: keyof typeof activeWidgets) => {
    setActiveWidgets({
      ...activeWidgets,
      [widgetName]: !activeWidgets[widgetName]
    });
    
    toast({
      title: activeWidgets[widgetName] ? "Widget removed" : "Widget added",
      description: `${widgetName.charAt(0).toUpperCase() + widgetName.slice(1)} widget has been ${activeWidgets[widgetName] ? "removed from" : "added to"} dashboard`,
    });
  };
  
  const handleAddExpense = () => {
    navigate('/expenses');
  };

  const handleViewAllExpenses = () => {
    navigate('/expenses');
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const handleToggleTaskComplete = (taskId: string | number) => {
    toast({
      title: "Task status updated",
      description: "Task completion status has been toggled",
    });
  };

  const handleEditTask = (task: any) => {
    navigate('/planner');
  };

  const handleEditGoal = (goal: any) => {
    navigate('/planner');
  };

  const formattedDate = format(currentDateTime, 'EEEE, MMMM d, yyyy');
  const formattedTime = format(currentDateTime, 'h:mm a');

  const handleRenewalClick = (renewal: any) => {
    if (renewal.isExpense) {
      localStorage.setItem('selectedExpenseCategory', renewal.category);
      navigate('/expenses?view=list&category=' + encodeURIComponent(renewal.category));
    } else {
      onCategoryClick(renewal.category);
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="py-6 px-2 sm:px-4 max-w-full overflow-x-hidden"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <motion.div
          className="flex items-center gap-3"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.3 }}
        >
          <h2 className="text-2xl font-bold text-white">Dashboard</h2>
        </motion.div>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full md:w-auto">
          <div className="hidden md:flex items-center text-gray-400 text-sm mr-3">
            <Clock className="w-4 h-4 mr-1" />
            <span>{formattedDate} • {formattedTime}</span>
          </div>
          
          <SearchBox 
            onSearch={handleSearch} 
            className="w-full sm:w-64 md:w-72"
          />
          
          <div className="flex items-center gap-2 ml-auto">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
              onClick={() => setWidgetLayout('grid')}
            >
              <Grid3X3 className={`h-4 w-4 ${widgetLayout === 'grid' ? 'text-purple-400' : 'text-gray-400'}`} />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 mr-2"
              onClick={() => setWidgetLayout('list')}
            >
              <Layout className={`h-4 w-4 ${widgetLayout === 'list' ? 'text-purple-400' : 'text-gray-400'}`} />
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              className="text-xs gap-1"
              onClick={() => setShowAddWidgetDialog(true)}
            >
              <Plus className="h-3 w-3" />
              Add Widget
            </Button>
          </div>
        </div>
      </div>
      
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
          onClick={onRenewalClick}
        >
          <Calendar className="w-8 h-8 mb-2 text-purple-400" />
          <span className="text-gray-400 text-sm">Upcoming Renewals</span>
          <span className="text-3xl font-bold">{upcomingRenewals.length}</span>
        </motion.div>
      </motion.div>
      
      <div className={`grid ${widgetLayout === 'grid' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'} gap-6 mb-8`}>
        {activeWidgets.planner && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <PlannerWidget 
              tasks={tasks} 
              goals={goals} 
              onViewMore={onViewPlanner}
              onToggleTaskComplete={handleToggleTaskComplete}
              onEditTask={handleEditTask}
              onEditGoal={handleEditGoal}
            />
          </motion.div>
        )}
        
        {activeWidgets.expenses && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <ExpensesWidget 
              expenses={expenses}
              onAddExpense={handleAddExpense}
              onViewAllExpenses={handleViewAllExpenses}
            />
          </motion.div>
        )}
      </div>
      
      {activeWidgets.categories && categoryItems.length > 0 && (
        <motion.div variants={containerVariants} className="bg-gray-800/50 border border-gray-700/50 p-4 rounded-xl mb-8 overflow-x-auto">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-medium">Categories</h3>
            {selectedCategories.length > 0 && (
              <button 
                onClick={() => selectedCategories.forEach(cat => onCategoryToggle(cat))}
                className="text-xs text-gray-400 hover:text-white"
              >
                Clear all
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2 min-w-max">
            {categoryItems}
          </div>
        </motion.div>
      )}
      
      {activeWidgets.renewals && upcomingRenewals.length > 0 && (
        <motion.div 
          variants={containerVariants} 
          className="bg-gray-800/50 border border-gray-700/50 p-4 rounded-xl overflow-x-auto"
        >
          <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-purple-400" />
            Upcoming Renewals
          </h3>
          <div className="space-y-2">
            {upcomingRenewals.map(renewal => {
              const now = new Date();
              now.setHours(0, 0, 0, 0);
              const renewalDate = new Date(renewal.renewalDate);
              renewalDate.setHours(0, 0, 0, 0);
              
              const daysRemaining = Math.round((renewalDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
              const isOverdue = isPast(renewalDate) && !isToday(renewalDate);
              
              let daysText = "";
              if (isToday(renewalDate)) {
                daysText = "Due today!";
              } else if (isTomorrow(renewalDate)) {
                daysText = "Due tomorrow";
              } else if (isOverdue) {
                daysText = "Overdue";
              } else {
                daysText = `${daysRemaining} days left`;
              }
              
              return (
                <div 
                  key={renewal.id} 
                  className={`flex flex-col sm:flex-row justify-between items-start sm:items-center p-2 rounded hover:bg-white/5 transition-colors cursor-pointer ${
                    isOverdue ? 'border-l-4 border-red-500 pl-2' : ''
                  }`}
                  onClick={() => handleRenewalClick(renewal)}
                >
                  <div className="flex items-center gap-2 mb-2 sm:mb-0">
                    <div className={`w-2 h-2 rounded-full ${isOverdue ? 'bg-red-400' : 'bg-purple-400'} animate-pulse`}></div>
                    <span className="truncate max-w-[180px] sm:max-w-none">{renewal.name}</span>
                    {renewal.isPaid !== undefined && (
                      <span className={`ml-2 ${renewal.isPaid ? "text-green-400" : "text-red-400"} flex items-center`}>
                        {renewal.isPaid ? <CheckCircle className="w-4 h-4 mr-1" /> : <XCircle className="w-4 h-4 mr-1" />}
                        {renewal.isPaid ? "Paid" : "Unpaid"}
                      </span>
                    )}
                    {renewal.isExpense && (
                      <span className="ml-1 px-1 bg-blue-500/20 text-blue-300 rounded-full text-xs">
                        {renewal.frequency || 'recurring'}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
                    <span className="text-green-400">${renewal.subscriptionCost}{renewal.isExpense ? '' : '/mo'}</span>
                    <span className="text-gray-400 text-sm">{format(new Date(renewal.renewalDate), 'MMM dd, yyyy')}</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      isOverdue 
                        ? "bg-red-500/20 text-red-300" 
                        : daysRemaining <= 3 
                          ? "bg-orange-500/20 text-orange-300" 
                          : "bg-blue-500/20 text-blue-300"
                    }`}>
                      {isOverdue && <AlertCircle className="inline-block h-3 w-3 mr-1" />}
                      {daysText}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      <Dialog open={showAddWidgetDialog} onOpenChange={setShowAddWidgetDialog}>
        <DialogContent className="bg-gray-800 text-white border-gray-700 max-w-sm mx-auto">
          <DialogHeader>
            <DialogTitle>Manage Dashboard Widgets</DialogTitle>
            <DialogDescription className="text-gray-400">
              Choose which widgets to display on your dashboard
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-3 py-2">
            <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-700/30">
              <div className="flex items-center gap-2">
                <CalendarClock className="h-5 w-5 text-purple-400" />
                <span>Planner Widget</span>
              </div>
              <Button 
                variant={activeWidgets.planner ? "default" : "outline"} 
                size="sm"
                className={activeWidgets.planner ? "bg-purple-600" : ""}
                onClick={() => toggleWidget('planner')}
              >
                {activeWidgets.planner ? "Active" : "Add"}
              </Button>
            </div>
            
            <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-700/30">
              <div className="flex items-center gap-2">
                <Banknote className="h-5 w-5 text-green-400" />
                <span>Expenses Widget</span>
              </div>
              <Button 
                variant={activeWidgets.expenses ? "default" : "outline"} 
                size="sm"
                className={activeWidgets.expenses ? "bg-purple-600" : ""}
                onClick={() => toggleWidget('expenses')}
              >
                {activeWidgets.expenses ? "Active" : "Add"}
              </Button>
            </div>
            
            <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-700/30">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-purple-400" />
                <span>Renewals List</span>
              </div>
              <Button 
                variant={activeWidgets.renewals ? "default" : "outline"} 
                size="sm"
                className={activeWidgets.renewals ? "bg-purple-600" : ""}
                onClick={() => toggleWidget('renewals')}
              >
                {activeWidgets.renewals ? "Active" : "Add"}
              </Button>
            </div>
            
            <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-700/30">
              <div className="flex items-center gap-2">
                <LayoutDashboard className="h-5 w-5 text-blue-400" />
                <span>Categories</span>
              </div>
              <Button 
                variant={activeWidgets.categories ? "default" : "outline"} 
                size="sm"
                className={activeWidgets.categories ? "bg-purple-600" : ""}
                onClick={() => toggleWidget('categories')}
              >
                {activeWidgets.categories ? "Active" : "Add"}
              </Button>
            </div>
          </div>
          
          <DialogFooter>
            <Button onClick={() => setShowAddWidgetDialog(false)}>
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default Dashboard;

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, CreditCard, TrendingUp, CalendarClock, ListTodo } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { DashboardProps } from '@/types/ComponentProps';
import { Task, Goal, Insight, Renewal } from '@/types/dashboard';

// Import refactored components
import DashboardHeader from './dashboard/DashboardHeader';
import DashboardStats from './dashboard/DashboardStats';
import DashboardWidgets from './dashboard/DashboardWidgets';
import DashboardCategories from './dashboard/DashboardCategories';
import RenewalsSection from './dashboard/RenewalsSection';
import WidgetDialog from './dashboard/WidgetDialog';

const Dashboard: React.FC<DashboardProps> = ({ 
  aiTools, 
  tasks = [],
  goals = [],
  selectedCategories,
  filterByRenewal,
  handleRenewalFilter,
  handleCategoryToggle,
  customCategories,
  navigateToPlanner,
  navigateToDailyTasks,
  setShowAddForm,
  expandedCategories = [],
  toggleCategoryExpansion,
  confirmCategoryDelete,
  setShowAIDialog,
  dailyTasks
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
  const [localDailyTasks, setLocalDailyTasks] = useState<any[]>([]);
  const [mobileControlsExpanded, setMobileControlsExpanded] = useState(false);
  const [activeInsight, setActiveInsight] = useState(0);

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
    
    const savedDailyTasks = localStorage.getItem('dailyTasks');
    if (savedDailyTasks) {
      try {
        setLocalDailyTasks(JSON.parse(savedDailyTasks));
      } catch (e) {
        console.error('Failed to parse daily tasks from localStorage', e);
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
  
  const favoriteTools = aiTools.filter(tool => tool.isFavorite).length;
  
  const totalMonthlyCost = expenses.reduce((sum, expense) => {
    if (expense.recurring && (expense.frequency === 'monthly' || !expense.frequency)) {
      return sum + expense.amount;
    }
    return sum;
  }, 0) + aiTools.reduce((sum, tool) => {
    return sum + (tool.subscriptionCost || 0);
  }, 0);
  
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0) + 
    aiTools.reduce((sum, tool) => sum + (tool.subscriptionCost || 0), 0);
  
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
      isPaid: expense.isPaid !== false,
      isExpense: true,
      frequency: expense.frequency || 'monthly'
    };
  });
  
  const upcomingRenewals = [...toolRenewals, ...expenseRenewals];

  const unpaidTotal = expenses
    .filter(expense => expense.isPaid === false)
    .reduce((sum, expense) => sum + expense.amount, 0);

  const unpaidCount = expenses.filter(expense => expense.isPaid === false).length;

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
        onClick={() => handleCategoryToggle(category)}
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

  const handleRenewalClick = (renewal: Renewal) => {
    if (renewal.isExpense) {
      localStorage.setItem('selectedExpenseCategory', renewal.category);
      navigate('/expenses?view=list&category=' + encodeURIComponent(renewal.category));
    } else {
      handleCategoryToggle(renewal.category);
    }
  };

  const handleRenewalsStatClick = () => {
    if (upcomingRenewals.length > 0) {
      navigate('/expenses?view=list&filter=renewals');
      toast({
        title: "Showing upcoming renewals",
        description: `${upcomingRenewals.length} upcoming renewals loaded`,
      });
    } else {
      toast({
        title: "No upcoming renewals",
        description: "You don't have any upcoming renewals in the next 30 days",
      });
    }
  };

  const handleUnpaidExpensesClick = () => {
    if (unpaidTotal > 0) {
      navigate('/expenses?view=list&filter=unpaid');
      toast({
        title: "Showing unpaid expenses",
        description: "Filtered to show only unpaid expenses",
      });
    } else {
      toast({
        title: "No unpaid expenses",
        description: "You don't have any unpaid expenses at the moment",
      });
    }
  };

  const handleCategoryClear = () => {
    selectedCategories.forEach(cat => handleCategoryToggle(cat));
  };

  const getInsights = () => {
    const insights: Insight[] = [];
    
    const sevenDaysFromNow = addDays(new Date(), 7);
    const upcomingSevenDays = upcomingRenewals.filter(renewal => {
      const renewalDate = new Date(renewal.renewalDate);
      return renewalDate <= sevenDaysFromNow;
    });
    
    if (upcomingSevenDays.length > 0) {
      insights.push({
        title: `${upcomingSevenDays.length} renewal${upcomingSevenDays.length > 1 ? 's' : ''} due in 7 days`,
        description: `Total of $${upcomingSevenDays.reduce((sum, r) => sum + r.subscriptionCost, 0).toFixed(2)}`,
        icon: <AlertTriangle className="w-5 h-5 text-orange-400" />,
        action: handleRenewalsStatClick,
        color: 'bg-orange-500/20 text-orange-300'
      });
    }
    
    if (unpaidTotal > 0) {
      insights.push({
        title: `${unpaidCount} unpaid expense${unpaidCount > 1 ? 's' : ''}`,
        description: `Total of $${unpaidTotal.toFixed(2)}`,
        icon: <CreditCard className="w-5 h-5 text-red-400" />,
        action: handleUnpaidExpensesClick,
        color: 'bg-red-500/20 text-red-300'
      });
    }
    
    insights.push({
      title: "Monthly spending",
      description: `$${totalMonthlyCost.toFixed(2)}/month`,
      icon: <TrendingUp className="w-5 h-5 text-blue-400" />,
      action: () => navigate('/expenses'),
      color: 'bg-blue-500/20 text-blue-300'
    });
    
    const incompleteTasks = tasks.filter(task => !task.completed);
    if (incompleteTasks.length > 0) {
      insights.push({
        title: `${incompleteTasks.length} pending task${incompleteTasks.length > 1 ? 's' : ''}`,
        description: "Click to view your planner",
        icon: <CalendarClock className="w-5 h-5 text-purple-400" />,
        action: navigateToPlanner,
        color: 'bg-purple-500/20 text-purple-300'
      });
    }

    const tasksToUse = dailyTasks || localDailyTasks;
    const dailyTasksWithStreaks = tasksToUse.filter(task => task.streak > 0);
    if (dailyTasksWithStreaks.length > 0) {
      insights.push({
        title: `${dailyTasksWithStreaks.length} daily task streak${dailyTasksWithStreaks.length > 1 ? 's' : ''}`,
        description: "Keep your momentum going!",
        icon: <ListTodo className="w-5 h-5 text-green-400" />,
        action: navigateToDailyTasks || navigateToPlanner,
        color: 'bg-green-500/20 text-green-300'
      });
    }
    
    return insights;
  };
  
  const insights = getInsights();
  
  useEffect(() => {
    if (insights.length <= 1) return;
    
    const timer = setInterval(() => {
      setActiveInsight(current => (current + 1) % insights.length);
    }, 8000);
    
    return () => clearInterval(timer);
  }, [insights.length]);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="py-6 px-2 sm:px-4 max-w-full overflow-x-hidden"
    >
      <DashboardHeader 
        formattedDate={formattedDate}
        formattedTime={formattedTime}
        insights={insights}
        activeInsight={activeInsight}
        isMobile={isMobile}
        mobileControlsExpanded={mobileControlsExpanded}
        setMobileControlsExpanded={setMobileControlsExpanded}
        handleSearch={handleSearch}
        widgetLayout={widgetLayout}
        setWidgetLayout={setWidgetLayout}
        setShowAddWidgetDialog={setShowAddWidgetDialog}
      />
      
      <DashboardStats 
        totalExpenses={totalExpenses}
        favoriteTools={favoriteTools}
        totalMonthlyCost={totalMonthlyCost}
        unpaidTotal={unpaidTotal}
        onCategoryClick={handleCategoryToggle}
        onUnpaidExpensesClick={handleUnpaidExpensesClick}
        containerVariants={containerVariants}
      />
      
      <DashboardWidgets 
        widgetLayout={widgetLayout}
        activeWidgets={activeWidgets}
        tasks={tasks}
        goals={goals}
        dailyTasks={dailyTasks || localDailyTasks}
        expenses={expenses}
        totalExpenses={totalExpenses}
        monthlyExpenses={totalMonthlyCost}
        unpaidTotal={unpaidTotal}
        onViewPlanner={navigateToPlanner}
        onViewDailyTasks={navigateToDailyTasks}
        onToggleTaskComplete={handleToggleTaskComplete}
        onEditTask={handleEditTask}
        onEditGoal={handleEditGoal}
        onAddExpense={handleAddExpense}
        onViewAllExpenses={handleViewAllExpenses}
      />
      
      {activeWidgets.categories && (
        <DashboardCategories 
          categoryItems={categoryItems}
          selectedCategories={selectedCategories}
          onCategoryClear={handleCategoryClear}
          containerVariants={containerVariants}
        />
      )}
      
      {activeWidgets.renewals && (
        <RenewalsSection 
          upcomingRenewals={upcomingRenewals}
          onRenewalClick={handleRenewalClick}
          containerVariants={containerVariants}
        />
      )}

      <WidgetDialog 
        open={showAddWidgetDialog}
        onOpenChange={setShowAddWidgetDialog}
        activeWidgets={activeWidgets}
        toggleWidget={toggleWidget}
      />
    </motion.div>
  );
};

export default Dashboard;

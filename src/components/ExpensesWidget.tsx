
import React, { useState, useEffect } from 'react';
import { Bar, BarChart, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, PieChart as PieChartIcon, BarChart as BarChartIcon, ArrowRight } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useIsMobile } from '@/hooks/use-mobile';
import { useNavigate } from 'react-router-dom';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/components/ui/use-toast';

interface ExpensesWidgetProps {
  expenses?: Array<{
    category: string;
    amount: number;
    color?: string;
    date?: string;
    recurring?: boolean;
    tags?: string[];
    isPaid?: boolean;
  }>;
  onAddExpense?: () => void;
  onViewAllExpenses?: () => void;
}

const CHART_COLORS = [
  '#9b87f5',  // Primary Purple
  '#7E69AB',  // Secondary Purple
  '#6E56CF',  // Vivid Purple
  '#A78BFA',  // Bright Purple
  '#0EA5E9',  // Ocean Blue
  '#1EAEDB',  // Bright Blue
  '#33C3F0',  // Sky Blue
  '#D6BCFA',  // Light Purple
  '#C4B5FD',  // Soft Purple
  '#8B5CF6',  // Bold Purple
];

const ExpensesWidget: React.FC<ExpensesWidgetProps> = ({ 
  expenses = [], 
  onAddExpense,
  onViewAllExpenses 
}) => {
  const [chartType, setChartType] = useState<'bar' | 'pie'>('pie');
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const [localExpenses, setLocalExpenses] = useState(expenses);
  const [showQuickAddDialog, setShowQuickAddDialog] = useState(false);
  const [newExpense, setNewExpense] = useState({
    category: '',
    amount: 0,
    recurring: false
  });
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [totalMonthlyAmount, setTotalMonthlyAmount] = useState<number>(0);

  // Simple direct calculation function for monthly total
  const calculateMonthlyTotal = (expenseItems: any[]) => {
    if (!expenseItems || expenseItems.length === 0) return 0;
    
    return expenseItems.reduce((total: number, expense: any) => {
      // Skip if expense is null or undefined
      if (!expense) return total;
      
      // Convert amount to number and default to 0 if NaN
      const amount = Number(expense.amount) || 0;
      
      // Include all recurring expenses regardless of paid status
      if (expense.recurring) {
        return total + amount;
      }
      
      // For non-recurring expenses, check if they're from current month
      if (expense.date) {
        const expenseDate = new Date(expense.date);
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        
        if (expenseDate.getMonth() === currentMonth && 
            expenseDate.getFullYear() === currentYear) {
          return total + amount;
        }
      }
      
      return total;
    }, 0);
  };

  // Update expenses data from localStorage
  const fetchAndUpdateExpenses = () => {
    try {
      const savedExpenses = localStorage.getItem('expenses');
      if (savedExpenses) {
        const parsedExpenses = JSON.parse(savedExpenses);
        setLocalExpenses(parsedExpenses);
        
        // Calculate and update monthly total right away
        const monthlyTotal = calculateMonthlyTotal(parsedExpenses);
        setTotalMonthlyAmount(monthlyTotal);
        
        console.log('Updated monthly total:', monthlyTotal, 'from expenses:', parsedExpenses);
      } else {
        console.log('No expenses found in localStorage');
        setTotalMonthlyAmount(0);
      }
    } catch (e) {
      console.error('Failed to parse expenses from localStorage', e);
      setTotalMonthlyAmount(0);
    }
  };

  // Initial load and periodic update
  useEffect(() => {
    fetchAndUpdateExpenses();
    
    // Listen for storage changes from other components
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'expenses') {
        console.log('Storage event detected - expenses updated');
        fetchAndUpdateExpenses();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Poll every second to catch any updates
    const intervalId = setInterval(fetchAndUpdateExpenses, 1000);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(intervalId);
    };
  }, []);

  const handleAddExpense = () => {
    if (onAddExpense) {
      onAddExpense();
    } else {
      setShowQuickAddDialog(true);
    }
  };

  const handleQuickAddExpense = () => {
    if (!newExpense.category || newExpense.amount <= 0) {
      toast({
        title: "Invalid expense",
        description: "Please enter a category and a valid amount",
        variant: "destructive"
      });
      return;
    }

    const color = CHART_COLORS[Math.floor(Math.random() * CHART_COLORS.length)];
    const newExpenseItem = {
      ...newExpense,
      color,
      date: new Date().toISOString().split('T')[0]
    };

    // Update local state right away
    const updatedExpenses = [...localExpenses, newExpenseItem];
    setLocalExpenses(updatedExpenses);
    
    // Immediately update the monthly total
    const newTotal = calculateMonthlyTotal(updatedExpenses);
    setTotalMonthlyAmount(newTotal);
    
    // Update localStorage
    localStorage.setItem('expenses', JSON.stringify(updatedExpenses));
    
    // Dispatch storage event for other components
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'expenses',
      newValue: JSON.stringify(updatedExpenses),
      url: window.location.href
    }));

    toast({
      title: "Expense added",
      description: `${newExpense.category}: $${newExpense.amount.toFixed(2)} ${newExpense.recurring ? '(recurring)' : ''}`,
    });
    
    setNewExpense({
      category: '',
      amount: 0,
      recurring: false
    });
    setShowQuickAddDialog(false);
    
    console.log('Added expense, new monthly total:', newTotal);
  };

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category);
    if (onViewAllExpenses) {
      localStorage.setItem('selectedExpenseCategory', category);
      navigate('/expenses?view=list&category=' + encodeURIComponent(category));
    }
  };

  const handleTagClick = (tag: string) => {
    localStorage.setItem('selectedExpenseTag', tag);
    navigate('/expenses?view=list&tag=' + encodeURIComponent(tag));
  };

  // Get total of all expenses (not just monthly)
  const displayData = localExpenses.length > 0 ? localExpenses : [];
  const totalExpenses = displayData.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

  const pieData = displayData.map((item, index) => ({
    name: item.category,
    value: Number(item.amount) || 0,
    color: item.color || CHART_COLORS[index % CHART_COLORS.length]
  }));

  const allTags = localExpenses
    .flatMap(expense => expense.tags || [])
    .filter((tag, index, self) => self.indexOf(tag) === index);

  const renderEmptyState = () => {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-center">
        <div className="text-gray-400 mb-6">
          <p className="mb-2">No expense data yet</p>
          <p className="text-sm text-gray-500">Track your recurring expenses and subscriptions</p>
        </div>
        <Button 
          onClick={handleAddExpense}
          className="bg-purple-600/70 hover:bg-purple-700 backdrop-blur-sm border border-white/10 shadow-lg transition-all hover:scale-[1.02]"
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Add New Expense
        </Button>
      </div>
    );
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 border border-gray-700 px-3 py-2 rounded-md shadow-md">
          <p className="text-white font-medium">{payload[0].name}</p>
          <p className="text-purple-300">${payload[0].value.toFixed(2)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="bg-gray-800/60 border-gray-700 text-white shadow-md">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-medium">Expenses Overview</CardTitle>
          <div className="flex items-center gap-2">
            {displayData.length > 0 && (
              <Tabs value={chartType} onValueChange={(value) => setChartType(value as 'bar' | 'pie')}>
                <TabsList className="bg-gray-700/50">
                  <TabsTrigger value="bar" className="data-[state=active]:bg-purple-600">
                    <BarChartIcon className="h-4 w-4" />
                  </TabsTrigger>
                  <TabsTrigger value="pie" className="data-[state=active]:bg-purple-600">
                    <PieChartIcon className="h-4 w-4" />
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            )}
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 rounded-full hover:bg-purple-500/20 bg-transparent"
              onClick={handleAddExpense}
            >
              <PlusCircle className="h-5 w-5" />
            </Button>
          </div>
        </div>
        <CardDescription className="text-gray-400">Monthly breakdown by category</CardDescription>
      </CardHeader>
      
      <CardContent>
        {displayData.length === 0 ? (
          renderEmptyState()
        ) : (
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'bar' ? (
                <BarChart data={displayData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <XAxis 
                    dataKey="category" 
                    tick={{ fill: '#9b87f5' }} 
                    axisLine={{ stroke: '#555' }}
                    tickLine={{ stroke: '#555' }}
                  />
                  <YAxis 
                    tick={{ fill: '#9b87f5' }} 
                    axisLine={{ stroke: '#555' }}
                    tickLine={{ stroke: '#555' }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar 
                    dataKey="amount" 
                    radius={[4, 4, 0, 0]}
                    onClick={(data) => handleCategoryClick(data.category)}
                    cursor="pointer"
                    activeBar={{ fill: null }}
                  >
                    {displayData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.color || CHART_COLORS[index % CHART_COLORS.length]} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              ) : (
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={isMobile ? 60 : 80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => 
                      isMobile ? '' : `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                    onClick={(entry) => handleCategoryClick(entry.name)}
                    cursor="pointer"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color || CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ 
                      backgroundColor: '#1f2937', 
                      borderColor: '#374151',
                      color: 'white'
                    }}
                    formatter={(value: number) => [`$${value.toFixed(2)}`, 'Amount']}
                  />
                </PieChart>
              )}
            </ResponsiveContainer>
          </div>
        )}
        
        {displayData.length > 0 && (
          <div className="mt-4 space-y-2">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="text-gray-400">
                Total Expenses: ${totalExpenses.toFixed(2)}
              </div>
              <div className="text-gray-400 text-right">
                Monthly Cost: ${totalMonthlyAmount.toFixed(2)}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {displayData.map((item, index) => (
                <div 
                  key={index} 
                  className="px-2 py-1 rounded-full text-xs flex items-center gap-1 cursor-pointer hover:opacity-80 transition-opacity"
                  style={{ backgroundColor: item.color ? `${item.color}40` : undefined }}
                  onClick={() => handleCategoryClick(item.category)}
                >
                  <div 
                    className="w-2 h-2 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span>{item.category}: ${Number(item.amount).toFixed(2)}</span>
                  {item.recurring && (
                    <span className="ml-1 px-1 bg-blue-500/20 text-blue-300 rounded-full text-xs">recurring</span>
                  )}
                  {item.isPaid === false && (
                    <span className="ml-1 px-1 bg-red-500/20 text-red-300 rounded-full text-xs">unpaid</span>
                  )}
                </div>
              ))}
            </div>
            
            {allTags.length > 0 && (
              <div className="mt-3">
                <h4 className="text-xs text-gray-400 mb-1">Tags</h4>
                <div className="flex flex-wrap gap-1">
                  {allTags.map((tag, index) => (
                    <div 
                      key={index} 
                      className="px-2 py-0.5 rounded-full text-xs bg-purple-500/20 text-purple-300 cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => handleTagClick(tag)}
                    >
                      {tag}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>

      {displayData.length > 0 && (
        <CardFooter>
          <Button 
            variant="ghost" 
            className="w-full text-purple-400 hover:text-purple-300 hover:bg-purple-500/10"
            onClick={onViewAllExpenses}
          >
            View All Expenses <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardFooter>
      )}

      <Dialog open={showQuickAddDialog} onOpenChange={setShowQuickAddDialog}>
        <DialogContent className="bg-gray-800 border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle>Add New Expense</DialogTitle>
            <DialogDescription className="text-gray-400">
              Quickly add a new expense to your tracker.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input 
                id="category" 
                placeholder="e.g., Food, Transport, Entertainment" 
                value={newExpense.category}
                onChange={(e) => setNewExpense({...newExpense, category: e.target.value})}
                className="bg-gray-700 border-gray-600"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Expense Cost ($)</Label>
              <Input 
                id="amount" 
                type="number" 
                min="0.01" 
                step="0.01" 
                placeholder="0.00"
                value={newExpense.amount || ''}
                onChange={(e) => setNewExpense({...newExpense, amount: parseFloat(e.target.value) || 0})}
                className="bg-gray-700 border-gray-600"
                style={{ appearance: 'textfield' }}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="recurring"
                checked={newExpense.recurring}
                onCheckedChange={(checked) => setNewExpense({...newExpense, recurring: checked})}
              />
              <Label htmlFor="recurring">Recurring expense</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowQuickAddDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleQuickAddExpense}>
              Add Expense
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default ExpensesWidget;

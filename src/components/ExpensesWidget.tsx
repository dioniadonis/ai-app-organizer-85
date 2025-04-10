
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
  }>;
  onAddExpense?: () => void;
  onViewAllExpenses?: () => void;
}

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

  // Fetch expenses from localStorage on mount
  useEffect(() => {
    const savedExpenses = localStorage.getItem('expenses');
    if (savedExpenses) {
      try {
        const parsedExpenses = JSON.parse(savedExpenses);
        setLocalExpenses(parsedExpenses);
      } catch (e) {
        console.error('Failed to parse expenses from localStorage', e);
      }
    }
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

    const color = `#${Math.floor(Math.random()*16777215).toString(16)}`;
    const newExpenseItem = {
      ...newExpense,
      color,
      date: new Date().toISOString().split('T')[0]
    };

    const updatedExpenses = [...localExpenses, newExpenseItem];
    setLocalExpenses(updatedExpenses);
    localStorage.setItem('expenses', JSON.stringify(updatedExpenses));
    
    toast({
      title: "Expense added",
      description: `${newExpense.category}: $${newExpense.amount} ${newExpense.recurring ? '(recurring)' : ''}`,
    });
    
    setNewExpense({
      category: '',
      amount: 0,
      recurring: false
    });
    setShowQuickAddDialog(false);
  };

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category);
    if (onViewAllExpenses) {
      // Add category to localStorage for the expenses page to read
      localStorage.setItem('selectedExpenseCategory', category);
      navigate('/expenses?view=list&category=' + encodeURIComponent(category));
    }
  };

  const handleTagClick = (tag: string) => {
    localStorage.setItem('selectedExpenseTag', tag);
    navigate('/expenses?view=list&tag=' + encodeURIComponent(tag));
  };

  // Only show real data, no defaults
  const displayData = localExpenses.length > 0 ? localExpenses : [];
  const totalExpenses = displayData.reduce((sum, item) => sum + item.amount, 0);

  // Format data for pie chart
  const pieData = displayData.map(item => ({
    name: item.category,
    value: item.amount,
    color: item.color
  }));

  // Get all unique tags from expenses
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
          className="bg-purple-600 hover:bg-purple-700"
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Add New Expense
        </Button>
      </div>
    );
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
              className="h-8 w-8 rounded-full hover:bg-purple-500/20"
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
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1f2937', 
                      borderColor: '#374151',
                      color: 'white'
                    }} 
                  />
                  <Bar 
                    dataKey="amount" 
                    radius={[4, 4, 0, 0]}
                    onClick={(data) => handleCategoryClick(data.category)}
                    cursor="pointer"
                  >
                    {displayData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.color || `#${Math.floor(Math.random()*16777215).toString(16)}`} 
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
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ 
                      backgroundColor: '#1f2937', 
                      borderColor: '#374151',
                      color: 'white'
                    }}
                    formatter={(value: number) => [`$${value}`, 'Amount']}
                  />
                </PieChart>
              )}
            </ResponsiveContainer>
          </div>
        )}
        
        {displayData.length > 0 && (
          <div className="mt-4 space-y-2">
            <div className="text-xs text-gray-400">
              Total: ${totalExpenses}
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
                  <span>{item.category}: ${item.amount}</span>
                  {item.recurring && (
                    <span className="ml-1 px-1 bg-blue-500/20 text-blue-300 rounded-full text-xs">recurring</span>
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

      {/* Quick Add Expense Dialog */}
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

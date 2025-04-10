import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  LayoutDashboard, 
  CalendarClock, 
  Bell, 
  UserCircle,
  PieChart,
  BarChart3,
  PlusCircle,
  Trash,
  Edit,
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  Switch,
  Label
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PieChart as Pie, Pie as PieSegment, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

interface Expense {
  id: string | number;
  category: string;
  amount: number;
  date: string;
  description?: string;
  recurring?: boolean;
  frequency?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  color?: string;
  tags?: string[];
}

const COLORS = ['#9b87f5', '#7E69AB', '#1EAEDB', '#D6BCFA', '#33C3F0', '#6E56CF', '#A78BFA', '#C4B5FD'];

const ExpensesPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeView, setActiveView] = useState<string>('list');
  const [hasNotifications, setHasNotifications] = useState(true);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [newExpense, setNewExpense] = useState<Partial<Expense>>({
    category: '',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    recurring: false,
    frequency: 'monthly'
  });
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<{field: keyof Expense, direction: 'asc' | 'desc'}>({
    field: 'date',
    direction: 'desc'
  });
  const [categoryFilter, setCategoryFilter] = useState<string[]>([]);
  const [tagFilter, setTagFilter] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const savedExpenses = localStorage.getItem('expenses');
    if (savedExpenses) {
      setExpenses(JSON.parse(savedExpenses));
    }
    
    const params = new URLSearchParams(location.search);
    const viewParam = params.get('view');
    if (viewParam === 'list' || viewParam === 'charts') {
      setActiveView(viewParam);
    }
    
    const categoryParam = params.get('category');
    if (categoryParam) {
      setCategoryFilter([decodeURIComponent(categoryParam)]);
      setShowFilters(true);
    }
    
    const tagParam = params.get('tag');
    if (tagParam) {
      setTagFilter([decodeURIComponent(tagParam)]);
      setShowFilters(true);
    }
    
    const selectedCategory = localStorage.getItem('selectedExpenseCategory');
    if (selectedCategory) {
      setCategoryFilter([selectedCategory]);
      setShowFilters(true);
      localStorage.removeItem('selectedExpenseCategory');
    }
    
    const selectedTag = localStorage.getItem('selectedExpenseTag');
    if (selectedTag) {
      setTagFilter([selectedTag]);
      setShowFilters(true);
      localStorage.removeItem('selectedExpenseTag');
    }
  }, [location.search]);

  useEffect(() => {
    localStorage.setItem('expenses', JSON.stringify(expenses));
  }, [expenses]);

  const categories = [...new Set(expenses.map(expense => expense.category))];
  const tags = [...new Set(expenses.flatMap(expense => expense.tags || []))];

  const filteredExpenses = expenses
    .filter(expense => 
      (searchTerm === '' || 
       expense.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
       expense.description?.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (categoryFilter.length === 0 || categoryFilter.includes(expense.category)) &&
      (tagFilter.length === 0 || (expense.tags && expense.tags.some(tag => tagFilter.includes(tag))))
    )
    .sort((a, b) => {
      if (sortOrder.field === 'amount') {
        return sortOrder.direction === 'asc' 
          ? a.amount - b.amount 
          : b.amount - a.amount;
      } else if (sortOrder.field === 'date') {
        return sortOrder.direction === 'asc'
          ? new Date(a.date).getTime() - new Date(b.date).getTime()
          : new Date(b.date).getTime() - new Date(a.date).getTime();
      }
      return 0;
    });

  const totalsByCategory = categories.map(category => {
    const total = expenses
      .filter(expense => expense.category === category)
      .reduce((sum, expense) => sum + expense.amount, 0);
    
    return {
      category,
      amount: total,
      color: COLORS[categories.indexOf(category) % COLORS.length]
    };
  });

  const toggleSort = (field: keyof Expense) => {
    setSortOrder(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const toggleCategoryFilter = (category: string) => {
    setCategoryFilter(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const toggleTagFilter = (tag: string) => {
    setTagFilter(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const clearFilters = () => {
    setCategoryFilter([]);
    setTagFilter([]);
    setSearchTerm('');
  };

  const addExpense = () => {
    if (!newExpense.category || !newExpense.amount || !newExpense.date) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const expenseToAdd: Expense = {
      id: Date.now(),
      category: newExpense.category,
      amount: Number(newExpense.amount),
      date: newExpense.date,
      description: newExpense.description,
      recurring: newExpense.recurring,
      frequency: newExpense.recurring ? newExpense.frequency : undefined,
      color: COLORS[categories.length % COLORS.length]
    };

    setExpenses(prev => [...prev, expenseToAdd]);
    setNewExpense({
      category: '',
      amount: 0,
      date: new Date().toISOString().split('T')[0],
      recurring: false,
      frequency: 'monthly'
    });
    setIsAddExpenseOpen(false);

    toast({
      title: "Expense added",
      description: `$${expenseToAdd.amount} for ${expenseToAdd.category} has been added`,
    });
  };

  const updateExpense = () => {
    if (!editingExpense) return;

    setExpenses(prev => 
      prev.map(expense => 
        expense.id === editingExpense.id ? editingExpense : expense
      )
    );

    setEditingExpense(null);
    toast({
      title: "Expense updated",
      description: `$${editingExpense.amount} for ${editingExpense.category} has been updated`,
    });
  };

  const deleteExpense = (id: string | number) => {
    setExpenses(prev => prev.filter(expense => expense.id !== id));
    toast({
      title: "Expense deleted",
      description: "The expense has been removed",
    });
  };

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  const handleTabChange = (value: string) => {
    if (value === 'dashboard') {
      navigate('/');
    } else if (value === 'planner') {
      navigate('/planner');
    } else {
      setActiveView(value);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    },
    exit: {
      opacity: 0,
      transition: {
        duration: 0.2
      }
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div 
        className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-gray-100"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        key={activeView}
      >
        <div className="max-w-6xl mx-auto p-4 sm:p-6">
          <div className="flex justify-between items-center mb-6">
            <motion.h1 
              className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.3 }}
            >
              Expense Manager
            </motion.h1>
            
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
                <PopoverContent className="w-80 p-0 bg-gray-800 border-gray-700" align="end">
                  <div className="p-3 border-b border-gray-700">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium">Notifications</h3>
                    </div>
                  </div>
                  {/* Notification content would go here */}
                </PopoverContent>
              </Popover>
              
              <Button 
                variant="ghost" 
                size="icon" 
                className="relative"
                onClick={() => navigate('/account')}
              >
                <UserCircle className="w-5 h-5" />
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
            <Tabs value={activeView} onValueChange={handleTabChange} className="w-full">
              <TabsList className="w-full justify-start bg-transparent">
                <TabsTrigger 
                  value="list" 
                  className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-white rounded-lg gap-2"
                >
                  List View
                </TabsTrigger>
                <TabsTrigger 
                  value="charts" 
                  className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-white rounded-lg gap-2"
                >
                  <PieChart className="w-4 h-4" />
                  Charts
                </TabsTrigger>
                <TabsTrigger 
                  value="dashboard" 
                  className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-white rounded-lg gap-2"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </TabsTrigger>
                <TabsTrigger 
                  value="planner" 
                  className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-white rounded-lg gap-2"
                >
                  <CalendarClock className="w-4 h-4" />
                  Planner
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </motion.div>
          
          <motion.div 
            className="bg-gray-800/20 rounded-xl p-6 shadow-lg border border-gray-700"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.3 }}
          >
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="relative w-full max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input 
                    placeholder="Search expenses..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-gray-700/50 border-gray-600 rounded-lg text-white"
                  />
                </div>
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => setShowFilters(!showFilters)}
                  className={showFilters ? "bg-purple-500/20 text-purple-300" : ""}
                >
                  <SlidersHorizontal className="h-4 w-4" />
                </Button>
              </div>
              <Button
                onClick={() => setIsAddExpenseOpen(true)}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <PlusCircle className="w-4 h-4 mr-2" />
                Add New Expense
              </Button>
            </div>
            
            {showFilters && (
              <div className="mb-6 p-4 rounded-lg bg-gray-700/30">
                {categoryFilter.length > 0 && (
                  <div className="mb-3">
                    <h3 className="text-sm font-medium mb-2">Category filters</h3>
                    <div className="flex flex-wrap gap-2">
                      {categoryFilter.map(category => (
                        <Button
                          key={category}
                          variant="outline"
                          size="sm"
                          className="text-xs bg-purple-500/30 text-purple-300 border-purple-500"
                          onClick={() => toggleCategoryFilter(category)}
                        >
                          {category}
                          <span className="ml-1">×</span>
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
                
                {tagFilter.length > 0 && (
                  <div className="mb-3">
                    <h3 className="text-sm font-medium mb-2">Tag filters</h3>
                    <div className="flex flex-wrap gap-2">
                      {tagFilter.map(tag => (
                        <Button
                          key={tag}
                          variant="outline"
                          size="sm"
                          className="text-xs bg-blue-500/30 text-blue-300 border-blue-500"
                          onClick={() => toggleTagFilter(tag)}
                        >
                          {tag}
                          <span className="ml-1">×</span>
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
                
                <div>
                  <h3 className="text-sm font-medium mb-2">Filter by category</h3>
                  <div className="flex flex-wrap gap-2">
                    {categories.map(category => (
                      <Button
                        key={category}
                        variant="outline"
                        size="sm"
                        className={`text-xs ${
                          categoryFilter.includes(category) 
                            ? "bg-purple-500/30 text-purple-300 border-purple-500"
                            : ""
                        }`}
                        onClick={() => toggleCategoryFilter(category)}
                      >
                        {category}
                      </Button>
                    ))}
                  </div>
                </div>
                
                {tags.length > 0 && (
                  <div className="mt-3">
                    <h3 className="text-sm font-medium mb-2">Filter by tag</h3>
                    <div className="flex flex-wrap gap-2">
                      {tags.map(tag => (
                        <Button
                          key={tag}
                          variant="outline"
                          size="sm"
                          className={`text-xs ${
                            tagFilter.includes(tag) 
                              ? "bg-blue-500/30 text-blue-300 border-blue-500"
                              : ""
                          }`}
                          onClick={() => toggleTagFilter(tag)}
                        >
                          {tag}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
                
                {(categoryFilter.length > 0 || tagFilter.length > 0 || searchTerm) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs mt-3"
                    onClick={clearFilters}
                  >
                    Clear all filters
                  </Button>
                )}
              </div>
            )}

            <Tabs value={activeView}>
              <TabsContent value="list" className="pt-2">
                {filteredExpenses.length > 0 ? (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-gray-700/30 rounded-lg text-sm font-medium">
                      <div className="flex-1 cursor-pointer flex items-center" onClick={() => toggleSort('category')}>
                        Category
                        {sortOrder.field === 'category' && (
                          <ArrowUpDown className="ml-1 h-3 w-3" />
                        )}
                      </div>
                      <div className="flex-1 cursor-pointer flex items-center" onClick={() => toggleSort('amount')}>
                        Amount
                        {sortOrder.field === 'amount' && (
                          <ArrowUpDown className="ml-1 h-3 w-3" />
                        )}
                      </div>
                      <div className="flex-1 cursor-pointer flex items-center" onClick={() => toggleSort('date')}>
                        Date
                        {sortOrder.field === 'date' && (
                          <ArrowUpDown className="ml-1 h-3 w-3" />
                        )}
                      </div>
                      <div className="w-20 text-center">Actions</div>
                    </div>

                    {filteredExpenses.map(expense => (
                      <motion.div
                        key={expense.id}
                        className="bg-gray-700/30 rounded-lg p-3 flex items-center"
                        whileHover={{ scale: 1.01 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="flex-1 flex items-center">
                          <div 
                            className="w-3 h-3 rounded-full mr-2" 
                            style={{ backgroundColor: expense.color }}
                          ></div>
                          <div>
                            <div>{expense.category}</div>
                            {expense.description && (
                              <div className="text-xs text-gray-400">{expense.description}</div>
                            )}
                          </div>
                        </div>
                        <div className="flex-1 font-medium">${expense.amount.toFixed(2)}</div>
                        <div className="flex-1 text-gray-400">
                          {format(new Date(expense.date), 'MMM dd, yyyy')}
                          {expense.recurring && (
                            <span className="ml-2 text-xs bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full">
                              {expense.frequency}
                            </span>
                          )}
                        </div>
                        <div className="w-20 flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-full"
                            onClick={() => {
                              setEditingExpense(expense);
                              setIsAddExpenseOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-full text-red-500 hover:text-red-400 hover:bg-red-500/10"
                            onClick={() => deleteExpense(expense.id)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </motion.div>
                    ))}

                    <div className="flex justify-between items-center p-4 bg-purple-500/10 rounded-lg mt-6">
                      <span>Total Expenses</span>
                      <span className="font-bold text-lg">${totalExpenses.toFixed(2)}</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <p className="mb-4">No expenses found</p>
                    <Button
                      onClick={() => setIsAddExpenseOpen(true)}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      <PlusCircle className="w-4 h-4 mr-2" />
                      Add Your First Expense
                    </Button>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="charts">
                {totalsByCategory.length > 0 ? (
                  <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card className="bg-gray-800/60 border-gray-700 text-white shadow-md">
                        <CardHeader>
                          <CardTitle className="text-lg">Expense Distribution</CardTitle>
                          <CardDescription className="text-gray-400">Breakdown by category</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                              <Pie>
                                <PieSegment
                                  data={totalsByCategory}
                                  dataKey="amount"
                                  nameKey="category"
                                  cx="50%"
                                  cy="50%"
                                  outerRadius={80}
                                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                >
                                  {totalsByCategory.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                  ))}
                                </PieSegment>
                                <Tooltip
                                  formatter={(value: number) => [`$${value}`, 'Amount']}
                                  contentStyle={{
                                    backgroundColor: '#1f2937',
                                    borderColor: '#374151',
                                    color: 'white'
                                  }}
                                />
                              </Pie>
                            </ResponsiveContainer>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="bg-gray-800/60 border-gray-700 text-white shadow-md">
                        <CardHeader>
                          <CardTitle className="text-lg">Category Comparison</CardTitle>
                          <CardDescription className="text-gray-400">Amount spent per category</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={totalsByCategory}>
                                <XAxis dataKey="category" tick={{ fill: '#9b87f5' }} />
                                <YAxis tick={{ fill: '#9b87f5' }} />
                                <Tooltip
                                  formatter={(value: number) => [`$${value}`, 'Amount']}
                                  contentStyle={{
                                    backgroundColor: '#1f2937',
                                    borderColor: '#374151',
                                    color: 'white'
                                  }}
                                />
                                <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                                  {totalsByCategory.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                  ))}
                                </Bar>
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="flex flex-wrap gap-2 justify-center">
                      {totalsByCategory.map((category, index) => (
                        <div
                          key={index}
                          className="px-3 py-1.5 rounded-full text-sm flex items-center gap-2"
                          style={{ backgroundColor: `${category.color}30` }}
                        >
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: category.color }}
                          ></div>
                          <span>{category.category}: ${category.amount}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-between items-center p-4 bg-purple-500/10 rounded-lg mt-6">
                      <span>Total Expenses</span>
                      <span className="font-bold text-lg">${totalExpenses.toFixed(2)}</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <p className="mb-4">No expense data to visualize</p>
                    <Button
                      onClick={() => setIsAddExpenseOpen(true)}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      <PlusCircle className="w-4 h-4 mr-2" />
                      Add Your First Expense
                    </Button>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </motion.div>
          
          <footer className="py-6 text-center text-gray-500 mt-12">
            <p>Loop Space AI Organizer &copy; {new Date().getFullYear()}</p>
          </footer>
        </div>

        <Dialog open={isAddExpenseOpen} onOpenChange={setIsAddExpenseOpen}>
          <DialogContent className="bg-gray-800 text-white border-gray-700">
            <DialogHeader>
              <DialogTitle>{editingExpense ? "Edit Expense" : "Add New Expense"}</DialogTitle>
              <DialogDescription className="text-gray-400">
                {editingExpense 
                  ? "Update the expense details below"
                  : "Enter the details for your new expense"}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="category" className="text-right text-sm font-medium">
                  Category
                </label>
                <Input
                  id="category"
                  value={editingExpense ? editingExpense.category : newExpense.category}
                  onChange={(e) => {
                    if (editingExpense) {
                      setEditingExpense({...editingExpense, category: e.target.value});
                    } else {
                      setNewExpense({...newExpense, category: e.target.value});
                    }
                  }}
                  className="col-span-3 bg-gray-700 border-gray-600"
                  list="categories"
                  placeholder="Enter or select a category"
                />
                <datalist id="categories">
                  {categories.map(category => (
                    <option key={category} value={category} />
                  ))}
                </datalist>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="amount" className="text-right text-sm font-medium">
                  Expense Cost ($)
                </label>
                <Input
                  id="amount"
                  type="number"
                  value={editingExpense ? editingExpense.amount : newExpense.amount}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value);
                    if (editingExpense) {
                      setEditingExpense({...editingExpense, amount: value});
                    } else {
                      setNewExpense({...newExpense, amount: value});
                    }
                  }}
                  className="col-span-3 bg-gray-700 border-gray-600"
                  style={{ appearance: 'textfield' }}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="date" className="text-right text-sm font-medium">
                  Date
                </label>
                <Input
                  id="date"
                  type="date"
                  value={editingExpense ? editingExpense.date : newExpense.date}
                  onChange={(e) => {
                    if (editingExpense) {
                      setEditingExpense({...editingExpense, date: e.target.value});
                    } else {
                      setNewExpense({...newExpense, date: e.target.value});
                    }
                  }}
                  className="col-span-3 bg-gray-700 border-gray-600"
                />
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <label htmlFor="description" className="text-right text-sm font-medium">
                  Description
                </label>
                <Input
                  id="description"
                  value={editingExpense ? editingExpense.description || '' : newExpense.description || ''}
                  onChange={(e) => {
                    if (editingExpense) {
                      setEditingExpense({...editingExpense, description: e.target.value});
                    } else {
                      setNewExpense({...newExpense, description: e.target.value});
                    }
                  }}
                  className="col-span-3 bg-gray-700 border-gray-600"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right text-sm font-medium">
                  Recurring
                </label>
                <div className="flex items-center col-span-3">
                  <Switch
                    id="recurring"
                    checked={editingExpense ? !!editingExpense.recurring : !!newExpense.recurring}
                    onCheckedChange={(checked) => {
                      if (editingExpense) {
                        setEditingExpense({...editingExpense, recurring: checked});
                      } else {
                        setNewExpense({...newExpense, recurring: checked});
                      }
                    }}
                  />
                  <Label htmlFor="recurring" className="ml-2">
                    This is a recurring expense
                  </Label>
                </div>
              </div>
              {(editingExpense?.recurring || newExpense.recurring) && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="frequency" className="text-right text-sm font-medium">
                    Frequency
                  </label>
                  <select
                    id="frequency"
                    value={editingExpense ? editingExpense.frequency : newExpense.frequency}
                    onChange={(e) => {
                      if (editingExpense) {
                        setEditingExpense({
                          ...editingExpense, 
                          frequency: e.target.value as 'daily' | 'weekly' | 'monthly' | 'yearly'
                        });
                      } else {
                        setNewExpense({
                          ...newExpense, 
                          frequency: e.target.value as 'daily' | 'weekly' | 'monthly' | 'yearly'
                        });
                      }
                    }}
                    className="col-span-3 p-2 rounded-md bg-gray-700 border border-gray-600"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button
                variant="ghost"
                onClick={() => {
                  setIsAddExpenseOpen(false);
                  setEditingExpense(null);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={editingExpense ? updateExpense : addExpense}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {editingExpense ? "Update Expense" : "Add Expense"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </motion.div>
    </AnimatePresence>
  );
};

export default ExpensesPage;

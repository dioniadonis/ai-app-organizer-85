
import React, { useState, useEffect } from 'react';
import { Bar, BarChart, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, PieChart as PieChartIcon, BarChart as BarChartIcon, ArrowRight } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useIsMobile } from '@/hooks/use-mobile';

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
  const [localExpenses, setLocalExpenses] = useState(expenses);

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

  // Default expenses data if none provided
  const defaultExpenses = [
    { category: 'Food', amount: 250, color: '#9b87f5' },
    { category: 'Transport', amount: 150, color: '#7E69AB' },
    { category: 'Utilities', amount: 100, color: '#1EAEDB' },
    { category: 'Entertainment', amount: 75, color: '#D6BCFA' },
    { category: 'Others', amount: 50, color: '#33C3F0' },
  ];

  const displayData = localExpenses.length > 0 ? localExpenses : expenses.length > 0 ? expenses : defaultExpenses;
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

  return (
    <Card className="bg-gray-800/60 border-gray-700 text-white shadow-md">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-medium">Expenses Overview</CardTitle>
          <div className="flex items-center gap-2">
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
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 rounded-full hover:bg-purple-500/20"
              onClick={onAddExpense}
            >
              <PlusCircle className="h-5 w-5" />
            </Button>
          </div>
        </div>
        <CardDescription className="text-gray-400">Monthly breakdown by category</CardDescription>
      </CardHeader>
      
      <CardContent>
        {displayData.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-36 text-center">
            <p className="text-gray-400 mb-3">No expense data yet</p>
            <Button 
              variant="outline" 
              size="sm"
              onClick={onAddExpense}
              className="border-purple-500 text-purple-400 hover:bg-purple-500/20"
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Your First Expense
            </Button>
          </div>
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
                  <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                    {displayData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color || `#${Math.floor(Math.random()*16777215).toString(16)}`} />
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
                  className="px-2 py-1 rounded-full text-xs flex items-center gap-1"
                  style={{ backgroundColor: item.color ? `${item.color}40` : undefined }}
                >
                  <div 
                    className="w-2 h-2 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span>{item.category}: ${item.amount}</span>
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
                      className="px-2 py-0.5 rounded-full text-xs bg-purple-500/20 text-purple-300"
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
    </Card>
  );
};

export default ExpensesWidget;

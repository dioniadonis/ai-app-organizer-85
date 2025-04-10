
import React from 'react';
import { BarChart, Bar, ResponsiveContainer, XAxis, Tooltip, Cell } from 'recharts';
import { Card } from '@/components/ui/card';
import { Banknote, Plus, ArrowRight, Receipt, CalendarClock } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ExpensesWidgetProps {
  expenses: any[];
  totalExpenses?: number;
  monthlyExpenses?: number;
  unpaidTotal?: number;
  onAddExpense: () => void;
  onViewAllExpenses: () => void;
}

const ExpensesWidget = ({ 
  expenses, 
  totalExpenses, 
  monthlyExpenses, 
  unpaidTotal = 0,
  onAddExpense, 
  onViewAllExpenses 
}: ExpensesWidgetProps) => {
  // Safety check - ensure expenses is an array
  const safeExpenses = Array.isArray(expenses) ? expenses : [];
  
  const calculatedTotalExpenses = totalExpenses ?? safeExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  
  const calculatedMonthlyExpenses = monthlyExpenses ?? safeExpenses
    .filter(expense => expense.recurring && (expense.frequency === 'monthly' || !expense.frequency))
    .reduce((sum, expense) => sum + expense.amount, 0);
  
  const calculatedUnpaidTotal = unpaidTotal ?? safeExpenses
    .filter(expense => expense.isPaid === false)
    .reduce((sum, expense) => sum + expense.amount, 0);

  // Create safe category data for chart
  const recentExpenses = safeExpenses.slice(0, 5).map(expense => ({
    name: expense.category?.substring(0, 10) || 'Other',
    amount: expense.amount
  }));

  // Safe handling of expense categories
  const expensesByCategory = safeExpenses.reduce((acc, expense) => {
    const category = expense.category || 'Other';
    if (!acc[category]) {
      acc[category] = 0;
    }
    acc[category] += expense.amount;
    return acc;
  }, {});

  const chartData = Object.entries(expensesByCategory)
    .map(([name, amount]) => ({ 
      name: name.length > 10 ? name.substring(0, 10) + '...' : name, 
      amount 
    }))
    .sort((a, b) => (b.amount as number) - (a.amount as number))
    .slice(0, 6);

  const chartColors = [
    '#9b87f5', '#7E69AB', '#6E56CF', '#A78BFA', '#0EA5E9', '#1EAEDB',
  ];

  const RecurringIndicator = ({ recurring }: { recurring?: boolean }) => {
    if (!recurring) return null;
    return (
      <div className="flex items-center gap-1 text-xs text-purple-400 ml-1">
        <CalendarClock className="w-3 h-3" />
        <span>recurring</span>
      </div>
    );
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 border border-gray-700 p-2 rounded-md shadow-md">
          <p className="font-medium">{payload[0].payload.name}</p>
          <p className="text-purple-400">${payload[0].value.toFixed(2)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="bg-gray-800/50 border border-gray-700 p-4">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <Banknote className="w-5 h-5 text-green-400 mr-2" />
          <h3 className="text-lg font-medium">Expenses Overview</h3>
        </div>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={onViewAllExpenses}
          className="text-purple-400 hover:text-purple-300 flex items-center gap-1"
        >
          View All <ArrowRight className="w-3 h-3 ml-1" />
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-700/30 rounded-lg p-3">
          <div className="text-gray-400 text-sm mb-1">Total Expenses</div>
          <div className="text-xl font-bold">${calculatedTotalExpenses.toFixed(2)}</div>
        </div>
        <div className="bg-gray-700/30 rounded-lg p-3">
          <div className="text-gray-400 text-sm mb-1">Monthly</div>
          <div className="text-xl font-bold">${calculatedMonthlyExpenses.toFixed(2)}</div>
        </div>
      </div>

      {chartData.length > 0 ? (
        <div className="mb-4">
          <div className="mb-2 text-sm font-medium">Expense Distribution</div>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} barGap={4}>
                <XAxis 
                  dataKey="name" 
                  tick={{ fill: '#9b87f5', fontSize: 11 }} 
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="amount" 
                  fill="#9b87f5" 
                  radius={[4, 4, 0, 0]} 
                  barSize={24}
                  animationDuration={1000}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : (
        <div className="h-40 flex items-center justify-center bg-gray-700/20 rounded-lg mb-4">
          <div className="text-gray-400 text-center">
            <p>No expense data available</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2 bg-ai-blue/30 text-ai-blue hover:bg-ai-blue/40 border border-ai-blue/50"
              onClick={onAddExpense}
            >
              <Plus className="w-3 h-3 mr-1" />
              Add Your First Expense
            </Button>
          </div>
        </div>
      )}

      {calculatedUnpaidTotal > 0 && (
        <div className="bg-red-500/20 rounded-lg p-3 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Receipt className="w-4 h-4 text-red-400" />
              <span className="text-sm font-medium">Unpaid Expenses</span>
            </div>
            <span className="text-red-300 font-bold">${calculatedUnpaidTotal.toFixed(2)}</span>
          </div>
        </div>
      )}

      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
        {safeExpenses.slice(0, 5).map((expense, index) => (
          <div 
            key={expense.id || index} 
            className="flex justify-between items-center p-2 bg-gray-700/20 rounded-md hover:bg-gray-700/30 transition-colors"
          >
            <div className="flex items-center">
              <div 
                className="w-2 h-2 rounded-full mr-2" 
                style={{ 
                  backgroundColor: expense.color || chartColors[index % chartColors.length] 
                }}
              ></div>
              <div>
                <div className="flex items-center">
                  <span className="font-medium">{expense.category || 'Other'}</span>
                  <RecurringIndicator recurring={expense.recurring} />
                </div>
                {expense.description && (
                  <div className="text-xs text-gray-400">{expense.description.substring(0, 20)}</div>
                )}
              </div>
            </div>
            <div className="flex items-center">
              <span className="font-medium">${expense.amount.toFixed(2)}</span>
              {expense.isPaid === false && (
                <span className="ml-2 text-xs bg-red-500/20 text-red-300 px-1.5 py-0.5 rounded-full">Unpaid</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default ExpensesWidget;

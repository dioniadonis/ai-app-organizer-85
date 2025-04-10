
import React from 'react';
import { Bar, BarChart, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

interface ExpensesWidgetProps {
  expenses?: Array<{
    category: string;
    amount: number;
    color?: string;
  }>;
  onAddExpense?: () => void;
}

const ExpensesWidget: React.FC<ExpensesWidgetProps> = ({ expenses = [], onAddExpense }) => {
  // Default expenses data if none provided
  const defaultExpenses = [
    { category: 'Food', amount: 250, color: '#9b87f5' },
    { category: 'Transport', amount: 150, color: '#7E69AB' },
    { category: 'Utilities', amount: 100, color: '#1EAEDB' },
    { category: 'Entertainment', amount: 75, color: '#D6BCFA' },
    { category: 'Others', amount: 50, color: '#33C3F0' },
  ];

  const displayData = expenses.length > 0 ? expenses : defaultExpenses;

  return (
    <Card className="bg-gray-800/60 border-gray-700 text-white shadow-md">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-medium">Expenses Overview</CardTitle>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 rounded-full hover:bg-purple-500/20"
            onClick={onAddExpense}
          >
            <PlusCircle className="h-5 w-5" />
          </Button>
        </div>
        <CardDescription className="text-gray-400">Monthly breakdown by category</CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
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
          </ResponsiveContainer>
        </div>
        
        <div className="mt-4 space-y-2">
          <div className="text-xs text-gray-400">
            Total: ${displayData.reduce((sum, item) => sum + item.amount, 0)}
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
        </div>
      </CardContent>
    </Card>
  );
};

export default ExpensesWidget;


import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { format, isToday, isTomorrow, isPast } from 'date-fns';

interface Renewal {
  id: string;
  name: string;
  category: string;
  subscriptionCost: number;
  renewalDate: string;
  isPaid?: boolean;
  isExpense?: boolean;
  frequency?: string;
}

interface RenewalsSectionProps {
  upcomingRenewals: Renewal[];
  onRenewalClick: (renewal: Renewal) => void;
  containerVariants: any;
}

const RenewalsSection: React.FC<RenewalsSectionProps> = ({
  upcomingRenewals,
  onRenewalClick,
  containerVariants
}) => {
  if (upcomingRenewals.length === 0) return null;

  return (
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
              onClick={() => onRenewalClick(renewal)}
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
  );
};

export default RenewalsSection;

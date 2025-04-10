
import React from 'react';
import { CalendarClock, Banknote, Calendar, LayoutDashboard } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface WidgetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activeWidgets: {
    planner: boolean;
    expenses: boolean;
    renewals: boolean;
    categories: boolean;
  };
  toggleWidget: (widgetName: keyof typeof activeWidgets) => void;
}

const WidgetDialog: React.FC<WidgetDialogProps> = ({
  open,
  onOpenChange,
  activeWidgets,
  toggleWidget
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
          <Button onClick={() => onOpenChange(false)}>
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default WidgetDialog;

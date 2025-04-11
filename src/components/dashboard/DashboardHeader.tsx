import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Grid3X3, Layout, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import SearchBox from '../SearchBox';
import { format } from 'date-fns';

interface DashboardHeaderProps {
  formattedDate: string;
  formattedTime: string;
  insights: any[];
  activeInsight: number;
  isMobile: boolean;
  mobileControlsExpanded: boolean;
  setMobileControlsExpanded: (expanded: boolean) => void;
  handleSearch: (term: string) => void;
  widgetLayout: 'grid' | 'list';
  setWidgetLayout: (layout: 'grid' | 'list') => void;
  setShowAddWidgetDialog: (show: boolean) => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  formattedDate,
  formattedTime,
  insights,
  activeInsight,
  isMobile,
  mobileControlsExpanded,
  setMobileControlsExpanded,
  handleSearch,
  widgetLayout,
  setWidgetLayout,
  setShowAddWidgetDialog
}) => {
  return (
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
          <span>{formattedDate} • {formattedTime}</span>
        </div>
        
        {insights.length > 0 && (
          <div className="w-full sm:w-auto relative overflow-hidden bg-gray-800/50 border border-gray-700/50 rounded-lg px-4 py-2">
            {insights.map((insight, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: index === activeInsight ? 1 : 0, y: index === activeInsight ? 0 : 10 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className={`flex items-center gap-3 cursor-pointer absolute inset-0 px-4 py-2 ${index === activeInsight ? 'z-10' : 'z-0'}`}
                onClick={insight.action}
              >
                <div className={`rounded-full p-1 ${insight.color}`}>
                  {insight.icon}
                </div>
                <div>
                  <div className="font-medium">{insight.title}</div>
                  <div className="text-xs text-gray-400">{insight.description}</div>
                </div>
                <Sparkles className="w-4 h-4 text-yellow-400 ml-auto animate-pulse" />
              </motion.div>
            ))}
          </div>
        )}
        
        {isMobile ? (
          <Collapsible 
            open={mobileControlsExpanded} 
            onOpenChange={setMobileControlsExpanded}
            className="w-full"
          >
            <div className="flex items-center justify-between w-full">
              <SearchBox 
                onSearch={handleSearch} 
                className="flex-1 mr-2"
              />
              <CollapsibleTrigger asChild>
                <Button variant="outline" size="icon" className="h-8 w-8">
                  {mobileControlsExpanded ? <Layout className="h-4 w-4" /> : <Grid3X3 className="h-4 w-4" />}
                </Button>
              </CollapsibleTrigger>
            </div>
            
            <CollapsibleContent className="space-y-2 mt-2">
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2">
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
                    className="h-8 w-8"
                    onClick={() => setWidgetLayout('list')}
                  >
                    <Layout className={`h-4 w-4 ${widgetLayout === 'list' ? 'text-purple-400' : 'text-gray-400'}`} />
                  </Button>
                </div>
                
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
            </CollapsibleContent>
          </Collapsible>
        ) : (
          <>
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
          </>
        )}
      </div>
    </div>
  );
};

export default DashboardHeader;

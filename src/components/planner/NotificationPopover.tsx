
import React from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Bell, ChevronLeft, Settings } from 'lucide-react';

interface Notification {
  id: number;
  title: string;
  message: string;
  date: string;
}

interface NotificationPopoverProps {
  hasNotifications: boolean;
  notifications: Notification[];
  openSettings: () => void;
  markAsRead: (id: number) => void;
}

// This component is kept for future reference but not currently used
const NotificationPopover: React.FC<NotificationPopoverProps> = ({
  hasNotifications,
  notifications,
  openSettings,
  markAsRead
}) => {
  return (
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
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={openSettings}
            >
              <Settings className="h-4 w-4 mr-1" />
              Settings
            </Button>
          </div>
        </div>
        <div className="max-h-80 overflow-auto">
          {notifications.length > 0 ? (
            notifications.map(notification => (
              <div key={notification.id} className="p-3 border-b border-gray-700 hover:bg-gray-700/50 transition-colors">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-sm">{notification.title}</h4>
                    <p className="text-sm text-gray-400">{notification.message}</p>
                    <p className="text-xs text-gray-500 mt-1">{notification.date}</p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6"
                    onClick={() => markAsRead(notification.id)}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="p-4 text-center text-gray-400">
              <p>No new notifications</p>
            </div>
          )}
        </div>
        <div className="p-2 border-t border-gray-700">
          <Button variant="ghost" size="sm" className="w-full text-xs">
            Clear all notifications
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationPopover;

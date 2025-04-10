
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';
import { UseFormReturn } from 'react-hook-form';

interface NotificationSettingsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  notificationForm: UseFormReturn<{
    frequency: string;
    emailNotifications: boolean;
    pushNotifications: boolean;
    customRate: string;
  }, any, undefined>;
  onSave: (data: any) => void;
}

const NotificationSettingsDialog: React.FC<NotificationSettingsDialogProps> = ({
  isOpen,
  onOpenChange,
  notificationForm,
  onSave
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-800 text-white border-gray-700">
        <DialogHeader>
          <DialogTitle>Notification Settings</DialogTitle>
          <DialogDescription className="text-gray-400">
            Customize how and when you receive notifications
          </DialogDescription>
        </DialogHeader>
        
        <Form {...notificationForm}>
          <form onSubmit={notificationForm.handleSubmit(onSave)} className="space-y-4">
            <FormField
              control={notificationForm.control}
              name="frequency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notification Frequency</FormLabel>
                  <FormControl>
                    <select 
                      className="w-full p-2 rounded-md bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      {...field}
                    >
                      <option value="realtime">Real-time</option>
                      <option value="hourly">Hourly</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="custom">Custom</option>
                    </select>
                  </FormControl>
                </FormItem>
              )}
            />
            
            {notificationForm.watch("frequency") === "custom" && (
              <FormField
                control={notificationForm.control}
                name="customRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Custom Notification Rate</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., Every 6 hours" 
                        className="bg-gray-700 border-gray-600"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            )}
            
            <FormField
              control={notificationForm.control}
              name="emailNotifications"
              render={({ field }) => (
                <FormItem className="flex items-center gap-2">
                  <FormControl>
                    <input 
                      type="checkbox" 
                      className="rounded-sm"
                      checked={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="m-0">Email Notifications</FormLabel>
                </FormItem>
              )}
            />
            
            <FormField
              control={notificationForm.control}
              name="pushNotifications"
              render={({ field }) => (
                <FormItem className="flex items-center gap-2">
                  <FormControl>
                    <input 
                      type="checkbox" 
                      className="rounded-sm"
                      checked={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="m-0">Push Notifications</FormLabel>
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default NotificationSettingsDialog;

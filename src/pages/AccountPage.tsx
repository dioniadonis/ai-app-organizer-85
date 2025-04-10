
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  User,
  Settings,
  CreditCard,
  Bell,
  Shield,
  HelpCircle,
  LogOut,
  Check,
  X,
  UserCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { toast } from '@/components/ui/use-toast';

const AccountPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [hasNotifications, setHasNotifications] = useState(true);
  
  const [notifications, setNotifications] = useState([
    { id: 1, title: "Task Due", message: "Complete project presentation", date: "2 hours ago" },
    { id: 2, title: "Goal Progress", message: "Daily exercise goal near completion", date: "Yesterday" }
  ]);

  const markNotificationAsRead = (id: number) => {
    setNotifications(notifications.filter(n => n.id !== id));
    if (notifications.length <= 1) {
      setHasNotifications(false);
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

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const handleSupportRequest = () => {
    toast({
      title: "Support Request Sent",
      description: "We'll get back to you soon!",
    });
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div 
        className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-gray-100"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        <div className="max-w-6xl mx-auto p-4 sm:p-6">
          <div className="flex justify-between items-center mb-6">
            <motion.h1 
              className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.3 }}
            >
              My Account
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
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleNavigation('/settings')}
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
                              onClick={() => markNotificationAsRead(notification.id)}
                            >
                              <X className="h-4 w-4" />
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
              
              <button 
                onClick={() => navigate(-1)} 
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800/30 text-sm hover:bg-white/10 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <Card className="bg-gray-800/30 border-gray-700 shadow-lg">
                <CardHeader>
                  <div className="flex flex-col items-center">
                    <div className="w-20 h-20 rounded-full bg-gray-700 flex items-center justify-center mb-3">
                      <UserCircle className="w-16 h-16 text-gray-400" />
                    </div>
                    <CardTitle>User Account</CardTitle>
                    <CardDescription className="text-gray-400">user@example.com</CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <Tabs orientation="vertical" value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="flex flex-col items-stretch h-auto space-y-1 bg-transparent">
                      <TabsTrigger 
                        value="profile" 
                        className="justify-start text-left px-3 py-2 data-[state=active]:bg-purple-500/20 data-[state=active]:text-white rounded-lg"
                      >
                        <User className="w-4 h-4 mr-2" />
                        Profile
                      </TabsTrigger>
                      <TabsTrigger 
                        value="subscription" 
                        className="justify-start text-left px-3 py-2 data-[state=active]:bg-purple-500/20 data-[state=active]:text-white rounded-lg"
                      >
                        <CreditCard className="w-4 h-4 mr-2" />
                        Subscription
                      </TabsTrigger>
                      <TabsTrigger 
                        value="settings" 
                        className="justify-start text-left px-3 py-2 data-[state=active]:bg-purple-500/20 data-[state=active]:text-white rounded-lg"
                      >
                        <Settings className="w-4 h-4 mr-2" />
                        Settings
                      </TabsTrigger>
                      <TabsTrigger 
                        value="security" 
                        className="justify-start text-left px-3 py-2 data-[state=active]:bg-purple-500/20 data-[state=active]:text-white rounded-lg"
                      >
                        <Shield className="w-4 h-4 mr-2" />
                        Security
                      </TabsTrigger>
                      <TabsTrigger 
                        value="help" 
                        className="justify-start text-left px-3 py-2 data-[state=active]:bg-purple-500/20 data-[state=active]:text-white rounded-lg"
                      >
                        <HelpCircle className="w-4 h-4 mr-2" />
                        Help & Support
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full text-gray-400 border-gray-600 hover:bg-gray-700" onClick={() => handleNavigation('/')}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                </CardFooter>
              </Card>
            </div>
            
            <div className="md:col-span-2">
              <Card className="bg-gray-800/30 border-gray-700 shadow-lg h-full">
                <TabsContent value="profile" className="m-0">
                  <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>Manage your personal information</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-1">
                      <Label htmlFor="name">Full Name</Label>
                      <div className="p-2 bg-gray-800 rounded-md">User Name</div>
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="email">Email Address</Label>
                      <div className="p-2 bg-gray-800 rounded-md">user@example.com</div>
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="joined">Member Since</Label>
                      <div className="p-2 bg-gray-800 rounded-md">April 2025</div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button className="bg-purple-600 hover:bg-purple-700">Edit Profile</Button>
                  </CardFooter>
                </TabsContent>
                
                <TabsContent value="subscription" className="m-0">
                  <CardHeader>
                    <CardTitle>Subscription Details</CardTitle>
                    <CardDescription>Manage your subscription plan</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="bg-gray-800/50 rounded-lg p-4 border border-purple-500/30">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="text-lg font-medium">Early Adopter Plan</h3>
                          <p className="text-gray-400 text-sm">$5.00 /month</p>
                        </div>
                        <Badge className="bg-green-500/20 text-green-300 hover:bg-green-500/30">Free Trial</Badge>
                      </div>
                      <ul className="mt-4 space-y-2">
                        <li className="flex items-center gap-2 text-sm">
                          <Check className="w-4 h-4 text-green-400" />
                          <span>Unlimited Tasks & Goals</span>
                        </li>
                        <li className="flex items-center gap-2 text-sm">
                          <Check className="w-4 h-4 text-green-400" />
                          <span>AI Assistant</span>
                        </li>
                        <li className="flex items-center gap-2 text-sm">
                          <Check className="w-4 h-4 text-green-400" />
                          <span>Advanced Analytics</span>
                        </li>
                        <li className="flex items-center gap-2 text-sm">
                          <Check className="w-4 h-4 text-green-400" />
                          <span>Customizable Dashboard</span>
                        </li>
                      </ul>
                    </div>
                    
                    <div className="bg-gray-800/30 rounded-lg p-4">
                      <h3 className="font-medium mb-2">Payment Methods</h3>
                      <div className="flex items-center gap-3 p-2 border border-gray-700 rounded-md">
                        <CreditCard className="w-5 h-5 text-purple-400" />
                        <div>
                          <div className="font-medium">Visa ending in 1234</div>
                          <div className="text-xs text-gray-400">Expires 04/28</div>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-400">
                      Early Adopter Special: Your subscription is currently free until further notice.
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="text-gray-400 border-gray-600 hover:bg-gray-700 mr-2">
                      Manage Payment Methods
                    </Button>
                    <Button className="bg-purple-600 hover:bg-purple-700">
                      Update Plan
                    </Button>
                  </CardFooter>
                </TabsContent>
                
                <TabsContent value="settings" className="m-0">
                  <CardHeader>
                    <CardTitle>Account Settings</CardTitle>
                    <CardDescription>Configure your account preferences</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-3">
                      <h3 className="font-medium">Notifications</h3>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="email-notif">Email Notifications</Label>
                          <p className="text-sm text-gray-400">Receive notifications via email</p>
                        </div>
                        <Switch id="email-notif" defaultChecked />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="task-notif">Task Reminders</Label>
                          <p className="text-sm text-gray-400">Get notified about upcoming tasks</p>
                        </div>
                        <Switch id="task-notif" defaultChecked />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="goal-notif">Goal Progress</Label>
                          <p className="text-sm text-gray-400">Get updates on your goal progress</p>
                        </div>
                        <Switch id="goal-notif" defaultChecked />
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <h3 className="font-medium">Display Settings</h3>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="dark-mode">Dark Mode</Label>
                          <p className="text-sm text-gray-400">Use dark theme</p>
                        </div>
                        <Switch id="dark-mode" defaultChecked />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="animations">Animations</Label>
                          <p className="text-sm text-gray-400">Enable smooth transitions</p>
                        </div>
                        <Switch id="animations" defaultChecked />
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button className="bg-purple-600 hover:bg-purple-700">Save Changes</Button>
                  </CardFooter>
                </TabsContent>
                
                <TabsContent value="security" className="m-0">
                  <CardHeader>
                    <CardTitle>Security</CardTitle>
                    <CardDescription>Manage your account security</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <h3 className="font-medium">Password</h3>
                      <p className="text-sm text-gray-400">Last changed: 30 days ago</p>
                      <Button variant="outline" className="text-gray-400 border-gray-600 hover:bg-gray-700">
                        Change Password
                      </Button>
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="font-medium">Two-Factor Authentication</h3>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-400">Enhance your account security</p>
                        <Switch id="2fa" />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="font-medium">Active Sessions</h3>
                      <div className="p-3 bg-gray-800 rounded-md">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">Current Browser</p>
                            <p className="text-xs text-gray-400">Last active: Just now</p>
                          </div>
                          <Badge className="bg-green-500/20 text-green-300">Active</Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="text-red-400 border-red-800 hover:bg-red-900/20">
                      Log Out All Devices
                    </Button>
                  </CardFooter>
                </TabsContent>
                
                <TabsContent value="help" className="m-0">
                  <CardHeader>
                    <CardTitle>Help & Support</CardTitle>
                    <CardDescription>Get assistance with your account</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <h3 className="font-medium">Frequently Asked Questions</h3>
                      <div className="space-y-3">
                        <div className="p-3 bg-gray-800 rounded-md hover:bg-gray-700 cursor-pointer">
                          <p className="font-medium">How do I create recurring tasks?</p>
                        </div>
                        <div className="p-3 bg-gray-800 rounded-md hover:bg-gray-700 cursor-pointer">
                          <p className="font-medium">Can I export my data?</p>
                        </div>
                        <div className="p-3 bg-gray-800 rounded-md hover:bg-gray-700 cursor-pointer">
                          <p className="font-medium">How do I use the AI assistant?</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="font-medium">Contact Support</h3>
                      <textarea 
                        className="w-full h-24 p-3 bg-gray-800 rounded-md border border-gray-700 focus:border-purple-500 focus:ring-purple-500"
                        placeholder="Describe your issue..."
                      ></textarea>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      className="bg-purple-600 hover:bg-purple-700"
                      onClick={handleSupportRequest}
                    >
                      Submit Support Request
                    </Button>
                  </CardFooter>
                </TabsContent>
              </Card>
            </div>
          </div>
          
          <footer className="py-6 text-center text-gray-500 mt-12">
            <p>Loop Space AI Organizer &copy; {new Date().getFullYear()}</p>
          </footer>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AccountPage;


import { useState } from "react";
import { 
  Bell, 
  ChevronRight, 
  Compass, 
  CreditCard, 
  Globe, 
  HelpCircle, 
  Info, 
  Languages, 
  LifeBuoy, 
  Lock, 
  Mail, 
  MessageSquare, 
  Shield
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import SecurityForm from "@/components/SecurityForm";

const Settings = () => {
  const [tab, setTab] = useState("security");
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">Configure your account settings</p>
      </div>
      
      <Tabs value={tab} onValueChange={setTab} className="space-y-6">
        <TabsList className="bg-zippy-darkGray border-zippy-gray">
          <TabsTrigger value="security" className="data-[state=active]:bg-zippy-purple">
            <Lock className="h-4 w-4 mr-2" />
            Security
          </TabsTrigger>
          <TabsTrigger value="notifications" className="data-[state=active]:bg-zippy-purple">
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="security">
          <Card className="bg-zippy-darkGray border-zippy-gray">
            <CardHeader>
              <CardTitle>Security</CardTitle>
              <CardDescription>
                Manage your account security and two-factor authentication.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SecurityForm />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications">
          <Card className="bg-zippy-darkGray border-zippy-gray">
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>
                Configure how you receive notifications.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Email Notifications</h3>
                <Separator />
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="space-y-0.5">
                      <div className="flex items-center">
                        <Bell className="h-4 w-4 mr-2 text-muted-foreground" />
                        <h4 className="font-medium">System Updates</h4>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Receive updates about system maintenance and new features.
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="space-y-0.5">
                      <div className="flex items-center">
                        <MessageSquare className="h-4 w-4 mr-2 text-muted-foreground" />
                        <h4 className="font-medium">Booking Updates</h4>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Get notified about new bookings and status changes.
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="space-y-0.5">
                      <div className="flex items-center">
                        <Compass className="h-4 w-4 mr-2 text-muted-foreground" />
                        <h4 className="font-medium">Route Changes</h4>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Be informed about route modifications and schedule updates.
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="space-y-0.5">
                      <div className="flex items-center">
                        <CreditCard className="h-4 w-4 mr-2 text-muted-foreground" />
                        <h4 className="font-medium">Payment Notifications</h4>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Receive notifications about payments and billing.
                      </p>
                    </div>
                    <Switch />
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Push Notifications</h3>
                <Separator />
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="space-y-0.5">
                      <h4 className="font-medium">Booking Notifications</h4>
                      <p className="text-sm text-muted-foreground">
                        Show notifications for new bookings and status changes.
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="space-y-0.5">
                      <h4 className="font-medium">Marketing Notifications</h4>
                      <p className="text-sm text-muted-foreground">
                        Receive special offers and promotional notifications.
                      </p>
                    </div>
                    <Switch />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <Card className="bg-zippy-darkGray border-zippy-gray">
        <CardHeader>
          <CardTitle>Help & Support</CardTitle>
          <CardDescription>
            Get help with using the application.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <HelpCircle className="h-5 w-5 text-muted-foreground" />
              <div>
                <h4 className="font-medium">Documentation</h4>
                <p className="text-sm text-muted-foreground">
                  Read the documentation to learn how to use the application.
                </p>
              </div>
            </div>
            <Button variant="outline" className="bg-zippy-gray border-zippy-lightGray">
              View Docs
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <LifeBuoy className="h-5 w-5 text-muted-foreground" />
              <div>
                <h4 className="font-medium">Support</h4>
                <p className="text-sm text-muted-foreground">
                  Contact support if you're having issues with the application.
                </p>
              </div>
            </div>
            <Button variant="outline" className="bg-zippy-gray border-zippy-lightGray">
              Contact
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <div>
                <h4 className="font-medium">Feedback</h4>
                <p className="text-sm text-muted-foreground">
                  Send feedback to help improve the application.
                </p>
              </div>
            </div>
            <Button variant="outline" className="bg-zippy-gray border-zippy-lightGray">
              Send Feedback
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Shield className="h-5 w-5 text-muted-foreground" />
              <div>
                <h4 className="font-medium">Privacy Policy</h4>
                <p className="text-sm text-muted-foreground">
                  Read our privacy policy.
                </p>
              </div>
            </div>
            <Button variant="outline" className="bg-zippy-gray border-zippy-lightGray">
              View
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Info className="h-5 w-5 text-muted-foreground" />
              <div>
                <h4 className="font-medium">About</h4>
                <p className="text-sm text-muted-foreground">
                  View information about the application.
                </p>
              </div>
            </div>
            <Button variant="outline" className="bg-zippy-gray border-zippy-lightGray">
              View
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;

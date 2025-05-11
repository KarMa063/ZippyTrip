
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
  Shield,
  X,
  Bus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

const Settings = () => {
  const [tab, setTab] = useState("security");
  const [activeDialog, setActiveDialog] = useState<string | null>(null);
  
  // Define the type for dialog content
  type DialogContentType = {
    title: string;
    description: string;
    content: React.ReactNode;
    footer?: React.ReactNode;
  };
  
  // Dialog content based on type
  const dialogContent: Record<string, DialogContentType> = {
    docs: {
      title: "Documentation",
      description: "Learn how to use the ZippyTrip Bus Operator Admin Panel",
      content: (
        <div className="space-y-4 mt-4">
          <h3 className="text-lg font-medium">Getting Started</h3>
          <p className="text-sm text-muted-foreground">
            Welcome to the ZippyTrip Bus Operator Admin Panel. This documentation will help you understand how to use the various features of the application.
          </p>
          
          <h3 className="text-lg font-medium">Dashboard</h3>
          <p className="text-sm text-muted-foreground">
            The dashboard provides an overview of your bus operations, including active routes, upcoming schedules, and recent bookings.
          </p>
          
          <h3 className="text-lg font-medium">Routes</h3>
          <p className="text-sm text-muted-foreground">
            Manage your bus routes, including adding new routes, editing existing routes, and viewing route details.
          </p>
          
          <h3 className="text-lg font-medium">Schedules</h3>
          <p className="text-sm text-muted-foreground">
            Create and manage bus schedules for your routes, including departure times, arrival times, and frequency.
          </p>
          
          <h3 className="text-lg font-medium">Bookings</h3>
          <p className="text-sm text-muted-foreground">
            View and manage passenger bookings, including confirming bookings, cancelling bookings, and viewing booking details.
          </p>
          
          <h3 className="text-lg font-medium">Analytics</h3>
          <p className="text-sm text-muted-foreground">
            View analytics and reports about your bus operations, including passenger statistics, revenue, and route performance.
          </p>
        </div>
      )
    },
    contact: {
      title: "Contact Support",
      description: "Get help with any issues you're experiencing",
      content: (
        <div className="space-y-4 mt-4">
          <h3 className="text-lg font-medium">Support Channels</h3>
          
          <div className="space-y-2">
            <h4 className="font-medium">Email Support</h4>
            <p className="text-sm text-muted-foreground">
              For general inquiries and non-urgent issues:
              <br />
              <a href="mailto:support@zippytrip.com" className="text-blue-400 hover:underline">
                support@zippytrip.com
              </a>
            </p>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium">Phone Support</h4>
            <p className="text-sm text-muted-foreground">
              For urgent issues requiring immediate assistance:
              <br />
              <a href="tel:+18005551234" className="text-blue-400 hover:underline">
                +1 (800) 555-1234
              </a>
              <br />
              Available Monday-Friday, 9am-5pm EST
            </p>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium">Live Chat</h4>
            <p className="text-sm text-muted-foreground">
              Chat with a support representative in real-time:
              <br />
              Available on the dashboard during business hours
            </p>
          </div>
        </div>
      )
    },
    feedback: {
      title: "Send Feedback",
      description: "Help us improve the ZippyTrip Bus Operator Admin Panel",
      content: (
        <div className="space-y-4 mt-4">
          <p className="text-sm text-muted-foreground">
            We value your feedback and are constantly working to improve our platform. Please share your thoughts, suggestions, or report any issues you've encountered.
          </p>
          
          <div className="space-y-2">
            <label htmlFor="feedback-type" className="text-sm font-medium">Feedback Type</label>
            <select 
              id="feedback-type" 
              className="w-full p-2 rounded-md bg-zippy-gray border border-zippy-lightGray text-white"
            >
              <option value="suggestion">Suggestion</option>
              <option value="bug">Bug Report</option>
              <option value="feature">Feature Request</option>
              <option value="other">Other</option>
            </select>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="feedback-message" className="text-sm font-medium">Your Feedback</label>
            <textarea 
              id="feedback-message" 
              rows={5} 
              className="w-full p-2 rounded-md bg-zippy-gray border border-zippy-lightGray text-white"
              placeholder="Please describe your feedback in detail..."
            ></textarea>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center space-x-2">
              <input 
                type="checkbox" 
                className="rounded border-zippy-lightGray"
              />
              <span>I'm willing to be contacted about this feedback</span>
            </label>
          </div>
        </div>
      ),
      footer: (
        <Button className="bg-zippy-purple hover:bg-zippy-purple/90">
          Submit Feedback
        </Button>
      )
    },
    privacy: {
      title: "Privacy Policy",
      description: "How we handle your data and protect your privacy",
      content: (
        <div className="space-y-4 mt-4 max-h-[60vh] overflow-y-auto pr-2">
          <h3 className="text-lg font-medium">Privacy Policy</h3>
          <p className="text-sm text-muted-foreground">
            Last updated: May 18, 2023
          </p>
          
          <div className="space-y-2">
            <h4 className="font-medium">1. Introduction</h4>
            <p className="text-sm text-muted-foreground">
              ZippyTrip ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our Bus Operator Admin Panel.
            </p>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium">2. Information We Collect</h4>
            <p className="text-sm text-muted-foreground">
              We collect information that you provide directly to us, such as when you create an account, update your profile, use our services, or communicate with us.
            </p>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium">3. How We Use Your Information</h4>
            <p className="text-sm text-muted-foreground">
              We use the information we collect to provide, maintain, and improve our services, to communicate with you, and to comply with legal obligations.
            </p>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium">4. Sharing Your Information</h4>
            <p className="text-sm text-muted-foreground">
              We may share your information with third-party service providers who perform services on our behalf, such as payment processing, data analysis, email delivery, and customer service.
            </p>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium">5. Data Security</h4>
            <p className="text-sm text-muted-foreground">
              We implement appropriate technical and organizational measures to protect the security of your personal information.
            </p>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium">6. Your Rights</h4>
            <p className="text-sm text-muted-foreground">
              Depending on your location, you may have certain rights regarding your personal information, such as the right to access, correct, or delete your personal information.
            </p>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium">7. Changes to This Privacy Policy</h4>
            <p className="text-sm text-muted-foreground">
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page.
            </p>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium">8. Contact Us</h4>
            <p className="text-sm text-muted-foreground">
              If you have any questions about this Privacy Policy, please contact us at privacy@zippytrip.com.
            </p>
          </div>
        </div>
      )
    },
    about: {
      title: "About ZippyTrip",
      description: "Information about our bus management platform",
      content: (
        <div className="space-y-4 mt-4">
          <div className="flex justify-center mb-4">
            <div className="bg-zippy-purple p-4 rounded-full">
              <Bus className="h-12 w-12 text-white" />
            </div>
          </div>
          
          <h3 className="text-lg font-medium text-center">ZippyTrip Bus Operator Admin Panel</h3>
          <p className="text-sm text-muted-foreground text-center">
            Version 1.2.0
          </p>
          
          <Separator />
          
          <p className="text-sm text-muted-foreground">
            ZippyTrip is a comprehensive bus management platform designed to streamline operations for bus companies of all sizes. Our platform provides tools for route management, scheduling, booking management, and analytics.
          </p>
          
          <div className="space-y-2">
            <h4 className="font-medium">Our Mission</h4>
            <p className="text-sm text-muted-foreground">
              To revolutionize the bus transportation industry by providing innovative technology solutions that improve efficiency, enhance the passenger experience, and drive business growth.
            </p>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium">Development Team</h4>
            <p className="text-sm text-muted-foreground">
              ZippyTrip is developed by a dedicated team of engineers, designers, and transportation experts committed to creating the best bus management platform in the industry.
            </p>
          </div>
          
          <Separator />
          
          <p className="text-sm text-muted-foreground text-center">
            © {new Date().getFullYear()} ZippyTrip Transportation Systems. All rights reserved.
          </p>
        </div>
      )
    }
  };
  
  // Handle opening dialogs
  const handleViewDocs = () => {
    setActiveDialog('docs');
  };
  
  const handleContact = () => {
    setActiveDialog('contact');
  };
  
  const handleSendFeedback = () => {
    setActiveDialog('feedback');
  };
  
  const handleViewPrivacy = () => {
    setActiveDialog('privacy');
  };
  
  const handleViewAbout = () => {
    setActiveDialog('about');
  };
  
  // Close dialog
  const handleCloseDialog = () => {
    setActiveDialog(null);
  };
  
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
            <Button 
              variant="outline" 
              className="bg-zippy-gray border-zippy-lightGray"
              onClick={handleViewDocs}
            >
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
            <Button 
              variant="outline" 
              className="bg-zippy-gray border-zippy-lightGray"
              onClick={handleContact}
            >
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
            <Button 
              variant="outline" 
              className="bg-zippy-gray border-zippy-lightGray"
              onClick={handleSendFeedback}
            >
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
            <Button 
              variant="outline" 
              className="bg-zippy-gray border-zippy-lightGray"
              onClick={handleViewPrivacy}
            >
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
            <Button 
              variant="outline" 
              className="bg-zippy-gray border-zippy-lightGray"
              onClick={handleViewAbout}
            >
              View
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Dialogs for each section */}
      {activeDialog && (
        <Dialog open={!!activeDialog} onOpenChange={handleCloseDialog}>
          <DialogContent className="bg-zippy-darkGray border-zippy-gray text-white max-w-2xl">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <DialogTitle>{dialogContent[activeDialog as keyof typeof dialogContent].title}</DialogTitle>
                {/* Remove this button to avoid duplicate close buttons */}
                {/* <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleCloseDialog}
                  className="h-6 w-6 rounded-full"
                >
                  <X className="h-4 w-4" />
                </Button> */}
              </div>
              <DialogDescription>
                {dialogContent[activeDialog as keyof typeof dialogContent].description}
              </DialogDescription>
            </DialogHeader>
            
            {dialogContent[activeDialog as keyof typeof dialogContent].content}
            
            <DialogFooter className="mt-6">
              {dialogContent[activeDialog as keyof typeof dialogContent].footer || (
                <Button 
                  variant="outline" 
                  onClick={handleCloseDialog}
                  className="bg-zippy-gray border-zippy-lightGray"
                >
                  Close
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default Settings;

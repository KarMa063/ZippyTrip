import { Button } from "../gcomponents/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../gcomponents/card";
import { Input } from "../gcomponents/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../gcomponents/tabs";

const GSettings = () => {
  const handleSaveProfile = () => {
    console.log("Profile updated");
  };

  const handleSaveNotifications = () => {
    console.log("Notification preferences saved");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your account settings and preferences</p>
      </div>

      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your personal information and how it appears on your account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium">First Name</p>
                  <Input id="firstName" defaultValue="John" />
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Last Name</p>
                  <Input id="lastName" defaultValue="Smith" />
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Email Address</p>
                <Input id="email" type="email" defaultValue="john.smith@example.com" />
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Phone Number</p>
                <Input id="phone" defaultValue="+977 9878654532" />
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSaveProfile}>Save Changes</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Control which notifications you receive and how they are delivered
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Email Notifications</h3>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium">New Bookings</p>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications when a new booking is made
                    </p>
                  </div>
                  <input type="checkbox" defaultChecked />
                </div>

                <hr className="my-4" />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium">Booking Cancellations</p>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications when a booking is cancelled
                    </p>
                  </div>
                  <input type="checkbox" defaultChecked />
                </div>

                <hr className="my-4" />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium">Guest Messages</p>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications when guests send you messages
                    </p>
                  </div>
                  <input type="checkbox" defaultChecked />
                </div>

                <hr className="my-4" />
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSaveNotifications}>Save Preferences</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="account" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Account Security</CardTitle>
              <CardDescription>Update your password and security settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm font-medium">Current Password</p>
                <Input id="current-password" type="password" />
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">New Password</p>
                <Input id="new-password" type="password" />
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Confirm New Password</p>
                <Input id="confirm-password" type="password" />
              </div>

              <div className="flex justify-end">
                <Button>Update Password</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Danger Zone</CardTitle>
              <CardDescription>Irreversible and destructive actions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Delete Account</h3>
                  <p className="text-sm text-muted-foreground">
                    Permanently delete your account and all your data
                  </p>
                </div>
                <Button variant="destructive">Delete Account</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GSettings;

import { Button } from "../gcomponents/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../gcomponents/card";
import { Input } from "../gcomponents/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../gcomponents/tabs";

const GSettings = () => {
  const handleSaveProfile = () => {
    console.log("Profile updated");
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
              <div className="space-y-2">
                <p className="text-sm font-medium">UserName</p>
                <Input id="userName" defaultValue="ZippyTrip Guesthouses" />
              </div>
              
              <div className="space-y-2">
                <p className="text-sm font-medium">Email Address</p>
                <Input id="email" type="email" defaultValue="zippytrip101@gmail.com" />
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

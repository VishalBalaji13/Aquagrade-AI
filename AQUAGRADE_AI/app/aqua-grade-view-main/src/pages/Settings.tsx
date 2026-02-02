import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Ship, Lock, Download, Bell } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { exportFishPredictionsToCSV } from "@/lib/csvExport";
import { exportFishPredictionsToPDF } from "@/lib/pdfExport";

const Settings = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [vesselName, setVesselName] = useState("");
  const [vesselRegistration, setVesselRegistration] = useState("");
  const [vesselHomePort, setVesselHomePort] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setEmail(user.email || "");
        
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (profile) {
          setFirstName(profile.first_name || "");
          setLastName(profile.last_name || "");
          setVesselName(profile.vessel_name || "");
          setVesselRegistration(profile.vessel_registration || "");
          setVesselHomePort(profile.vessel_home_port || "");
        }
      }
      setLoading(false);
    };

    fetchUserData();
  }, []);

  const handleSaveProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('profiles')
      .update({
        first_name: firstName,
        last_name: lastName
      })
      .eq('id', user.id);

    if (error) {
      toast.error("Failed to update profile");
    } else {
      toast.success("Profile updated successfully!");
    }
  };

  const handleSaveVessel = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('profiles')
      .update({
        vessel_name: vesselName,
        vessel_registration: vesselRegistration,
        vessel_home_port: vesselHomePort
      })
      .eq('id', user.id);

    if (error) {
      toast.error("Failed to update vessel information");
    } else {
      toast.success("Vessel information updated successfully!");
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill in all password fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("New passwords don't match");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) {
      toast.error("Failed to change password: " + error.message);
    } else {
      toast.success("Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
  };

  const handleExportData = async (format: 'csv' | 'pdf') => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Please log in to export data");
      return;
    }

    const { data } = await supabase
      .from('fish_predictions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (!data || data.length === 0) {
      toast.error("No data to export");
      return;
    }

    if (format === 'csv') {
      exportFishPredictionsToCSV(data);
      toast.success("CSV file downloaded successfully!");
    } else {
      exportFishPredictionsToPDF(data);
      toast.success("PDF file downloaded successfully!");
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in max-w-4xl">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground mt-1">
            Manage your account and preferences
          </p>
        </div>

        {/* Profile Settings */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Information
            </CardTitle>
            <CardDescription>Update your personal details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input 
                  id="firstName" 
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input 
                  id="lastName" 
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                value={email}
                disabled
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" type="tel" placeholder="+1 (555) 000-0000" />
            </div>

            <Button className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={handleSaveProfile}>
              Save Changes
            </Button>
          </CardContent>
        </Card>

        {/* Vessel Information */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ship className="h-5 w-5" />
              Vessel Information
            </CardTitle>
            <CardDescription>Details about your fishing vessel</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="vesselName">Vessel Name</Label>
              <Input 
                id="vesselName" 
                placeholder="The Sea Runner"
                value={vesselName}
                onChange={(e) => setVesselName(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="registration">Registration Number</Label>
                <Input 
                  id="registration" 
                  placeholder="REG-12345"
                  value={vesselRegistration}
                  onChange={(e) => setVesselRegistration(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="homePort">Home Port</Label>
                <Input 
                  id="homePort" 
                  placeholder="Boston Harbor"
                  value={vesselHomePort}
                  onChange={(e) => setVesselHomePort(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <Button className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={handleSaveVessel}>
              Update Vessel Info
            </Button>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
            <CardDescription>Manage your notification preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive updates about new features and improvements
                </p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Analysis Complete</Label>
                <p className="text-sm text-muted-foreground">
                  Get notified when fish analysis is complete
                </p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Weekly Reports</Label>
                <p className="text-sm text-muted-foreground">
                  Receive weekly summary of your catches
                </p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>

        {/* Security */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Security
            </CardTitle>
            <CardDescription>Manage your password and security settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input 
                id="currentPassword" 
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input 
                id="newPassword" 
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input 
                id="confirmPassword" 
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <Button className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={handleChangePassword}>
              Change Password
            </Button>
          </CardContent>
        </Card>

        {/* Data Export */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Data Export
            </CardTitle>
            <CardDescription>Download your analysis history and data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Export all your fish analysis records, predictions, and feedback as a CSV or PDF file.
            </p>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => handleExportData('csv')}>
                <Download className="mr-2 h-4 w-4" />
                Export as CSV
              </Button>
              <Button variant="outline" onClick={() => handleExportData('pdf')}>
                <Download className="mr-2 h-4 w-4" />
                Export as PDF
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Settings;

import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { updateUser } from "@/services/auth.service";
import { ArrowLeft, User, Mail, Shield, Trash2, LogOut, Eye, EyeOff, KeyRound } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const AccountSettings = () => {
  const navigate = useNavigate();
  const { user, logout, setUser } = useAuth(); // setUser is available thanks to updateUserState in context

  const [isLoading, setIsLoading] = useState(false);

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Local form state - initialized from context user
  const [userInfo, setUserInfo] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });

  // Sync form with current user from context (on mount and if user changes)
  useEffect(() => {
    if (user) {
      setUserInfo({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
      });
    }
  }, [user]);

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleUserInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

const handleUpdateUserInfo = async (e: React.FormEvent) => {
  e.preventDefault();

  // Fixed: Only check user.id (your backend uses string id)
  if (!user || !user.id) {
    toast({
      title: "Error",
      description: "User not found. Please log in again.",
      variant: "destructive",
    });
    return;
  }

  const trimmedInfo = {
    firstName: userInfo.firstName.trim(),
    lastName: userInfo.lastName.trim(),
    email: userInfo.email.trim(),
  };

  if (!trimmedInfo.firstName || !trimmedInfo.lastName || !trimmedInfo.email) {
    toast({
      title: "Validation Error",
      description: "All fields are required.",
      variant: "destructive",
    });
    return;
  }

  setIsLoading(true);

  try {
    const updatedUser = await updateUser(user.id, trimmedInfo);

    // Update context so navbar refreshes instantly
    setUser(updatedUser);

    toast({
      title: "Success",
      description: "Profile updated successfully!",
    });
  } catch (error: any ) {
    toast({
      title: "Update Failed",
      description: error.message || "Something went wrong.",
      variant: "destructive",
    });
  } finally {
    setIsLoading(false);
  }
};

  const [passwordError, setPasswordError] = useState("");

  const validatePassword = (password: string): string => {
    if (!password) return "";

    const errors: string[] = [];

    if (password.length <= 8) errors.push("at least 9 characters");
    if (!/[a-zA-Z]/.test(password)) errors.push("letters");
    if (!/[0-9]/.test(password)) errors.push("numbers");

    return errors.length > 0 ? `Password must contain ${errors.join(", ")}.` : "";
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Mismatch",
        description: "New password and confirmation do not match.",
        variant: "destructive",
      });
      return;
    }

    const validationError = validatePassword(passwordData.newPassword);
    if (validationError) {
      setPasswordError(validationError);
      toast({
        title: "Invalid Password",
        description: validationError,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // TODO: Replace with real API call when backend is ready
      await new Promise((resolve) => setTimeout(resolve, 800));

      toast({
        title: "Password Changed",
        description: "Your password was updated successfully.",
      });

      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setPasswordError("");
    } catch {
      toast({
        title: "Failed",
        description: "Could not change password.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = () => {
    toast({
      title: "Not Available",
      description: "Account deletion is not yet implemented.",
      variant: "destructive",
    });
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/dashboard">
            <Button variant="outline" size="sm" className="gap-2 pointer-events-auto cursor-pointer">
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
          </Link>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Account Settings</h1>
            <p className="text-muted-foreground">Manage your account information and security settings</p>
          </div>

          {/* User Information */}
          <Card variant="glass" className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                User Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateUserInfo} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-foreground mb-2">
                      First Name
                    </label>
                    <Input
                      id="firstName"
                      name="firstName"
                      type="text"
                      value={userInfo.firstName}
                      onChange={handleUserInfoChange}
                      placeholder="First name"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-foreground mb-2">
                      Last Name
                    </label>
                    <Input
                      id="lastName"
                      name="lastName"
                      type="text"
                      value={userInfo.lastName}
                      onChange={handleUserInfoChange}
                      placeholder="Last name"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                    Email
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={userInfo.email}
                    onChange={handleUserInfoChange}
                    placeholder="your@email.com"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  variant="gradient"
                  size="lg"
                  disabled={isLoading}
                  className="pointer-events-auto cursor-pointer"
                >
                  {isLoading ? "Updating..." : "Update Information"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Security / Change Password */}
          <Card variant="glass" className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-1">Change Password</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Update your password regularly to keep your account secure.
                </p>

                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Current Password</label>
                    <div className="relative">
                      <Input
                        name="currentPassword"
                        type={showCurrentPassword ? "text" : "password"}
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        placeholder="••••••••"
                        required
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                      >
                        {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">New Password</label>
                    <div className="relative">
                      <Input
                        name="newPassword"
                        type={showNewPassword ? "text" : "password"}
                        value={passwordData.newPassword}
                        onChange={(e) => {
                          handlePasswordChange(e);
                          setPasswordError(validatePassword(e.target.value));
                        }}
                        placeholder="••••••••"
                        required
                        className={`pr-10 ${passwordError ? "border-destructive" : ""}`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                      >
                        {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {passwordError && <p className="text-sm text-destructive mt-2">{passwordError}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Confirm New Password</label>
                    <div className="relative">
                      <Input
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        placeholder="••••••••"
                        required
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    variant="outline"
                    size="lg"
                    disabled={isLoading}
                    className="gap-2"
                  >
                    <KeyRound className="w-4 h-4" />
                    {isLoading ? "Changing..." : "Change Password"}
                  </Button>
                </form>
              </div>
            </CardContent>
          </Card>

          {/* Account Actions */}
          <Card variant="glass">
            <CardHeader>
              <CardTitle>Account Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  variant="outline"
                  size="lg"
                  className="gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={handleDeleteAccount}
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Account
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  className="gap-2"
                  onClick={handleLogout}
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default AccountSettings;
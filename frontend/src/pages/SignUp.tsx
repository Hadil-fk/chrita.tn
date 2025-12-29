import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Eye, EyeOff, UserPlus } from "lucide-react";
import GoogleAuthButton from "@/components/GoogleAuthButton";

const SignUp = () => {
  const navigate = useNavigate();
  const { signup, loginWithGoogle } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    acceptTerms: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  const handleGoogleSuccess = async (credential: string) => {
    setIsGoogleLoading(true);
    try {
      await loginWithGoogle(credential);
      toast({
        title: "Account Created!",
        description: "Welcome to Chrita.tn! You are now signed in with Google.",
      });
      navigate("/");
    } catch (error) {
      toast({
        title: "Google Sign Up Failed",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleGoogleError = () => {
    toast({
      title: "Google Sign Up Failed",
      description: "Failed to sign up with Google. Please try again.",
      variant: "destructive",
    });
  };

  const validatePassword = (password: string): string => {
    if (password.length === 0) return "";
    
    const errors: string[] = [];
    
    if (password.length <= 8) {
      errors.push("Password must be longer than 8 characters");
    }
    
    if (!/[a-zA-Z]/.test(password)) {
      errors.push("Password must contain letters");
    }
    
    if (!/[0-9]/.test(password)) {
      errors.push("Password must contain numbers");
    }
    
    return errors.join(". ");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.acceptTerms) {
      toast({
        title: "Terms Required",
        description: "Please accept the terms and conditions to continue.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.email || !formData.password || !formData.firstName) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const passwordValidationError = validatePassword(formData.password);
    if (passwordValidationError) {
      setPasswordError(passwordValidationError);
      toast({
        title: "Invalid Password",
        description: passwordValidationError,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      await signup(
        formData.firstName,
        formData.lastName || "",
        formData.email,
        formData.password
      );
      toast({
        title: "Account Created!",
        description: "Welcome to Chrita.tn! You are now signed in.",
      });
      navigate("/");
    } catch (error) {
      toast({
        title: "Sign Up Failed",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout showBackground>
      <div className="container mx-auto px-4 py-12 flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <Card variant="glass" className="w-full max-w-md animate-slide-up">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-3xl font-bold text-primary">Sign Up</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  placeholder="First Name"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  required
                />
                <Input
                  placeholder="Last Name"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                />
              </div>
              <Input
                type="email"
                placeholder="Email address"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
              <div>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={formData.password}
                    onChange={(e) => {
                      const newPassword = e.target.value;
                      setFormData({ ...formData, password: newPassword });
                      setPasswordError(validatePassword(newPassword));
                    }}
                    required
                    className={passwordError ? "border-destructive" : ""}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {passwordError && (
                  <p className="text-sm text-destructive mt-2">{passwordError}</p>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <Checkbox
                  id="terms"
                  checked={formData.acceptTerms}
                  onCheckedChange={(checked) => 
                    setFormData({ ...formData, acceptTerms: checked as boolean })
                  }
                />
                <label htmlFor="terms" className="text-sm text-muted-foreground cursor-pointer">
                  I accept the terms and conditions
                </label>
              </div>

              <Button 
                type="submit" 
                variant="gradient" 
                size="lg" 
                className="w-full pointer-events-auto cursor-pointer"
                disabled={isLoading || isGoogleLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Creating Account...
                  </span>
                ) : (
                  <>
                    <UserPlus className="w-5 h-5" />
                    Sign Up
                  </>
                )}
              </Button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>

            <GoogleAuthButton
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              isLoading={isGoogleLoading || isLoading}
              variant="gradient"
              size="lg"
            />

            <p className="text-center mt-6 text-muted-foreground">
              Already have an account?{" "}
              <Link to="/signin" className="text-primary font-semibold hover:underline">
                Sign In
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default SignUp;

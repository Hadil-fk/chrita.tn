import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { login as loginService, signup as signupService, logout as logoutService, loginWithGoogle as loginWithGoogleService, getCurrentUser, isAuthenticated } from "@/services/auth.service";
import { User } from "@/types";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (firstName: string, lastName: string, email: string, password: string) => Promise<void>;
  loginWithGoogle: (tokenId: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Check if user is logged in on component mount
   * Loads user data from localStorage if token exists
   */
  useEffect(() => {
    const initializeAuth = () => {
      try {
        // Check if user has a valid token
        if (isAuthenticated()) {
          // Load user data from localStorage
          const savedUser = getCurrentUser();
          if (savedUser) {
            setUser(savedUser);
          }
        }
      } catch (error) {
        console.error("Failed to initialize auth:", error);
        // Clear invalid data
        logoutService();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  /**
   * Login user with email and password
   * Calls the backend API and stores JWT token
   */
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Call the authentication service
      await loginService({ email, password });
      
      // Read normalized user from localStorage (set by loginService)
      const savedUser = getCurrentUser();
      setUser(savedUser);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Sign up a new user
   * Calls the backend API to create a new user account
   */
  const signup = async (firstName: string, lastName: string, email: string, password: string) => {
    setIsLoading(true);
    // Call the signup service
    await signupService({ firstName, lastName, email, password });
    
    // After successful signup, automatically log the user in
    await login(email, password);
    setIsLoading(false);
  };

  /**
   * Login user with Google OAuth
   * Calls the backend API with Google token and stores JWT token
   */
  const loginWithGoogle = async (tokenId: string) => {
    setIsLoading(true);
    try {
      await loginWithGoogleService(tokenId);
      // Read normalized user from localStorage (set by loginWithGoogleService)
      const savedUser = getCurrentUser();
      setUser(savedUser);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Logout current user
   * Removes token and user data, clears state
   */
  const logout = () => {
    logoutService();
    setUser(null);
  };

  /**
   * Update user state
   * Used after profile updates or to sync user data
   */
  const updateUserState = (updatedUser: User | null) => {
    setUser(updatedUser);
    if (updatedUser) {
      localStorage.setItem("auth-user", JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: user !== null,
        isLoading,
        login,
        signup,
        loginWithGoogle,
        logout,
        setUser: updateUserState,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

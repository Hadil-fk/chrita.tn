import api from "@/api/api";
import { LoginRequest, SignUpRequest, AuthResponse, User } from "@/types";
import { AxiosError } from "axios";

const getErrorMessage = (error: unknown, defaultMessage: string): string => {
  if (error instanceof AxiosError) {
    // Server responded with error
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    // Network error (no response)
    if (error.request && !error.response) {
      return "Network error: Could not connect to server. Please check if the backend is running.";
    }
    // Request setup error
    if (error.message) {
      return error.message;
    }
  }
  if (error instanceof Error) {
    return error.message;
  }
  return defaultMessage;
};

// SIGN UP
export const signup = async (data: SignUpRequest): Promise<void> => {
  try {
    // Ensure all required fields are present and properly formatted
    const signupData = {
      firstName: data.firstName?.trim() || "",
      lastName: data.lastName?.trim() || "",
      email: data.email?.trim().toLowerCase() || "",
      password: data.password || ""
    };

    // Validate required fields before sending
    if (!signupData.firstName || !signupData.email || !signupData.password) {
      throw new Error("First name, email, and password are required");
    }

    console.log("Sending signup request:", { ...signupData, password: "***" });
    
    const response = await api.post("/auth/signup", signupData);
    console.log("Signup successful:", response.data);
  } catch (error) {
    console.error("Signup error details:", error);
    throw new Error(getErrorMessage(error, "Registration failed"));
  }
};

// SIGN IN
export const login = async (data: LoginRequest): Promise<AuthResponse> => {
  try {
    const response = await api.post<AuthResponse>("/auth/signin", data);

    if (response.data.token) localStorage.setItem("token", response.data.token);
    if (response.data.user) localStorage.setItem("auth-user", JSON.stringify(response.data.user));

    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Login failed"));
  }
};

export const logout = (): void => {
  localStorage.removeItem("token");
  localStorage.removeItem("auth-user");
};

export const getCurrentUser = (): User | null => {
  const userStr = localStorage.getItem("auth-user");
  return userStr ? JSON.parse(userStr) : null;
};

export const isAuthenticated = (): boolean => !!localStorage.getItem("token");

// GOOGLE OAUTH
export const loginWithGoogle = async (tokenId: string): Promise<AuthResponse> => {
  try {
    const response = await api.post<AuthResponse>("/auth/google", { tokenId });

    if (response.data.token) localStorage.setItem("token", response.data.token);
    if (response.data.user) localStorage.setItem("auth-user", JSON.stringify(response.data.user));

    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Google authentication failed"));
  }
};

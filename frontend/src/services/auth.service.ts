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

// Helper: normalize raw user object to ensure firstName/lastName exist
const normalizeUser = (raw: any): any => {
  if (!raw) return null;
  return {
    id: raw.id ?? raw._id?.toString?.() ?? raw._id ?? "",
    firstName: raw.firstName ?? raw.first_name ?? "",
    lastName: raw.lastName ?? raw.last_name ?? "",
    email: raw.email ?? "",
  };
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
    if (response.data.user) {
      const normalized = normalizeUser(response.data.user);
      localStorage.setItem("auth-user", JSON.stringify(normalized));
    }

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
  if (!userStr) return null;
  try {
    const parsed = JSON.parse(userStr);
    return normalizeUser(parsed);
  } catch (err) {
    console.warn("Failed to parse auth-user", err);
    return null;
  }
};

export const isAuthenticated = (): boolean => !!localStorage.getItem("token");

// UPDATE USER PROFILE
export const updateUser = async (userId: string, data: Partial<User>): Promise<User> => {
  try {
    const response = await api.put(`/auth/profile/${userId}`, data);
    
    // Backend returns { message, user } — extract user
    const raw = response.data?.user ?? response.data;
    const normalized = normalizeUser(raw);

    // Update localStorage with normalized user
    localStorage.setItem("auth-user", JSON.stringify(normalized));

    return normalized;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to update profile"));
  }
};

// GOOGLE OAUTH
export const loginWithGoogle = async (tokenId: string): Promise<AuthResponse> => {
  try {
    const response = await api.post<AuthResponse>("/auth/google", { tokenId });

    if (response.data.token) localStorage.setItem("token", response.data.token);
    if (response.data.user) {
      const normalized = normalizeUser(response.data.user);
      localStorage.setItem("auth-user", JSON.stringify(normalized));
    }

    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Google authentication failed"));
  }
};

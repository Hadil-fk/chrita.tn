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
const normalizeUser = (raw: unknown): User | null => {
  if (!raw || typeof raw !== "object") return null;

  const obj = raw as Record<string, unknown>;

  const id = 
    (obj.id as string | undefined) ?? 
    (typeof obj._id === "object" && obj._id != null && "toString" in obj._id 
      ? (obj._id as { toString: () => string }).toString() 
      : undefined) ??
    (typeof obj._id === "string" ? obj._id as string : undefined) ??
    "";

  return {
    id,
    firstName: (obj.firstName as string | undefined) ?? (obj.first_name as string | undefined) ?? "",
    lastName: (obj.lastName as string | undefined) ?? (obj.last_name as string | undefined) ?? "",
    email: (obj.email as string | undefined) ?? "",
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

// CHANGE PASSWORD
export const changePassword = async (userId: string, currentPassword: string, newPassword: string): Promise<void> => {
  try {
    await api.put(`/auth/change-password/${userId}`, { currentPassword, newPassword });
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to change password"));
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

import { useRef, useEffect } from "react";
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface GoogleAuthButtonProps {
  onSuccess: (credential: string) => Promise<void>;
  onError?: () => void;
  isLoading?: boolean;
  variant?: "gradient" | "outline" | "minimal" | "custom";
  size?: "default" | "sm" | "lg" | "xl";
  className?: string;
}

/**
 * Custom Google OAuth Button Component
 * 
 * Variants:
 * - "gradient": Matches your existing gradient buttons (default)
 * - "outline": Outline style button
 * - "minimal": Only Google logo, no text
 * - "custom": Fully custom styled button with "Continue with Google" text
 */
const GoogleAuthButton = ({
  onSuccess,
  onError,
  isLoading = false,
  variant = "gradient",
  size = "lg",
  className = "",
}: GoogleAuthButtonProps) => {
  const googleButtonRef = useRef<HTMLDivElement>(null);

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    try {
      if (!credentialResponse.credential) {
        throw new Error("No credential received from Google");
      }
      await onSuccess(credentialResponse.credential);
    } catch (error) {
      console.error("Google login error:", error);
      onError?.();
    }
  };

  const handleClick = () => {
    // Trigger click on the hidden Google button
    // The Google button renders as a div with role="button"
    const googleButton = googleButtonRef.current?.querySelector('div[role="button"]') as HTMLElement;
    if (googleButton) {
      googleButton.click();
    }
  };

  // Google logo SVG
  const GoogleIcon = () => (
    <svg
      className="w-5 h-5"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );

  // Minimal variant - only logo with white background, primary border
  if (variant === "minimal") {
    return (
      <>
        <div ref={googleButtonRef} className="hidden">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={onError}
            useOneTap={false}
          />
        </div>
        <button
          onClick={handleClick}
          disabled={isLoading}
          className={`p-3 rounded-lg border-2 border-primary bg-white hover:bg-gray-50 hover:border-primary/80 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
          type="button"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin text-black" />
          ) : (
            <GoogleIcon />
          )}
        </button>
      </>
    );
  }

  // Custom variant - "Continue with Google" text with white background, black text, primary border
  if (variant === "custom") {
    return (
      <>
        <div ref={googleButtonRef} className="hidden">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={onError}
            useOneTap={false}
          />
        </div>
        <Button
          onClick={handleClick}
          disabled={isLoading}
          variant="outline"
          size={size}
          className={`w-full bg-white text-black border-2 border-primary hover:bg-gray-50 hover:border-primary/80 hover:text-primary transition-all duration-300 ${className}`}
          type="button"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin text-black" />
              Connecting...
            </>
          ) : (
            <>
              <GoogleIcon />
              Continue with Google
            </>
          )}
        </Button>
      </>
    );
  }

  // Gradient or Outline variant - white background, black text, primary border
  return (
    <>
      <div ref={googleButtonRef} className="hidden">
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={onError}
          useOneTap={false}
        />
      </div>
      <Button
        onClick={handleClick}
        disabled={isLoading}
        variant="outline"
        size={size}
        className={`w-full bg-white text-black border-2 border-primary hover:bg-gray-50 hover:border-primary/80 hover:text-primary transition-all duration-300 ${className}`}
        type="button"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin text-black" />
            Connecting...
          </>
        ) : (
          <>
            <GoogleIcon />
            Continue with Google
          </>
        )}
      </Button>
    </>
  );
};

export default GoogleAuthButton;

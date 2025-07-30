// src/components/AuthWrapper.tsx
import { useSelector } from "react-redux";
import { RootState } from "../store/store";
import { Navigate } from "react-router-dom";
import { ReactNode } from "react";

interface AuthWrapperProps {
  children: ReactNode;
}

export const AuthWrapper = ({ children }: AuthWrapperProps) => {
  console.log("proooo , called")
  const { userId } = useSelector((state: RootState) => state.authreducer);
  const { connected, onboarding_complete } = useSelector(
    (state: RootState) => state.OAuthreducer
  );

  // 1. No user → redirect to landing
  if (!userId) {
    return <Navigate to="/" replace />;
  }

  // Special case: If we're on /connect-gmail but already connected
  if (window.location.pathname === "/connect-gmail" && connected) {
    return onboarding_complete 
      ? <Navigate to="/dashboard" replace />
      : <Navigate to="/prompt-select" replace />;
  }

  // Special case: If we're on /prompt-select but onboarding is already complete
  if (window.location.pathname === "/prompt-select" && onboarding_complete) {
    return <Navigate to="/dashboard" replace />;
  }

  // 2. For all other routes, check the requirements
  if (!connected && window.location.pathname !== "/connect-gmail") {
    return <Navigate to="/connect-gmail" replace />;
  }

  if (connected && !onboarding_complete && window.location.pathname !== "/prompt-select") {
    return <Navigate to="/prompt-select" replace />;
  }

  // If all checks pass, render the children
  return <>{children}</>;
};
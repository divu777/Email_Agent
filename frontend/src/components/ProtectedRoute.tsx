import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";

interface ProtectedRouteProps {
  children: any;
  requireGmailConnected?: boolean;
}

const ProtectedRoute = ({ children, requireGmailConnected = false }: ProtectedRouteProps) => {
  const { userId } = useSelector((state: RootState) => state.authreducer);
  const { onboarding_complete } = useSelector((state: RootState) => state.OAuthreducer);

  if (!userId) {
    return <Navigate to="/" replace />;
  }

  if (requireGmailConnected && !onboarding_complete) {
    return <Navigate to="/connect-gmail" replace />;
  }

  return children;
};

export default ProtectedRoute;

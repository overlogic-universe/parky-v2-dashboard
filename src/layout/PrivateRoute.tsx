import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../configuration";

// Define the type for children prop
interface PrivateRouteProps {
  children: ReactNode;
}

export default function PrivateRoute({ children }: PrivateRouteProps) {
  const [user, loading] = useAuthState(auth);

  if (loading) {
    return (
      <div className="fixed inset-0 flex flex-col justify-center items-center bg-white">
        <img className="text-center mb-3" src="/images/logo/parky-logo.png" height={300} width={300} />
        <div className="animate-spin h-10 w-10 border-t-3 border-brand-500 rounded-full mx-auto"></div>
      </div>
    );
  }

  return user ? (
    // Render the children if the user is authenticated
    <>{children}</>
  ) : (
    // Redirect to signin if the user is not authenticated
    <Navigate to="/signin" replace />
  );
}

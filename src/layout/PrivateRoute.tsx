import { ReactNode, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../configuration";
import { db } from "../configuration"; 
import { doc, getDoc } from "firebase/firestore";

interface PrivateRouteProps {
  children: ReactNode;
}

export default function PrivateRoute({ children }: PrivateRouteProps) {
  const [user, loading] = useAuthState(auth);
  const [checking, setChecking] = useState(true);
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAccess = async () => {
      if (user) {
        const docRef = doc(db, "admins", user.uid);
        const docSnap = await getDoc(docRef);
        setHasAccess(docSnap.exists());
      } else {
        setHasAccess(false);
      }
      setChecking(false);
    };

    if (!loading) {
      checkAccess();
    }
  }, [user, loading]);

  if (loading || checking) {
    return (
      <div className="fixed inset-0 flex flex-col justify-center items-center bg-white">
        <img className="dark:hidden mb-3" src="/images/logo/parky-logo-b.png" alt="Logo" height={300} width={300} />
        <img className="hidden dark:block mb-3" src="/images/logo/parky-logo.png" alt="Logo" height={300} width={300} />
        <div className="animate-spin h-10 w-10 border-t-3 border-brand-500 rounded-full mx-auto"></div>
      </div>
    );
  }

  if (!user || !hasAccess) {
    return <Navigate to="/signin" replace />;
  }

  return <>{children}</>;
}

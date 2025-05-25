import { ReactNode, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../configuration";
import { doc, getDoc } from "firebase/firestore";

interface Props {
  children: ReactNode;
}

export default function OnlyGuestRoute({ children }: Props) {
  const [user, loading] = useAuthState(auth);
  const [checking, setChecking] = useState(true);
  const [isAttendant, setIsAttendant] = useState<boolean | null>(null);

  useEffect(() => {
    const checkParkingAttendant = async () => {
      if (user) {
        const docRef = doc(db, "admins", user.uid);
        const docSnap = await getDoc(docRef);
        setIsAttendant(docSnap.exists());
      } else {
        setIsAttendant(false);
      }
      setChecking(false);
    };

    if (!loading) {
      checkParkingAttendant();
    }
  }, [user, loading]);

  if (loading || checking) {
    return (
      <div className="fixed inset-0 flex flex-col justify-center items-center bg-white">
        <img className="dark:hidden text-center mb-3" src="/images/logo/parky-logo-b.png" alt="Logo" height={300} width={300} />
        <img className="hidden dark:block text-center mb-3" src="/images/logo/parky-logo.png" alt="Logo" height={300} width={300} />
        <div className="animate-spin h-10 w-10 border-t-3 border-brand-500 rounded-full mx-auto"></div>
      </div>
    );
  }

  // Jika user login dan terdaftar sebagai parking_attendant → redirect ke dashboard
  if (user && isAttendant) {
    return <Navigate to="/" replace />;
  }

  // Jika belum login atau tidak terdaftar sebagai parking_attendant → boleh akses
  return <>{children}</>;
}

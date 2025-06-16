import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../configuration";
import { EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";
import Alert from "../ui/alert/Alert";
import { doc, getDoc } from "firebase/firestore";

export default function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [showLoginErrorAlert, setShowLoginErrorAlert] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLoginWithEmail = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email?.trim() && !password?.trim()) {
      setShowLoginErrorAlert("Email dan kata sandi tidak boleh kosong!");
      return;
    }

    if (!email?.trim()) {
      setShowLoginErrorAlert("Email tidak boleh kosong!");
      return;
    }

    if (!password?.trim()) {
      setShowLoginErrorAlert("Kata sandi tidak boleh kosong!");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setShowLoginErrorAlert("Email tidak valid. Contoh: johndoe@gmail.com.");
      return;
    }

    if (password.length < 6) {
      setShowLoginErrorAlert("Password minimal 6 karakter!");
      return;
    }

    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;

      // Ambil data admin dari Firestore
      const userDoc = await getDoc(doc(db, "admins", uid));

      if (!userDoc.exists()) {
        await auth.signOut();
        setShowLoginErrorAlert("Akun tidak terdaftar sebagai admin!");
        return;
      }

      const adminData = userDoc.data();

      // Cek apakah admin sudah dihapus (soft delete)
      if (adminData.deleted_at !== null && adminData.deleted_at !== undefined) {
        await auth.signOut();
        setShowLoginErrorAlert("Login gagal. Email atau kata sandi salah!");
        return;
      }

      setShowLoginErrorAlert("");
      navigate("/");
    } catch (err: unknown) {
      setShowLoginErrorAlert("Login gagal. Email atau kata sandi salah!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-5">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">Masuk</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Masukkan email and password anda untuk masuk!</p>
            {showLoginErrorAlert !== "" ? (
              <div className="my-5">
                <Alert variant="error" title="Gagal Masuk" message={showLoginErrorAlert} />
              </div>
            ) : (
              <></>
            )}
          </div>
        </div>

        <form onSubmit={handleLoginWithEmail}>
          <div className="space-y-6">
            <div>
              <Label>
                Email <span className="text-error-500">*</span>
              </Label>
              <Input placeholder="contoh@gmail.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <Label>
                Password <span className="text-error-500">*</span>
              </Label>
              <div className="relative">
                <Input type={showPassword ? "text" : "password"} placeholder="Masukkan password Anda" value={password} onChange={(e) => setPassword(e.target.value)} />
                <span onClick={() => setShowPassword(!showPassword)} className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2">
                  {showPassword ? <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" /> : <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />}
                </span>
              </div>
            </div>
            <div>
              <Button className="w-full" size="md" disabled={loading}>
                {loading ? "Loading..." : "Masuk"}
              </Button>
            </div>
          </div>
        </form>

        {/* <div className="mt-5">
              <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
                Don&apos;t have an account? {""}
                <Link
                  to="/signup"
                  className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
                >
                  Sign Up
                </Link>
              </p>
            </div> */}
      </div>
    </div>
  );
}

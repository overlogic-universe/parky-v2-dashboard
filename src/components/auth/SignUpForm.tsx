import { useState } from "react";
import { useNavigate } from "react-router";
import { EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Alert from "../ui/alert/Alert";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../configuration";
import { doc, setDoc } from "firebase/firestore";

export default function SignUpForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showLoginErrorAlert, setShowLoginErrorAlert] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowLoginErrorAlert("");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (name.trim() === "") {
      setShowLoginErrorAlert("Nama tidak boleh kosong!");
      return;
    }

    if (!emailRegex.test(email)) {
      setShowLoginErrorAlert("Nama tidak boleh kosong!. Contoh: johndoe@gmail.com.");
      return;
    }

    if (password.length < 8) {
      setShowLoginErrorAlert("Password minimal 8 karakter!");
      return;
    }

    try {
      setLoading(true);

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Simpan data tambahan ke Firestore
      await setDoc(doc(db, "admins", user.uid), {
        id: user.uid,
        name,
        email,
        createdAt: new Date(),
      });

      navigate("/");
    } catch (error: any) {
      setShowLoginErrorAlert("Gagal membuat akun");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 w-full overflow-y-auto no-scrollbar">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-3 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">Daftarkan Admin!</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Daftarkan admin baru!</p>

            {showLoginErrorAlert && (
              <div className="my-5">
                <Alert variant="error" title="Gagal Membuat Akun" message={showLoginErrorAlert} />
              </div>
            )}

            <form className="pt-5" onSubmit={handleSubmit}>
              <div className="space-y-5">
                <div>
                  <Label>
                    Nama<span className="text-error-500">*</span>
                  </Label>
                  <Input type="text" id="fname" name="fname" placeholder="Masukkan nama" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div>
                  <Label>
                    Email<span className="text-error-500">*</span>
                  </Label>
                  <Input type="email" id="email" name="email" placeholder="Masukkan email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div>
                  <Label>
                    Password<span className="text-error-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input placeholder="Masukkan password" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} />
                    <span onClick={() => setShowPassword(!showPassword)} className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2">
                      {showPassword ? <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" /> : <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />}
                    </span>
                  </div>
                </div>
                <div>
                  <button type="submit" disabled={loading} className="flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-white transition rounded-lg bg-brand-500 shadow-theme-xs hover:bg-brand-600">
                    {loading ? "Mendaftarkan..." : "Daftar"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

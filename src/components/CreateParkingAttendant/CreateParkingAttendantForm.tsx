import { useState } from "react";
import { useNavigate } from "react-router";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Alert from "../ui/alert/Alert";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../configuration";
import { doc, setDoc } from "firebase/firestore";
import { generateRandomPassword } from "../../utils/GetRandomPassword";
import GeneratedPasswordInformation from "../common/GeneratedPasswordInformation";

export default function CreateParkingAttendantForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
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
      setShowLoginErrorAlert("Email tidak valid. Contoh: johndoe@gmail.com.");
      return;
    }

    try {
      setLoading(true);

      // 🔐 Auto generate password
      const generatedPassword = generateRandomPassword(); // ambil 12 karakter biar nggak kepanjangan

      // Kirim email ke petugas
      const response = await fetch("http://localhost:5000/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password: generatedPassword,
          role: "petugas",
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Gagal mengirim email:", errorText);
        throw new Error("Gagal mengirim email notifikasi");
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, generatedPassword);
      const user = userCredential.user;

      // Simpan data tambahan ke Firestore
      await setDoc(doc(db, "parking_attendants", user.uid), {
        id: user.uid,
        name,
        email,
        created_at: new Date(),
        updated_at: null,
      });

      navigate("/");
    } catch (error: any) {
      console.error(error);

      let errorMessage = "Terjadi kesalahan saat membuat akun.";

      switch (error.code) {
        case "auth/email-already-in-use":
          errorMessage = "Email sudah terdaftar. Silakan gunakan email lain.";
          break;
        case "auth/invalid-email":
          errorMessage = "Format email tidak valid.";
          break;
        case "auth/weak-password":
          errorMessage = "Password terlalu lemah.";
          break;
        case "auth/operation-not-allowed":
          errorMessage = "Pembuatan akun dengan email dan password tidak diizinkan.";
          break;
        case "Gagal mengirim email notifikasi":
          errorMessage = "Gagal mengirim email notifikasi.";
          break;
        default:
          errorMessage = "Gagal membuat akun. Silakan coba lagi.";
          break;
      }

      setShowLoginErrorAlert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 w-full overflow-y-auto no-scrollbar">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-3 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">Daftarkan Petugas!</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Daftarkan petugas baru!</p>
            <GeneratedPasswordInformation />
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
                {showLoginErrorAlert && (
                  <div className="my-5">
                    <Alert variant="error" title="Gagal Membuat Akun" message={showLoginErrorAlert} />
                  </div>
                )}
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

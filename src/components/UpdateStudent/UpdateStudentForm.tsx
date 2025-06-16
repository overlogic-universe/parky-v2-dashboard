import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Alert from "../ui/alert/Alert";
import { db } from "../../configuration";
import {
  doc,
  getDoc,
  getDocs,
  updateDoc,
  collection,
  query,
  where,
} from "firebase/firestore";
import { UpdateStudentFormProps } from "../../pages/UpdateStudentPage/UpdateStudentPage";
import { Vehicle, Student } from "../../interface/interface";


export function UpdateStudentForm({ id }: UpdateStudentFormProps) {
  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState<Student | null>(null);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [name, setName] = useState("");
  const [nim, setNim] = useState("");
  const [plate, setPlate] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const studentDoc = await getDoc(doc(db, "students", id));
        if (!studentDoc.exists()) {
          throw new Error("Data mahasiswa tidak ditemukan.");
        }

        const studentData = studentDoc.data() as Student;
        setStudent(studentData);
        setName(studentData.name);
        setNim(studentData.nim);

        const vehiclesQuery = query(
          collection(db, "vehicles"),
          where("student_id", "==", id),
          where("deleted_at", "==", null)
        );
        const vehicleSnap = await getDocs(vehiclesQuery);

        if (!vehicleSnap.empty) {
          const vehicleData = vehicleSnap.docs[0].data() as Vehicle;
          setVehicle(vehicleData);
          setPlate(vehicleData.plate);
        }

        setLoading(false);
      } catch (err: any) {
        console.error(err);
        setError("Gagal memuat data mahasiswa.");
        setLoading(false);
      }
    };

    fetchStudentData();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!student) return;

    try {
      setLoading(true);
      await updateDoc(doc(db, "students", id), {
        name,
        nim,
        updated_at: new Date(),
      });

      if (vehicle) {
        await updateDoc(doc(db, "vehicles", vehicle.id), {
          plate,
          updated_at: new Date(),
        });
      }

      navigate("/student-table");
    } catch (err: any) {
      console.error(err);
      setError("Gagal memperbarui data.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p>Memuat...</p>;
  if (!student) return <p>Mahasiswa tidak ditemukan.</p>;

  return (
    <div className="flex flex-col flex-1 w-full overflow-y-auto no-scrollbar">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-3 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Ubah Data Mahasiswa
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Perbarui nama, NIM, atau plat kendaraan mahasiswa.
            </p>

            <form className="pt-5" onSubmit={handleSubmit}>
              <div className="space-y-5">
                <div>
                  <Label>Nama Lengkap</Label>
                  <Input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div>
                  <Label>NIM</Label>
                  <Input
                    type="text"
                    value={nim}
                    onChange={(e) => setNim(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input type="email" value={student.email} disabled />
                </div>
                <div>
                  <Label>QR Code ID</Label>
                  <Input type="text" value={student.qr_code_id} disabled />
                </div>
                <div>
                  <Label>Plat Kendaraan</Label>
                  <Input
                    type="text"
                    value={plate}
                    onChange={(e) => setPlate(e.target.value)}
                  />
                </div>

                {error && (
                  <div className="my-5">
                    <Alert
                      variant="error"
                      title="Terjadi Kesalahan"
                      message={error}
                    />
                  </div>
                )}

                <div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-white transition rounded-lg bg-brand-500 shadow-theme-xs hover:bg-brand-600"
                  >
                    {loading ? "Menyimpan..." : "Simpan Perubahan"}
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

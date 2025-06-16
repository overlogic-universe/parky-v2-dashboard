import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Alert from "../ui/alert/Alert";
import { db } from "../../configuration";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { ParkingAttendant } from "../../interface/interface";
import { UpdateParkingAttendantFormProps } from "../../pages/UpdateParkingAttendantPage/UpdateParkingAttendantPage";

export function UpdateParkingAttendantForm({ id }: UpdateParkingAttendantFormProps) {
  const [loading, setLoading] = useState(true);
  const [parkingAttendant, setParkingAttendant] = useState<ParkingAttendant | null>(null);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchParkingAttendantData = async () => {
      try {
        const parkingAttendantDoc = await getDoc(doc(db, "parking_attendants", id));
        if (!parkingAttendantDoc.exists()) {
          throw new Error("Data petugas parkir tidak ditemukan.");
        }

        const parkingAttendantData = parkingAttendantDoc.data() as ParkingAttendant;
        setParkingAttendant(parkingAttendantData);
        setName(parkingAttendantData.name);

        setLoading(false);
      } catch (err: any) {
        console.error(err);
        setError("Gagal memuat data petugas parkir.");
        setLoading(false);
      }
    };

    fetchParkingAttendantData();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!parkingAttendant) return;

    try {
      setLoading(true);
      await updateDoc(doc(db, "parking_attendants", id), {
        name,
        updated_at: new Date(),
      });

      navigate("/parking-attendant-table");
    } catch (err: any) {
      console.error(err);
      setError("Gagal memperbarui data.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p>Memuat...</p>;
  if (!parkingAttendant) return <p>Petugas parkir tidak ditemukan.</p>;

  return (
    <div className="flex flex-col flex-1 w-full overflow-y-auto no-scrollbar">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-3 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">Ubah Data Petugas Parkir</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Perbarui nama atau plat kendaraan petugas parkir.</p>

            <form className="pt-5" onSubmit={handleSubmit}>
              <div className="space-y-5">
                <div>
                  <Label>Nama Lengkap</Label>
                  <Input type="text" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input type="email" value={parkingAttendant.email} disabled />
                </div>

                {error && (
                  <div className="my-5">
                    <Alert variant="error" title="Terjadi Kesalahan" message={error} />
                  </div>
                )}

                <div>
                  <button type="submit" disabled={loading} className="flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-white transition rounded-lg bg-brand-500 shadow-theme-xs hover:bg-brand-600">
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

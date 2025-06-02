import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import { LeafletMouseEvent } from "leaflet";
import DatePicker from "react-datepicker";
import { db } from "../../configuration";
import { doc, setDoc, collection, getDocs, serverTimestamp, getDoc } from "firebase/firestore";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import "leaflet/dist/leaflet.css";
import { format, toZonedTime } from "date-fns-tz";
import { useNavigate } from "react-router";
import { AttendantDropdown } from "./AttendantDropdown";
import { FirestoreTimestamp, ParkingAttendant, ParkingSchedule } from "../../interface/interface";
import Alert from "../ui/alert/Alert";

const daysOfWeek = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
const dayLabels: Record<string, string> = {
  monday: "Senin",
  tuesday: "Selasa",
  wednesday: "Rabu",
  thursday: "Kamis",
  friday: "Jumat",
  saturday: "Sabtu",
  sunday: "Minggu",
};

export default function CreateParkingLotForm() {
  const [name, setName] = useState("");
  const [maxCapacity, setMaxCapacity] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [inactiveDescription, setInactiveDescription] = useState("");
  const [schedules, setSchedules] = useState<Partial<Record<string, ParkingSchedule>>>({});
  const [attendants, setAttendants] = useState<ParkingAttendant[]>([]);
  const [assignments, setAssignments] = useState<Partial<Record<string, string>>>({});
  const [parkingAssignments, setParkingAssignments] = useState<any[]>([]);
  const [showLoginErrorAlert, setShowLoginErrorAlert] = useState<string | null>(null);

  useEffect(() => {
    const fetchParkingAssignments = async () => {
      const snapshot = await getDocs(collection(db, "parking_assignments"));
      const assignmentsData = await Promise.all(
        snapshot.docs.map(async (docSnap) => {
          const data = docSnap.data();
          const scheduleRef = doc(db, "parking_schedules", data.parking_schedule_id);
          const scheduleSnap = await getDoc(scheduleRef);
          const scheduleData = scheduleSnap.exists() ? scheduleSnap.data() : null;

          return {
            ...data,
            day_of_week: scheduleData?.day_of_week || null,
          };
        })
      );
      setParkingAssignments(assignmentsData);
    };
    fetchParkingAssignments();
  }, []);

  useEffect(() => {
    const fetchAttendants = async () => {
      const snapshot = await getDocs(collection(db, "parking_attendants"));
      const data: ParkingAttendant[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as ParkingAttendant[];
      setAttendants(data);
    };

    fetchAttendants();
  }, []);

  const [location, setLocation] = useState({
    lat: -7.5527367,
    lng: 110.7644429,
  });
  const [loading, setLoading] = useState(false);
  const jakartaTimezone = "Asia/Jakarta";

  const navigate = useNavigate();

  function LocationSelector() {
    useMapEvents({
      click(e: LeafletMouseEvent) {
        setLocation({ lat: e.latlng.lat, lng: e.latlng.lng });
      },
    });
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowLoginErrorAlert(null); // Reset error
    setLoading(true);

    // Validasi utama
    if (!name.trim()) {
      setShowLoginErrorAlert("Nama tempat parkir wajib diisi.");
      setLoading(false);
      return;
    }

    if (!maxCapacity.trim() || isNaN(Number(maxCapacity)) || Number(maxCapacity) <= 0) {
      setShowLoginErrorAlert("Maksimal kapasitas harus berupa angka lebih dari 0.");
      setLoading(false);
      return;
    }

    if (!isActive && !inactiveDescription.trim()) {
      setShowLoginErrorAlert("Deskripsi tidak aktif wajib diisi jika tempat parkir tidak aktif.");
      setLoading(false);
      return;
    }

    // Validasi jadwal dan petugas
    for (const day of daysOfWeek) {
      const schedule = schedules[day];

      if (!schedule || (!schedule.is_closed && (!schedule.open_time || !schedule.closed_time))) {
        setShowLoginErrorAlert(`Jadwal hari ${dayLabels[day]} belum lengkap. Pastikan jam buka dan tutup diisi jika tidak ditutup.`);
        setLoading(false);
        return;
      }

      if (!assignments[day]) {
        setShowLoginErrorAlert(`Penjaga parkir untuk hari ${dayLabels[day]} belum dipilih.`);
        setLoading(false);
        return;
      }
    }

    setLoading(true);
    try {
      const now = new Date();

      const parkingLotId = uuidv4();
      console.log("Raw maxCapacity:", maxCapacity);
      console.log("Parsed maxCapacity:", parseInt(maxCapacity, 10));

      const parkingLotData = {
        id: parkingLotId,
        name,
        max_capacity: parseInt(maxCapacity, 10),
        latitude: location.lat,
        longitude: location.lng,
        is_active: isActive,
        inactive_description: isActive ? null : inactiveDescription,
        created_at: now,
        updated_at: now,
      };

      await setDoc(doc(db, "parking_lots", parkingLotId), parkingLotData);

      for (const day of Object.keys(schedules)) {
        const schedule = schedules[day]!;
        const scheduleId = uuidv4();
        const attendantId = assignments[day];

        await setDoc(doc(db, "parking_schedules", scheduleId), {
          id: scheduleId,
          day_of_week: day,
          open_time: schedule.open_time ? format(schedule.open_time, "HH:mm") : null,
          closed_time: schedule.closed_time ? format(schedule.closed_time, "HH:mm") : null,
          is_closed: schedule.is_closed,
          created_at: now,
          updated_at: now,
        });
        if (attendantId) {
          const parkingAssignmentsId = uuidv4();

          await setDoc(doc(db, "parking_assignments", parkingAssignmentsId), {
            id: parkingAssignmentsId,
            parking_lot_id: parkingLotId,
            parking_schedule_id: scheduleId,
            parking_attendant_id: attendantId,
            created_at: now,
            updated_at: now,
          });
        }
      }

      setLoading(false);
      navigate("/");
      alert("Tempat parkir berhasil ditambahkan!");
    } catch (e) {
      setLoading(false);
      alert(`Gagal Menambahkan Data ${e}`);
    }
  };

  const getAvailableAttendantsForDay = (day: string): ParkingAttendant[] => {
    const busyAttendantIds = parkingAssignments.filter((assignment) => assignment.day_of_week === day).map((assignment) => assignment.parking_attendant_id);

    return attendants.filter((attendant) => !busyAttendantIds.includes(attendant.id));
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl mx-auto p-6 shadow-xl rounded-2xl space-y-8 border border-gray-300 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-400">Tambah Tempat Parkir</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="name">
            Nama Tempat Parkir<span className="text-error-500">*</span>
          </Label>
          <Input id="name" placeholder="Masukkan nama tempat parkir" value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        <div>
          <Label htmlFor="capacity">
            Maksimal Kapasitas<span className="text-error-500">*</span>
          </Label>
          <Input id="capacity" placeholder="Masukkan maksimal kapasitas" type="number" value={maxCapacity} onChange={(e) => setMaxCapacity(e.target.value)} />
        </div>
      </div>

      <div>
        <Label className="text-xl font-semibold text-gray-800 mb-4">Jadwal Operasional</Label>
        <div className="space-y-4">
          {daysOfWeek.map((day) => (
            <div key={day} className=" p-5 rounded-xl shadow-sm space-y-4 border border-gray-300 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
              <h3 className="font-semibold capitalize text-lg text-gray-800 dark:text-gray-400">{dayLabels[day]}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-center">
                {/* Jam Buka */}
                <DatePicker
                  selected={schedules[day]?.open_time ? toZonedTime(schedules[day]?.open_time, jakartaTimezone) : null}
                  onChange={(date) =>
                    setSchedules((prev) => {
                      const current: ParkingSchedule = prev[day] ?? {
                        id: day,
                        day_of_week: day,
                        is_closed: false,
                        open_time: "",
                        closed_time: "",
                        created_at: serverTimestamp() as unknown as FirestoreTimestamp,
                        updated_at: serverTimestamp() as unknown as FirestoreTimestamp,
                      };

                      return {
                        ...prev,
                        [day]: {
                          ...current,
                          open_time: date ? date.toISOString() : "",
                        },
                      };
                    })
                  }
                  showTimeSelect
                  showTimeSelectOnly
                  timeIntervals={15}
                  timeCaption="Jam Buka"
                  dateFormat="HH:mm"
                  timeFormat="HH:mm"
                  placeholderText="Jam Buka"
                  calendarClassName="react-datepicker"
                  popperClassName="react-datepicker-popper"
                  className="w-full rounded-lg dark:text-white px-4 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500 border border-gray-300 bg-white dark:border-white/[0.05] dark:bg-white/[0.05]"
                />

                {/* Jam Tutup */}
                <DatePicker
                  selected={schedules[day]?.closed_time ? toZonedTime(schedules[day]?.closed_time, jakartaTimezone) : null}
                  onChange={(date) =>
                    setSchedules((prev) => {
                      const current: ParkingSchedule = prev[day] ?? {
                        id: day,
                        day_of_week: day,
                        is_closed: false,
                        open_time: "",
                        closed_time: "",
                        created_at: serverTimestamp() as unknown as FirestoreTimestamp,
                        updated_at: serverTimestamp() as unknown as FirestoreTimestamp,
                      };

                      return {
                        ...prev,
                        [day]: {
                          ...current,
                          closed_time: date ? date.toISOString() : "",
                        },
                      };
                    })
                  }
                  showTimeSelect
                  showTimeSelectOnly
                  timeIntervals={15}
                  timeCaption="Jam Tutup"
                  dateFormat="HH:mm"
                  timeFormat="HH:mm"
                  placeholderText="Jam Tutup"
                  calendarClassName="react-datepicker"
                  popperClassName="react-datepicker-popper"
                  className="w-full rounded-lg dark:text-white px-4 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500 border border-gray-300 bg-white dark:border-white/[0.05] dark:bg-white/[0.05]"
                />

                {/* Toggle Buka */}
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-800 dark:text-gray-400">Buka</span>
                  <Label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={schedules[day]?.is_closed || false}
                      onChange={(e) =>
                        setSchedules((prev) => {
                          const current: ParkingSchedule = prev[day] ?? {
                            id: day,
                            day_of_week: day,
                            is_closed: true,
                            open_time: "",
                            closed_time: "",
                            created_at: serverTimestamp() as unknown as FirestoreTimestamp,
                            updated_at: serverTimestamp() as unknown as FirestoreTimestamp,
                          };

                          return { ...prev, [day]: { ...current, is_closed: e.target.checked } };
                        })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-green-400 transition-all duration-300"></div>
                    <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full peer-checked:translate-x-full transition-transform duration-300"></div>
                  </Label>
                </div>
              </div>
              <div>
                <Label className="font-semibold capitalize text-sm text-gray-800">Petugas Parkir</Label>
                <div className="col-span-full">
                  {getAvailableAttendantsForDay(day).length > 0 ? (
                    <AttendantDropdown
                      selectedId={assignments[day]}
                      onSelect={(id) =>
                        setAssignments((prev) => ({
                          ...prev,
                          [day]: id,
                        }))
                      }
                      attendants={getAvailableAttendantsForDay(day)}
                    />
                  ) : (
                    <p className="text-sm text-gray-500 italic">Tidak ada petugas tersedia untuk hari ini</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <label className="inline-flex items-center cursor-pointer">
          <span className="mr-2 text-sm text-gray-700 dark:text-gray-400">Tempat Parkir Aktif?</span>
          <div className="relative">
            <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="sr-only peer" />
            <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-indigo-600 transition-colors"></div>
            <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full peer-checked:translate-x-full transition-transform"></div>
          </div>
        </label>
      </div>

      {!isActive && (
        <div>
          <Label htmlFor="inactiveDesc">Deskripsi Jika Tidak Aktif</Label>
          <Input id="inactiveDesc" value={inactiveDescription} onChange={(e) => setInactiveDescription(e.target.value)} className="mt-1 w-full rounded-lg border-gray-300 shadow-sm focus:ring-brand-500 focus:border-brand-500" />
        </div>
      )}

      <div>
        <Label>Pilih Lokasi (klik pada peta)</Label>
        <MapContainer center={[location.lat, location.lng]} zoom={16} style={{ height: "300px" }} className="rounded-lg overflow-hidden z-0">
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <Marker position={[location.lat, location.lng]} />
          <LocationSelector />
        </MapContainer>
      </div>
      {showLoginErrorAlert && (
        <div className="my-5">
          <Alert variant="error" title="Gagal Menambahkan Tempat Parkir" message={showLoginErrorAlert} />
        </div>
      )}
      <button type="submit" disabled={loading} className="flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-white transition rounded-lg bg-brand-500 shadow-theme-xs hover:bg-brand-600">
        {loading ? "Mendaftarkan..." : "Daftar"}
      </button>
    </form>
  );
}

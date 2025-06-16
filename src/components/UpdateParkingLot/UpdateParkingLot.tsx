// ... imports (tetap sama)
import { collection, doc, getDoc, getDocs, query, serverTimestamp, updateDoc, where } from "firebase/firestore";
import { useNavigate } from "react-router";
import DatePicker from "react-datepicker";
import { toZonedTime } from "date-fns-tz";
import "react-datepicker/dist/react-datepicker.css";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import { useState, useEffect } from "react";
import { db } from "../../configuration";
import { ParkingAssignment, ParkingSchedule, ParkingAttendant, ParkingLot, FirestoreTimestamp, dayLabels, daysOfWeek } from "../../interface/interface";
import { UpdateParkingLotFormProps } from "../../pages/UpdateParkingLotPage/UpdateParkingLotPage";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import Alert from "../ui/alert/Alert";
import { LeafletMouseEvent } from "leaflet";
import { AttendantDropdown } from "../CreateParkingLot/AttendantDropdown";

// ...imports tetap sama

export default function UpdateParkingLotForm({ parkingLotId }: UpdateParkingLotFormProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [maxCapacity, setMaxCapacity] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [inactiveDescription, setInactiveDescription] = useState("");
  const [location, setLocation] = useState({ lat: 0, lng: 0 });

  const [assignments, setAssignments] = useState<Partial<Record<string, string>>>({});
  const [schedules, setSchedules] = useState<Partial<Record<string, ParkingSchedule>>>({});
  const [attendants, setAttendants] = useState<ParkingAttendant[]>([]);
  const [parkingAssignments, setParkingAssignments] = useState<any[]>([]);
  const [showUpdateErrorAlert, _] = useState<string | null>(null);

  const navigate = useNavigate();
  const jakartaTimezone = "Asia/Jakarta";

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
            deleted_at: data.deleted_at || null, // <- tambahkan ini agar bisa difilter nanti
          };
        })
      );
      setParkingAssignments(assignmentsData);
    };

    fetchParkingAssignments();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const lotSnap = await getDoc(doc(db, "parking_lots", parkingLotId));
        if (!lotSnap.exists()) throw new Error("Data tempat parkir tidak ditemukan.");

        const lot = lotSnap.data() as ParkingLot;
        setName(lot.name);
        setMaxCapacity(String(lot.max_capacity));
        setIsActive(lot.is_active);
        setInactiveDescription(lot.inactive_description || "");
        setLocation({ lat: lot.latitude, lng: lot.longitude });

        const assignmentSnap = await getDocs(query(collection(db, "parking_assignments"), where("parking_lot_id", "==", parkingLotId), where("deleted_at", "==", null)));

        const assignmentData = assignmentSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as (ParkingAssignment & { id: string })[];

        const assignmentMap: Record<string, string> = {};
        for (const assignment of assignmentData) {
          const scheduleSnap = await getDoc(doc(db, "parking_schedules", assignment.parking_schedule_id));
          if (scheduleSnap.exists()) {
            const schedule = scheduleSnap.data() as ParkingSchedule;
            if (!schedule.deleted_at) {
              assignmentMap[schedule.day_of_week] = assignment.parking_attendant_id;
            }
          }
        }
        setAssignments(assignmentMap);

        const scheduleDocs = await Promise.all(assignmentData.map((a) => getDoc(doc(db, "parking_schedules", a.parking_schedule_id))));

        const scheduleData = scheduleDocs
          .filter((doc) => doc.exists() && doc.data().deleted_at)
          .reduce((acc, doc) => {
            acc[doc.id] = doc.data() as ParkingSchedule;
            return acc;
          }, {} as Record<string, ParkingSchedule>);

        setSchedules(scheduleData); // ✅ Now matches expected type

        const attendantsSnap = await getDocs(query(collection(db, "parking_attendants"), where("deleted_at", "==", null)));
        setAttendants(attendantsSnap.docs.map((doc) => doc.data() as ParkingAttendant));
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [parkingLotId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateDoc(doc(db, "parking_lots", parkingLotId), {
        name,
        max_capacity: Number(maxCapacity),
        is_active: isActive,
        inactive_description: isActive ? null : inactiveDescription,
        latitude: location.lat,
        longitude: location.lng,
        updated_at: new Date(),
      });

      // 1. Simpan ParkingSchedule & ParkingAssignment untuk setiap hari
      for (const day of daysOfWeek) {
        let schedule = schedules[day];
        const attendantId = assignments[day];

        if (!schedule) continue;

        // Auto-set is_closed = true if open_time or closed_time is missing
        const isTimeIncomplete = !schedule.open_time || !schedule.closed_time;
        schedule = {
          ...schedule,
          is_closed: isTimeIncomplete ? true : schedule.is_closed,
        };

        const q = query(collection(db, "parking_schedules"), where("day_of_week", "==", day), where("deleted_at", "==", null));

        const existing = await getDocs(q);
        let scheduleId = "";

        if (!existing.empty) {
          const docRef = existing.docs[0].ref;
          await updateDoc(docRef, {
            open_time: schedule.open_time,
            closed_time: schedule.closed_time,
            is_closed: schedule.is_closed,
            updated_at: new Date(),
          });
          scheduleId = docRef.id;
        } else {
          const newSchedule = doc(collection(db, "parking_schedules"));
          await updateDoc(newSchedule, {
            id: newSchedule.id,
            day_of_week: day,
            open_time: schedule.open_time,
            closed_time: schedule.closed_time,
            is_closed: schedule.is_closed,
            created_at: new Date(),
            updated_at: new Date(),
            deleted_at: null,
          });
          scheduleId = newSchedule.id;
        }

        const assignSnap = await getDocs(query(collection(db, "parking_assignments"), where("parking_lot_id", "==", parkingLotId), where("parking_schedule_id", "==", scheduleId), where("deleted_at", "==", null)));

        if (!attendantId) {
          for (const docSnap of assignSnap.docs) {
            await updateDoc(docSnap.ref, {
              deleted_at: new Date(),
            });
          }
        } else if (!assignSnap.empty) {
          const ref = assignSnap.docs[0].ref;
          await updateDoc(ref, {
            parking_attendant_id: attendantId,
            updated_at: new Date(),
          });
        } else {
          const newAssignmentRef = doc(collection(db, "parking_assignments"));
          await updateDoc(newAssignmentRef, {
            id: newAssignmentRef.id,
            parking_lot_id: parkingLotId,
            parking_schedule_id: scheduleId,
            parking_attendant_id: attendantId,
            created_at: new Date(),
            updated_at: new Date(),
            deleted_at: null,
          });
        }
      }

      alert("Data berhasil diperbarui!");
      navigate("/parking-lot-table");
    } catch (err) {
      alert("Gagal memperbarui data.");
      console.error(err);
    }
  };

  function LocationSelector() {
    useMapEvents({
      click(e: LeafletMouseEvent) {
        setLocation({ lat: e.latlng.lat, lng: e.latlng.lng });
      },
    });
    return null;
  }

  const getAvailableAttendantsForDay = (day: string): ParkingAttendant[] => {
    const busyAttendantIds = parkingAssignments.filter((assignment) => assignment.day_of_week === day && assignment.deleted_at == null).map((assignment) => assignment.parking_attendant_id);

    return attendants.filter((attendant) => !busyAttendantIds.includes(attendant.id));
  };

  if (loading) return <p>Memuat data...</p>;
  if (error) return <Alert variant="error" title="Error" message={error} />;

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
                        deleted_at: null,
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
                        deleted_at: null,
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

                {/* Toggle Tutup */}
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-800 dark:text-gray-400">Tutup</span>
                  <Label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={schedules[day]?.is_closed || false}
                      onChange={(e) =>
                        setSchedules((prev) => {
                          const current: ParkingSchedule = prev[day] ?? {
                            id: day,
                            day_of_week: day,
                            is_closed: false,
                            open_time: "",
                            closed_time: "",
                            created_at: serverTimestamp() as unknown as FirestoreTimestamp,
                            updated_at: serverTimestamp() as unknown as FirestoreTimestamp,
                            deleted_at: null,
                          };

                          return { ...prev, [day]: { ...current, is_closed: e.target.checked } };
                        })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-red-400 transition-all duration-300"></div>
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
      {showUpdateErrorAlert && (
        <div className="my-5">
          <Alert variant="error" title="Gagal Memperbarui Tempat Parkir" message={showUpdateErrorAlert} />
        </div>
      )}
      <button type="submit" disabled={loading} className="flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-white transition rounded-lg bg-brand-500 shadow-theme-xs hover:bg-brand-600">
        {loading ? "Memperbarui..." : "Perbarui"}
      </button>
    </form>
  );
}

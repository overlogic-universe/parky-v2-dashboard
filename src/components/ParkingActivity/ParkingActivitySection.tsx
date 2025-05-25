"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, Timestamp } from "firebase/firestore";
import { db } from "../../configuration";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tab";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../ui/table";
import { LoadingAnimation } from "../ui/loading/LoadingAnimation";
import { ParkingActivity, ParkingAssignment, ParkingAttendant, ParkingHistory, ParkingLot, ParkingSchedule, Student, Vehicle } from "../../interface/interface";
import SearchInput from "../ui/search";
import InformationBox from "./InformationBox";
import { BoxCubeIcon, UserIcon } from "../../icons";
import { TodayDate } from "../ui/text/TodayDate";

interface ActivityItem {
  studentName: string;
  nim: string;
  vehiclePlate: string;
  parkedAt: string;
  exitedAt: string;
  status: string;
}

interface TabData {
  lotId: string;
  lotName: string;
  vehicleInCount: number;
  maxCapacity: number;
  attendantName: string;
  activities: ActivityItem[];
}

export default function ParkingActivitySection() {
  const [tabData, setTabData] = useState<TabData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Dapatkan hari ini dalam format lowercase (e.g., 'monday')
        const today = new Date();
        const dayOfWeek = today
          .toLocaleDateString("en-US", {
            weekday: "long",
          })
          .toLowerCase();

        // Dapatkan timestamp untuk awal hari ini
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const startTimestamp = Timestamp.fromDate(startOfDay);

        // Ambil semua data yang diperlukan
        const [parkingLotsSnap, parkingSchedulesSnap, parkingAssignmentsSnap, parkingAttendantsSnap, parkingActivitiesSnap, parkingHistoriesSnap, studentsSnap, vehiclesSnap] = await Promise.all([
          getDocs(collection(db, "parking_lots")),
          getDocs(collection(db, "parking_schedules")),
          getDocs(collection(db, "parking_assignments")),
          getDocs(collection(db, "parking_attendants")),
          getDocs(collection(db, "parking_activities")),
          getDocs(collection(db, "parking_histories")),
          getDocs(collection(db, "students")),
          getDocs(collection(db, "vehicles")),
        ]);

        // Konversi snapshot ke array
        const parkingLots: ParkingLot[] = parkingLotsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as ParkingLot));
        const parkingSchedules: ParkingSchedule[] = parkingSchedulesSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as ParkingSchedule));
        const parkingAssignments: ParkingAssignment[] = parkingAssignmentsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as ParkingAssignment));
        const parkingAttendants: ParkingAttendant[] = parkingAttendantsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as ParkingAttendant));
        const parkingActivities: ParkingActivity[] = parkingActivitiesSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as ParkingActivity));
        const parkingHistories: ParkingHistory[] = parkingHistoriesSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as ParkingHistory));
        const students: Student[] = studentsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Student));
        const vehicles: Vehicle[] = vehiclesSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Vehicle));

        // Filter jadwal parkir untuk hari ini yang tidak tutup
        const todaySchedules = parkingSchedules.filter((schedule) => schedule.day_of_week === dayOfWeek && !schedule.is_closed);

        // Ambil ID jadwal parkir untuk hari ini
        const todayScheduleIds = todaySchedules.map((schedule) => schedule.id);

        // Filter penugasan berdasarkan jadwal hari ini
        const todayAssignments = parkingAssignments.filter((assignment) => todayScheduleIds.includes(assignment.parking_schedule_id));

        // Ambil ID tempat parkir yang aktif dan memiliki penugasan hari ini
        const activeLotIds = parkingLots.filter((lot) => lot.is_active).map((lot) => lot.id);

        const assignedLotIds = todayAssignments.map((assignment) => assignment.parking_lot_id).filter((id) => activeLotIds.includes(id));

        // Hapus duplikat ID tempat parkir
        const uniqueLotIds = Array.from(new Set(assignedLotIds));

        // Siapkan data untuk setiap tab
        const tabs: TabData[] = uniqueLotIds.map((lotId) => {
          const lot = parkingLots.find((l) => l.id === lotId);
          const assignment = todayAssignments.find((a) => a.parking_lot_id === lotId);
          const attendant = parkingAttendants.find((att) => att.id === assignment?.parking_attendant_id);

          const activitiesForLot = parkingActivities.filter((activity) => activity.parking_lot_id === lotId && activity.created_at.seconds >= startTimestamp.seconds);

          const latestActivity = activitiesForLot.sort((a, b) => b.updated_at.seconds - a.updated_at.seconds)[0];

          const vehicleInCount = latestActivity?.vehicle_in_count || 0;

          const activities: ActivityItem[] = activitiesForLot.map((activity) => {
            const history = parkingHistories.find((h) => h.id === activity.parking_history_id);
            const student = students.find((s) => s.id === activity.student_id);
            const vehicle = vehicles.find((v) => v.student_id === activity.student_id);

            const parkedAt = history?.parked_at ? new Date(history.parked_at.seconds * 1000).toLocaleTimeString() : "-";
            const exitedAt = history?.exited_at ? new Date(history.exited_at.seconds * 1000).toLocaleTimeString() : "-";
            const status = history?.status || "-";

            return {
              studentName: student?.name || "-",
              nim: student?.nim || "-",
              vehiclePlate: vehicle?.plate || "-",
              parkedAt,
              exitedAt,
              status,
            };
          });

          return {
            lotId,
            lotName: lot?.name || "-",
            vehicleInCount,
            maxCapacity: lot?.max_capacity || 0,
            attendantName: attendant?.name || "-",
            activities,
          };
        });

        setTabData(tabs);
      } catch (error) {
        console.error("Error fetching parking activity data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="w-full">
      <TodayDate/>
      {loading ? (
        <LoadingAnimation />
      ) : (
        <Tabs defaultValue={tabData[0]?.lotId} className="w-full">
          <TabsList className="flex flex-wrap mb-4">
            {tabData.map((tab) => (
              <TabsTrigger key={tab.lotId} value={tab.lotId}>
                {tab.lotName}
              </TabsTrigger>
            ))}
          </TabsList>

          {tabData.map((tab) => {
            const filteredActivities = tab.activities.filter((activity) => activity.studentName.toLowerCase().includes(search.toLowerCase()));

            return (
              <TabsContent key={tab.lotId} value={tab.lotId}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <InformationBox icon={<BoxCubeIcon className="text-gray-800 size-6 dark:text-white/90" />} title="Kapasitas Parkir" value={`${tab.vehicleInCount} / ${tab.maxCapacity}`} />
                  <InformationBox icon={<UserIcon className="text-gray-800 size-6 dark:text-white/90" />} title="Pertugas Parkir" value={tab.attendantName} />
                </div>
                <div className="py-5 overflow-x-scroll sm:overflow-x-hidden rounded-xl border border-gray-300 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
                  <SearchInput placeholder="Cari berdasarkan nama mahasiswa..." value={search} onChange={setSearch} />
                  {filteredActivities.length > 0 ? (
                    <Table>
                      <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                        <TableRow>
                          <TableCell className="ps-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Nama Mahasiswa</TableCell>
                          <TableCell className="ps-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">NIM</TableCell>
                          <TableCell className="ps-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Kendaraan</TableCell>
                          <TableCell className="ps-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Waktu Masuk</TableCell>
                          <TableCell className="ps-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Waktu Keluar</TableCell>
                          <TableCell className="ps-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Status</TableCell>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredActivities.map((activity, index) => (
                          <TableRow key={index} className={`py-5 ${index % 2 !== 1 ? "bg-gray-200 dark:bg-gray-900" : ""} hover:bg-gray-100 dark:hover:bg-gray-800`}>
                            <TableCell className="py-4 text-theme-sm text-gray-800 dark:text-white/90">{activity.studentName}</TableCell>
                            <TableCell className="py-4 text-theme-sm text-gray-800 dark:text-white/90">{activity.nim}</TableCell>
                            <TableCell className="py-4 text-theme-sm text-gray-800 dark:text-white/90">{activity.vehiclePlate}</TableCell>
                            <TableCell className={`py-4 text-theme-sm ${activity.parkedAt == "-" ? "text-gray-800 dark:text-white/90" : "text-green-500 "}`}>{activity.parkedAt}</TableCell>
                            <TableCell className={`py-4 text-theme-sm  ${activity.exitedAt == "-" ? "text-gray-800 dark:text-white/90" : "text-red-400 "}`}>{activity.exitedAt}</TableCell>
                            <TableCell className={`py-4 text-theme-sm font-semibold ${activity.status == "in" ? "text-green-500" : "text-red-400"}`}>{activity.status}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <p className="text-center text-theme-sm text-gray-500 py-4">Tidak ada data</p>
                  )}
                </div>
              </TabsContent>
            );
          })}
        </Tabs>
      )}
    </div>
  );
}

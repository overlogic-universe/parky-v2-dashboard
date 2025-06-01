"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../configuration";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tab";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../ui/table";
import { ParkingActivity, ParkingAssignment, ParkingAttendant, ParkingHistory, ParkingLot, ParkingSchedule, Student, Vehicle } from "../../interface/interface";
import SearchInput from "../ui/search";
import { LoadingAnimation } from "../ui/loading/LoadingAnimation";
import { DAYS, translateDayToIndo } from "../../utils/DayUtil";


interface ActivityItem {
  studentName: string;
  nim: string;
  vehiclePlate: string;
  parkedAt: string;
  exitedAt: string;
  status: string;
  attendantName: string;
  updatedAt: Date | null;
}

interface LotTab {
  lotId: string;
  lotName: string;
  activities: ActivityItem[];
}

type WeeklyData = {
  [day: string]: LotTab[];
};

export default function ParkingActivitySection() {
  const [weeklyData, setWeeklyData] = useState<WeeklyData>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeDay, setActiveDay] = useState(DAYS[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      try {
        const now = new Date();
        now.setHours(0, 0, 0, 0);

        const [lotsSnap, schedulesSnap, assignmentsSnap, attendantsSnap, activitiesSnap, historiesSnap, studentsSnap, vehiclesSnap] = await Promise.all([
          getDocs(collection(db, "parking_lots")),
          getDocs(collection(db, "parking_schedules")),
          getDocs(collection(db, "parking_assignments")),
          getDocs(collection(db, "parking_attendants")),
          getDocs(collection(db, "parking_activities")),
          getDocs(collection(db, "parking_histories")),
          getDocs(collection(db, "students")),
          getDocs(collection(db, "vehicles")),
        ]);

        const parkingLots: ParkingLot[] = lotsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as ParkingLot));
        const parkingSchedules: ParkingSchedule[] = schedulesSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as ParkingSchedule));
        const parkingAssignments: ParkingAssignment[] = assignmentsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as ParkingAssignment));
        const parkingAttendants: ParkingAttendant[] = attendantsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as ParkingAttendant));
        const parkingActivities: ParkingActivity[] = activitiesSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as ParkingActivity));
        const parkingHistories: ParkingHistory[] = historiesSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as ParkingHistory));
        const students: Student[] = studentsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Student));
        const vehicles: Vehicle[] = vehiclesSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Vehicle));

        const weekData: WeeklyData = {};

        for (const day of DAYS) {
          const schedules = parkingSchedules.filter((s) => s.day_of_week === day && !s.is_closed);
          const scheduleIds = schedules.map((s) => s.id);

          const assignments = parkingAssignments.filter((a) => scheduleIds.includes(a.parking_schedule_id));
          const lotIds = Array.from(new Set(assignments.map((a) => a.parking_lot_id)));

          const lotTabs: LotTab[] = lotIds
            .map((lotId) => {
              const lot = parkingLots.find((l) => l.id === lotId);
              const lotAssignments = assignments.filter((a) => a.parking_lot_id === lotId);
              const attendant = parkingAttendants.find((att) => att.id === lotAssignments[0]?.parking_attendant_id);

              const lotActivities = parkingActivities.filter((a) => a.parking_lot_id === lotId);

              const activities: ActivityItem[] = lotActivities
                .map((activity) => {
                  const history = parkingHistories.find((h) => h.id === activity.parking_history_id);
                  const student = students.find((s) => s.id === activity.student_id);
                  const vehicle = vehicles.find((v) => v.student_id === activity.student_id);

                  return {
                    studentName: student?.name || "-",
                    nim: student?.nim || "-",
                    vehiclePlate: vehicle?.plate || "-",
                    parkedAt: history?.parked_at ? new Date(history.parked_at.seconds * 1000).toLocaleTimeString() : "-",
                    exitedAt: history?.exited_at ? new Date(history.exited_at.seconds * 1000).toLocaleTimeString() : "-",
                    status: history?.status || "-",
                    updatedAt: history?.updated_at ? new Date(history.updated_at.seconds * 1000) : null,
                    attendantName: attendant?.name || "-",
                  };
                })
                .sort((a, b) => {
                  if (!a.updatedAt) return 1;
                  if (!b.updatedAt) return -1;
                  return b.updatedAt.getTime() - a.updatedAt.getTime();
                });

              return {
                lotId,
                lotName: lot?.name || "-",
                activities,
              };
            })
            .sort((a, b) => a.lotName.localeCompare(b.lotName));

          weekData[day] = lotTabs;
        }

        setWeeklyData(weekData);
      } catch (error) {
        console.log("ERRORRO : ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const isSameDay = (date: Date, dayName: string) => {
    const dayIndex = DAYS.indexOf(dayName.toLowerCase());
    if (dayIndex === -1) return false;

    const dateDayIndex = date.getDay() === 0 ? 6 : date.getDay() - 1;

    return dateDayIndex === dayIndex;
  };

  return (
    <div className="w-full">
      {loading ? (
        <LoadingAnimation />
      ) : (
        <Tabs defaultValue={activeDay} onValueChange={(val) => setActiveDay(val)}>
          <TabsList className="grid sm:grid-cols-7 grid-cols-3 mb-4">
            {DAYS.map((day) => (
              <TabsTrigger key={day} value={day} className="capitalize">
                {translateDayToIndo(day)}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent key={activeDay} value={activeDay}>
            {weeklyData[activeDay]?.length === 0 ? (
              <div className="text-center text-gray-500 text-theme-sm py-10">Tidak ada tempat parkir yang terjadwal pada hari ini</div>
            ) : (
              <Tabs defaultValue={weeklyData[activeDay]?.[0]?.lotId}>
                <TabsList className="flex flex-wrap mb-4">
                  {(weeklyData[activeDay] || []).map((lot) => (
                    <TabsTrigger key={lot.lotId} value={lot.lotId}>
                      {lot.lotName}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {(weeklyData[activeDay] || []).map((lot) => {
                  const filteredActivities = lot.activities.filter((a) => {
                    return a.updatedAt && isSameDay(a.updatedAt, activeDay) && a.studentName.toLowerCase().includes(search.toLowerCase());
                  });

                  return (
                    <TabsContent key={lot.lotId} value={lot.lotId} className="py-5 overflow-x-scroll sm:overflow-x-hidden rounded-xl border border-gray-300 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
                      <SearchInput placeholder="Cari berdasarkan nama mahasiswa..." value={search} onChange={setSearch} />
                      {filteredActivities.length > 0 ? (
                        <Table>
                          <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                            <TableRow>
                              <TableCell className="ps-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Nama Mahasiswa</TableCell>
                              <TableCell className="ps-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">NIM</TableCell>
                              <TableCell className="ps-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Kendaraan</TableCell>
                              <TableCell className="ps-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Masuk</TableCell>
                              <TableCell className="ps-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Keluar</TableCell>
                              <TableCell className="ps-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Status</TableCell>
                              <TableCell className="ps-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Petugas</TableCell>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredActivities.map((a, index) => (
                              <TableRow key={index} className={`py-5 ${index % 2 !== 1 ? "bg-gray-200 dark:bg-gray-900" : ""} hover:bg-gray-100 dark:hover:bg-gray-800`}>
                                <TableCell className="py-4 text-theme-sm text-gray-800 dark:text-white/90">{a.studentName}</TableCell>
                                <TableCell className="py-4 text-theme-sm text-gray-800 dark:text-white/90">{a.nim}</TableCell>
                                <TableCell className="py-4 text-theme-sm text-gray-800 dark:text-white/90">{a.vehiclePlate}</TableCell>
                                <TableCell className="py-4 text-theme-sm text-green-500"> {a.parkedAt}</TableCell>
                                <TableCell className="py-4 text-theme-sm text-red-400">{a.exitedAt}</TableCell>
                                <TableCell className={`py-4 text-theme-sm ${a.status === "in" ? "text-green-500" : a.status === "out" ? "text-red-400" : "text-gray-500"}`}>{a.status}</TableCell>
                                <TableCell className="py-4 text-theme-sm text-gray-800 dark:text-white/90">{a.attendantName}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      ) : (
                        <p className="text-center text-theme-sm text-gray-500 py-4">Tidak ada aktivitas</p>
                      )}
                    </TabsContent>
                  );
                })}
              </Tabs>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

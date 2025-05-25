import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../configuration";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../ui/table";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";

type ParkingLot = {
  id: string;
  name: string;
  max_capacity: number;
  latitude: number;
  longitude: number;
};

type Schedule = {
  day_of_week: string;
  open_time: string | null;
  closed_time: string | null;
  is_closed: boolean;
  inactive_desc: string | null;
};

type LotWithSchedules = ParkingLot & {
  schedules: Schedule[];
};

export default function ParkingLotTable() {
  const [lots, setLots] = useState<LotWithSchedules[]>([]);
  const [filteredLots, setFilteredLots] = useState<LotWithSchedules[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    async function fetchData() {
      setLoading(true);

      const lotsSnapshot = await getDocs(collection(db, "parking_lots"));
      const scheduleSnapshot = await getDocs(collection(db, "parking_schedules"));
      const linkSnapshot = await getDocs(collection(db, "parking_lots_has_parking_schedules"));

      const scheduleMap = new Map<string, Schedule>();
      scheduleSnapshot.forEach((doc) => {
        const data = doc.data();
        scheduleMap.set(data.id, {
          day_of_week: data.day_of_week,
          open_time: data.open_time,
          closed_time: data.closed_time,
          is_closed: data.is_closed,
          inactive_desc: data.inactive_desc || null,
        });
      });

      const lotSchedulesMap = new Map<string, Schedule[]>();
      linkSnapshot.forEach((doc) => {
        const data = doc.data();
        const lotId = data.parking_lot_id;
        const schedule = scheduleMap.get(data.parking_schedule_id);
        if (schedule) {
          if (!lotSchedulesMap.has(lotId)) {
            lotSchedulesMap.set(lotId, []);
          }
          lotSchedulesMap.get(lotId)!.push(schedule);
        }
      });

      const lotsData: LotWithSchedules[] = lotsSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name,
          max_capacity: data.max_capacity,
          latitude: data.latitude,
          longitude: data.longitude,
          schedules: lotSchedulesMap.get(doc.id) || [],
        };
      });

      setLots(lotsData);
      setFilteredLots(lotsData);
      setLoading(false);
    }

    fetchData();
  }, []);

  useEffect(() => {
    const filtered = lots.filter((lot) => lot.name.toLowerCase().includes(searchTerm.toLowerCase()));
    setFilteredLots(filtered);
  }, [searchTerm, lots]);

  return (
    <div className="py-5 rounded-xl border border-gray-300 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="p-4">
        <Input placeholder="Cari berdasarkan nama tempat parkir..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full max-w-md mb-4" />
      </div>
      {loading ? (
        <div className="text-center text-gray-500">
          <div className="animate-spin h-6 w-6 border-t-2 border-brand-500 rounded-full mx-auto"></div>
        </div>
      ) : filteredLots.length === 0 ? (
        <div className="text-center text-theme-sm text-gray-500 pt-5">Tempat parkir tidak ditemukan</div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell isHeader>Nama</TableCell>
                <TableCell isHeader>Kapasitas Maksimal</TableCell>
                <TableCell isHeader>Lokasi</TableCell>
                <TableCell isHeader>Jadwal</TableCell>
                <TableCell isHeader>Aksi</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {filteredLots.map((lot, index) => (
                <TableRow key={lot.id} className={index % 2 === 0 ? "bg-gray-50 dark:bg-gray-800" : ""}>
                  <TableCell className="py-4">{lot.name}</TableCell>
                  <TableCell className="py-4">{lot.max_capacity}</TableCell>
                  <TableCell className="py-4 space-y-2">
                    <Button variant="outline" size="sm" onClick={() => window.open(`https://www.google.com/maps?q=${lot.latitude},${lot.longitude}`, "_blank")}>
                      Lihat Map
                    </Button>
                  </TableCell>
                  <TableCell className="py-4 text-sm">
                    <div className="space-y-2">
                      {lot.schedules
                        .sort((a, b) => daysOrder[a.day_of_week] - daysOrder[b.day_of_week])
                        .map((schedule, index) => (
                          <div key={index} className="flex items-start">
                            <span className="min-w-[60px] font-medium">{dayLabels[schedule.day_of_week]}:</span>
                            {schedule.is_closed ? (
                              <span className="border border-red-500 text-red-600 px-2 py-1 rounded text-xs">Tutup ({schedule.inactive_desc ?? "-"})</span>
                            ) : (
                              <span className="border border-green-500 text-green-700 px-2 py-1 rounded text-xs">
                                {schedule.open_time} - {schedule.closed_time}
                              </span>
                            )}
                          </div>
                        ))}
                    </div>
                  </TableCell>

                  <TableCell className="py-4 space-x-2">
                    <Button size="sm" variant="primary">
                      Detail
                    </Button>
                    <Button size="sm" variant="outline">
                      Edit
                    </Button>
                    <Button size="sm" className="bg-red-400 hover:bg-red-500">
                      Hapus
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

const dayLabels: Record<string, string> = {
  monday: "Senin",
  tuesday: "Selasa",
  wednesday: "Rabu",
  thursday: "Kamis",
  friday: "Jumat",
  saturday: "Sabtu",
  sunday: "Minggu",
};

const daysOrder: Record<string, number> = {
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
  sunday: 7,
};

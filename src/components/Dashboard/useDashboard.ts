import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import dayjs from "dayjs";
import { db } from "../../configuration";

type SeriesData = {
  name: string;
  data: number[];
};

export const useDashboard = (startDate: dayjs.Dayjs, endDate: dayjs.Dayjs) => {
  const [series, setSeries] = useState<SeriesData[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [totalStudents, setTotalStudents] = useState(0);
  const [totalAttendants, setTotalAttendants] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const studentSnap = await getDocs(query(collection(db, "students")));
        setTotalStudents(studentSnap.size);

        // Fetch total attendants
        const attendantSnap = await getDocs(query(collection(db, "parking_attendants")));
        setTotalAttendants(attendantSnap.size);

        const q = query(collection(db, "parking_activities"), where("created_at", ">=", startDate.toDate()), where("created_at", "<=", endDate.toDate()));
        const snap = await getDocs(q);
        const activities = snap.docs.map((doc) => doc.data());

        // 2. Ambil data parking_lots
        const lotSnap = await getDocs(collection(db, "parking_lots"));
        const lotsMap = new Map<string, string>();
        lotSnap.docs.forEach((doc) => {
          lotsMap.set(doc.id, doc.data().name);
        });

        // 3. Kelompokkan berdasarkan lot dan tanggal
        const grouped: { [lotName: string]: { [date: string]: number } } = {};
        activities.forEach((a: any) => {
          const lotName = lotsMap.get(a.parking_lot_id) ?? "Unknown";
          const date = dayjs(a.created_at.toDate()).format("YYYY-MM-DD");

          if (!grouped[lotName]) grouped[lotName] = {};
          if (!grouped[lotName][date]) grouped[lotName][date] = 0;

          grouped[lotName][date]++;
        });

        // 4. Buat rentang tanggal
        const range: string[] = [];
        let d = startDate.startOf("day");
        while (d.isBefore(endDate) || d.isSame(endDate)) {
          range.push(d.format("YYYY-MM-DD"));
          d = d.add(1, "day");
        }
        setCategories(range);

        // 5. Format series Apex
        const chartSeries: SeriesData[] = Object.keys(grouped).map((lot) => ({
          name: lot,
          data: range.map((date) => grouped[lot][date] || 0),
        }));

        setSeries(chartSeries);
      } catch (error) {
        console.log("RORRRR ,", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [startDate, endDate]);

  return { series, categories, loading, totalStudents, totalAttendants };
};

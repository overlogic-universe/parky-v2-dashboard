import Chart from "react-apexcharts";
import dayjs from "dayjs";
import { useDashboard } from "./useDashboard";
import { ApexOptions } from "apexcharts";
import { useState, useMemo } from "react";
import { LoadingAnimation } from "../ui/loading/LoadingAnimation";
import InformationBox from "../ParkingActivity/InformationBox";
import { UserIcon } from "../../icons";

const rangeOptions = [
  { label: "1 Bulan Terakhir", value: 30 },
  { label: "3 Bulan Terakhir", value: 90 },
  { label: "6 Bulan Terakhir", value: 180 },
  { label: "1 Tahun Terakhir", value: 365 },
];

export const Dashboard = () => {
  const [range, setRange] = useState(30);

  const { start, end } = useMemo(() => {
    const end = dayjs();
    const start = end.subtract(range, "day");
    return { start, end };
  }, [range]);

  const { series, categories, loading, totalAttendants, totalStudents } = useDashboard(start, end);

  const options: ApexOptions = {
    chart: {
      type: "line",
      zoom: { enabled: false },
      toolbar: { show: false },
    },
    xaxis: {
      categories,
      labels: {
        rotate: -45,
        style: {
          fontSize: "10px",
        },
        formatter: (value: string) => {
          return dayjs(value).format("D MMM YYYY");
        },
        showDuplicates: false,
        trim: true,
      },
      tickAmount: range > 180 ? 12 : range > 90 ? 8 : 6, // biar nggak terlalu rapat
      title: { text: "Tanggal" },
    },
    yaxis: {
      title: { text: "Jumlah Aktivitas" },
    },
    legend: {
      position: "top",
    },
  };

  return (
    <section>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <InformationBox icon={<UserIcon className="text-gray-800 size-6 dark:text-white/90" />} title="Jumlah Mahasiswa" value={totalStudents} />
        <InformationBox icon={<UserIcon className="text-gray-800 size-6 dark:text-white/90" />} title="Jumlah Petugas" value={totalAttendants} />
      </div>
      <div className="p-5 rounded-xl border border-gray-300 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="flex justify-between items-center mx-5 mb-4">
          <h2 className="text-xl font-semibold">Aktivitas Parkir per Tempat Parkir</h2>
          <select className="border border-gray-300 dark:bg-gray-800 p-2 rounded-md font-medium text-gray-500 text-start text-theme-sm dark:text-gray-400" value={range} onChange={(e) => setRange(Number(e.target.value))}>
            {rangeOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {loading ? <LoadingAnimation /> : <Chart options={options} series={series} type="line" height={350} />}
      </div>
    </section>
  );
};

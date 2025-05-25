import { useState, useEffect } from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { collection, getDocs, query } from "firebase/firestore";
import { User } from "../tables/StudentTables/StudentTable";
import { db } from "../../configuration";
import { convertToAge } from "../../utils/DateUtil";
import dayjs from "dayjs";
import EcommerceMetrics from "../ecommerce/EcommerceMetrics";

export default function Dashboard() {
  const [patients, setPatients] = useState<User[]>([]);
  const [selectedRange, setSelectedRange] = useState<string>("1_month");
  const [activityData, setActivityData] = useState<{ date: string; count: number }[]>([]);

  useEffect(() => {
    async function fetchPatients() {
      const q = query(collection(db, "users"));
      const snapshot = await getDocs(q);
      const userDocs = snapshot.docs;

      const rawPatients: Patient[] = await Promise.all(
        userDocs.map(async (doc) => {
          const userData = doc.data();
          return {
            id: doc.id,
            name: userData.name,
            birthDate: userData.dateOfBirth,
            gender: userData.gender,
            dmDuration: userData.durationOfDM,
            weight: userData.bodyWeight,
            height: userData.height,
            otherDiseases: userData.historyOfDiseases || "-",
            ethnicity: userData.tribe,
            createdAt: userData.createdAt,
            feedbackId: userData.feedbackId,
            examinationResultId: userData.examinationResultId,
          };
        })
      );

      const uniquePatients = removeDuplicates(rawPatients);
      setPatients(uniquePatients);
    }

    fetchPatients();
  }, []);

  useEffect(() => {
    filterActivityData();
  }, [patients, selectedRange]);

  function removeDuplicates(patients: Patient[]) {
    const seen = new Set();
    const unique: Patient[] = [];

    for (const patient of patients) {
      const key = `${patient.name}_${patient.gender}_${patient.birthDate}`;
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(patient);
      }
    }

    return unique;
  }

  function generateDateRange(start: dayjs.Dayjs, end: dayjs.Dayjs) {
    const range = [];
    let current = end.startOf("day");

    while (current.isAfter(start) || current.isSame(start)) {
      range.push(current.format("YYYY-MM-DD"));
      current = current.subtract(1, "day");
    }

    return range;
  }

  function filterActivityData() {
    const today = dayjs();
    let startDate = today;

    switch (selectedRange) {
      case "1_month":
        startDate = today.subtract(1, "month");
        break;
      case "3_months":
        startDate = today.subtract(3, "month");
        break;
      case "6_months":
        startDate = today.subtract(6, "month");
        break;
      case "1_year":
        startDate = today.subtract(1, "year");
        break;
      case "3_years":
        startDate = today.subtract(3, "year");
        break;
      case "5_years":
        startDate = today.subtract(5, "year");
        break;
      case "10_years":
        startDate = today.subtract(10, "year");
        break;
      default:
        startDate = today.subtract(1, "month");
    }

    const filteredPatients = patients.filter((p) => {
      if (!p.createdAt) return false;
      const createdAtDate = p.createdAt;
      return dayjs(createdAtDate).isAfter(startDate) && dayjs(createdAtDate).isBefore(today.add(1, "day"));
    });

    const dateRange = generateDateRange(startDate, today);

    const dateCountMap: { [key: string]: number } = {};
    dateRange.forEach((date) => {
      dateCountMap[date] = 0;
    });

    filteredPatients.forEach((p) => {
      const date = dayjs(p.createdAt).format("YYYY-MM-DD");
      if (dateCountMap[date] !== undefined) {
        dateCountMap[date]++;
      }
    });

    const activityArray = dateRange.map((date) => ({
      date,
      count: dateCountMap[date],
    }));

    setActivityData(activityArray);
  }

  // For gender chart
  const manTotal = patients.filter((p) => p.gender === "Pria").length;
  const womanTotal = patients.filter((p) => p.gender === "Wanita").length;

  // For age chart
  const ageRanges = {
    "0-18 th": 0,
    "19-35 th": 0,
    "36-50 th": 0,
    "51-65 th": 0,
    "66+ th": 0,
  };

  patients.forEach((p) => {
    const age = convertToAge(p.birthDate);
    if (age <= 18) ageRanges["0-18 th"]++;
    else if (age <= 35) ageRanges["19-35 th"]++;
    else if (age <= 50) ageRanges["36-50 th"]++;
    else if (age <= 65) ageRanges["51-65 th"]++;
    else ageRanges["66+ th"]++;
  });

  // Chart Options
  const activityChartOptions: ApexOptions = {
    chart: {
      type: "line",
      toolbar: { show: false },
      zoom: { enabled: false },
      fontFamily: "Poppins, sans-serif",
    },
    stroke: {
      curve: "smooth",
    },
    colors: ["#5D87FF"],
    xaxis: {
      categories: activityData.map((d) => d.date),
      type: "datetime",
      labels: {
        rotate: -45,
        datetimeFormatter: {
          year: "yyyy",
          month: "MMM yyyy",
          day: "dd MMM",
        },
      },
    },
    yaxis: {
      title: {
        text: "Jumlah Aktivitas",
      },
    },
    tooltip: {
      x: {
        format: "dd MMM yyyy",
      },
    },
  };

  const genderChartOptions: ApexOptions = {
    labels: ["Pria", "Wanita"],
    colors: ["#05df72", "#5D87FF"],
    chart: {
      type: "donut",
      fontFamily: "Poppins, sans-serif",
      foreColor: "#FFFFFF",
    },
    legend: {
      position: "bottom",
    },
    tooltip: {
      theme: "dark",
      style: {
        fontSize: "14px",
        fontFamily: "Poppins, sans-serif",
      },
    },
    dataLabels: {
      enabled: true,
      dropShadow: { opacity: 0 },
      style: {
        fontFamily: "Poppins, sans-serif",
        colors: ["#FFFFFF"],
        fontSize: "16px",
        fontWeight: "bold",
      },
    },
  };

  const ageChartOptions: ApexOptions = {
    chart: {
      type: "bar",
      fontFamily: "Poppins, sans-serif",
      toolbar: { show: false },
    },
    plotOptions: {
      bar: {
        borderRadius: 4,
        horizontal: false,
        columnWidth: "45%",
      },
    },
    colors: ["#05df72"],
    dataLabels: { enabled: false },
    xaxis: {
      categories: Object.keys(ageRanges),
    },
  };

  return (
    <div className="flex flex-col space-y-3">
      <EcommerceMetrics />
      {/* Aktivitas Chart */}
      <div className="py-5 rounded-xl border border-gray-300 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="flex justify-between items-center mx-5 mb-4">
          <h2 className="text-xl text-gray-700 dark:text-gray-300 font-semibold">Aktivitas Pengguna</h2>
          <select className="border border-gray-300 dark:bg-gray-800 p-2 rounded-md font-medium text-gray-500 text-start text-theme-sm dark:text-gray-400" value={selectedRange} onChange={(e) => setSelectedRange(e.target.value)}>
            <option value="1_month">1 Bulan Terakhir</option>
            <option value="3_months">3 Bulan Terakhir</option>
            <option value="6_months">6 Bulan Terakhir</option>
            <option value="1_year">1 Tahun Terakhir</option>
            <option value="3_years">3 Tahun Terakhir</option>
            <option value="5_years">5 Tahun Terakhir</option>
            <option value="10_years">10 Tahun Terakhir</option>
          </select>
        </div>
        <Chart options={activityChartOptions} series={[{ name: "Aktivitas", data: activityData.map((d) => d.count) }]} type="line" height={300} />
      </div>

      {/* Gender Chart */}
      <div className="py-5 rounded-xl border border-gray-300 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <h2 className="text-xl text-gray-700 dark:text-gray-300 font-semibold mx-5 mb-4">Perbandingan Gender</h2>
        <Chart options={genderChartOptions} series={[manTotal, womanTotal]} type="donut" height={300} />
      </div>

      {/* Age Chart */}
      <div className="py-5 rounded-xl border border-gray-300 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <h2 className="text-xl text-gray-700 dark:text-gray-300 font-semibold mx-5 mb-4">Distribusi Usia</h2>
        <Chart options={ageChartOptions} series={[{ name: "Jumlah", data: Object.values(ageRanges) }]} type="bar" height={300} />
      </div>
    </div>
  );
}

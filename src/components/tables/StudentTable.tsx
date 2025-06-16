import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../configuration";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../ui/table";
import Button from "../ui/button/Button";
import DeleteButton from "./DeleteButton";
import { useNavigate } from "react-router";
import { LoadingAnimation } from "../ui/loading/LoadingAnimation";
import SearchInput from "../ui/search";

export interface Student {
  id: string;
  name: string;
  email: string;
  nim: string;
  plate?: string;
}

export default function StudentTable() {
  const [students, setStudents] = useState<Student[]>([]);
  const [search, setSearch] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const studentsQuery = query(collection(db, "students"), where("deleted_at", "==", null));
        const studentsSnapshot = await getDocs(studentsQuery);
        const studentsData = studentsSnapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name,
          email: doc.data().email,
          nim: doc.data().nim,
        }));

        const vehicleSnapshot = await getDocs(collection(db, "vehicles"));
        const vehiclesData = vehicleSnapshot.docs.map((doc) => ({
          student_id: doc.data().student_id,
          plate: doc.data().plate,
        }));

        const merged = studentsData.map((student) => {
          const matchedVehicle = vehiclesData.find((v) => v.student_id === student.id);
          return {
            ...student,
            plate: matchedVehicle?.plate || "-",
          };
        });

        setStudents(merged);
      } catch (error) {
        console.error("Error fetching students and vehicles:", error);
      }
      setLoading(false);
    }

    fetchData();
  }, []);

  const filteredStudents = students.filter((student) => student.name.toLowerCase().includes(search.toLowerCase()));

  const handleEdit = (studentId: string) => {
    navigate(`/update-student/${studentId}`);
  };

  return (
    <div className="py-5 overflow-x-scroll sm:overflow-x-hidden rounded-xl border border-gray-300 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      {/* Search Input */}
      <SearchInput placeholder="Cari berdasarkan nama mahasiswa..." value={search} onChange={(e) => setSearch(e)} />

      {/* Loading */}
      {loading ? (
        <LoadingAnimation />
      ) : filteredStudents.length > 0 ? (
        <Table>
          <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
            <TableRow>
              <TableCell isHeader className="ps-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                Nama
              </TableCell>
              <TableCell isHeader className="ps-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                Email
              </TableCell>
              <TableCell isHeader className="ps-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                NIM
              </TableCell>
              <TableCell isHeader className="ps-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                Plat Nomor
              </TableCell>
              <TableCell isHeader className="ps-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                Action
              </TableCell>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {filteredStudents.map((student, index) => (
              <TableRow key={student.id} className={`py-5 ${index % 2 !== 1 ? "bg-gray-200 dark:bg-gray-900" : ""} hover:bg-gray-100 dark:hover:bg-gray-800`}>
                <TableCell className="py-4 text-gray-800 text-theme-sm dark:text-white/90">{student.name}</TableCell>
                <TableCell className="py-4 text-gray-800 text-theme-sm dark:text-white/90">{student.email}</TableCell>
                <TableCell className="py-4 text-gray-800 text-theme-sm dark:text-white/90">{student.nim}</TableCell>
                <TableCell className="py-4 text-gray-800 text-theme-sm dark:text-white/90">{student.plate}</TableCell>
                <TableCell className="flex gap-2 py-2">
                  <div className="flex justify-center items-center gap-2">
                    {/* <Button size="sm" variant="primary" onClick={() => navigate("/student-detail", { state: { patient: patient } })}> */}
                    <Button size="sm" variant="primary" onClick={() => handleEdit(student.id)}>
                      Edit
                    </Button>

                    <DeleteButton data={student} collectionName="students" />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div className="text-center text-theme-sm text-gray-500 pt-5">Mahasiswa tidak ditemukan</div>
      )}
    </div>
  );
}

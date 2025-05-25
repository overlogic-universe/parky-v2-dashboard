import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../configuration";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../ui/table";
import Button from "../ui/button/Button";
import DeleteButton from "./DeleteButton";
import { useNavigate } from "react-router";
import { LoadingAnimation } from "../ui/loading/LoadingAnimation";
import Input from "../form/input/InputField";
import SearchInput from "../ui/search";

export interface User {
  id: string;
  name: string;
  email: string;
}

export default function ParkingAttendant() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const userSnapshot = await getDocs(collection(db, "parking_attendants"));
        console.log(`USER ${userSnapshot}}`);
        const usersData = userSnapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name,
          email: doc.data().email,
        }));

        setUsers(usersData);
      } catch (error) {
        console.error("Error fetching users and vehicles:", error);
      }
      setLoading(false);
    }

    fetchData();
  }, []);

  const filteredUsers = users.filter((user) => user.name.toLowerCase().includes(search.toLowerCase()));

  const handleDetail = (userId: string) => {
    console.log("Detail user", userId);
    // TODO: navigasi ke halaman detail user
    navigate(`/users/${userId}`);
  };

  const handleAdd = () => {
    console.log("Add user");
    // TODO: navigasi atau buka modal tambah
  };

  const handleEdit = (userId: string) => {
    console.log("Edit user", userId);
    // TODO: navigasi atau buka modal edit
  };

  const handleDelete = (userId: string) => {
    console.log("Delete user", userId);
    // TODO: tampilkan konfirmasi & hapus dari Firestore
  };

  return (
    <div className="py-5 overflow-x-scroll sm:overflow-x-hidden rounded-xl border border-gray-300 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      {/* Search Input */}
      <SearchInput placeholder="Cari berdasarkan nama petugas..." value={search} onChange={(e) => setSearch(e)} />

      {/* Loading */}
      {loading ? (
        <LoadingAnimation />
      ) : filteredUsers.length > 0 ? (
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
                Action
              </TableCell>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {filteredUsers.map((user, index) => (
              <TableRow key={user.id} className={`py-5 ${index % 2 !== 1 ? "bg-gray-200 dark:bg-gray-900" : ""} hover:bg-gray-100 dark:hover:bg-gray-800`}>
                <TableCell className="py-4 text-gray-800 text-theme-sm dark:text-white/90">{user.name}</TableCell>
                <TableCell className="py-4 text-gray-800 text-theme-sm dark:text-white/90">{user.email}</TableCell>
                <TableCell className="flex gap-2 py-2">
                  <div className="flex justify-center items-center gap-2">
                    {/* <Button size="sm" variant="primary" onClick={() => navigate("/user-detail", { state: { patient: patient } })}> */}
                    <Button size="sm" variant="primary">
                      Detail
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => alert(`Edit ${user.name}`)}>
                      Edit
                    </Button>
                    <DeleteButton user={user} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div className="text-center text-theme-sm text-gray-500 pt-5">Petugas tidak ditemukan</div>
      )}
    </div>
  );
}

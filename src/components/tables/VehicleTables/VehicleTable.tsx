import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../configuration";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../ui/table";
import Button from "../../ui/button/Button";
import DeleteButton from "./DeleteButton";
import { useNavigate } from "react-router";

export interface Vehicle {
  id: string;
  plate: string;
  user_id: string;
}

export default function VehicleTable() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [search, setSearch] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const vehicleSnapshot = await getDocs(collection(db, "vehicles"));
        console.log(`Vehicle ${vehicleSnapshot}}`);
        const vehiclesData = vehicleSnapshot.docs.map((doc) => ({
          id: doc.id,
          plate: doc.data().plate,
          user_id: doc.data().user_id,
        }));

        const userSnapshot = await getDocs(collection(db, "users"));
        const usersData = userSnapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name,
        }));

        const merged = vehiclesData.map((vehicle) => {
          const matchedUser = usersData.find((v) => v.id === vehicle.user_id);
          return {
            ...vehicle,
            user: matchedUser.name || "-",
          };
        });

        setVehicles(merged);
      } catch (error) {
        console.error("Error fetching vehicles and vehicles:", error);
      }
      setLoading(false);
    }

    fetchData();
  }, []);

  const filteredvehicles = vehicles.filter((vehicle) =>
    vehicle.plate.toLowerCase().includes(search.toLowerCase())
  );

  const handleDetail = (vehicleId: string) => {
    console.log("Detail vehicle", vehicleId);
    // TODO: navigasi ke halaman detail vehicle
    navigate(`/vehicles/${vehicleId}`);
  };

  const handleAdd = () => {
    console.log("Add vehicle");
    // TODO: navigasi atau buka modal tambah
  };

  const handleEdit = (vehicleId: string) => {
    console.log("Edit vehicle", vehicleId);
    // TODO: navigasi atau buka modal edit
  };

  return (
    <div className="py-5 overflow-x-scroll sm:overflow-x-hidden rounded-xl border border-gray-300 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      {/* Search Input */}
      <div className="flex gap-3 mb-4 px-5">
        <input
          type="text"
          placeholder="Cari berdasarkan plat..."
          className="border border-gray-300 dark:bg-gray-800 p-2 text-gray-500 text-start text-theme-sm dark:text-gray-400 rounded-md flex-grow"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Loading */}
      {loading ? (
        <div className="text-center text-gray-500">
          <div className="animate-spin h-6 w-6 border-t-2 border-brand-500 rounded-full mx-auto"></div>
        </div>
      ) : filteredvehicles.length > 0 ? (
        <Table>
          <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
            <TableRow>
              <TableCell
                isHeader
                className="ps-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Plat Nomor
              </TableCell>
              <TableCell
                isHeader
                className="ps-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Pengendara
              </TableCell>
              <TableCell
                isHeader
                className="ps-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Action
              </TableCell>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {filteredvehicles.map((vehicle, index) => (
              <TableRow
                key={vehicle.id}
                className={`py-5 ${
                  index % 2 !== 1 ? "bg-gray-200 dark:bg-gray-700" : ""
                } hover:bg-gray-100 dark:hover:bg-gray-600`}
              >
                <TableCell className="py-4 text-gray-800 text-theme-sm dark:text-white/90">
                  {vehicle.plate}
                </TableCell>
                <TableCell className="py-4 text-gray-800 text-theme-sm dark:text-white/90">
                  {vehicle.user_id}
                </TableCell>
                <TableCell className="flex gap-2 py-2">
                  <div className="flex justify-center items-center gap-2">
                    {/* <Button size="sm" variant="primary" onClick={() => navigate("/vehicle-detail", { state: { patient: patient } })}> */}
                    <Button size="sm" variant="primary">
                      Detail
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => alert(`Edit ${vehicle.plate}`)}
                    >
                      Edit
                    </Button>
                    <DeleteButton vehicle={vehicle} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div className="text-center text-theme-sm text-gray-500 pt-5">
          Kendaraan tidak ditemukan
        </div>
      )}
    </div>
  );
}

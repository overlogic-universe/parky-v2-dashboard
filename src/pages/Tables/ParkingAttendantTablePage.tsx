import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ParkingAttendantTable from "../../components/tables/UserTables/ParkingAttendantTable";

export default function ParkingAttendantTablePage() {
  return (
    <>
      <PageMeta title="Tabel Petugas Parkir 🧑‍💼" description="This is the user table of Parky" />
      <PageBreadcrumb pageTitle="Tabel Petugas Parkir 🧑‍💼" />
      <div className="space-y-6">
        <ParkingAttendantTable />
      </div>
    </>
  );
}

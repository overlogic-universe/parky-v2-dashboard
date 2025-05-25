import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ParkingLotTable from "../../components/tables/ParkingLotTable";

export default function ParkingLotTablePage() {
  return (
    <>
      <PageMeta title="Parky | Tabel Tempat Parkir 🅿️" description="This is the user table of Parky" />
      <PageBreadcrumb pageTitle="Tabel Tempat Parkir 🅿️" />
      <div className="space-y-6">
        <ParkingLotTable />
      </div>
    </>
  );
}

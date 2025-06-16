import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import { useParams } from "react-router";
import { UpdateParkingAttendantForm } from "../../components/UpdateParkingAttendant/UpdateParkingAttendantForm";

export interface UpdateParkingAttendantFormProps {
  id: string;
}

export default function UpdateParkingAttendantPage() {
  const { id } = useParams<{ id: string }>();

  if (!id) {
    return <div>Parking attendant ID tidak ditemukan.</div>;
  }

  return (
    <>
      <PageMeta title="Parky | Perbarui Data Petugas 📅" description="Update Parking Attendant" />
      <PageBreadcrumb pageTitle="Perbarui Data Petugas 📅" />
      <div className="space-y-6">
        <UpdateParkingAttendantForm id={id} />
      </div>
    </>
  );
}

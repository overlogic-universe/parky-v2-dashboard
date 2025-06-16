import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import UpdateParkingLotForm from "../../components/UpdateParkingLot/UpdateParkingLot";
import { useParams } from "react-router";

export interface UpdateParkingLotFormProps {
  parkingLotId: string;
}

export default function UpdateParkingLotPage() {
  const { parkingLotId } = useParams<{ parkingLotId: string }>();

  if (!parkingLotId) {
    return <div>Parking lot ID tidak ditemukan.</div>;
  }

  return (
    <>
      <PageMeta title="Parky | Perbarui Tempat Parkir 📅" description="Update Parking Lot" />
      <PageBreadcrumb pageTitle="Perbarui Tempat Parkir 📅" />
      <div className="space-y-6">
        <UpdateParkingLotForm parkingLotId={parkingLotId} />
      </div>
    </>
  );
}

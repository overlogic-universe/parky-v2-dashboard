import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ParkingActivitySection from "../../components/ParkingActivity/ParkingActivitySection";

export default function ParkingActivityPage() {
  return (
    <>
      <PageMeta title="Parky | Activity 🏍️" description="Parking Activity Parky" />
      <PageBreadcrumb pageTitle="Aktivitas Parkir 🏍️" />
      <div className="space-y-6">
        <ParkingActivitySection />
      </div>
    </>
  );
}

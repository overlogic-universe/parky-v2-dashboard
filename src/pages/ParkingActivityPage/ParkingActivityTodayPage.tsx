import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ParkingActivityTodaySection from "../../components/ParkingActivity/ParkingActivityTodaySection";

export default function ParkingActivityTodayPage() {
  return (
    <>
      <PageMeta title="Parky | Activity 🏍️" description="Parking Activity Parky" />
      <PageBreadcrumb pageTitle="Aktivitas Parkir 🏍️" />
      <div className="space-y-6">
        <ParkingActivityTodaySection />
      </div>
    </>
  );
}

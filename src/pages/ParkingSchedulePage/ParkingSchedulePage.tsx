import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ParkingScheduleSection from "../../components/ParkingSchedule/ParkingScheduleSection";

export default function ParkingSchedulePage() {
  return (
    <>
      <PageMeta title="Parky | Schedule 📅" description="Parking Schedule Parky" />
      <PageBreadcrumb pageTitle="Parking Schedule 📅" />
      <div className="space-y-6">
        <ParkingScheduleSection />
      </div>
    </>
  );
}

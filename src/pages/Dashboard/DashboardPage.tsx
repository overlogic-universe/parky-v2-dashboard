import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import Dashboard from "../../components/Dashboard/Dashboard";

export default function DashboardPage() {
  return (
    <>
      <PageMeta title="Dasbor 📊" description="Dasbor Parky" />
      <PageBreadcrumb pageTitle="Dasbor 📊" />
      <div className="space-y-6">
        <Dashboard />
      </div>
    </>
  );
}

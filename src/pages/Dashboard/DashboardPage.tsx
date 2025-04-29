import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import Dashboard from "../../components/Dashboard/Dashboard";

export default function DashboardPage() {
  return (
    <>
      <PageMeta title="Dashboard 📊" description="This is the dashboard of neurotic" />
      <PageBreadcrumb pageTitle="Dashboard 📊" />
      <div className="space-y-6">
        <Dashboard />
      </div>
    </>
  );
}

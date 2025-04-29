import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import UserTable from "../../components/tables/UserTables/UserTable";

export default function UserTablePage() {
  return (
    <>
      <PageMeta title="Tabel Pasien 🏥" description="This is the user table of neurotic" />
      <PageBreadcrumb pageTitle="Tabel Pasien 🏥" />
      <div className="space-y-6">
        <UserTable />
      </div>
    </>
  );
}

import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import UserTable from "../../components/tables/UserTables/UserTable";

export default function UserTablePage() {
  return (
    <>
      <PageMeta title="User 🧑‍💻" description="This is the user table of Parky" />
      <PageBreadcrumb pageTitle="Pengguna 🧑‍💻" />
      <div className="space-y-6">
        <UserTable />
      </div>
    </>
  );
}

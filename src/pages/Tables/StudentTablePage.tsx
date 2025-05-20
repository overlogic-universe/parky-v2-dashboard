import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import StudentTable from "../../components/tables/UserTables/StudentTable";

export default function StudentTablePage() {
  return (
    <>
      <PageMeta title="Tabel Mahasiswa 🧑‍💻" description="This is the user table of Parky" />
      <PageBreadcrumb pageTitle="Tabel Mahasiswa 🧑‍💻" />
      <div className="space-y-6">
        <StudentTable />
      </div>
    </>
  );
}

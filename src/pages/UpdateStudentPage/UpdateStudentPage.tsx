import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import {UpdateStudentForm} from "../../components/UpdateStudent/UpdateStudentForm";
import { useParams } from "react-router";

export interface UpdateStudentFormProps {
  id: string;
}

export default function UpdateStudentPage() {
  const { id } = useParams<{ id: string }>();

  if (!id) {
    return <div>ID Mahasiswa tidak ditemukan.</div>;
  }

  return (
    <>
      <PageMeta title="Parky | Perbarui Tempat Parkir 📅" description="Update Student" />
      <PageBreadcrumb pageTitle="Perbarui Tempat Parkir 📅" />
      <div className="space-y-6">
        <UpdateStudentForm id={id} />
      </div>
    </>
  );
}

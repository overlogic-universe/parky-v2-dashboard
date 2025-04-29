import { useLocation } from "react-router-dom";
import PageMeta from "../../components/common/PageMeta";
import PatientDetails from "../../components/PatientDetails/PatientDetails";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";


const PatientDetailsPage= () => {
  const location = useLocation();
  const { patient } = location.state || {};
  return (
    <>
      <PageMeta title={patient.name} description="Halaman detail pasien" />
      <PageBreadcrumb pageTitle={patient.name} />
      <PatientDetails />
    </>
  );
};

export default PatientDetailsPage;

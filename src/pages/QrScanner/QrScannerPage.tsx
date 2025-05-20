import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";

export default function QrScannerPage() {
  return (
    <>
      <PageMeta title="QR Scan" description="This is the QR Scanner of Parky" />
      <PageBreadcrumb pageTitle="Pindai QR" />
      <div className="space-y-6">
        <div className="bg-white flex"></div>
      </div>
    </>
  );
}

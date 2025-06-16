import { useState } from "react";
import { collection, doc, getDocs, query, updateDoc, where } from "firebase/firestore";
import Button from "../ui/button/Button";
import { db } from "../../configuration";
import { Modal } from "../ui/modal";

export interface DeletableItem {
  id: string;
  [key: string]: any;
}

interface ButtonDeleteProps {
  data: DeletableItem;
  collectionName: "students" | "parking_attendants" | "parking_lots";
}

const ButtonDelete: React.FC<ButtonDeleteProps> = ({ data, collectionName }) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteUser = async () => {
    setIsDeleting(true);
    try {
      // Soft delete data utama
      const ref = doc(db, collectionName, data.id);
      await updateDoc(ref, { deleted_at: new Date() });

      // Soft delete relasi berdasarkan jenis koleksi
      if (collectionName === "parking_attendants" || collectionName === "parking_lots") {
        const field = collectionName === "parking_attendants" ? "parking_attendant_id" : "parking_lot_id";

        const assignmentsQuery = query(
          collection(db, "parking_assignments"),
          where(field, "==", data.id),
          where("deleted_at", "==", null)
        );
        const assignmentSnapshots = await getDocs(assignmentsQuery);

        // Soft delete assignments
        const softDeleteAssignments = assignmentSnapshots.docs.map((doc) =>
          updateDoc(doc.ref, { deleted_at: new Date() })
        );
        await Promise.all(softDeleteAssignments);

        // Ambil schedule_id dari assignments
        const scheduleIds = assignmentSnapshots.docs.map((doc) => doc.data().parking_schedule_id);

        // Query schedules berdasarkan ID dan belum dihapus
        const scheduleQueries = scheduleIds.map((id) =>
          getDocs(query(collection(db, "parking_schedules"), where("__name__", "==", id), where("deleted_at", "==", null)))
        );
        const scheduleSnapshotsArray = await Promise.all(scheduleQueries);

        const scheduleSoftDeletes = scheduleSnapshotsArray
          .flatMap((snap) => snap.docs)
          .map((doc) => updateDoc(doc.ref, { deleted_at: new Date() }));

        await Promise.all(scheduleSoftDeletes);
      }

      // Soft delete vehicles jika student dihapus
      if (collectionName === "students") {
        const vehiclesQuery = query(
          collection(db, "vehicles"),
          where("student_id", "==", data.id),
          where("deleted_at", "==", null)
        );
        const vehiclesSnapshot = await getDocs(vehiclesQuery);

        const softDeleteVehicles = vehiclesSnapshot.docs.map((doc) =>
          updateDoc(doc.ref, { deleted_at: new Date() })
        );

        await Promise.all(softDeleteVehicles);
      }

      console.log(`Data dari koleksi "${collectionName}" berhasil dihapus (soft delete).`);
      setShowDeleteModal(false);
      setShowSuccessModal(true);
    } catch (error) {
      console.error("Gagal melakukan soft delete:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteClick = () => setShowDeleteModal(true);
  const handleDeleteCancel = () => setShowDeleteModal(false);
  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    window.location.reload();
  };

  return (
    <>
      <Button
        size="sm"
        variant="primary"
        className="bg-red-400 hover:bg-red-500"
        onClick={handleDeleteClick}
      >
        Delete
      </Button>

      {/* Modal Konfirmasi */}
      <Modal isOpen={showDeleteModal} onClose={handleDeleteCancel} className="max-w-md p-6 absolute">
        <div className="text-center">
          <h3 className="text-lg font-semibold">Konfirmasi Penghapusan</h3>
          <p className="mt-2 text-sm text-gray-600">Apakah Anda yakin ingin menghapus data ini?</p>
          <div className="mt-4 flex justify-center gap-4">
            <button onClick={handleDeleteCancel} className="px-4 py-2 bg-gray-300 text-black rounded-lg">
              Batal
            </button>
            <button
              onClick={handleDeleteUser}
              className="px-4 py-2 bg-red-400 hover:bg-red-500 text-white rounded-lg"
              disabled={isDeleting}
            >
              {isDeleting ? "Menghapus..." : "Hapus"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal Sukses */}
      <Modal isOpen={showSuccessModal} onClose={handleSuccessModalClose} className="max-w-md p-6 absolute">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-green-500">Penghapusan Berhasil!</h3>
          <p className="mt-2 text-sm text-gray-600">Data berhasil ditandai sebagai dihapus.</p>
          <div className="mt-4 flex justify-center gap-4">
            <button
              onClick={handleSuccessModalClose}
              className="px-4 py-2 bg-green-400 hover:bg-green-500 text-white rounded-lg"
            >
              OK
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default ButtonDelete;

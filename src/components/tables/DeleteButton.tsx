import { useState } from "react";
import { deleteDoc, doc } from "firebase/firestore";
import Button from "../ui/button/Button";
import { User } from "./StudentTable";
import { db } from "../../configuration";
import { Modal } from "../ui/modal";

interface ButtonDeleteProps {
  user: User;
}

const ButtonDelete: React.FC<ButtonDeleteProps> = ({ user }) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fungsi untuk menghapus feedback dan examination results
  // async function deleteFeedbackAndExaminationResults() {
  //   try {
  //     const feedbackRef = doc(db, "feedbacks", user.feedbackId);
  //     await deleteDoc(feedbackRef);

  //     const examinationResultRef = doc(
  //       db,
  //       "examination_results",
  //       user.examinationResultId
  //     );
  //     await deleteDoc(examinationResultRef);

  //     console.log("Feedback dan Examination Results berhasil dihapus.");
  //   } catch (error) {
  //     console.error("Error menghapus feedback dan examination result:", error);
  //   }
  // }

  // Fungsi untuk menghapus user
  async function handleDeleteUser() {
    setIsDeleting(true);
    try {
      // await deleteFeedbackAndExaminationResults();

      const userRef = doc(db, "users", user.id);
      await deleteDoc(userRef);

      console.log("User berhasil dihapus.");
      setIsDeleting(false);
      setShowDeleteModal(false); // Menutup modal konfirmasi
      setShowSuccessModal(true); // Menampilkan modal success
    } catch (error) {
      console.error("Error menghapus user:", error);
      setIsDeleting(false); // Reset loading state jika ada error
    }
  }

  // Handle untuk membuka modal konfirmasi
  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  // Handle untuk membatalkan penghapusan
  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
  };

  // Handle untuk menutup modal success dan me-refresh halaman
  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    window.location.reload(); // Refresh halaman setelah sukses
  };

  return (
    <>
      <Button size="sm" variant="primary" className="bg-red-400 hover:bg-red-500" onClick={handleDeleteClick}>
        Delete
      </Button>

      {/* Modal Konfirmasi Penghapusan */}
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
              disabled={isDeleting} // Disabled jika sedang menghapus
            >
              {isDeleting ? "Menghapus..." : "Hapus"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal Success */}
      <Modal isOpen={showSuccessModal} onClose={handleSuccessModalClose} className="max-w-md p-6 absolute">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-green-500">Penghapusan Berhasil!</h3>
          <p className="mt-2 text-sm text-gray-600">Data telah berhasil dihapus.</p>
          <div className="mt-4 flex justify-center gap-4">
            <button onClick={handleSuccessModalClose} className="px-4 py-2 bg-green-400 hover:bg-green-500 text-white rounded-lg">
              OK
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default ButtonDelete;

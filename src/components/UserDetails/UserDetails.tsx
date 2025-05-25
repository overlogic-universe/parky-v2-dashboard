import { doc, getDoc } from "firebase/firestore";
import { User } from "../tables/StudentTables/StudentTable";
import { useState, useEffect } from "react";
import { useLocation } from "react-router";
import { db } from "../../configuration";
import { convertToAge, formatDate, formatDateWithTime } from "../../utils/DateUtil";

export interface ExaminationPoint {
  detected: boolean;
  frequency: number;
}

export interface ExaminationResult {
  kanan: Record<string, ExaminationPoint>;
  kiri: Record<string, ExaminationPoint>;
}

export interface Feedback {
  id: string;
  description: string | null;
  rating: number;
}

const UserDetails = () => {
  const location = useLocation();
  const { user } = location.state as { user: User };

  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [examinationResult, setExaminationResult] = useState<ExaminationResult | null>(null);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        if (user.feedbackId) {
          const feedbackDoc = await getDoc(doc(db, "feedbacks", user.feedbackId));
          if (feedbackDoc.exists()) {
            setFeedback(feedbackDoc.data() as Feedback);
          }
        }

        if (user.examinationResultId) {
          const resultDoc = await getDoc(doc(db, "examination_results", user.examinationResultId));
          if (resultDoc.exists()) {
            setExaminationResult(resultDoc.data() as ExaminationResult);
          }
        }
      } catch (err) {
        console.error("Error loading user details:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [user.feedbackId, user.examinationResultId]);

  const footPoints = [
    {
      label: "a",
      top: "11%",
      left: "34%",
      detected: examinationResult?.kiri["a"].detected,
    },
    {
      label: "b",
      top: "8%",
      left: "18%",
      detected: examinationResult?.kiri["b"].detected,
    },
    {
      label: "c",
      top: "32%",
      left: "36%",
      detected: examinationResult?.kiri["c"].detected,
    },
    {
      label: "d",
      top: "31%",
      left: "20%",
      detected: examinationResult?.kiri["d"].detected,
    },
    {
      label: "e",
      top: "36%",
      left: "7%",
      detected: examinationResult?.kiri["e"].detected,
    },
    {
      label: "f",
      top: "55%",
      left: "8%",
      detected: examinationResult?.kiri["f"].detected,
    },
    {
      label: "g",
      top: "73%",
      left: "14%",
      detected: examinationResult?.kiri["g"].detected,
    },
    {
      label: "h",
      top: "92%",
      left: "21%",
      detected: examinationResult?.kiri["h"].detected,
    },

    // kaki kanan
    {
      label: "a",
      top: "11%",
      left: "66%",
      detected: examinationResult?.kanan["a"].detected,
    },
    {
      label: "b",
      top: "8%",
      left: "82%",
      detected: examinationResult?.kanan["b"].detected,
    },
    {
      label: "c",
      top: "32%",
      left: "65%",
      detected: examinationResult?.kanan["c"].detected,
    },
    {
      label: "d",
      top: "31%",
      left: "80%",
      detected: examinationResult?.kanan["d"].detected,
    },
    {
      label: "e",
      top: "36%",
      left: "93%",
      detected: examinationResult?.kanan["e"].detected,
    },
    {
      label: "f",
      top: "55%",
      left: "92%",
      detected: examinationResult?.kanan["f"].detected,
    },
    {
      label: "g",
      top: "73%",
      left: "86%",
      detected: examinationResult?.kanan["g"].detected,
    },
    {
      label: "h",
      top: "92%",
      left: "79%",
      detected: examinationResult?.kanan["h"].detected,
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin h-8 w-8 border-t-2 border-brand-500 rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Box Atas */}
      <div className="py-5 overflow-hidden rounded-xl border border-gray-300 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] px-5">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Detail Pasien</h2>
        <hr className="mb-3" />
        <p className=" font-semibold text-gray-700 dark:text-white mb-4">
          Tanggal Pemeriksaan:
          <span className="font-normal tex-xl"> {formatDateWithTime(user.createdAt)}</span>
        </p>
        <div className="grid grid-cols-2 gap-4 text-sm text-gray-700 dark:text-gray-300">
          <p>
            <span className="font-bold dark:text-white">Nama:</span> {user.name}
          </p>
          <p>
            <span className="font-bold dark:text-white">Jenis Kelamin:</span> {user.gender}
          </p>
          <p>
            <span className="font-bold dark:text-white">Tgl Lahir:</span> {formatDate(user.birthDate)}
          </p>
          <p>
            <span className="font-bold dark:text-white">Umur:</span> {convertToAge(user.birthDate)} tahun
          </p>
          <p>
            <span className="font-bold dark:text-white">Berat:</span> {user.weight} kg
          </p>
          <p>
            <span className="font-bold dark:text-white">Tinggi:</span> {user.height} cm
          </p>
          <p>
            <span className="font-bold dark:text-white">Durasi DM:</span> {user.dmDuration} tahun
          </p>
          <p>
            <span className="font-bold dark:text-white">Penyakit lain:</span> {user.otherDiseases}
          </p>
          <p>
            <span className="font-bold dark:text-white">Suku:</span> {user.ethnicity}
          </p>
          <p className={`${user.isNeuropathy ? "text-error-500" : "text-brand-500"}`}>
            <span className="font-bold text-gray-700 dark:text-white">Diagnosa:</span> {user.isNeuropathy ? "Terindikasi Neuropati" : "Tidak terindikasi Neuropati"}
          </p>
        </div>
      </div>

      {/* Box Bawah */}
      <div className="py-5 overflow-hidden rounded-xl border border-gray-300 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] px-5">
        {examinationResult && (
          <>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Hasil Pemeriksaan</h3>
            <hr className="mb-3" />

            <div className="mb-4">
              <div className="relative w-full max-w-sm mx-auto">
                <img src="/images/user-details/foot.png" alt="Gambar kaki" className="w-full" />
                {footPoints.map((point) => (
                  <div
                    key={`${point.label}-${point.left}`}
                    className={`text-center text-white absolute w-[1.9rem] h-[1.9rem] rounded-full ${point.detected ? "bg-green-500" : "bg-red-400"}`}
                    style={{
                      top: point.top,
                      left: point.left,
                      transform: "translate(-50%, -50%)",
                    }}
                  >
                    {point.label}
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {["kiri", "kanan"].map((side) => (
                <div key={side}>
                  <p className="font-medium capitalize mb-1 text-gray-700 dark:text-white">{side}</p>
                  <ul className="space-y-1 text-sm">
                    {Object.entries(examinationResult[side as keyof ExaminationResult])
                      .sort(([a], [b]) => a.localeCompare(b))
                      .map(([point, data]) => (
                        <li key={point}>
                          <span className="font-bold uppercase text-gray-700 dark:text-gray-300">{point}:</span>{" "}
                          <span className={`${data.detected ? "text-brand-500" : "text-error-500"}`}>
                            {data.detected ? "Terdeteksi" : "Tidak"} ({data.frequency} Hz)
                          </span>
                        </li>
                      ))}
                  </ul>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
      <div className="py-5 overflow-hidden rounded-xl border border-gray-300 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] px-5">
        {feedback && (
          <>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Feedback</h3>
            <hr className="mb-3" />
            <p className="dark:text-gray-300 text-gray-700">
              <span className="font-bold dark:text-white">Rating:</span> {feedback.rating}
            </p>
            <p className="dark:text-gray-300 text-gray-700">
              <span className="font-bold dark:text-white">Catatan:</span> {feedback.description || "-"}
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default UserDetails;

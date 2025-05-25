import { InfoIcon } from "../../icons";

export default function GeneratedPasswordInformation() {
  return (
    <div className="mt-4 p-4 rounded-xl bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          <InfoIcon />
        </div>
        <div>
          <p className="text-sm font-medium text-blue-800 dark:text-blue-300">Informasi!</p>
          <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">Password akan digenerate secara otomatis dan dikirimkan ke email yang Anda masukkan.</p>
        </div>
      </div>
    </div>
  );
}

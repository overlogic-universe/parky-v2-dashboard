import { ReactNode } from "react";

interface InformationBoxProps {
  title: string;
  value: string | number;
  icon: ReactNode;
}

export default function InformationBox({ title, value, icon }: InformationBoxProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
      <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">{icon}</div>

      <span className="mt-5 text-sm text-gray-500 dark:text-gray-400">{title}</span>
      <h4 className="mt-2 font-bold text-gray-800 text-theme-xl dark:text-white/90">{value}</h4>
    </div>
  );
}

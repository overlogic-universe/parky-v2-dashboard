"use client";

import { useState } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";

interface AttendantDropdownProps {
  selectedId: string | undefined;
  onSelect: (id: string) => void;
  attendants: { id: string; name: string }[];
}

export const AttendantDropdown: React.FC<AttendantDropdownProps> = ({
  selectedId,
  onSelect,
  attendants,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedName =
    attendants.find((attendant) => attendant.id === selectedId)?.name || "Pilih Petugas";

  return (
    <div className="w-1/2">
      <button
        type="button"
        className="dropdown-toggle w-full rounded-md px-4 py-2 text-left text-sm dark:hover:bg-gray-800 dark:text-gray-400 text-gray-700 bg-white hover:bg-gray-100 border border-gray-300 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        {selectedName}
      </button>
      <Dropdown className="relative dark:bg-white/[0.03]" isOpen={isOpen} onClose={() => setIsOpen(false)}>
        {attendants.map((attendant) => (
          <DropdownItem className="font-bold text-theme-sm dark:text-gray-200 dark:hover:bg-gray-800"
            key={attendant.id}
            onItemClick={() => {
              onSelect(attendant.id);
              setIsOpen(false);
            }}
          >
            {attendant.name}
          </DropdownItem>
        ))}
      </Dropdown>
    </div>
  );
};

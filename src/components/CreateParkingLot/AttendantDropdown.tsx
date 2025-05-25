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
        className="dropdown-toggle w-full rounded-md border px-4 py-2 text-left text-sm text-gray-700 bg-white hover:bg-gray-100"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        {selectedName}
      </button>
      <Dropdown className="relative" isOpen={isOpen} onClose={() => setIsOpen(false)}>
        {attendants.map((attendant) => (
          <DropdownItem className="font-bold"
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

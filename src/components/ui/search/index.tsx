"use client";

import Input from "../../form/input/InputField";

interface SearchInputProps {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export default function SearchInput({ placeholder = "Cari...", value, onChange, className = "" }: SearchInputProps) {
  return (
    <div className={`p-4 ${className}`}>
      <Input placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} className="w-full max-w-md mb-4" />
    </div>
  );
}

"use client";

import { ChevronDown, ChevronRight } from "lucide-react";

interface SectionHeaderProps {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
}

const SectionHeader = ({ title, isOpen, onToggle }: SectionHeaderProps) => {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="w-full flex items-center justify-between px-6 py-4 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
      aria-expanded={isOpen}
    >
      <span className="text-lg font-semibold text-gray-800">{title}</span>
      {isOpen ? (
        <ChevronDown className="w-5 h-5 text-gray-600" />
      ) : (
        <ChevronRight className="w-5 h-5 text-gray-600" />
      )}
    </button>
  );
};

export default SectionHeader;

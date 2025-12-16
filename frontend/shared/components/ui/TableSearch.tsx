/**
 * TableSearch Component
 * Reusable search input for tables
 */

import Image from 'next/image';
import searchImage from '@/public/search.png';

export interface TableSearchProps {
  onSearch?: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const TableSearch = ({
  onSearch,
  placeholder = 'Buscar...',
  className = '',
}: TableSearchProps) => {
  return (
    <div
      className={`w-full md:w-auto flex items-center gap-2 text-xs rounded-full ring-[1.5px] ring-gray-300 px-2 ${className}`}
    >
      <Image src={searchImage} alt="search image" width={14} height={14} />
      <input
        type="text"
        placeholder={placeholder}
        className="w-[200px] p-2 bg-transparent outline-none"
        onChange={(e) => onSearch && onSearch(e.target.value)}
      />
    </div>
  );
};

export default TableSearch;

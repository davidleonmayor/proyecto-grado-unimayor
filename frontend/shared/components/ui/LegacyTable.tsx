/**
 * Table Component
 * Reusable data table component
 */

export interface TableColumn {
  header: string;
  accessor: string;
  className?: string;
}

export interface TableProps<T = any> {
  columns: TableColumn[];
  renderRow: (item: T) => React.ReactNode;
  data: T[];
  className?: string;
}

export const LegacyTable = <T,>({
  columns,
  renderRow,
  data,
  className = '',
}: TableProps<T>) => {
  return (
    <table className={`w-full mt-4 ${className}`}>
      <thead>
        <tr className="text-left text-gray-500 text-sm">
          {columns.map((col) => (
            <th key={col.accessor} className={col.className}>
              {col.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>{data.map((item, index) => renderRow(item))}</tbody>
    </table>
  );
};

export default LegacyTable;

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
    <div className="w-full overflow-x-auto pb-4 mt-2 -mx-4 px-4 md:mx-0 md:px-0">
      <table className={`w-full min-w-max text-left border-collapse ${className}`}>
        <thead>
          <tr className="text-left text-gray-500 text-xs uppercase tracking-wider border-b border-gray-200">
            {columns.map((col) => (
              <th key={col.accessor} className={`p-4 font-semibold whitespace-nowrap ${col.className || ''}`}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{data.map((item, index) => renderRow(item))}</tbody>
      </table>
    </div>
  );
};

export default LegacyTable;

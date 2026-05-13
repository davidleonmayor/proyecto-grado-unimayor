"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { HotTable, type HotTableRef } from "@handsontable/react-wrapper";
import { registerAllModules } from "handsontable/registry";
import type Handsontable from "handsontable";
import "handsontable/styles/handsontable.css";
import "handsontable/styles/ht-theme-main.css";

registerAllModules();

export type GridColumn = {
  key: string;
  title: string;
  type: "text" | "checkbox" | "dropdown" | "numeric";
  width?: number;
  readOnly?: boolean;
  source?: string[];
};

export type GridChange = {
  rowIndex: number;
  key: string;
  newValue: unknown;
  oldValue: unknown;
};

type HandsontableGridProps<T extends Record<string, unknown>> = {
  data: T[];
  columns: GridColumn[];
  rowHeights?: number;
  onCellChange: (change: GridChange) => void;
  rowClassName?: (rowIndex: number, row: T) => string | undefined;
};

const HandsontableGrid = <T extends Record<string, unknown>>({
  data,
  columns,
  rowHeights = 36,
  onCellChange,
  rowClassName,
}: HandsontableGridProps<T>) => {
  const hotRef = useRef<HotTableRef | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState<{ width: number; height: number }>({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => {
      const rect = el.getBoundingClientRect();
      setSize({ width: rect.width, height: rect.height });
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const hotColumns = useMemo<Handsontable.ColumnSettings[]>(
    () =>
      columns.map((c) => ({
        data: c.key,
        type: c.type,
        width: c.width,
        readOnly: c.readOnly,
        source: c.source,
        className:
          c.type === "checkbox" ? "htCenter htMiddle" : "htLeft htMiddle",
      })),
    [columns],
  );

  const colHeaders = useMemo(() => columns.map((c) => c.title), [columns]);

  const cellsCallback = useMemo<
    Handsontable.GridSettings["cells"] | undefined
  >(() => {
    if (!rowClassName) return undefined;
    return (row) => {
      const meta: Partial<Handsontable.CellMeta> = {};
      const rowData = data[row];
      if (!rowData) return meta;
      const cls = rowClassName(row, rowData);
      if (cls) meta.className = cls;
      return meta;
    };
  }, [rowClassName, data]);

  return (
    <div ref={containerRef} className="ht-theme-main h-full w-full">
      {size.height > 0 && size.width > 0 ? (
        <HotTable
          ref={hotRef}
          data={data as unknown as Handsontable.CellValue[][]}
          columns={hotColumns}
          colHeaders={colHeaders}
          rowHeaders
          rowHeights={rowHeights}
          height={size.height}
          width={size.width}
          stretchH="last"
          manualColumnResize
          manualRowResize
          contextMenu
          copyPaste
          fillHandle
          autoWrapRow
          autoWrapCol
          undo
          outsideClickDeselects={false}
          licenseKey="non-commercial-and-evaluation"
          cells={cellsCallback}
          afterChange={(changes, source) => {
            if (!changes || source === "loadData") return;
            for (const [rowIndex, prop, oldValue, newValue] of changes) {
              if (oldValue === newValue) continue;
              onCellChange({
                rowIndex,
                key: prop as string,
                newValue,
                oldValue,
              });
            }
          }}
        />
      ) : null}
    </div>
  );
};

export default HandsontableGrid;

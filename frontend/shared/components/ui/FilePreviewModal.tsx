"use client";

import { useEffect, useRef, useState } from "react";

export type PreviewFetcher = () => Promise<{ blob: Blob; type: string; filename: string }>;

interface FilePreviewModalProps {
  filename: string;
  fetcher: PreviewFetcher;
  onClose: () => void;
}

type Kind = "pdf" | "xlsx" | "docx" | "unsupported";

const getKind = (filename: string, mime: string): Kind => {
  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  if (ext === "pdf" || mime === "application/pdf") return "pdf";
  if (ext === "xlsx" || ext === "xls" || ext === "csv" || mime.includes("spreadsheet") || mime.includes("excel")) return "xlsx";
  if (ext === "docx" || mime.includes("wordprocessingml")) return "docx";
  return "unsupported";
};

export const FilePreviewModal = ({ filename, fetcher, onClose }: FilePreviewModalProps) => {
  const [kind, setKind] = useState<Kind | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [docxHtml, setDocxHtml] = useState<string | null>(null);
  const [sheets, setSheets] = useState<{ name: string; html: string }[] | null>(null);
  const [activeSheet, setActiveSheet] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const objectUrlRef = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        setLoading(true);
        setError(null);
        const { blob, type } = await fetcher();
        if (cancelled) return;

        const detected = getKind(filename, type);
        setKind(detected);

        if (detected === "pdf") {
          const url = URL.createObjectURL(blob);
          objectUrlRef.current = url;
          setPdfUrl(url);
        } else if (detected === "xlsx") {
          const XLSX = await import("xlsx");
          const buffer = await blob.arrayBuffer();
          const workbook = XLSX.read(buffer, { type: "array" });
          const rendered = workbook.SheetNames.map((name) => ({
            name,
            html: XLSX.utils.sheet_to_html(workbook.Sheets[name], { editable: false }),
          }));
          if (!cancelled) setSheets(rendered);
        } else if (detected === "docx") {
          const mammoth = await import("mammoth");
          const buffer = await blob.arrayBuffer();
          const result = await mammoth.convertToHtml({ arrayBuffer: buffer });
          if (!cancelled) setDocxHtml(result.value);
        }
      } catch (err) {
        if (cancelled) return;
        console.error("Error al previsualizar archivo:", err);
        setError(err instanceof Error ? err.message : "Error al cargar la previsualización");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    run();

    return () => {
      cancelled = true;
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
    };
  }, [fetcher, filename]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[999] bg-black/60 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-2 min-w-0">
            <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="text-sm font-medium text-gray-800 truncate" title={filename}>{filename}</span>
            <span className="text-xs text-gray-400 ml-1">· Previsualización (solo lectura)</span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 transition-colors p-1"
            aria-label="Cerrar"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-auto bg-gray-100">
          {loading && (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          )}

          {!loading && error && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-sm text-red-600 max-w-md px-6">
                <p className="font-medium mb-1">No se pudo previsualizar el archivo</p>
                <p className="text-gray-500">{error}</p>
              </div>
            </div>
          )}

          {!loading && !error && kind === "pdf" && pdfUrl && (
            <iframe src={pdfUrl} title={filename} className="w-full h-full bg-white" />
          )}

          {!loading && !error && kind === "xlsx" && sheets && (
            <div className="flex flex-col h-full">
              {sheets.length > 1 && (
                <div className="flex gap-1 px-3 py-2 bg-white border-b border-gray-200 overflow-x-auto">
                  {sheets.map((s, i) => (
                    <button
                      key={s.name}
                      onClick={() => setActiveSheet(i)}
                      className={`text-xs px-3 py-1 rounded transition-colors whitespace-nowrap ${
                        i === activeSheet
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {s.name}
                    </button>
                  ))}
                </div>
              )}
              <div
                className="flex-1 overflow-auto bg-white p-4 file-preview-xlsx"
                dangerouslySetInnerHTML={{ __html: sheets[activeSheet]?.html ?? "" }}
              />
            </div>
          )}

          {!loading && !error && kind === "docx" && docxHtml !== null && (
            <div className="bg-white mx-auto my-6 max-w-3xl shadow-sm border border-gray-200 px-10 py-12 file-preview-docx">
              <div dangerouslySetInnerHTML={{ __html: docxHtml }} />
            </div>
          )}

          {!loading && !error && kind === "unsupported" && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-sm text-gray-600 max-w-md px-6">
                <p className="font-medium mb-1">Formato no soportado para previsualización</p>
                <p className="text-gray-500">Por favor, descarga el archivo para visualizarlo.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx global>{`
        .file-preview-xlsx table {
          border-collapse: collapse;
          font-size: 12px;
        }
        .file-preview-xlsx td,
        .file-preview-xlsx th {
          border: 1px solid #e5e7eb;
          padding: 4px 8px;
          min-width: 60px;
        }
        .file-preview-docx p {
          margin: 0 0 0.75em;
          line-height: 1.6;
          color: #1f2937;
        }
        .file-preview-docx h1,
        .file-preview-docx h2,
        .file-preview-docx h3 {
          font-weight: 600;
          margin: 1.25em 0 0.5em;
          color: #111827;
        }
        .file-preview-docx h1 { font-size: 1.5rem; }
        .file-preview-docx h2 { font-size: 1.25rem; }
        .file-preview-docx h3 { font-size: 1.1rem; }
        .file-preview-docx table {
          border-collapse: collapse;
          margin: 1em 0;
        }
        .file-preview-docx td,
        .file-preview-docx th {
          border: 1px solid #e5e7eb;
          padding: 6px 10px;
        }
        .file-preview-docx ul,
        .file-preview-docx ol {
          padding-left: 1.5em;
          margin: 0 0 0.75em;
        }
      `}</style>
    </div>
  );
};

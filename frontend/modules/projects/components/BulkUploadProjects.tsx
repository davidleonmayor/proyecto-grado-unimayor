/**
 * BulkUploadProjects Component
 * Handles bulk project import from Excel files
 */

'use client';

import { ChangeEvent, useRef, useState } from 'react';
import Swal from 'sweetalert2';
import { projectsService } from '../services/projects.service';
import type { BulkUploadSummary } from '@/shared/types/common';

export interface BulkUploadProjectsProps {
  onSuccessfulImport?: () => void;
}

export const BulkUploadProjects = ({
  onSuccessfulImport,
}: BulkUploadProjectsProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [isDownloadingTemplate, setIsDownloadingTemplate] = useState(false);
  const [importSummary, setImportSummary] = useState<BulkUploadSummary | null>(
    null
  );
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setImportSummary(null);

    if (file && !/\.(xlsx|xls)$/i.test(file.name)) {
      Swal.fire('Archivo no válido', 'Selecciona un archivo Excel (.xlsx o .xls)', 'warning');
      event.target.value = '';
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  };

  const handleBulkUpload = async () => {
    if (!selectedFile) {
      Swal.fire('Sin archivo', 'Selecciona un archivo Excel antes de importar.', 'info');
      return;
    }

    try {
      setIsImporting(true);
      const summary = await projectsService.bulkUploadProjects(selectedFile);

      setImportSummary(summary);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      const hasErrors = summary.failed > 0;
      const imported = summary.imported;
      const message = imported
        ? hasErrors
          ? `Se importaron ${imported} proyecto(s) y ${summary.failed} fila(s) necesitan revisión.`
          : `Se importaron ${imported} proyecto(s) correctamente.`
        : 'No se pudo importar ninguna fila. Revisa el detalle de errores.';
      const status: 'success' | 'info' | 'error' =
        imported && !hasErrors ? 'success' : imported && hasErrors ? 'info' : 'error';

      await Swal.fire('Carga masiva procesada', message, status);

      if (imported && onSuccessfulImport) {
        onSuccessfulImport();
      }
    } catch (err: any) {
      const message = err?.message || 'No se pudo procesar el archivo';
      Swal.fire('Error', message, 'error');
    } finally {
      setIsImporting(false);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      setIsDownloadingTemplate(true);
      await projectsService.downloadBulkTemplate();
      Swal.fire('Plantilla generada', 'Revisa tu carpeta de descargas.', 'success');
    } catch (err: any) {
      const message = err?.message || 'No se pudo descargar la plantilla';
      Swal.fire('Error', message, 'error');
    } finally {
      setIsDownloadingTemplate(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-100 p-8">
        <div className="flex flex-col gap-8 md:flex-row md:items-start max-w-5xl mx-auto">
          <div className="flex-1 space-y-4">
            <div>
              <h2 className="text-xl font-medium text-gray-900 tracking-tight">Carga Masiva de Proyectos</h2>
              <p className="text-sm text-gray-500 mt-1 leading-relaxed">
                Importa múltiples proyectos mediante un archivo Excel (.xlsx, .xls).
              </p>
            </div>

            <div className="text-xs text-gray-500 bg-gray-50 p-4 rounded-md border border-gray-100 space-y-2">
              <p><span className="font-semibold text-gray-700">Columnas obligatorias:</span> Titulo, Modalidad, Estado, Programa, Fecha_inicio, Estudiantes.</p>
              <p><span className="font-semibold text-gray-700">Columnas opcionales:</span> Resumen, Objetivos, Empresa, Fecha_fin, Asesores.</p>
              <p><span className="font-semibold text-gray-700">Formato:</span> Fechas AAAA-MM-DD. Listas separadas por (;). Máx. 2 estudiantes/asesores.</p>
            </div>
          </div>

          <div className="w-full md:w-[380px] flex flex-col gap-4">
            <div className="relative group">
              <div className={`border-2 border-dashed rounded-lg p-6 text-center transition-all ${selectedFile ? 'border-gray-800 bg-gray-50' : 'border-gray-200 hover:border-gray-400 bg-white'}`}>
                <input
                  id="bulk-upload"
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />

                {!selectedFile ? (
                  <div className="space-y-2 pointer-events-none">
                    <svg className="mx-auto h-8 w-8 text-gray-400 group-hover:text-gray-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    <div className="text-sm font-medium text-gray-700">Haz clic o arrastra un archivo</div>
                    <div className="text-xs text-gray-400">Excel hasta 5MB</div>
                  </div>
                ) : (
                  <div className="space-y-2 pointer-events-none">
                    <svg className="mx-auto h-8 w-8 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="text-sm font-medium text-gray-900 truncate px-2">{selectedFile.name}</div>
                    <div className="text-xs text-gray-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleDownloadTemplate}
                disabled={isDownloadingTemplate}
                className="flex-1 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 disabled:opacity-50 transition-colors"
                title="Descargar Plantilla"
              >
                {isDownloadingTemplate ? 'Generando...' : 'Plantilla'}
              </button>

              <button
                type="button"
                onClick={handleBulkUpload}
                disabled={!selectedFile || isImporting}
                className="flex-[2] px-4 py-2.5 bg-gray-900 text-white border border-transparent text-sm font-medium rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 disabled:bg-gray-200 disabled:text-gray-500 transition-colors"
              >
                {isImporting ? 'Procesando...' : 'Importar Archivo'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {importSummary && (
        <div className="bg-white rounded-lg border border-gray-100 p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Resultados de Importación</h3>
              <p className="text-sm text-gray-500 mt-1">
                {importSummary.totalRows} filas procesadas en total
              </p>
            </div>
            <div className="flex gap-4 text-sm bg-gray-50 rounded-md p-1 border border-gray-100">
              <div className="px-4 py-2 rounded bg-white shadow-sm border border-gray-100">
                <span className="text-gray-500 mr-2">Exitosos</span>
                <span className="font-semibold text-gray-900">{importSummary.imported}</span>
              </div>
              <div className="px-4 py-2 rounded bg-white shadow-sm border border-gray-100">
                <span className="text-gray-500 mr-2">Errores</span>
                <span className="font-semibold text-gray-900">{importSummary.failed}</span>
              </div>
            </div>
          </div>

          <div className="border border-gray-100 rounded-md overflow-hidden">
            <table className="min-w-full divide-y divide-gray-100 text-sm">
              <thead className="bg-gray-50/50">
                <tr>
                  <th className="px-6 py-3 text-left font-medium text-gray-500">Fila</th>
                  <th className="px-6 py-3 text-left font-medium text-gray-500">Estado</th>
                  <th className="px-6 py-3 text-left font-medium text-gray-500">Proyecto</th>
                  <th className="px-6 py-3 text-left font-medium text-gray-500">Detalles</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-50">
                {importSummary.rows.map((row) => (
                  <tr key={`${row.row}-${row.title ?? ''}-${row.status}`}>
                    <td className="px-6 py-4 text-gray-500">{row.row}</td>
                    <td className="px-6 py-4">
                      {row.status === 'success' ? (
                        <span className="text-green-600 font-medium whitespace-nowrap">✓ Importado</span>
                      ) : (
                        <span className="text-red-600 font-medium whitespace-nowrap">✕ Error</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-900 font-medium">{row.title || '—'}</td>
                    <td className="px-6 py-4">
                      <ul className="space-y-1 text-gray-600">
                        {row.messages.map((message, index) => (
                          <li key={`${row.row}-message-${index}`} className="flex items-start">
                            <span className="mr-2 text-gray-400">•</span>
                            <span>{message}</span>
                          </li>
                        ))}
                      </ul>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default BulkUploadProjects;

'use client';

import { ChangeEvent, useRef, useState } from 'react';
import Swal from 'sweetalert2';
import api, { BulkUploadSummary } from '../lib/api';

interface BulkUploadProjectsProps {
    onSuccessfulImport?: () => void;
}

export default function BulkUploadProjects({ onSuccessfulImport }: BulkUploadProjectsProps) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isImporting, setIsImporting] = useState(false);
    const [isDownloadingTemplate, setIsDownloadingTemplate] = useState(false);
    const [importSummary, setImportSummary] = useState<BulkUploadSummary | null>(null);
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
            const summary = await api.bulkUploadProjects(selectedFile);

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
            await api.downloadBulkTemplate();
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
            <div className="bg-white rounded-xl shadow-[0_2px_12px_rgb(0,0,0,0.03)] border border-gray-100 p-8">
                <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex-1 max-w-2xl">
                        <h2 className="text-[18px] font-semibold text-gray-800 mb-3">Carga Masiva de Proyectos</h2>
                        <p className="text-[13px] text-gray-500 leading-relaxed font-light mb-5">
                            Importa múltiples proyectos simultáneamente mediante un archivo Excel (.xlsx o .xls). Verifica que la información coincida con los registros del sistema (modalidades, programas, estados, estudiantes y asesores).
                        </p>

                        <div className="bg-slate-50/50 rounded-lg p-5 border border-slate-100">
                            <ul className="text-[13px] text-gray-600 space-y-2.5 font-light">
                                <li className="flex items-start gap-2">
                                    <span className="text-indigo-400 mt-0.5">•</span>
                                    <span><strong className="font-medium text-gray-700">Obligatorias:</strong> Titulo, Modalidad, Estado, Programa, Fecha_inicio, Estudiantes.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-indigo-400 mt-0.5">•</span>
                                    <span><strong className="font-medium text-gray-700">Opcionales:</strong> Resumen, Objetivos, Empresa, Fecha_fin, Asesores.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-indigo-400 mt-0.5">•</span>
                                    <span>Las fechas deben usar el formato <span className="bg-white px-1.5 py-0.5 rounded border border-gray-200 text-gray-500 text-xs shadow-sm">AAAA-MM-DD</span>. Las listas se separan con punto y coma (;). Máximo 2 estudiantes y 2 asesores por fila.</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="w-full lg:w-[340px] flex flex-col gap-4">
                        <div className="relative group">
                            <input
                                id="bulk-upload"
                                ref={fileInputRef}
                                type="file"
                                accept=".xlsx,.xls"
                                onChange={handleFileChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            />
                            <div className={`flex flex-col items-center justify-center w-full p-6 border-2 border-dashed rounded-xl transition-all duration-200 ${selectedFile ? 'border-primary-400 bg-primary-50/30' : 'border-gray-200 bg-gray-50/50 group-hover:border-primary-300 group-hover:bg-gray-50'}`}>
                                <svg className={`w-8 h-8 mb-3 ${selectedFile ? 'text-primary-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                </svg>
                                <span className={`text-sm font-medium ${selectedFile ? 'text-primary-700' : 'text-gray-600'}`}>
                                    {selectedFile ? 'Archivo seleccionado' : 'Seleccionar archivo Excel'}
                                </span>
                                <span className="text-[11px] text-gray-400 mt-1 mt-1 text-center font-light px-2 truncate w-full">
                                    {selectedFile ? selectedFile.name : 'Arrastra un archivo o haz clic aquí'}
                                </span>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2.5 mt-2">
                            <button
                                type="button"
                                onClick={handleBulkUpload}
                                disabled={!selectedFile || isImporting}
                                className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 shadow-sm ${!selectedFile || isImporting
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
                                        : 'bg-primary-600 text-white hover:bg-primary-700 hover:shadow-md hover:-translate-y-0.5'
                                    }`}
                            >
                                {isImporting ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        Procesando...
                                    </>
                                ) : (
                                    'Importar Proyectos'
                                )}
                            </button>
                            <button
                                type="button"
                                onClick={handleDownloadTemplate}
                                disabled={isDownloadingTemplate}
                                className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium border transition-all duration-200 ${isDownloadingTemplate
                                        ? 'border-gray-200 text-gray-400 cursor-not-allowed bg-gray-50'
                                        : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50/80 bg-white'
                                    }`}
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                {isDownloadingTemplate ? 'Generando...' : 'Descargar Plantilla Base'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {importSummary && (
                <div className="bg-white rounded-xl shadow-[0_2px_12px_rgb(0,0,0,0.03)] border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 bg-slate-50/30">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h3 className="text-[16px] font-semibold text-gray-800">Resultado de Importación</h3>
                                <p className="text-[13px] text-gray-500 font-light mt-1">
                                    Total filas procesadas: <span className="font-medium text-gray-700">{importSummary.totalRows}</span>
                                </p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-emerald-50 text-emerald-700 text-[13px] font-medium border border-emerald-100">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                    Exitosos: {importSummary.imported}
                                </span>
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded text-[13px] font-medium border ${importSummary.failed > 0 ? 'bg-rose-50 text-rose-700 border-rose-100' : 'bg-gray-50 text-gray-600 border-gray-100'}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${importSummary.failed > 0 ? 'bg-rose-500' : 'bg-gray-400'}`}></span>
                                    Errores: {importSummary.failed}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead>
                                <tr className="bg-white border-b border-gray-100">
                                    <th className="px-6 py-4 text-left font-medium text-gray-400 uppercase tracking-widest text-[10px] w-16">
                                        Fila
                                    </th>
                                    <th className="px-6 py-4 text-left font-medium text-gray-400 uppercase tracking-widest text-[10px] w-32">
                                        Estado
                                    </th>
                                    <th className="px-6 py-4 text-left font-medium text-gray-400 uppercase tracking-widest text-[10px] min-w-[200px]">
                                        Título
                                    </th>
                                    <th className="px-6 py-4 text-left font-medium text-gray-400 uppercase tracking-widest text-[10px]">
                                        Mensajes
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {importSummary.rows.map((row) => (
                                    <tr key={`${row.row}-${row.title ?? ''}-${row.status}`} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4 text-gray-500 font-medium text-[13px]">{row.row}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <span className={`w-1.5 h-1.5 rounded-full ${row.status === 'success' ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                                                <span className={`text-[11px] font-medium tracking-wide uppercase px-2 py-0.5 rounded border ${row.status === 'success' ? 'text-emerald-700 border-emerald-200' : 'text-rose-700 border-rose-200'
                                                    }`}>
                                                    {row.status === 'success' ? 'Importado' : 'Fallido'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-[13px] text-gray-800 font-medium">
                                            {row.title || <span className="text-gray-400 italic font-light">Sin título</span>}
                                        </td>
                                        <td className="px-6 py-4">
                                            <ul className="space-y-1">
                                                {row.messages.map((message, index) => (
                                                    <li key={`${row.row}-message-${index}`} className="text-[12px] text-gray-600 font-light flex items-start gap-1.5">
                                                        <span className={row.status === 'success' ? 'text-emerald-400' : 'text-rose-400'}>•</span>
                                                        {message}
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
}

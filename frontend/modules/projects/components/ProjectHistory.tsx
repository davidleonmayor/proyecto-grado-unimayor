/**
 * ProjectHistory Component
 * Displays project activity history timeline
 */

'use client';

import { useState } from 'react';
import { projectsService } from '../services/projects.service';

export interface HistoryItem {
  id: string;
  date: string;
  action: string;
  description: string;
  user: string;
  role: string;
  file: boolean;
  fileName: string | null;
  numero_resolucion: string | null;
  statusChange: {
    from: string;
    to: string;
  } | null;
}

export interface ProjectHistoryProps {
  history: HistoryItem[];
}

const getStatusColor = (statusName: string) => {
  const status = statusName.toLowerCase();

  if (status.includes('en progreso') || status.includes('progreso')) {
    return { text: 'text-blue-600', dot: 'bg-blue-500' };
  }
  if (status.includes('en revisión') || status.includes('revisión')) {
    return { text: 'text-yellow-600', dot: 'bg-yellow-500' };
  }
  if (status.includes('pendiente') || status.includes('aprobación')) {
    return { text: 'text-orange-600', dot: 'bg-orange-500' };
  }
  if (status.includes('aprobado')) {
    return { text: 'text-green-600', dot: 'bg-green-500' };
  }
  if (status.includes('rechazado')) {
    return { text: 'text-red-600', dot: 'bg-red-500' };
  }
  if (status.includes('finalizado')) {
    return { text: 'text-purple-600', dot: 'bg-purple-500' };
  }

  return { text: 'text-gray-600', dot: 'bg-gray-500' };
};

export const ProjectHistory = ({ history }: ProjectHistoryProps) => {
  const [downloading, setDownloading] = useState<string | null>(null);
  const [previewing, setPreviewing] = useState<{ id: string; url: string | null; loading: boolean }>({ id: '', url: null, loading: false });

  const handlePreview = async (historyId: string) => {
    try {
      setPreviewing({ id: historyId, url: null, loading: true });
      const { blob, type } = await projectsService.getFileBlob(historyId);
      
      if (type !== 'application/pdf') {
        alert('Solo se pueden previsualizar archivos PDF en el navegador. Por favor descargue el archivo.');
        setPreviewing({ id: '', url: null, loading: false });
        return;
      }

      const url = URL.createObjectURL(blob);
      setPreviewing({ id: historyId, url, loading: false });
    } catch (error) {
      console.error('Error al obtener previsualización:', error);
      alert(error instanceof Error ? error.message : 'Error al obtener previsualización');
      setPreviewing({ id: '', url: null, loading: false });
    }
  };

  const closePreview = () => {
    if (previewing.url) {
      URL.revokeObjectURL(previewing.url);
    }
    setPreviewing({ id: '', url: null, loading: false });
  };

  const handleDownload = async (historyId: string) => {
    try {
      setDownloading(historyId);
      await projectsService.downloadFile(historyId);
    } catch (error) {
      console.error('Error al descargar archivo:', error);
      alert(
        error instanceof Error ? error.message : 'Error al descargar el archivo'
      );
    } finally {
      setDownloading(null);
    }
  };

  if (history.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No hay historial de actividades registrado.
      </div>
    );
  }

  return (
    <div className="relative border-l-2 border-gray-200 ml-3 space-y-8 py-4">
      {history.map((item) => (
        <div key={item.id} className="relative pl-8">
          <div
            className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 border-white ${
              item.action.includes('Entrega')
                ? 'bg-blue-500'
                : item.action.includes('Revisión')
                  ? 'bg-primary-500'
                  : item.action.includes('Aprobación')
                    ? 'bg-green-500'
                    : 'bg-gray-400'
            }`}
          ></div>

          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h4 className="text-sm font-bold text-gray-900">{item.action}</h4>
                <p className="text-xs text-gray-500">
                  Por <span className="font-medium">{item.user}</span> ({item.role})
                </p>
              </div>
              <span className="text-xs text-gray-400">
                {new Date(item.date).toLocaleDateString()}{' '}
                {new Date(item.date).toLocaleTimeString()}
              </span>
            </div>

            <p className="text-sm text-gray-700 mb-3 whitespace-pre-wrap">
              {item.description}
            </p>

            {item.numero_resolucion && (
              <div className="mb-3">
                <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded">
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  Resolución: {item.numero_resolucion}
                </span>
              </div>
            )}

            {item.statusChange && (() => {
              const fromColor = getStatusColor(item.statusChange.from);
              const toColor = getStatusColor(item.statusChange.to);

              return (
                <div className="mb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${fromColor.dot}`}></div>
                      <span className={`text-sm font-medium ${fromColor.text}`}>
                        {item.statusChange.from}
                      </span>
                    </div>

                    <svg
                      className="w-4 h-4 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      />
                    </svg>

                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${toColor.dot}`}></div>
                      <span className={`text-sm font-semibold ${toColor.text}`}>
                        {item.statusChange.to}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })()}

            {item.file && (
              <div className="flex items-center gap-6 mt-4">
                <button
                  onClick={() => handleDownload(item.id)}
                  disabled={downloading === item.id}
                  className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 hover:underline disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {downloading === item.id ? (
                    <>
                      <svg
                        className="animate-spin h-4 w-4"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Descargando...
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                        />
                      </svg>
                      {item.fileName || 'Descargar adjunto'}
                    </>
                  )}
                </button>

                <button
                  onClick={() => handlePreview(item.id)}
                  disabled={previewing.loading && previewing.id === item.id}
                  className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-800 hover:underline disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {previewing.loading && previewing.id === item.id ? (
                     <>
                     <svg
                       className="animate-spin h-4 w-4"
                       xmlns="http://www.w3.org/2000/svg"
                       fill="none"
                       viewBox="0 0 24 24"
                     >
                       <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                       <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                     </svg>
                     Cargando...
                   </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      Previsualizar PDF
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      ))}

      {previewing.url && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-gray-50/50">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="text-base font-semibold text-gray-800">Previsualización de Documento</h3>
              </div>
              <button 
                onClick={closePreview} 
                className="text-gray-400 hover:text-red-500 p-1.5 rounded-full hover:bg-red-50 transition-colors"
                title="Cerrar"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 w-full bg-gray-200 p-2">
              <embed src={previewing.url} type="application/pdf" className="w-full h-full rounded shadow-sm bg-white" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectHistory;

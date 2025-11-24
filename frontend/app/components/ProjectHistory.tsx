'use client';

import { useState } from 'react';
import api from '../lib/api';

interface HistoryItem {
    id: string;
    date: string;
    action: string;
    description: string;
    user: string;
    role: string;
    file: boolean;
    fileName: string | null;
    statusChange: {
        from: string;
        to: string;
    } | null;
}

interface ProjectHistoryProps {
    history: HistoryItem[];
}

export default function ProjectHistory({ history }: ProjectHistoryProps) {
    const handleDownload = (historyId: string) => {
        const url = api.getDownloadUrl(historyId);
        window.open(url, '_blank');
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
                    {/* Timeline Dot */}
                    <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 border-white ${item.action.includes('Entrega') ? 'bg-blue-500' :
                            item.action.includes('Revisión') ? 'bg-purple-500' :
                                item.action.includes('Aprobación') ? 'bg-green-500' : 'bg-gray-400'
                        }`}></div>

                    {/* Content Card */}
                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <h4 className="text-sm font-bold text-gray-900">{item.action}</h4>
                                <p className="text-xs text-gray-500">
                                    Por <span className="font-medium">{item.user}</span> ({item.role})
                                </p>
                            </div>
                            <span className="text-xs text-gray-400">
                                {new Date(item.date).toLocaleDateString()} {new Date(item.date).toLocaleTimeString()}
                            </span>
                        </div>

                        <p className="text-sm text-gray-700 mb-3 whitespace-pre-wrap">{item.description}</p>

                        {/* Status Change Badge */}
                        {item.statusChange && (
                            <div className="flex items-center gap-2 text-xs bg-gray-50 p-2 rounded mb-3">
                                <span className="px-2 py-0.5 rounded-full bg-gray-200 text-gray-700">{item.statusChange.from}</span>
                                <span>→</span>
                                <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium">{item.statusChange.to}</span>
                            </div>
                        )}

                        {/* File Download */}
                        {item.file && (
                            <button
                                onClick={() => handleDownload(item.id)}
                                className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 hover:underline"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                {item.fileName || 'Descargar archivo adjunto'}
                            </button>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}

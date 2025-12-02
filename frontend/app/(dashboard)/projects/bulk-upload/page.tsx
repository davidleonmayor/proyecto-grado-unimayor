'use client';

import Link from 'next/link';
import BulkUploadProjects from '../../../components/BulkUploadProjects';

export default function BulkUploadProjectsPage() {
    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-gray-500 mb-1">Dashboard / Proyectos</p>
                    <h1 className="text-2xl font-bold text-gray-800">Carga masiva de proyectos</h1>
                    <p className="text-sm text-gray-600 mt-1">
                        Sube un archivo Excel (.xlsx o .xls) con los datos completos de proyectos para registrarlos en lote.
                    </p>
                </div>
                <Link
                    href="/dashboard/projects"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Volver a proyectos
                </Link>
            </div>

            <BulkUploadProjects />
        </div>
    );
}


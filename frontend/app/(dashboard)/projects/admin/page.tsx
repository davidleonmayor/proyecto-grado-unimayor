'use client';

import { ChangeEvent, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import api, { BulkUploadSummary } from '../../../lib/api';
import Swal from 'sweetalert2';

interface Project {
    id: string;
    title: string;
    summary: string;
    status: string;
    modality: string;
    program: string;
    faculty: string;
    company: string | null;
    startDate: string;
    endDate: string | null;
    lastUpdate: string;
    actors: Array<{ name: string; role: string }>;
}

export default function AdminProjectsPage() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isImporting, setIsImporting] = useState(false);
    const [importSummary, setImportSummary] = useState<BulkUploadSummary | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const loadProjects = async () => {
        try {
            setIsLoading(true);
            const data = await api.getAllProjects();
            setProjects(data);
            setError(null);
        } catch (err: any) {
            if (err.message.includes('403')) {
                setError('No tienes permisos para acceder a esta sección');
            } else {
                setError('Error al cargar proyectos');
            }
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

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

            if (imported) {
                loadProjects();
            }
        } catch (err: any) {
            const message = err?.message || 'No se pudo procesar el archivo';
            Swal.fire('Error', message, 'error');
        } finally {
            setIsImporting(false);
        }
    };

    useEffect(() => {
        loadProjects();
    }, []);

    const handleDelete = async (projectId: string, projectTitle: string) => {
        const result = await Swal.fire({
            title: '¿Estás seguro?',
            html: `Se eliminará el proyecto:<br/><strong>${projectTitle}</strong>`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            try {
                await api.deleteProject(projectId);
                await Swal.fire('Eliminado', 'Proyecto eliminado exitosamente', 'success');
                loadProjects(); // Refresh list
            } catch (error) {
                Swal.fire('Error', 'No se pudo eliminar el proyecto', 'error');
            }
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6">
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                    {error}
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Administración de Proyectos</h1>
            </div>

            <div className="space-y-6 mb-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
                        <div className="flex-1">
                            <h2 className="text-lg font-semibold text-gray-800">Carga masiva de proyectos</h2>
                            <p className="text-sm text-gray-600 mt-2">
                                Importa múltiples proyectos a la vez usando un archivo Excel. Asegúrate de que los datos
                                hagan referencia a registros existentes en el sistema (modalidades, programas, estados, estudiantes y asesores).
                            </p>
                            <ul className="mt-4 text-sm text-gray-600 list-disc pl-5 space-y-1">
                                <li>
                                    <span className="font-semibold">Columnas obligatorias:</span> Titulo, Modalidad, Estado, Programa, Fecha_inicio, Estudiantes.
                                </li>
                                <li>
                                    <span className="font-semibold">Columnas opcionales:</span> Resumen, Empresa, Fecha_fin, Asesores.
                                </li>
                                <li>Utiliza formato de fecha AAAA-MM-DD. Las listas (estudiantes/asesores) se separan con punto y coma (;).</li>
                                <li>Máximo 2 estudiantes y 2 asesores por fila. Un estudiante no puede repetirse en varios proyectos.</li>
                            </ul>
                        </div>

                        <div className="w-full lg:w-80">
                            <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="bulk-upload">
                                Archivo Excel (.xlsx o .xls)
                            </label>
                            <input
                                id="bulk-upload"
                                ref={fileInputRef}
                                type="file"
                                accept=".xlsx,.xls"
                                onChange={handleFileChange}
                                className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            />
                            <p className="text-xs text-gray-500 mt-2">
                                {selectedFile ? `Archivo seleccionado: ${selectedFile.name}` : 'Tamaño máximo 5MB.'}
                            </p>
                            <button
                                type="button"
                                onClick={handleBulkUpload}
                                disabled={!selectedFile || isImporting}
                                className={`mt-4 inline-flex items-center justify-center px-4 py-2 rounded-md text-sm font-semibold text-white transition-colors ${
                                    !selectedFile || isImporting
                                        ? 'bg-blue-300 cursor-not-allowed'
                                        : 'bg-blue-600 hover:bg-blue-700'
                                }`}
                            >
                                {isImporting ? 'Procesando...' : 'Importar proyectos'}
                            </button>
                        </div>
                    </div>
                </div>

                {importSummary && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-4">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-800">Resumen de importación</h2>
                                <p className="text-sm text-gray-500">
                                    Total filas procesadas: {importSummary.totalRows}
                                </p>
                            </div>
                            <div className="flex flex-wrap gap-3 text-sm">
                                <span className="px-3 py-1 rounded-full bg-green-50 text-green-700 font-medium">
                                    Importados: {importSummary.imported}
                                </span>
                                <span
                                    className={`px-3 py-1 rounded-full font-medium ${
                                        importSummary.failed
                                            ? 'bg-red-50 text-red-700'
                                            : 'bg-gray-100 text-gray-700'
                                    }`}
                                >
                                    Errores: {importSummary.failed}
                                </span>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 text-sm">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">
                                            Fila
                                        </th>
                                        <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">
                                            Estado
                                        </th>
                                        <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">
                                            Título
                                        </th>
                                        <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">
                                            Mensajes
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {importSummary.rows.map((row) => (
                                        <tr key={`${row.row}-${row.title ?? ''}-${row.status}`}>
                                            <td className="px-4 py-3 text-gray-900 font-medium">{row.row}</td>
                                            <td className="px-4 py-3">
                                                <span
                                                    className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                        row.status === 'success'
                                                            ? 'bg-green-100 text-green-800'
                                                            : 'bg-red-100 text-red-800'
                                                    }`}
                                                >
                                                    {row.status === 'success' ? 'Importado' : 'Error'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-gray-900">
                                                {row.title || 'Sin título'}
                                            </td>
                                            <td className="px-4 py-3">
                                                <ul className="list-disc pl-5 space-y-1 text-gray-700">
                                                    {row.messages.map((message, index) => (
                                                        <li key={`${row.row}-message-${index}`}>{message}</li>
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

            {projects.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
                    No hay proyectos registrados.
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Título
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Estado
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Programa
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Modalidad
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actores
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {projects.map((project) => (
                                <tr key={project.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-medium text-gray-900 line-clamp-2">
                                            {project.title}
                                        </div>
                                        {project.summary && (
                                            <div className="text-xs text-gray-500 line-clamp-1">{project.summary}</div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${project.status === 'Aprobado' ? 'bg-green-100 text-green-800' :
                                                project.status === 'Rechazado' ? 'bg-red-100 text-red-800' :
                                                    'bg-yellow-100 text-yellow-800'
                                            }`}>
                                            {project.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-900">{project.program}</div>
                                        <div className="text-xs text-gray-500">{project.faculty}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {project.modality}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-900">
                                            {project.actors.length} {project.actors.length === 1 ? 'persona' : 'personas'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <Link
                                            href={`/dashboard/projects/admin/edit/${project.id}`}
                                            className="text-blue-600 hover:text-blue-900 mr-4"
                                        >
                                            Editar
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(project.id, project.title)}
                                            className="text-red-600 hover:text-red-900"
                                        >
                                            Eliminar
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

"use client";

import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import RoleProtectedRoute from "@/shared/components/layout/RoleProtectedRoute";
import { announcementService } from "@/modules/dashboard/services/announcement.service";

const AnnouncementsPageContent = () => {
    const [announcements, setAnnouncements] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");

    const loadAnnouncements = async () => {
        try {
            setIsLoading(true);
            const res = await announcementService.getAnnouncements();
            setAnnouncements(res);
        } catch (error) {
            console.error("Error cargando anuncios", error);
            Swal.fire("Error", "No se pudieron cargar los anuncios", "error");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadAnnouncements();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!title.trim() || !content.trim()) {
            Swal.fire("Advertencia", "El título y contenido son obligatorios", "warning");
            return;
        }

        const confirmMsg = await Swal.fire({
            title: "¿Crear y Enviar Notificación?",
            text: "Esto enviará un correo masivo a todos los usuarios del sistema. ¿Estás seguro de continuar?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Sí, Enviar",
            cancelButtonText: "Cancelar"
        });

        if (!confirmMsg.isConfirmed) return;

        try {
            setIsSubmitting(true);
            await announcementService.createAnnouncement(title, content);

            Swal.fire("Éxito", "Notificación global enviada exitosamente a todos los usuarios.", "success");
            setTitle("");
            setContent("");
            loadAnnouncements(); // Regargar la lista

        } catch (error) {
            console.error("Error creando anuncio", error);
            Swal.fire("Error", "Ocurrió un error creando el anuncio", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        const confirmMsg = await Swal.fire({
            title: "¿Eliminar Anuncio?",
            text: "El anuncio se ocultará del panel de todos los usuarios de forma permanente.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#ef4444",
            confirmButtonText: "Sí, Eliminar",
            cancelButtonText: "Cancelar"
        });

        if (!confirmMsg.isConfirmed) return;

        try {
            await announcementService.deleteAnnouncement(id);
            loadAnnouncements();
        } catch (error) {
            console.error("Error eliminando", error);
            Swal.fire("Error", "No se pudo eliminar el anuncio", "error");
        }
    }

    return (
        <div className="flex-1 p-4 flex flex-col xl:flex-row gap-6">
            {/* LADO IZQUIERDO: Formulario de Creación */}
            <div className="w-full xl:w-1/3 flex flex-col gap-4">
                <div className="bg-white p-6 rounded-md shadow-sm">
                    <h1 className="text-xl font-bold text-gray-800 mb-4">📢 Crear Nuevo Anuncio</h1>
                    <p className="text-sm text-gray-500 mb-6">
                        Publica un anuncio que será visible en la plataforma. Si eres <strong>Coordinador</strong>, este anuncio y su correo de notificación se enviarán <strong>solo a tu facultad</strong>. Si eres Administrador o Decano, se enviará a todo el sistema de forma global.
                    </p>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-medium text-gray-700">Título del Anuncio</label>
                            <input
                                type="text"
                                className="border border-gray-300 rounded-md p-2 text-sm outline-none focus:ring-2 focus:ring-primary-500"
                                placeholder="Ej: Actualización de Plataforma"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                maxLength={200}
                                disabled={isSubmitting}
                            />
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-medium text-gray-700">Contenido o Mensaje</label>
                            <textarea
                                className="border border-gray-300 rounded-md p-2 text-sm outline-none focus:ring-2 focus:ring-primary-500 min-h-[150px] resize-y"
                                placeholder="Escribe el cuerpo del mensaje..."
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                disabled={isSubmitting}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`mt-2 bg-secondary text-white py-2.5 rounded-md font-semibold transition-colors ${isSubmitting ? "opacity-75 cursor-not-allowed" : "hover:bg-opacity-90"}`}
                        >
                            {isSubmitting ? "Enviando Correos..." : "Publicar y Enviar Correos"}
                        </button>
                    </form>
                </div>
            </div>

            {/* LADO DERECHO: Historial de Anuncios Propios/Generales */}
            <div className="w-full xl:w-2/3 flex flex-col gap-4">
                <div className="bg-white p-6 rounded-md shadow-sm h-full max-h-[calc(100vh-120px)] overflow-hidden flex flex-col">
                    <h2 className="text-lg font-bold text-gray-800 mb-4">Historial de Anuncios</h2>

                    <div className="flex-1 overflow-y-auto pr-2 flex flex-col gap-4">
                        {isLoading ? (
                            <div className="flex justify-center py-10">
                                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
                            </div>
                        ) : announcements.length === 0 ? (
                            <div className="text-center py-10 opacity-60">
                                <span className="text-4xl mb-2 block">📭</span>
                                <p>No hay anuncios publicados aún.</p>
                            </div>
                        ) : (
                            announcements.map((anuncio) => (
                                <div key={anuncio.id_anuncio} className="border border-gray-100 rounded-lg p-4 bg-slate-50 relative group">
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-2 border-b border-gray-200 pb-2">
                                        <h3 className="font-semibold text-gray-800 text-lg">{anuncio.titulo}</h3>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded shadow-sm">
                                                {new Date(anuncio.fecha_creacion).toLocaleDateString("es-CO", { dateStyle: "medium" })}
                                            </span>
                                            <button
                                                onClick={() => handleDelete(anuncio.id_anuncio)}
                                                className="text-red-500 p-1 hover:bg-red-50 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                                                title="Eliminar Anuncio"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed mt-2">{anuncio.contenido}</p>
                                    <div className="mt-3 text-right">
                                        <span className="text-xs font-medium text-gray-400">Escrito por: {anuncio.autor_nombre}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div >
    );
};

export default function AnnouncementsPage() {
    return (
        <RoleProtectedRoute allowedRoles={["admin", "dean"]}>
            <AnnouncementsPageContent />
        </RoleProtectedRoute>
    );
}

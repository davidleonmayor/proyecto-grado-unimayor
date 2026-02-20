'use client';

import { useEffect, useState } from 'react';
import Image from "next/image";
import dateImage from "@/public/date.png";
import phoneImage from "@/public/phone.png";
import emailImage from "@/public/mail.png";
import singleAttendanceImage from "@/public/singleAttendance.png";
import singleBranch from "@/public/singleBranch.png";
import singleClass from "@/public/singleClass.png";
import singleLesson from "@/public/singleLesson.png";
import EventCalendar from '@/modules/events/components/EventCalendar';
import Link from "next/link";
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { personsService } from '@/modules/persons/services/persons.service';


const ProfilePage = () => {
    const { user, loading: authLoading } = useAuth();
    const [profile, setProfile] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [projects, setProjects] = useState<any[]>([]);
    const [roles, setRoles] = useState<string[]>([]);

    useEffect(() => {
        if (user?.id_persona) {
            loadProfile(user.id_persona);
        }
    }, [user]);

    const loadProfile = async (personId: string) => {
        try {
            setIsLoading(true);
            const data = await personsService.getPersonById(personId);
            setProfile(data);

            // Determine user's roles
            const userRoles = new Set<string>();
            data.actores?.forEach((actor: any) => {
                if (actor.tipo_rol?.nombre_rol) {
                    userRoles.add(actor.tipo_rol.nombre_rol);
                }
            });
            setRoles(Array.from(userRoles));

            // Collect all projects (student + teacher)
            const allProjects = [
                ...(data.studentProjects || []),
                ...(data.teacherProjects || [])
            ];
            // Deduplicate by id
            const uniqueProjects = Array.from(
                new Map(allProjects.map((p: any) => [p.id_trabajo_grado, p])).values()
            );
            setProjects(uniqueProjects);
        } catch (error) {
            console.error('Error loading profile:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (authLoading || isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="flex items-center justify-center h-screen">
                <p className="text-gray-500">No se pudo cargar el perfil</p>
            </div>
        );
    }

    const fullName = `${profile.nombres} ${profile.apellidos}`;
    const email = profile.correo_electronico;
    const phone = profile.numero_celular || 'N/A';
    const document = profile.num_doc_identidad || 'N/A';
    const faculty = profile.facultad?.nombre_facultad || profile.programa_academico?.facultad?.nombre_facultad || 'N/A';
    const program = profile.programa_academico?.nombre_programa || null;

    // Build role display
    const roleDisplay = roles.length > 0 ? roles.join(', ') : 'Sin rol asignado';

    // Get first project for quick stats
    const mainProject = projects[0] || null;
    const mainStatus = mainProject?.estado_tg?.nombre_estado || 'Sin proyecto';
    const mainModality = mainProject?.opcion_grado?.nombre_opcion_grado || 'N/A';

    return (
        <div className="flex-1 p-2 sm:p-4 flex flex-col xl:flex-row gap-4">
            {/* LEFT */}
            <div className="w-full xl:w-2/3">
                {/* TOP */}
                <div className="flex flex-col lg:flex-row gap-4">

                    {/* USER INFO CARD */}
                    <div className="bg-pastelBlue py-4 sm:py-6 px-3 sm:px-4 rounded-md flex-1 flex flex-col sm:flex-row gap-3 sm:gap-4">
                        <div className="w-full sm:w-1/3 flex justify-center sm:justify-start">
                            <div className="relative w-24 h-24 sm:w-32 sm:h-32 lg:w-36 lg:h-36 rounded-full overflow-hidden bg-primary-200">
                                <Image
                                    src="/avatar.png"
                                    alt={fullName}
                                    width={144}
                                    height={144}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>
                        <div className="w-full sm:w-2/3 flex flex-col justify-between gap-3 sm:gap-4">
                            <div className="flex flex-col gap-1">
                                <h1 className="text-lg sm:text-xl font-semibold">{fullName}</h1>
                                <p className="text-xs sm:text-sm text-gray-500">
                                    {roleDisplay}{program ? ` · ${program}` : ''}{faculty !== 'N/A' ? ` · ${faculty}` : ''}
                                </p>
                            </div>
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-2 flex-wrap text-xs font-medium">
                                <div className="w-full sm:w-auto flex items-center gap-2">
                                    <Image src={dateImage} alt="fecha" width={14} height={14} />
                                    <span className="break-words">Ingreso: {new Date(profile.fecha_registro).toLocaleDateString('es-CO', { month: 'long', year: 'numeric' })}</span>
                                </div>
                                <div className="w-full sm:w-auto flex items-center gap-2">
                                    <Image src={emailImage} alt="email icon" width={14} height={14} />
                                    <span className="break-all">{email}</span>
                                </div>
                                <div className="w-full sm:w-auto flex items-center gap-2">
                                    <Image src={phoneImage} alt="celular" width={14} height={14} />
                                    <span>{phone}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SMALL CARDS */}
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        <div className="bg-white p-3 sm:p-4 rounded-md flex gap-3 sm:gap-4">
                            <Image src={singleAttendanceImage} alt="" width={24} height={24} className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
                            <div className="min-w-0">
                                <h1 className="text-lg sm:text-xl font-semibold truncate">{mainStatus}</h1>
                                <span className="text-xs sm:text-sm text-gray-400">Estado del proyecto</span>
                            </div>
                        </div>
                        <div className="bg-white p-3 sm:p-4 rounded-md flex gap-3 sm:gap-4">
                            <Image src={singleClass} alt="" width={24} height={24} className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
                            <div className="min-w-0">
                                <h1 className="text-lg sm:text-xl font-semibold truncate">{mainModality}</h1>
                                <span className="text-xs sm:text-sm text-gray-400">Opción de grado</span>
                            </div>
                        </div>
                        <div className="bg-white p-3 sm:p-4 rounded-md flex gap-3 sm:gap-4">
                            <Image src={singleBranch} alt="" width={24} height={24} className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
                            <div className="min-w-0">
                                <h1 className="text-lg sm:text-xl font-semibold">{projects.length}</h1>
                                <span className="text-xs sm:text-sm text-gray-400">Proyecto{projects.length !== 1 ? 's' : ''} asignado{projects.length !== 1 ? 's' : ''}</span>
                            </div>
                        </div>
                        <div className="bg-white p-3 sm:p-4 rounded-md flex gap-3 sm:gap-4">
                            <Image src={singleLesson} alt="" width={24} height={24} className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
                            <div className="min-w-0">
                                <h1 className="text-lg sm:text-xl font-semibold truncate">{roles.length}</h1>
                                <span className="text-xs sm:text-sm text-gray-400">Rol{roles.length !== 1 ? 'es' : ''}</span>
                            </div>
                        </div>
                    </div>

                </div>

                {/* BOTTOM - Personal Info */}
                <div className="mt-4 bg-white rounded-md p-3 sm:p-4">
                    <h1 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Información Personal</h1>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <p className="text-xs text-gray-400">Nombre completo</p>
                            <p className="text-sm font-medium">{fullName}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-400">Documento de identidad</p>
                            <p className="text-sm font-medium">{document}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-400">Correo electrónico</p>
                            <p className="text-sm font-medium break-all">{email}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-400">Número de celular</p>
                            <p className="text-sm font-medium">{phone}</p>
                        </div>
                        {program && (
                            <div>
                                <p className="text-xs text-gray-400">Programa académico</p>
                                <p className="text-sm font-medium">{program}</p>
                            </div>
                        )}
                        <div>
                            <p className="text-xs text-gray-400">Facultad</p>
                            <p className="text-sm font-medium">{faculty}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-400">Roles</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                                {roles.length > 0 ? roles.map(r => (
                                    <span key={r} className="text-xs bg-primary-100 text-primary-800 px-2 py-0.5 rounded-full">{r}</span>
                                )) : (
                                    <span className="text-sm text-gray-500">Sin rol asignado</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Projects Section */}
                {projects.length > 0 ? (
                    <div className="mt-4 bg-white rounded-md p-3 sm:p-4">
                        <h1 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">
                            {projects.length === 1 ? 'Proyecto de Grado' : 'Proyectos de Grado'}
                        </h1>
                        <div className="flex flex-col gap-3">
                            {projects.map((project: any) => {
                                const projectActors = project.actores?.filter((a: any) =>
                                    a.id_persona !== profile.id_persona &&
                                    ['Director', 'Asesor', 'Asesor Externo', 'Estudiante'].includes(a.tipo_rol?.nombre_rol)
                                ) || [];

                                return (
                                    <div key={project.id_trabajo_grado} className="border border-gray-200 rounded-md p-3 sm:p-4">
                                        <h3 className="font-semibold text-base sm:text-lg break-words">
                                            {project.titulo_trabajo || 'Sin título'}
                                        </h3>
                                        <p className="text-xs sm:text-sm text-gray-500 mt-2 break-words">
                                            {project.resumen || 'Sin descripción'}
                                        </p>
                                        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                            <div>
                                                <p className="text-xs text-gray-400">Estado</p>
                                                <p className="text-sm font-medium">{project.estado_tg?.nombre_estado || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-400">Modalidad</p>
                                                <p className="text-sm font-medium">{project.opcion_grado?.nombre_opcion_grado || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-400">Programa</p>
                                                <p className="text-sm font-medium">{project.programa_academico?.nombre_programa || 'N/A'}</p>
                                            </div>
                                            {project.empresa && (
                                                <div>
                                                    <p className="text-xs text-gray-400">Empresa</p>
                                                    <p className="text-sm font-medium">{project.empresa.nombre_empresa || 'N/A'}</p>
                                                </div>
                                            )}
                                        </div>
                                        {projectActors.length > 0 && (
                                            <div className="mt-4">
                                                <p className="text-xs text-gray-400 mb-2">Participantes:</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {projectActors.map((actor: any) => (
                                                        <span
                                                            key={actor.id_actor}
                                                            className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded"
                                                        >
                                                            {actor.persona?.nombres} {actor.persona?.apellidos} ({actor.tipo_rol?.nombre_rol})
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ) : (
                    <div className="mt-4 bg-white rounded-md p-4">
                        <h1 className="text-lg sm:text-xl font-semibold mb-3">Proyecto de Grado</h1>
                        <p className="text-gray-500 text-sm">No tienes proyectos de grado asignados actualmente.</p>
                    </div>
                )}
            </div>

            {/* RIGHT */}
            <div className="w-full xl:w-1/3 flex flex-col gap-3 sm:gap-4">
                <div className="bg-white p-3 sm:p-4 rounded-md">
                    <h1 className="text-lg sm:text-xl font-semibold">Atajos</h1>
                    <div className="mt-3 sm:mt-4 flex gap-2 sm:gap-4 flex-wrap text-xs text-gray-600">
                        <Link href="/projects" className="p-2 sm:p-3 rounded-md bg-pastelBlue hover:bg-pastelBlue/80 transition-colors">
                            Mis Proyectos
                        </Link>
                        <Link href="/list/events" className="p-2 sm:p-3 rounded-md bg-pastelGreen hover:bg-pastelGreen/80 transition-colors">
                            Eventos
                        </Link>
                    </div>
                </div>
                <div className="hidden xl:block">
                    <EventCalendar />
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;

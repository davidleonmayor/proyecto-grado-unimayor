'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
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
import FormModal from '@/shared/components/ui/FormModal';
import RoleProtectedRoute from '@/shared/components/layout/RoleProtectedRoute';
import { personsService } from '@/modules/persons/services/persons.service';


const SingleStudentPageContent = () => {
    const params = useParams();
    const studentId = params.id as string;
    const [student, setStudent] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [project, setProject] = useState<any>(null);

    useEffect(() => {
        loadStudent();
    }, [studentId]);

    const loadStudent = async () => {
        try {
            setIsLoading(true);
            const data = await personsService.getPersonById(studentId);
            setStudent(data);
            setProject(data.studentProjects?.[0] || null);
        } catch (error) {
            console.error('Error loading student:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
            </div>
        );
    }

    if (!student) {
        return (
            <div className="flex items-center justify-center h-screen">
                <p className="text-gray-500">Estudiante no encontrado</p>
            </div>
        );
    }

    const fullName = `${student.nombres} ${student.apellidos}`;
    const email = student.correo_electronico;
    const phone = student.numero_celular || 'N/A';
    const program = student.programa_academico?.nombre_programa || 'N/A';
    const modality = project?.opcion_grado?.nombre_opcion_grado || 'N/A';
    const status = project?.estado_tg?.nombre_estado || 'Sin proyecto';
    const advisors = project?.actores?.filter((a: any) =>
        ['Director', 'Asesor', 'Asesor Externo'].includes(a.tipo_rol?.nombre_rol)
    ) || [];

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
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                                <h1 className="text-lg sm:text-xl font-semibold">{fullName}</h1>
                                <FormModal type="update" table="student" data={student} />
                            </div>
                            <p className="text-xs sm:text-sm text-gray-500">
                                Estudiante de {program}. {project?.titulo_trabajo ? `Proyecto: ${project.titulo_trabajo}` : 'Sin proyecto asignado.'}
                            </p>
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-2 flex-wrap text-xs font-medium">
                                <div className="w-full sm:w-auto flex items-center gap-2">
                                    <Image
                                        src={dateImage}
                                        alt="fecha"
                                        width={14}
                                        height={14}
                                    />
                                    <span className="break-words">Ingreso: {new Date(student.fecha_registro).toLocaleDateString('es-CO', { month: 'long', year: 'numeric' })}</span>
                                </div>
                                <div className="w-full sm:w-auto flex items-center gap-2">
                                    <Image
                                        src={emailImage}
                                        alt="email icon"
                                        width={14}
                                        height={14}
                                    />
                                    <span className="break-all">{email}</span>
                                </div>
                                <div className="w-full sm:w-auto flex items-center gap-2">
                                    <Image
                                        src={phoneImage}
                                        alt="celular"
                                        width={14}
                                        height={14}
                                    />
                                    <span>{phone}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SMALL CARDS */}
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        {/* CARD */}
                        <div className="bg-white p-3 sm:p-4 rounded-md flex gap-3 sm:gap-4">
                            <Image src={singleAttendanceImage} alt="" width={24} height={24} className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
                            <div className="min-w-0">
                                <h1 className="text-lg sm:text-xl font-semibold truncate">{status}</h1>
                                <span className="text-xs sm:text-sm text-gray-400">Estado del proyecto</span>
                            </div>
                        </div>
                        {/* CARD */}
                        <div className="bg-white p-3 sm:p-4 rounded-md flex gap-3 sm:gap-4">
                            <Image src={singleClass} alt="" width={24} height={24} className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
                            <div className="min-w-0">
                                <h1 className="text-lg sm:text-xl font-semibold truncate">{modality}</h1>
                                <span className="text-xs sm:text-sm text-gray-400">Opción de grado</span>
                            </div>
                        </div>
                        {/* CARD */}
                        <div className="bg-white p-3 sm:p-4 rounded-md flex gap-3 sm:gap-4">
                            <Image src={singleBranch} alt="" width={24} height={24} className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
                            <div className="min-w-0">
                                <h1 className="text-lg sm:text-xl font-semibold">{advisors.length}</h1>
                                <span className="text-xs sm:text-sm text-gray-400">Asesor{advisors.length !== 1 ? 'es' : ''} asignado{advisors.length !== 1 ? 's' : ''}</span>
                            </div>
                        </div>
                        {/* CARD */}
                        <div className="bg-white p-3 sm:p-4 rounded-md flex gap-3 sm:gap-4">
                            <Image src={singleLesson} alt="" width={24} height={24} className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
                            <div className="min-w-0">
                                <h1 className="text-lg sm:text-xl font-semibold truncate">{program}</h1>
                                <span className="text-xs sm:text-sm text-gray-400">Programa académico</span>
                            </div>
                        </div>
                    </div>

                </div>
                {/* BOTTOM - Project Details */}
                {project ? (
                    <div className="mt-4 bg-white rounded-md p-3 sm:p-4">
                        <h1 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Proyecto de Grado</h1>
                        <div className="border border-gray-200 rounded-md p-3 sm:p-4">
                            <h3 className="font-semibold text-base sm:text-lg break-words">{project.titulo_trabajo}</h3>
                            <p className="text-xs sm:text-sm text-gray-500 mt-2 break-words">{project.resumen || 'Sin descripción'}</p>
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
                            {advisors.length > 0 && (
                                <div className="mt-4">
                                    <p className="text-xs text-gray-400 mb-2">Asesores:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {advisors.map((advisor: any) => (
                                            <Link
                                                key={advisor.id_actor}
                                                href={`/list/teachers/${advisor.persona?.id_persona}`}
                                                className="text-xs bg-purple-100 hover:bg-purple-200 text-purple-800 px-2 py-1 rounded transition-colors cursor-pointer"
                                            >
                                                {advisor.persona?.nombres} {advisor.persona?.apellidos} ({advisor.tipo_rol?.nombre_rol})
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="mt-4 bg-white rounded-md p-4">
                        <p className="text-gray-500">No hay proyecto asignado</p>
                    </div>
                )}
            </div>
            {/* RIGHT */}
            <div className="w-full xl:w-1/3 flex flex-col gap-3 sm:gap-4">
                <div className="bg-white p-3 sm:p-4 rounded-md">
                    <h1 className="text-lg sm:text-xl font-semibold">Atajos</h1>
                    <div className="mt-3 sm:mt-4 flex gap-2 sm:gap-4 flex-wrap text-xs text-gray-600">
                        {project && (
                            <Link href={`/projects/${project.id_trabajo_grado}`} className="p-2 sm:p-3 rounded-md bg-pastelBlue hover:bg-pastelBlue/80 transition-colors">Ver Proyecto</Link>
                        )}
                        <Link href={"/projects"} className="p-2 sm:p-3 rounded-md bg-pastelBlue hover:bg-pastelBlue/80 transition-colors">Proyectos</Link>
                        <Link href={"/list/events"} className="p-2 sm:p-3 rounded-md bg-pastelGreen hover:bg-pastelGreen/80 transition-colors">Eventos</Link>
                    </div>
                </div>
                <div className="hidden xl:block">
                    <EventCalendar />
                </div>
            </div>
        </div>
    );
}

const SingleStudentPage = () => {
    return (
        <RoleProtectedRoute allowedRoles={['admin', 'teacher', 'dean']}>
            <SingleStudentPageContent />
        </RoleProtectedRoute>
    );
};

export default SingleStudentPage;


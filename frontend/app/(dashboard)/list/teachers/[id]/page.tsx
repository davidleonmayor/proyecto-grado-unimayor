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


const SingleTeacherPageContent = () => {
    const params = useParams();
    const teacherId = params.id as string;
    const [teacher, setTeacher] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [projects, setProjects] = useState<any[]>([]);

    useEffect(() => {
        loadTeacher();
    }, [teacherId]);

    const loadTeacher = async () => {
        try {
            setIsLoading(true);
            const data = await personsService.getPersonById(teacherId);
            setTeacher(data);
            setProjects(data.teacherProjects || []);
        } catch (error) {
            console.error('Error loading teacher:', error);
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

    if (!teacher) {
        return (
            <div className="flex items-center justify-center h-screen">
                <p className="text-gray-500">Profesor no encontrado</p>
            </div>
        );
    }

    const fullName = `${teacher.nombres} ${teacher.apellidos}`;
    const role = teacher.actores?.find((a: any) =>
        ['Director', 'Asesor', 'Asesor Externo'].includes(a.tipo_rol?.nombre_rol)
    )?.tipo_rol?.nombre_rol || 'Profesor';
    const faculty = teacher.facultad?.nombre_facultad || 'N/A';
    const email = teacher.correo_electronico;
    const phone = teacher.numero_celular || 'N/A';
    const totalProjects = projects.length;
    const totalStudents = new Set(
        projects.flatMap((p: any) =>
            p.actores?.filter((a: any) => a.tipo_rol?.nombre_rol === 'Estudiante')
                .map((a: any) => a.persona?.id_persona)
        )
    ).size;
    const uniqueModalities = new Set(
        projects.map((p: any) => p.opcion_grado?.nombre_opcion_grado).filter(Boolean)
    ).size;

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
                                <FormModal table="teacher" type="update" data={teacher} />
                            </div>
                            <p className="text-xs sm:text-sm text-gray-500">
                                {role} de la facultad de {faculty}. {totalProjects > 0 ? `Actualmente dirige ${totalProjects} proyecto${totalProjects > 1 ? 's' : ''} de grado.` : 'Sin proyectos asignados.'}
                            </p>
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-2 flex-wrap text-xs font-medium">
                                <div className="w-full sm:w-auto flex items-center gap-2">
                                    <Image
                                        src={dateImage}
                                        alt="fecha"
                                        width={14}
                                        height={14}
                                    />
                                    <span className="break-words">Ingreso: {new Date(teacher.fecha_registro).toLocaleDateString('es-CO', { month: 'long', year: 'numeric' })}</span>
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
                                <h1 className="text-lg sm:text-xl font-semibold">{totalProjects}</h1>
                                <span className="text-xs sm:text-sm text-gray-400">Proyectos dirigidos</span>
                            </div>
                        </div>
                        {/* CARD */}
                        <div className="bg-white p-3 sm:p-4 rounded-md flex gap-3 sm:gap-4">
                            <Image src={singleClass} alt="" width={24} height={24} className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
                            <div className="min-w-0">
                                <h1 className="text-lg sm:text-xl font-semibold">{totalStudents}</h1>
                                <span className="text-xs sm:text-sm text-gray-400">Estudiantes asignados</span>
                            </div>
                        </div>
                        {/* CARD */}
                        <div className="bg-white p-3 sm:p-4 rounded-md flex gap-3 sm:gap-4">
                            <Image src={singleBranch} alt="" width={24} height={24} className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
                            <div className="min-w-0">
                                <h1 className="text-lg sm:text-xl font-semibold">{uniqueModalities}</h1>
                                <span className="text-xs sm:text-sm text-gray-400">Opciones de Grado supervisadas</span>
                            </div>
                        </div>
                        {/* CARD */}
                        <div className="bg-white p-3 sm:p-4 rounded-md flex gap-3 sm:gap-4">
                            <Image src={singleLesson} alt="" width={24} height={24} className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
                            <div className="min-w-0">
                                <h1 className="text-lg sm:text-xl font-semibold truncate">{faculty}</h1>
                                <span className="text-xs sm:text-sm text-gray-400">Facultad</span>
                            </div>
                        </div>
                    </div>

                </div>
                {/* BOTTOM - Projects List */}
                <div className="mt-4 bg-white rounded-md p-3 sm:p-4">
                    <h1 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Proyectos Dirigidos</h1>
                    {projects.length === 0 ? (
                        <p className="text-sm text-gray-500">No hay proyectos asignados</p>
                    ) : (
                        <div className="space-y-3 sm:space-y-4">
                            {projects.map((project: any) => (
                                <div key={project.id_trabajo_grado} className="border border-gray-200 rounded-md p-3 sm:p-4">
                                    <h3 className="font-semibold text-sm sm:text-base break-words">{project.titulo}</h3>
                                    <p className="text-xs sm:text-sm text-gray-500 mt-1">
                                        Estado: {project.estado_tg?.nombre_estado || 'N/A'}
                                    </p>
                                    <p className="text-xs sm:text-sm text-gray-500">
                                        Modalidad: {project.opcion_grado?.nombre_opcion_grado || 'N/A'}
                                    </p>
                                    <p className="text-xs sm:text-sm text-gray-500 break-words">
                                        Programa: {project.programa_academico?.nombre_programa || 'N/A'}
                                    </p>
                                    <div className="mt-2">
                                        <p className="text-xs text-gray-400">Estudiantes:</p>
                                        <div className="flex flex-wrap gap-2 mt-1">
                                            {project.actores
                                                ?.filter((a: any) => a.tipo_rol?.nombre_rol === 'Estudiante')
                                                .map((a: any) => (
                                                    <Link
                                                        key={a.id_actor}
                                                        href={`/list/students/${a.persona?.id_persona}`}
                                                        className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-800 px-2 py-1 rounded transition-colors cursor-pointer"
                                                    >
                                                        {a.persona?.nombres} {a.persona?.apellidos}
                                                    </Link>
                                                ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            {/* RIGHT */}
            <div className="w-full xl:w-1/3 flex flex-col gap-3 sm:gap-4">
                <div className="bg-white p-3 sm:p-4 rounded-md">
                    <h1 className="text-lg sm:text-xl font-semibold">Atajos</h1>
                    <div className="mt-3 sm:mt-4 flex gap-2 sm:gap-4 flex-wrap text-xs text-gray-600">
                        <Link href={"/projects"} className="p-2 sm:p-3 rounded-md bg-pastelBlue hover:bg-pastelBlue/80 transition-colors">Proyectos</Link>
                        <Link href={"/list/students"} className="p-2 sm:p-3 rounded-md bg-pastelPurple hover:bg-pastelPurple/80 transition-colors">Estudiantes</Link>
                        <Link href={"/list/teachers"} className="p-2 sm:p-3 rounded-md bg-pastelYellow hover:bg-pastelYellow/80 transition-colors">Profesores</Link>
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

const SingleTeacherPage = () => {
    return (
        <RoleProtectedRoute allowedRoles={['admin', 'dean']}>
            <SingleTeacherPageContent />
        </RoleProtectedRoute>
    );
};

export default SingleTeacherPage;


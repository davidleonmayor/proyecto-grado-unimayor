'use client';

import Image from "next/image";
import dateImage from "@/public/date.png";
import phoneImage from "@/public/phone.png";
import emailImage from "@/public/mail.png";
import singleAttendanceImage from "@/public/singleAttendance.png";
import singleBranch from "@/public/singleBranch.png";
import singleClass from "@/public/singleClass.png";
import singleLesson from "@/public/singleLesson.png";
import BigCalendar from "@/app/components/BigCalendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import Announcement from "@/app/components/Announcement";
import Link from "next/link";
import Performance from "@/app/components/Performance";
import FormModal from "@/app/components/FormModal";
import RoleProtectedRoute from "@/app/components/RoleProtectedRoute";

const SingleTeacherPageContent = () => {

    const imageUrl = "https://images.pexels.com/photos/1102341/pexels-photo-1102341.jpeg?auto=compress&cs=tinysrgb&w=1200";

    return (
        <div className="flex-1 p-4 flex flex-col xl:flex-row">
            {/* LEFT */}
            <div className="w-full xl:w-2/3">
                {/* TOP */}
                <div className="flex flex-col lg:flex-row gap-4">

                    {/* USER INFO CARD */}
                    <div className="bg-pastelBlue py-6 px-4 rounded-md flex-1 flex gap-4">
                        <div className="w-1/3">
                            <Image
                                src={imageUrl}
                                alt="image example"
                                width={144}
                                height={144}
                                className="w-36 h-36 rounded-full object-cover"
                            />
                        </div>
                        <div className="w-2/3 flex flex-col justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <h1 className="text-xl font-semibold">Maria</h1>
                                <FormModal table="teacher" type="update" data={{
                                    id: 2,
                                    username: "Laura Gómez",
                                    email: "laura.gomez@unimayor.edu.co",
                                    img:
                                        "https://images.pexels.com/photos/1102341/pexels-photo-1102341.jpeg?auto=compress&cs=tinysrgb&w=1200",
                                    phone: "3102589634",
                                    role: "Tutor",
                                    carrera: "Tecnología en Desarrollo de Software",
                                }} />
                            </div>
                            <p className="text-sm text-gray-500">
                                Profesora titular del programa de Ingeniería Informatica. Experta en inteligencia artificial y
                                con 10 años de experiencia en investigación aplicada.
                            </p>
                            <div className="flex items-center justify-between gap-2 flex-wrap text-xs font-medium">
                                <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
                                    <Image
                                        src={dateImage}
                                        alt="fecha"
                                        width={14}
                                        height={14}
                                    />
                                    <span>Ingreso: Agosto 2020</span>
                                </div>
                                <div className="w-full md:w-1/3 lg:w- 2xl:w-1/3 flex items-center gap-2">
                                    <Image
                                        src={emailImage}
                                        alt="email icon"
                                        width={14}
                                        height={14}
                                    />
                                    <span>maria@unimayor.edu.co</span>
                                </div>
                                <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
                                    <Image
                                        src={phoneImage}
                                        alt="celular"
                                        width={14}
                                        height={14}
                                    />
                                    <span>+57 312 1235678</span>
                                </div>
                            </div>
                        </div>
                    </div>


                    {/* SMALL CARDS */}
                    <div className="flex-1 flex gap-4 justify-between flex-wrap">
                        {/* CARD */}
                        <div className="bg-white p-4 rounded-md flex gap-4 w-full md:w-[48%] xl:w-[45%] 2xl:w-[48%]">
                            <Image src={singleAttendanceImage} alt="" width={24} height={24} className="w-6 h-6" />
                            <div className="">
                                <h1 className="text-xl font-semibold ">5</h1>
                                <span className="text-sm text-gray-400">Proyectos dirigidos</span>
                            </div>
                        </div>
                        {/* CARD */}
                        <div className="bg-white p-4 rounded-md flex gap-4 w-full md:w-[48%] xl:w-[45%] 2xl:w-[48%]">
                            <Image src={singleClass} alt="" width={24} height={24} className="w-6 h-6" />
                            <div className="">
                                <h1 className="text-xl font-semibold ">8</h1>
                                <span className="text-sm text-gray-400">Estudiantes asignados</span>
                            </div>
                        </div>
                        {/* CARD */}
                        <div className="bg-white p-4 rounded-md flex gap-4 w-full md:w-[48%] xl:w-[45%] 2xl:w-[48%]">
                            <Image src={singleBranch} alt="" width={24} height={24} className="w-6 h-6" />
                            <div className="">
                                <h1 className="text-xl font-semibold ">3</h1>
                                <span className="text-sm text-gray-400">Opciones de Grado supervisadas</span>
                            </div>
                        </div>
                        {/* CARD */}
                        <div className="bg-white p-4 rounded-md flex gap-4 w-full md:w-[48%] xl:w-[45%] 2xl:w-[48%]">
                            <Image src={singleLesson} alt="" width={24} height={24} className="w-6 h-6" />
                            <div className="">
                                <h1 className="text-xl font-semibold ">2</h1>
                                <span className="text-sm text-gray-400">Comites academicos</span>
                            </div>
                        </div>
                    </div>

                </div>
                {/* BOTTOM */}
                <div className="mt-4 bg-white rounded-md p-4 h-[800px]">
                    <h1>Horario del profesor</h1>
                    <BigCalendar />
                </div>
            </div>
            {/* RIGHT */}
            <div className="w-full xl:w-1/3 flex flex-col gap-4">
                <div className="bg-white p-4 rounded-md">
                    <h1 className="text-xl font-semibold">Atajos</h1>
                    <div className="mt-4 flex gap-4 flex-wrap text-xs text-gray-600">
                        <Link href={"/projects"} className="p-3 rounded-md bg-pastelBlue">Proyectos</Link>
                        <Link href={"/students"} className="p-3 rounded-md bg-pastelPurple">Estudiantes</Link>
                        <Link href={"/advisors"} className="p-3 rounded-md bg-pastelYellow">Asesores</Link>
                        <Link href={"/evaluations"} className="p-3 rounded-md bg-pastelGreen">Evaluaciones</Link>
                        <Link href={"/documents"} className="p-3 rounded-md bg-pastelRed">Documentos</Link>

                    </div>
                </div>
                <Performance />
                <Announcement />
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

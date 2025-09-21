"use client";

import Image from "next/image";
import { useState } from "react";
import TeacherForm from "./forms/TeacherForm";
import StudentForm from "./forms/StudentForm";

const FormModal = ({ table, type, data, id }:
    {
        table: "teacher" | "student" | "project" | "advisor" | "degreeOption" | "evaluation" | "document" | "career" | "event";
        type: "create" | "update" | "delete";
        data?: any;
        id?: number;
    }
) => {

    const size = type === "create" ? "w-8 h-8" : "w-7 h-7";
    const bgColor = type === "create" ? "bg-principal" : type === "update" ? "bg-pastelBlue" : "bg-pastelRed";

    const [open, setOpen] = useState(false);

    const Form = () => {
        return type === "delete" && id ? (
            <form action="" className="p-4 flex flex-col gap-4">
                <span className="text-center font-medium">Todos los datos se perderan. Estas seguro que deseas eliminar {table}?</span>
                <button className="bg-red-700 text-white py-2 px-4 rounded-md border-none w-max self-center">Eliminar</button>
            </form>
        ) : (
            // <TeacherForm type="create"/>
            // <TeacherForm type="update" data={data}/>
            <StudentForm type="create" />
            // <StudentForm type="update" data={data}/>
        );
    }

    return (
        <>
            <button className={`${size} flex items-center justify-center rounded-full ${bgColor}`}
                onClick={() => setOpen(true)}
            >
                <Image src={`/${type}.png`} alt="" width={16} height={16} />
            </button>
            {open && (
                <div className="w-screen h-screen absolute left-0 top-0 bg-black/60 z-50 flex items-center justify-center">
                    <div className="bg-white p-4 rounded-md relative w-[90%] md:w-[70%] lg:w-[60%] xl:w-[50%] 2xl:w-[40%]">
                        <Form />
                        <div className="absolute top-4 right-4 cursor-pointer" onClick={() => setOpen(false)}>
                            <Image src="/close.png" alt="close image" width={14} height={14} />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default FormModal;
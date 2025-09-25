import { useState } from "react";
import { CareerData, careersData } from "../lib/data";

export const useMessageForm = (careers: CareerData[] = careersData) => {

    const [students, setStudents] = useState([""]);
    const [destinatario, setDestinatario] = useState("");

    const programs = careersData;

    const handleStudentChange = (index: number, value: string) => {
        const newStudents = [...students];
        newStudents[index] = value;
        setStudents(newStudents);
    };

    const addStudent = () => setStudents([...students, ""]);

    const removeStudent = (index: number) => {
        if (students.length === 1) return;
        setStudents(students.filter((_, i) => i !== index));
    }
    const handleClick = (accion: string) => {
        alert(`Acción: ${accion}\nEstudiantes: ${students.join(", ")}\nDestinatario: ${destinatario}`);
    };

    return {
        students,
        handleStudentChange,
        addStudent,
        removeStudent,
        handleClick,
        programs,
        destinatario,
        setDestinatario

    }
}
import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

export const generatePdf = async (data) => {
  try {
    // Carpeta local donde guardar los PDFs
    const pdfDir = path.join(process.cwd(), "storage", "pdfs");

    // Crear carpeta si no existe
    await fs.promises.mkdir(pdfDir, { recursive: true });

    // Ruta del archivo PDF
    const filePath = path.join(pdfDir, `document-${Date.now()}.pdf`);

    // Crear documento y stream
    const doc = new PDFDocument({ margin: 50 });
    const writeStream = fs.createWriteStream(filePath);
    doc.pipe(writeStream);

    // ===== ENCABEZADO ESTÁTICO =====
    doc.fontSize(14).font("Times-Bold").text("FACULTAD DE INGENIERÍA", { align: "center" });
    doc.text("CONSEJO DE FACULTAD", { align: "center" });
    doc.moveDown();

    // Número de referencia (ejemplo fijo)
    doc.fontSize(12).font("Times-Roman");
    doc.text("605.02.02", { align: "center" });
    doc.text("015-2016", { align: "center" });
    doc.moveDown();

    // Fecha y ciudad
    doc.text(`${data.ciudad}, ${data.fecha || "Fecha no especificada"}`, { align: "left" });
    doc.moveDown();

    // Estudiantes
    doc.text("Estudiantes", { underline: true, align: "left" });
    data.estudiantes.forEach((est) => {
      doc.text(est.nombre, { align: "left" });
    });
    doc.moveDown();

    // Programa
    doc.text(`Programa ${data.programa || "N/A"}`, { align: "left" });
    doc.text("Facultad de Ingeniería", { align: "left" });
    doc.moveDown();

    // Saludo
    doc.text("Cordial saludo", { align: "left" });
    doc.moveDown();

    // Comentarios (justificado)
    doc.text(data.comentarios || "Sin comentarios", {
      align: "justify",
      lineGap: 6,
    });
    doc.moveDown();

    // Cierre
    doc.text("Atentamente,", { align: "left" });
    doc.moveDown();

    // Firmante + cargo
    doc.text(data.firmante || "Firma no especificada", { align: "left" });
    doc.text("Presidente Consejo de Facultad", { align: "left" });

    // Finalizar documento
    doc.end();

    // Usamos async/await con una promesa para terminar
    await new Promise((resolve, reject) => {
      writeStream.on("finish", resolve);
      writeStream.on("error", reject);
    });

    console.log(`✅ PDF guardado en: ${filePath}`);
    return filePath;
  } catch (error) {
    console.error("Error al generar PDF: ", error);
    throw error;
  }
};

export interface ReportData {
  titulo: string;
  tipo: string;
  fecha: string;
  generadoPor: string;
  contenido?: any;
}

export function generateReportPDF(data: ReportData) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  canvas.width = 800;
  canvas.height = 1200;

  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#0EA5E9';
  ctx.fillRect(0, 0, canvas.width, 100);
  
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 24px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('REPORTE DE PROYECTOS DE GRADO', canvas.width / 2, 40);
  
  ctx.font = '16px Arial';
  ctx.fillText('Universidad Mayor del Cauca', canvas.width / 2, 70);

  let y = 150;
  ctx.fillStyle = '#000000';
  ctx.font = 'bold 18px Arial';
  ctx.textAlign = 'left';
  ctx.fillText(`Título: ${data.titulo}`, 50, y);
  
  y += 30;
  ctx.font = '14px Arial';
  ctx.fillText(`Tipo: ${data.tipo}`, 50, y);
  
  y += 30;
  ctx.fillText(`Fecha: ${data.fecha}`, 50, y);
  
  y += 30;
  ctx.fillText(`Generado por: ${data.generadoPor}`, 50, y);

  y += 40;
  ctx.strokeStyle = '#CCCCCC';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(50, y);
  ctx.lineTo(canvas.width - 50, y);
  ctx.stroke();

  y += 40;
  ctx.font = 'bold 16px Arial';
  ctx.fillText('Resumen Ejecutivo', 50, y);
  
  y += 30;
  ctx.font = '12px Arial';
  const contenido = data.contenido || 'Este es un reporte generado automáticamente por el sistema de gestión de proyectos de grado.';
  const lines = wrapText(ctx, contenido, canvas.width - 100);
  lines.forEach((line: string) => {
    y += 20;
    ctx.fillText(line, 50, y);
  });

  canvas.toBlob((blob) => {
    if (blob) {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `reporte-${data.titulo.toLowerCase().replace(/\s+/g, '-')}-${data.fecha}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  });
}

function wrapText(context: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = words[0];

  for (let i = 1; i < words.length; i++) {
    const word = words[i];
    const width = context.measureText(currentLine + ' ' + word).width;
    if (width < maxWidth) {
      currentLine += ' ' + word;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  lines.push(currentLine);
  return lines;
}

export function generateReportText(data: ReportData): string {
  return `
========================================
REPORTE DE PROYECTOS DE GRADO
Universidad Mayor del Cauca
========================================

Título: ${data.titulo}
Tipo: ${data.tipo}
Fecha: ${data.fecha}
Generado por: ${data.generadoPor}

----------------------------------------
RESUMEN EJECUTIVO
----------------------------------------

${data.contenido || 'Este es un reporte generado automáticamente por el sistema de gestión de proyectos de grado.'}

========================================
Fin del Reporte
========================================
  `.trim();
}

export function downloadReportAsText(data: ReportData) {
  const text = generateReportText(data);
  const blob = new Blob([text], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `reporte-${data.titulo.toLowerCase().replace(/\s+/g, '-')}-${data.fecha}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}


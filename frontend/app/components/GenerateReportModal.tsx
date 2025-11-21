'use client';

import { useState } from 'react';
import Image from 'next/image';
import closeImage from '@/public/close.png';
import { generateReportPDF, downloadReportAsText, ReportData } from '../lib/reportGenerator';
import { useAuth } from '../contexts/AuthContext';

interface GenerateReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GenerateReportModal({ isOpen, onClose }: GenerateReportModalProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    titulo: '',
    tipo: 'Estadístico',
    contenido: '',
  });
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleGeneratePDF = () => {
    if (!formData.titulo) {
      alert('Por favor ingresa un título para el reporte');
      return;
    }

    setLoading(true);
    const reportData: ReportData = {
      titulo: formData.titulo,
      tipo: formData.tipo,
      fecha: new Date().toLocaleDateString('es-CO'),
      generadoPor: user?.name || 'Usuario',
      contenido: formData.contenido,
    };

    setTimeout(() => {
      generateReportPDF(reportData);
      setLoading(false);
      onClose();
      setFormData({ titulo: '', tipo: 'Estadístico', contenido: '' });
    }, 500);
  };

  const handleGenerateText = () => {
    if (!formData.titulo) {
      alert('Por favor ingresa un título para el reporte');
      return;
    }

    setLoading(true);
    const reportData: ReportData = {
      titulo: formData.titulo,
      tipo: formData.tipo,
      fecha: new Date().toLocaleDateString('es-CO'),
      generadoPor: user?.name || 'Usuario',
      contenido: formData.contenido,
    };

    setTimeout(() => {
      downloadReportAsText(reportData);
      setLoading(false);
      onClose();
      setFormData({ titulo: '', tipo: 'Estadístico', contenido: '' });
    }, 500);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200"
        >
          <Image src={closeImage} alt="close" width={16} height={16} />
        </button>

        <h2 className="text-xl font-bold mb-4">Generar Nuevo Reporte</h2>

        <div className="space-y-4">
          <div>
            <label htmlFor="titulo" className="block text-sm font-semibold text-gray-700 mb-2">
              Título del Reporte
            </label>
            <input
              id="titulo"
              name="titulo"
              type="text"
              value={formData.titulo}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-principal"
              placeholder="Ej: Reporte de proyectos por carrera"
            />
          </div>

          <div>
            <label htmlFor="tipo" className="block text-sm font-semibold text-gray-700 mb-2">
              Tipo de Reporte
            </label>
            <select
              id="tipo"
              name="tipo"
              value={formData.tipo}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-principal"
            >
              <option value="Estadístico">Estadístico</option>
              <option value="Análisis">Análisis</option>
              <option value="Operativo">Operativo</option>
              <option value="Financiero">Financiero</option>
            </select>
          </div>

          <div>
            <label htmlFor="contenido" className="block text-sm font-semibold text-gray-700 mb-2">
              Contenido (Opcional)
            </label>
            <textarea
              id="contenido"
              name="contenido"
              value={formData.contenido}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-principal"
              placeholder="Descripción o resumen del reporte..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={handleGeneratePDF}
              disabled={loading}
              className="flex-1 bg-secondary hover:bg-hoverColor text-white font-semibold py-2 rounded-lg transition-all disabled:opacity-50"
            >
              {loading ? 'Generando...' : 'Generar PDF'}
            </button>
            <button
              onClick={handleGenerateText}
              disabled={loading}
              className="flex-1 bg-principal hover:bg-principalDark text-gray-800 font-semibold py-2 rounded-lg transition-all disabled:opacity-50"
            >
              {loading ? 'Generando...' : 'Generar TXT'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { authService } from '@/modules/auth/services/auth.service';
import Swal from 'sweetalert2';
import { useAvatar } from '@/shared/hooks/useAvatar';

export default function SettingsPage() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('general');
    
    // Simular el cambio de foto de forma global (localStorage)
    const { avatar, updateAvatar } = useAvatar();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const imageUrl = URL.createObjectURL(file);
            updateAvatar(imageUrl);
            Swal.fire({
                icon: 'success',
                title: 'Foto actualizada',
                text: 'La foto de perfil se ha actualizado correctamente.',
                confirmButtonColor: '#0ea5e9'
            });
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    const handleDeleteImage = () => {
        updateAvatar(null);
        Swal.fire({
            icon: 'info',
            title: 'Foto eliminada',
            text: 'Se ha restaurado el avatar por defecto.',
            confirmButtonColor: '#0ea5e9'
        });
    };

    // Password Update Logic
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState(0);

    const handlePasswordChange = (value: string) => {
        setNewPassword(value);
        let strength = 0;
        if (value.length >= 8) strength++;
        if (/[a-z]/.test(value)) strength++;
        if (/[A-Z]/.test(value)) strength++;
        if (/[0-9]/.test(value)) strength++;
        if (/[@$!%*?&]/.test(value)) strength++;
        setPasswordStrength(strength);
    };

    const handleUpdatePassword = async () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            Swal.fire('Error', 'Todos los campos son obligatorios', 'error');
            return;
        }
        if (newPassword !== confirmPassword) {
            Swal.fire('Error', 'Las contraseñas nuevas no coinciden', 'error');
            return;
        }

        if (passwordStrength < 4) {
            Swal.fire('Error', 'La contraseña no cumple con los requisitos mínimos de seguridad', 'error');
            return;
        }
        
        try {
            setIsUpdatingPassword(true);
            await authService.updatePassword(currentPassword, newPassword);
            Swal.fire({
                icon: 'success',
                title: '¡Contraseña actualizada!',
                text: 'Tu contraseña ha sido modificada con éxito.',
                confirmButtonColor: '#0ea5e9'
            });
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setPasswordStrength(0);
        } catch (error: any) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message || 'No se pudo actualizar la contraseña.',
                confirmButtonColor: '#0ea5e9'
            });
        } finally {
            setIsUpdatingPassword(false);
        }
    };

    const tabs = [
        { id: 'general', label: 'General', icon: '/profile.png' },
        { id: 'security', label: 'Seguridad', icon: '/validation.png' },
    ];

    return (
        <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto w-full">
            <div className="mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Ajustes</h1>
                <p className="text-sm text-gray-500 mt-1">Administra la configuración de tu cuenta y seguridad.</p>
            </div>

            <div className="flex flex-col md:flex-row gap-8">
                {/* Tabs / Navigation */}
                <div className="w-full md:w-64 shrink-0">
                    <nav className="flex md:flex-col gap-2 overflow-x-auto pb-4 md:pb-0 hide-scrollbar">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center justify-start gap-3 px-4 py-3 rounded-md transition-all duration-300 ease-in-out whitespace-nowrap ${
                                    activeTab === tab.id
                                        ? 'bg-secondary-50 text-secondary-700 font-semibold shadow-sm ring-1 ring-secondary-100'
                                        : 'text-gray-500 hover:bg-hoverColor hover:text-white hover:font-semibold hover:scale-105 hover:shadow-lg'
                                }`}
                            >
                                <Image 
                                    src={tab.icon} 
                                    alt={tab.label} 
                                    width={20} 
                                    height={20} 
                                    className={`shrink-0 transition-opacity ${activeTab === tab.id ? 'opacity-100' : 'opacity-50 group-hover:opacity-80'}`}
                                />
                                <span className="text-sm">{tab.label}</span>
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Content Area */}
                <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden min-h-[500px]">
                    {/* General Tab */}
                    {activeTab === 'general' && (
                        <div className="p-6 sm:p-8 animate-in">
                            <h2 className="text-xl font-semibold text-gray-900 mb-6">Información General</h2>
                            <div className="space-y-6">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 pb-6 border-b border-gray-100">
                                    <div className="w-20 h-20 rounded-full bg-secondary-100 flex items-center justify-center shrink-0 border-4 border-white shadow-md relative overflow-hidden">
                                         <Image src={avatar} alt="Avatar" fill className="object-cover" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-900">Foto de perfil</h3>
                                        <p className="text-xs text-gray-500 mt-1 mb-3">PNG o JPG max. 2MB</p>
                                        <div className="flex gap-3">
                                            <input 
                                                type="file" 
                                                accept="image/png, image/jpeg" 
                                                className="hidden" 
                                                ref={fileInputRef} 
                                                onChange={handleImageChange} 
                                            />
                                            <button 
                                                onClick={triggerFileInput} 
                                                className="px-4 py-2 bg-secondary-500 text-white text-xs font-semibold rounded-lg hover:bg-secondary-600 transition-colors shadow-sm"
                                            >
                                                Cambiar
                                            </button>
                                            {avatar !== '/avatar.png' && (
                                                <button 
                                                    onClick={handleDeleteImage}
                                                    className="px-4 py-2 bg-white border border-gray-200 text-rose-600 text-xs font-medium rounded-lg hover:bg-rose-50 transition-colors"
                                                >
                                                    Eliminar
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-2">Nombres</label>
                                        <input type="text" disabled defaultValue={user?.nombres || ''} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-500 cursor-not-allowed focus:outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-2">Apellidos</label>
                                        <input type="text" disabled defaultValue={user?.apellidos || ''} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-500 cursor-not-allowed focus:outline-none" />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-medium text-gray-700 mb-2">Correo Electrónico Institucional</label>
                                        <input type="email" disabled defaultValue={user?.correo_electronico || ''} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-500 cursor-not-allowed focus:outline-none" />
                                        <p className="text-[11px] text-gray-400 mt-2">La información básica se sincroniza automáticamente con el directorio activo y no puede ser modificada aquí.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Security Tab */}
                    {activeTab === 'security' && (
                        <div className="p-6 sm:p-8 animate-in">
                            <h2 className="text-xl font-semibold text-gray-900 mb-6">Seguridad</h2>
                            
                            <div className="space-y-8">
                                <div>
                                    <h3 className="text-base font-medium text-gray-900 mb-4">Cambiar Contraseña</h3>
                                    <div className="space-y-4 max-w-md">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-2">Contraseña actual</label>
                                            <input 
                                                type="password" 
                                                placeholder="••••••••" 
                                                value={currentPassword}
                                                onChange={(e) => setCurrentPassword(e.target.value)}
                                                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm text-gray-900 focus:ring-2 focus:ring-secondary-500 focus:border-secondary-500 outline-none transition-all" 
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-2">Nueva contraseña</label>
                                            <input 
                                                type="password" 
                                                placeholder="••••••••" 
                                                value={newPassword}
                                                onChange={(e) => handlePasswordChange(e.target.value)}
                                                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm text-gray-900 focus:ring-2 focus:ring-secondary-500 focus:border-secondary-500 outline-none transition-all" 
                                            />
                                            {newPassword && (
                                                <div className="mt-2">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className="text-[10px] text-gray-600">Fortaleza:</span>
                                                        <span className={`text-[10px] font-semibold ${passwordStrength <= 2 ? 'text-red-500' : passwordStrength === 3 ? 'text-yellow-500' : passwordStrength === 4 ? 'text-blue-500' : 'text-green-500'}`}>
                                                            {passwordStrength <= 2 ? 'Débil' : passwordStrength === 3 ? 'Media' : passwordStrength === 4 ? 'Buena' : 'Excelente'}
                                                        </span>
                                                    </div>
                                                    <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                                                        <div
                                                            className={`h-full transition-all duration-300 ${passwordStrength <= 2 ? 'bg-red-500' : passwordStrength === 3 ? 'bg-yellow-500' : passwordStrength === 4 ? 'bg-blue-500' : 'bg-green-500'}`}
                                                            style={{ width: `${(passwordStrength / 5) * 100}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-2">Confirmar nueva contraseña</label>
                                            <input 
                                                type="password" 
                                                placeholder="••••••••" 
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm text-gray-900 focus:ring-2 focus:ring-secondary-500 focus:border-secondary-500 outline-none transition-all" 
                                            />
                                            {confirmPassword && newPassword !== confirmPassword && (
                                                <p className="mt-1 text-xs text-red-500">Las contraseñas no coinciden</p>
                                            )}
                                        </div>

                                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                                            <p className="text-[11px] font-semibold text-gray-600 mb-2 uppercase tracking-wider">Requisitos mínimos:</p>
                                            <ul className="text-[11px] text-gray-500 space-y-1.5">
                                                <li className={`flex items-center gap-2 ${newPassword.length >= 8 ? 'text-green-600 font-medium' : ''}`}>
                                                    <span className={`w-1 h-1 rounded-full ${newPassword.length >= 8 ? 'bg-green-600' : 'bg-gray-400'}`}></span>
                                                    Al menos 8 caracteres
                                                </li>
                                                <li className={`flex items-center gap-2 ${/[A-Z]/.test(newPassword) ? 'text-green-600 font-medium' : ''}`}>
                                                    <span className={`w-1 h-1 rounded-full ${/[A-Z]/.test(newPassword) ? 'bg-green-600' : 'bg-gray-400'}`}></span>
                                                    Una letra mayúscula
                                                </li>
                                                <li className={`flex items-center gap-2 ${/[0-9]/.test(newPassword) ? 'text-green-600 font-medium' : ''}`}>
                                                    <span className={`w-1 h-1 rounded-full ${/[0-9]/.test(newPassword) ? 'bg-green-600' : 'bg-gray-400'}`}></span>
                                                    Un número
                                                </li>
                                                <li className={`flex items-center gap-2 ${/[@$!%*?&]/.test(newPassword) ? 'text-green-600 font-medium' : ''}`}>
                                                    <span className={`w-1 h-1 rounded-full ${/[@$!%*?&]/.test(newPassword) ? 'bg-green-600' : 'bg-gray-400'}`}></span>
                                                    Un carácter especial (@$!%*?&)
                                                </li>
                                            </ul>
                                        </div>

                                        <button 
                                            onClick={handleUpdatePassword}
                                            disabled={isUpdatingPassword || passwordStrength < 4 || newPassword !== confirmPassword}
                                            className="px-5 py-2.5 bg-secondary-500 hover:bg-secondary-600 text-white text-sm font-semibold rounded-xl transition-all shadow-sm mt-2 w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95"
                                        >
                                            {isUpdatingPassword ? 'Actualizando...' : 'Actualizar contraseña'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </div>
            
            <style jsx global>{`
                .hide-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .hide-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
                @keyframes slide-in {
                    from { opacity: 0; transform: translateY(8px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-in {
                    animation: slide-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
            `}</style>
        </div>
    );
}

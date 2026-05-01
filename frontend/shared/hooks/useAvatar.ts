'use client';

import { useState, useEffect } from 'react';

export const useAvatar = () => {
    const [avatar, setAvatar] = useState('/avatar.png');

    useEffect(() => {
        const storedAvatar = localStorage.getItem('userAvatar');
        if (storedAvatar) {
            setAvatar(storedAvatar);
        }

        const handleAvatarChange = () => {
            const updatedAvatar = localStorage.getItem('userAvatar');
            setAvatar(updatedAvatar || '/avatar.png');
        };

        window.addEventListener('avatarChanged', handleAvatarChange);
        return () => window.removeEventListener('avatarChanged', handleAvatarChange);
    }, []);

    const updateAvatar = (imageUrl: string | null) => {
        if (imageUrl) {
            localStorage.setItem('userAvatar', imageUrl);
        } else {
            localStorage.removeItem('userAvatar');
        }
        window.dispatchEvent(new Event('avatarChanged'));
    };

    return { avatar, updateAvatar };
};

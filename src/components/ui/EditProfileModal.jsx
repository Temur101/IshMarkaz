import { useState, useEffect } from 'react';
import { X, Briefcase, MapPin, Phone, Award, Plus, Trash2, Link as LinkIcon, Camera, Loader2, User } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { useLanguage } from '../../context/LanguageContext';
import { Button } from './Button';
import { Input } from './Input';
import { useAuth } from '../../context/AuthContext';

export const EditProfileModal = ({ isOpen, onClose }) => {
    const { t } = useLanguage();
    const { user, updateProfile } = useAuth();

    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        role: '',
        location: '',
        phone: '',
        skills: '',
        social_links: [],
        avatar_url: ''
    });

    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState('');
    const [isUploading, setIsUploading] = useState(false);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen && user) {
            setFormData({
                first_name: user.user_metadata?.first_name || '',
                last_name: user.user_metadata?.last_name || '',
                role: user.user_metadata?.role || '',
                location: user.user_metadata?.location || '',
                phone: user.user_metadata?.phone || '',
                skills: user.user_metadata?.skills || '',
                social_links: user.user_metadata?.social_links || [],
                avatar_url: user.user_metadata?.avatar_url || ''
            });
            setAvatarPreview(user.user_metadata?.avatar_url || '');
            setAvatarFile(null);
        }
    }, [isOpen, user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSocialChange = (index, field, value) => {
        const newSocialLinks = [...formData.social_links];
        newSocialLinks[index] = { ...newSocialLinks[index], [field]: value };
        setFormData(prev => ({ ...prev, social_links: newSocialLinks }));
    };

    const addSocialLink = () => {
        if (formData.social_links.length < 5) {
            setFormData(prev => ({
                ...prev,
                social_links: [...prev.social_links, { platform: '', value: '' }]
            }));
        }
    };

    const removeSocialLink = (index) => {
        const newSocialLinks = formData.social_links.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, social_links: newSocialLinks }));
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validation
        if (!file.type.startsWith('image/')) {
            setError('Пожалуйста, выберите изображение');
            return;
        }
        if (file.size > 2 * 1024 * 1024) {
            setError('Размер файла не должен превышать 2МБ');
            return;
        }

        setAvatarFile(file);
        const reader = new FileReader();
        reader.onloadend = () => {
            setAvatarPreview(reader.result);
        };
        reader.readAsDataURL(file);
    };

    const uploadAvatar = async () => {
        if (!avatarFile || !user) return formData.avatar_url;

        setIsUploading(true);
        try {
            const fileExt = avatarFile.name.split('.').pop();
            const filePath = `${user.id}/avatar.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, avatarFile, {
                    upsert: true,
                    contentType: avatarFile.type
                });

            if (uploadError) throw uploadError;

            // Get signed URL (since bucket is private)
            // Note: In real app, we might store the path and sign on demand, 
            // but for simple immediate UI update, we store the signed URL or path.
            // Requirement says "Save URL in profiles.avatar_url". 
            // We'll get a temporary signed URL to show it immediately, but store the path or path-based URL.
            // For Supabase, private buckets require signed URLs.
            const { data: signedData, error: signedError } = await supabase.storage
                .from('avatars')
                .createSignedUrl(filePath, 315360000); // 10 years

            if (signedError) throw signedError;
            return signedData.signedUrl;

        } catch (err) {
            console.error('Upload error:', err);
            setError('Ошибка при загрузке аватара');
            return formData.avatar_url;
        } finally {
            setIsUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        let currentAvatarUrl = formData.avatar_url;
        if (avatarFile) {
            currentAvatarUrl = await uploadAvatar();
        }

        const dataToUpdate = { ...formData, avatar_url: currentAvatarUrl };
        const { error } = await updateProfile(dataToUpdate);

        if (error) {
            setError(error.message);
        } else {
            onClose();
        }
        setIsSubmitting(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-lg bg-[#0F0F11] border border-white/10 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-6 border-b border-white/5">
                    <h2 className="text-xl font-bold text-white">Редактировать профиль</h2>
                    <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                    <form id="edit-profile-form" className="space-y-6" onSubmit={handleSubmit}>
                        {/* Avatar Section */}
                        <div className="flex flex-col items-center gap-4 py-2">
                            <div className="relative group">
                                <div className="w-24 h-24 rounded-full bg-brand-black border-2 border-white/10 flex items-center justify-center overflow-hidden shadow-xl">
                                    {avatarPreview ? (
                                        <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <User size={40} className="text-white/20" />
                                    )}
                                    {(isSubmitting || isUploading) && (
                                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                            <Loader2 size={24} className="text-brand-orange animate-spin" />
                                        </div>
                                    )}
                                </div>
                                <label className="absolute bottom-0 right-0 w-8 h-8 bg-brand-orange rounded-full flex items-center justify-center cursor-pointer border-2 border-[#0F0F11] hover:scale-110 transition-transform shadow-lg">
                                    <Camera size={16} className="text-white" />
                                    <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} disabled={isSubmitting || isUploading} />
                                </label>
                            </div>
                            <div className="text-center">
                                <h3 className="text-sm font-bold text-brand-orange uppercase tracking-wider">Аватар</h3>
                                <p className="text-[10px] text-brand-muted mt-1">JPG, PNG (Max 2MB)</p>
                            </div>
                        </div>

                        <div className="space-y-4 pt-4 border-t border-white/5">
                            <h3 className="text-sm font-bold text-brand-orange uppercase tracking-wider">Основная информация</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <Input
                                    label="Имя"
                                    name="first_name"
                                    value={formData.first_name}
                                    onChange={handleChange}
                                    placeholder="Иван"
                                />
                                <Input
                                    label="Фамилия"
                                    name="last_name"
                                    value={formData.last_name}
                                    onChange={handleChange}
                                    placeholder="Иванов"
                                />
                            </div>

                            <Input
                                label="Профессия"
                                icon={<Briefcase size={16} />}
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                placeholder="UI/UX Designer"
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <Input
                                    label="Местоположение"
                                    icon={<MapPin size={16} />}
                                    name="location"
                                    value={formData.location}
                                    onChange={handleChange}
                                    placeholder="Россия, Москва"
                                />
                                <Input
                                    label="Телефон"
                                    icon={<Phone size={16} />}
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="+7 (999) 000-00-00"
                                />
                            </div>

                            <div className="flex flex-col gap-1.5 w-full">
                                <label className="text-sm font-medium text-brand-muted pl-1 flex items-center gap-2">
                                    <Award size={16} /> Навыки (через запятую)
                                </label>
                                <textarea
                                    name="skills"
                                    value={formData.skills}
                                    onChange={handleChange}
                                    placeholder="React, Node.js, Figma..."
                                    className="w-full px-4 py-3 rounded-lg bg-brand-gray border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange min-h-[80px] resize-y"
                                />
                            </div>
                        </div>

                        <div className="space-y-4 pt-4 border-t border-white/5">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-bold text-brand-orange uppercase tracking-wider">Социальные сети</h3>
                                <span className="text-[10px] text-brand-muted">{formData.social_links.length}/5</span>
                            </div>

                            <div className="space-y-3">
                                {formData.social_links.map((link, index) => (
                                    <div key={index} className="flex gap-2 items-end group">
                                        <div className="flex-1 grid grid-cols-2 gap-2">
                                            <Input
                                                placeholder="Платформа"
                                                value={link.platform}
                                                onChange={(e) => handleSocialChange(index, 'platform', e.target.value)}
                                            />
                                            <Input
                                                placeholder="Значение (@username)"
                                                value={link.value}
                                                onChange={(e) => handleSocialChange(index, 'value', e.target.value)}
                                            />
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="text-red-500 hover:text-red-400 p-2 h-10 border-white/10"
                                            onClick={() => removeSocialLink(index)}
                                        >
                                            <Trash2 size={16} />
                                        </Button>
                                    </div>
                                ))}

                                {formData.social_links.length < 5 && (
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        className="w-full border-dashed border-2 bg-transparent hover:bg-white/5"
                                        onClick={addSocialLink}
                                    >
                                        <Plus size={16} className="mr-2" /> Добавить соцсеть
                                    </Button>
                                )}
                            </div>
                        </div>

                        {error && (
                            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-sm rounded-lg text-center">
                                {error}
                            </div>
                        )}
                    </form>
                </div>

                <div className="p-6 border-t border-white/5 flex justify-end gap-3 bg-[#0F0F11] rounded-b-2xl">
                    <Button variant="ghost" onClick={onClose}>Отмена</Button>
                    <Button type="submit" form="edit-profile-form" disabled={isSubmitting}>
                        {isSubmitting ? "Сохранение..." : "Сохранить"}
                    </Button>
                </div>
            </div>
        </div>
    );
};

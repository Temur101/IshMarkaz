import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { Button } from './Button';
import { Input } from './Input';
import { useTasks } from '../../context/TaskContext';
import { useAuth } from '../../context/AuthContext';

export const JobCreationModal = ({ isOpen, onClose, initialData = null }) => {
    const { t, language } = useLanguage();
    const { addTask, updateTask } = useTasks();
    const { user } = useAuth();
    const isEditMode = !!initialData;

    const [formData, setFormData] = useState({
        companyName: '',
        jobTitle: '',
        jobType: '',
        shortDescription: '',
        fullDescription: '',
        salary: '',
        duration: '',
        workSchedule: '',
        tags: '',
        workers_needed: 1,
        criteriaCount: 0,
        evaluationList: [],
        duration_value: 1,
        duration_unit: 'days'
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    // Reset form when modal opens or initialData changes
    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                // Map initialData (task) to formData
                const getJobTypeFromTask = (task) => {
                    const taskType = task.original_type || task.originalType || task.type;
                    if (typeof taskType === 'object') return 'fullTime'; // fallback
                    if (taskType === 'Trial Week') return 'trialWeek';
                    if (taskType === 'Task') return 'temporary';
                    if (task.experience_level === 'No Experience' || task.experienceLevel === 'No Experience') return 'noExperience';
                    return 'fullTime';
                };

                const getLocalizedValue = (val) => {
                    if (typeof val === 'object' && val !== null) {
                        return val[language] || val['en'] || '';
                    }
                    return val || '';
                };

                setFormData({
                    companyName: initialData.company || '',
                    jobTitle: getLocalizedValue(initialData.title),
                    jobType: getJobTypeFromTask(initialData),
                    shortDescription: getLocalizedValue(initialData.description).substring(0, 100), // fallback if short desc not separate
                    fullDescription: getLocalizedValue(initialData.description),
                    salary: initialData.payment || '',
                    duration: '', // duration mapping is complex, leaving empty for now or could try to match
                    workSchedule: '',
                    tags: initialData.tags ? initialData.tags.join(', ') : '',
                    workers_needed: initialData.workers_needed || 1,
                    criteriaCount: initialData.evaluationList ? initialData.evaluationList.length : 0,
                    evaluationList: initialData.evaluationList ? initialData.evaluationList.map(c => getLocalizedValue(c)) : [],
                    duration_value: initialData.duration_value || 1,
                    duration_unit: initialData.duration_unit || 'days'
                });
            } else {
                setFormData({
                    companyName: '',
                    jobTitle: '',
                    jobType: '',
                    shortDescription: '',
                    fullDescription: '',
                    salary: '',
                    duration: '',
                    workSchedule: '',
                    tags: '',
                    workers_needed: 1,
                    criteriaCount: 0,
                    evaluationList: [],
                    duration_value: 1,
                    duration_unit: 'days'
                });
            }
        }
    }, [isOpen, initialData, language]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'criteriaCount') {
            const count = Math.max(0, parseInt(value) || 0);
            setFormData(prev => ({
                ...prev,
                criteriaCount: count,
                evaluationList: Array(count).fill('').map((_, i) => prev.evaluationList[i] || '')
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleCriterionChange = (index, value) => {
        const newList = [...formData.evaluationList];
        newList[index] = value;
        setFormData(prev => ({ ...prev, evaluationList: newList }));
    };

    const isValid =
        formData.companyName &&
        formData.jobTitle &&
        formData.jobType &&
        formData.shortDescription &&
        formData.fullDescription &&
        formData.salary;

    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isValid) return;

        setIsSubmitting(true);
        setError('');

        try {
            const getTypeLabel = (type) => {
                return {
                    en: t('jobCreation.types.' + type, { lng: 'en' }) || type,
                    ru: t('jobCreation.types.' + type, { lng: 'ru' }) || type,
                    uz: t('jobCreation.types.' + type, { lng: 'uz' }) || type
                };
            };

            const getExperienceLevel = (type) => {
                switch (type) {
                    case 'trialWeek': return "Mid-Level";
                    case 'fullTime': return "Senior";
                    case 'temporary': return "Any";
                    case 'noExperience': return "No Experience";
                    default: return "Mid-Level";
                }
            };

            const getDurationLabel = (dur) => {
                if (!dur) return null;
                const map = {
                    '1-2 days': { en: '1-2 days', ru: '1-2 дня', uz: '1-2 kun' },
                    '1 week': { en: '1 week', ru: '1 неделя', uz: '1 hafta' },
                    'Permanent': { en: 'Permanent', ru: 'Постоянно', uz: 'Doimiy' }
                };
                return map[dur] || { en: dur, ru: dur, uz: dur };
            };

            const taskData = {
                title: {
                    en: formData.jobTitle,
                    ru: formData.jobTitle,
                    uz: formData.jobTitle
                },
                company: formData.companyName,
                category: initialData?.category || {
                    en: "New Opportunity",
                    ru: "Новая вакансия",
                    uz: "Yangi imkoniyat"
                },
                type: getTypeLabel(formData.jobType),
                time_required: getDurationLabel(formData.duration) || {
                    en: formData.workSchedule || "Full-time",
                    ru: formData.workSchedule || "Полный день",
                    uz: formData.workSchedule || "To'liq kun"
                },
                payment: formData.salary,
                description: {
                    en: formData.fullDescription,
                    ru: formData.fullDescription,
                    uz: formData.fullDescription
                },
                tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : [],
                experience_level: getExperienceLevel(formData.jobType),
                evaluation_list: formData.evaluationList.filter(c => c.trim() !== "").map(c => ({
                    en: c, ru: c, uz: c
                })),
                original_type: formData.jobType === 'trialWeek' || formData.jobType === 'Trial Week' ? "Trial Week" :
                    formData.jobType === 'temporary' || formData.jobType === 'Task' ? "Task" : "Full-time",
                workers_needed: parseInt(formData.workers_needed) || 1,
                user_id: user?.id || 'anonymous',
                duration_value: formData.jobType === 'temporary' ? parseInt(formData.duration_value) : null,
                duration_unit: formData.jobType === 'temporary' ? formData.duration_unit : null
            };

            let result;
            if (isEditMode) {
                taskData.id = initialData.id;
                result = await updateTask(taskData);
            } else {
                result = await addTask(taskData);
            }

            if (result.error) {
                setError(result.error.message || 'Error saving job');
            } else {
                onClose();
            }
        } catch (err) {
            console.error('Job submission error:', err);
            setError('An unexpected error occurred');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative w-full max-w-2xl bg-[#0F0F11] border border-white/10 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/5">
                    <h2 className="text-xl font-bold text-white">
                        {isEditMode ? t('jobCreation.editModalTitle') || "Update Job" : t('jobCreation.modalTitle')}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-white/40 hover:text-white transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Body (Scrollable) */}
                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                    <form className="space-y-6" onSubmit={handleSubmit}>

                        {/* Company & Job Title Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label={t('jobCreation.companyName')}
                                name="companyName"
                                value={formData.companyName}
                                onChange={handleChange}
                                placeholder={t('jobCreation.companyNamePlaceholder')}
                                required
                            />
                            <Input
                                label={t('jobCreation.jobTitle')}
                                name="jobTitle"
                                value={formData.jobTitle}
                                onChange={handleChange}
                                placeholder={t('jobCreation.jobTitlePlaceholder')}
                                required
                            />
                        </div>

                        {/* Job Type Dropdown */}
                        <div className="flex flex-col gap-1.5 w-full">
                            <label className="text-sm font-medium text-brand-muted pl-1">
                                {t('jobCreation.jobType')}
                            </label>
                            <div className="relative">
                                <select
                                    name="jobType"
                                    value={formData.jobType}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-lg bg-brand-gray border border-white/10 text-white focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange appearance-none cursor-pointer"
                                    required
                                >
                                    <option value="" disabled>{t('jobCreation.selectOption') || "Select option"}</option>
                                    <option value="trialWeek">{t('jobCreation.types.trialWeek')}</option>
                                    <option value="fullTime">{t('jobCreation.types.fullTime')}</option>
                                    <option value="temporary">{t('jobCreation.types.temporary')}</option>
                                    <option value="noExperience">{t('jobCreation.types.noExperience')}</option>
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/30">
                                    <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Duration for Temporary Job */}
                        {formData.jobType === 'temporary' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-white/5 rounded-xl border border-white/5">
                                <Input
                                    label={language === 'ru' ? 'Длительность' : 'Duration'}
                                    name="duration_value"
                                    type="number"
                                    min="1"
                                    value={formData.duration_value}
                                    onChange={handleChange}
                                    required
                                />
                                <div className="flex flex-col gap-1.5 w-full">
                                    <label className="text-sm font-medium text-brand-muted pl-1">
                                        {language === 'ru' ? 'Единица измерения' : 'Unit'}
                                    </label>
                                    <div className="relative">
                                        <select
                                            name="duration_unit"
                                            value={formData.duration_unit}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 rounded-lg bg-brand-gray border border-white/10 text-white focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange appearance-none cursor-pointer"
                                            required
                                        >
                                            <option value="hours">{language === 'ru' ? 'Часов' : 'Hours'}</option>
                                            <option value="days">{language === 'ru' ? 'Дней' : 'Days'}</option>
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/30">
                                            <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Short Description */}
                        <Input
                            label={t('jobCreation.shortDescription')}
                            name="shortDescription"
                            value={formData.shortDescription}
                            onChange={handleChange}
                            placeholder={t('jobCreation.shortDescriptionPlaceholder')}
                            required
                        />

                        {/* Full Description (Textarea) */}
                        <div className="flex flex-col gap-1.5 w-full">
                            <label className="text-sm font-medium text-brand-muted pl-1">
                                {t('jobCreation.fullDescription')}
                            </label>
                            <textarea
                                name="fullDescription"
                                value={formData.fullDescription}
                                onChange={handleChange}
                                placeholder={t('jobCreation.fullDescriptionPlaceholder')}
                                className="w-full px-4 py-3 rounded-lg bg-brand-gray border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange min-h-[120px] resize-y"
                                required
                            />
                        </div>

                        {/* Salary & Tags Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label={t('jobCreation.salary')}
                                name="salary"
                                value={formData.salary}
                                onChange={handleChange}
                                placeholder={t('jobCreation.salaryPlaceholder')}
                                required
                            />
                            <Input
                                label={t('jobCreation.tags')}
                                name="tags"
                                value={formData.tags}
                                onChange={handleChange}
                                placeholder={t('jobCreation.tagsPlaceholder')}
                            />
                            <Input
                                label={t('jobCreation.workersNeeded') || "Number of employees needed"}
                                name="workers_needed"
                                type="number"
                                min="1"
                                value={formData.workers_needed}
                                onChange={handleChange}
                                placeholder="1"
                                required
                            />
                        </div>

                        {/* Duration & Schedule Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Duration Dropdown */}
                            <div className="flex flex-col gap-1.5 w-full">
                                <label className="text-sm font-medium text-brand-muted pl-1">
                                    {t('jobCreation.duration')}
                                </label>
                                <div className="relative">
                                    <select
                                        name="duration"
                                        value={formData.duration}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-lg bg-brand-gray border border-white/10 text-white focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange appearance-none cursor-pointer"
                                    >
                                        <option value="" disabled>{t('jobCreation.selectOption') || "Select option"}</option>
                                        <option value="1-2 days">{t('jobCreation.durations.oneTwoDays')}</option>
                                        <option value="1 week">{t('jobCreation.durations.oneWeek')}</option>
                                        <option value="Permanent">{t('jobCreation.durations.permanent')}</option>
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/30">
                                        <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            {/* Work Schedule Dropdown */}
                            <div className="flex flex-col gap-1.5 w-full">
                                <label className="text-sm font-medium text-brand-muted pl-1">
                                    {t('jobCreation.workSchedule')}
                                </label>
                                <div className="relative">
                                    <select
                                        name="workSchedule"
                                        value={formData.workSchedule}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-lg bg-brand-gray border border-white/10 text-white focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange appearance-none cursor-pointer"
                                    >
                                        <option value="" disabled>{t('jobCreation.selectOption') || "Select option"}</option>
                                        <option value="Full-time">{t('jobCreation.schedules.fullTime')}</option>
                                        <option value="Part-time">{t('jobCreation.schedules.partTime')}</option>
                                        <option value="Shift-based">{t('jobCreation.schedules.shiftBased')}</option>
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/30">
                                        <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Evaluation Criteria Section */}
                        <div className="space-y-4 pt-4 border-t border-white/5">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-medium text-brand-muted pl-1">
                                    {t('jobCreation.evaluationCriteria')}
                                </label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="number"
                                        name="criteriaCount"
                                        min="0"
                                        max="10"
                                        value={formData.criteriaCount}
                                        onChange={handleChange}
                                        className="w-16 px-2 py-1 bg-brand-gray border border-white/10 rounded text-center text-white"
                                    />
                                </div>
                            </div>

                            {formData.evaluationList.map((criterion, index) => (
                                <Input
                                    key={index}
                                    placeholder={`${t('jobCreation.criterionPlaceholder')} #${index + 1}`}
                                    value={criterion}
                                    onChange={(e) => handleCriterionChange(index, e.target.value)}
                                />
                            ))}
                        </div>

                        {error && (
                            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-sm rounded-lg text-center">
                                {error}
                            </div>
                        )}

                    </form>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-white/5 flex justify-end gap-3 bg-[#0F0F11] rounded-b-2xl">
                    <Button
                        variant="ghost"
                        onClick={onClose}
                    >
                        {t('task.backToDashboard') || "Cancel"}
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={!isValid || isSubmitting}
                        className="min-w-[140px]"
                    >
                        {isSubmitting ? (
                            <span className="flex items-center gap-2">
                                <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                {isEditMode ? "Updating..." : "Publishing..."}
                            </span>
                        ) : (
                            isEditMode ? (t('jobCreation.update') || "Update Job") : t('jobCreation.publish')
                        )}
                    </Button>
                </div>

            </div>
        </div>
    );
};

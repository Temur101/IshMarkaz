
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { useModal } from '../context/ModalContext';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { TaskCard } from '../components/ui/TaskCard';
import { Search } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useTasks } from '../context/TaskContext';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
    const { t, language } = useLanguage();
    const { tasks, loading } = useTasks();
    const { user } = useAuth();
    const { openAuthModal } = useModal();
    const { category } = useParams();
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (category) {
            localStorage.setItem('lastViewedCategory', category);
        }
    }, [category]);

    const getLocalizedContent = (content) => {
        if (typeof content === 'object' && content !== null) {
            return content[language] || content['en'] || Object.values(content)[0] || "";
        }
        return content || "";
    };

    const getSeoData = () => {
        switch (category) {
            case 'no-experience':
                return {
                    title: "Работа без опыта в Узбекистане | IshMarkaz",
                    description: "Свежие вакансии без опыта в Узбекистане. Найдите первую работу, временную работу или подработку на IshMarkaz.",
                    h1: "Работа без опыта в Узбекистане",
                    text: "На этой странице собраны вакансии без опыта в Узбекистане. Здесь можно найти первую работу, временную подработку и вакансии для студентов."
                };
            case 'temporary':
                return {
                    title: "Временная работа в Узбекистане | IshMarkaz",
                    description: "Свежие вакансии для временной работы и подработки в Узбекистане. Найдите подходящие варианты на IshMarkaz.",
                    h1: "Временная работа в Узбекистане",
                    text: "Ищете временную работу или подработку? На этой странице представлены свежие вакансии с гибким графиком и проектной занятостью в Узбекистане."
                };
            case 'trial-week':
                return {
                    title: "Работа на пробную неделю | IshMarkaz",
                    description: "Вакансии с пробной неделей в Узбекистане. Проверьте себя и найдите подходящего работодателя на IshMarkaz.",
                    h1: "Работа на пробную неделю",
                    text: "Начните работу с пробной недели. Это отличный способ познакомиться с компанией, проверить свои силы и понять, подходит ли вам данная вакансия."
                };
            case 'full-time':
                return {
                    title: "Работа на полный день в Узбекистане | IshMarkaz",
                    description: "Свежие вакансии на полный день в Узбекистане. Найдите постоянную работу от прямых работодателей на IshMarkaz.",
                    h1: "Работа на полный день в Узбекистане",
                    text: "На этой странице представлены вакансии с полной занятостью в Узбекистане. Выбирайте надежных работодателей и стабильный заработок."
                };
            case 'all':
            default:
                return {
                    title: "Все вакансии в Узбекистане | IshMarkaz",
                    description: "Полный список свежих вакансий и предложений о работе в Узбекистане. Найдите работу своей мечты на IshMarkaz.",
                    h1: "Все вакансии в Узбекистане",
                    text: "Изучите все доступные вакансии в Узбекистане. Мы регулярно обновляем список актуальных предложений от прямых работодателей."
                };
        }
    };

    const seoData = getSeoData();

    const filteredTasks = tasks.filter(task => {
        const title = String(getLocalizedContent(task.title || '')).toLowerCase();
        const company = String(task.company || '').toLowerCase();
        const matchesSearch = title.includes(searchTerm.toLowerCase()) ||
            company.includes(searchTerm.toLowerCase());

        let matchesCategory = true;
        const taskType = task.original_type || task.originalType || task.type;
        const fullDesc = String(getLocalizedContent(task.description || '')).toLowerCase();

        switch (category) {
            case 'trial-week':
                matchesCategory = taskType === 'Trial Week' || String(taskType).toLowerCase() === 'trial week';
                break;
            case 'full-time':
                matchesCategory = taskType === 'Full-time' || String(taskType).toLowerCase() === 'full-time';
                break;
            case 'no-experience':
                matchesCategory = (task.experience_level || task.experienceLevel) === 'No Experience' ||
                    fullDesc.includes('no experience') ||
                    fullDesc.includes('без опыта');
                break;
            case 'temporary':
                matchesCategory = taskType === 'Task' || String(taskType).toLowerCase() === 'task' || String(taskType).toLowerCase() === 'temporary';
                break;
            case 'all':
            default:
                matchesCategory = true;
                break;
        }

        // PUBLIC RULES: Only show 'open' jobs where workers_needed > 0
        const isOpen = (task.status === 'open' || !task.status); // Default to open if status is not set
        const hasSpots = (task.workers_needed === undefined || task.workers_needed > 0);

        if (!isOpen || !hasSpots) return false;

        return matchesSearch && matchesCategory;
    });

    return (
        <DashboardLayout>
            <Helmet>
                <title>{seoData.title}</title>
                <meta name="description" content={seoData.description} />
                <meta name="robots" content="index, follow" />
            </Helmet>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                <div>
                    <h1 className="text-3xl font-bold mb-2">{seoData.h1}</h1>
                    <p className="text-brand-muted mb-4 max-w-3xl leading-relaxed">{seoData.text}</p>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-brand-orange/10 border border-brand-orange/20 rounded-full">
                            <div className="w-2 h-2 bg-brand-orange rounded-full animate-pulse" />
                            <span className="text-sm font-bold text-brand-orange uppercase tracking-wider">
                                {t('dashboard.vacanciesCounter').replace('{count}', tasks.length)}
                            </span>
                        </div>
                        {tasks.filter(t => {
                            const diff = new Date() - new Date(t.created_at);
                            return diff < 86400000;
                        }).length > 0 && (
                                <div className="flex items-center gap-1.5 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full">
                                    <span className="text-sm font-bold text-green-500 uppercase tracking-wider">
                                        +{tasks.filter(t => {
                                            const diff = new Date() - new Date(t.created_at);
                                            return diff < 86400000;
                                        }).length} {language === 'ru' ? 'сегодня' : (language === 'uz' ? 'bugun' : 'today')}
                                    </span>
                                </div>
                            )}
                    </div>
                </div>

                <div className="flex w-full md:w-auto gap-4">

                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" size={18} />
                        <Input
                            placeholder={t('dashboard.searchPlaceholder')}
                            className="pl-10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="w-12 h-12 border-4 border-brand-orange border-t-transparent rounded-full animate-spin mb-4" />
                        <p className="text-brand-muted">Загрузка вакансий...</p>
                    </div>
                ) : filteredTasks.length > 0 ? (
                    filteredTasks.map(task => (
                        <TaskCard key={task.id} task={task} />
                    ))
                ) : (
                    <div className="text-center py-20 bg-white/5 rounded-2xl border border-white/5">
                        <p className="text-xl font-medium text-white mb-2">{t('dashboard.noTasks')}</p>
                        <p className="text-brand-muted">Попробуйте изменить параметры поиска или выбрать другую категорию.</p>
                    </div>
                )}
            </div>

            <div className="mt-16 pt-8 border-t border-white/10">
                <h2 className="text-xl font-bold text-white mb-4">Популярные категории</h2>
                <div className="flex flex-wrap gap-4">
                    <Link to="/jobs/all" className="text-brand-muted hover:text-brand-orange transition-colors underline-offset-4 hover:underline">Все вакансии</Link>
                    <Link to="/jobs/no-experience" className="text-brand-muted hover:text-brand-orange transition-colors underline-offset-4 hover:underline">Работа без опыта</Link>
                    <Link to="/jobs/temporary" className="text-brand-muted hover:text-brand-orange transition-colors underline-offset-4 hover:underline">Временная работа</Link>
                    <Link to="/jobs/trial-week" className="text-brand-muted hover:text-brand-orange transition-colors underline-offset-4 hover:underline">Пробная неделя</Link>
                </div>
            </div>

        </DashboardLayout>
    );
}

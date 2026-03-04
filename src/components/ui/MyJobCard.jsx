import { Building2, MapPin, Clock, DollarSign, Pencil, Trash2, Users, UserCheck2, PauseCircle, PlayCircle, XCircle } from 'lucide-react';
import { Button } from './Button';
import { Badge } from './Badge';
import { Tooltip } from './Tooltip';
import { useLanguage } from '../../context/LanguageContext';

export const MyJobCard = ({ task, onEdit, onDelete }) => {
    const { language, t } = useLanguage();

    const getLocalizedContent = (content) => {
        if (typeof content === 'object' && content !== null) {
            return content[language] || content['en'] || Object.values(content)[0] || "";
        }
        return content || "";
    };

    return (
        <div className="bg-white/5 border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-all group">
            <div className="space-y-6">
                <div>
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 rounded-xl bg-brand-orange/10 flex items-center justify-center text-brand-orange">
                            <Building2 size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white group-hover:text-brand-orange transition-colors">
                                {getLocalizedContent(task.title)}
                            </h3>
                            <p className="text-brand-muted flex items-center gap-2">
                                {task.company}
                                {task.status === 'paused' && (
                                    <Badge variant="default" className="bg-orange-500/10 text-orange-400 border-orange-500/20 ml-2">
                                        {language === 'ru' ? 'Пауза' : 'Paused'}
                                    </Badge>
                                )}
                                {task.status === 'closed' && (
                                    <Badge variant="default" className="bg-red-500/10 text-red-500 border-red-500/20 ml-2">
                                        {t('task.closed') || "Closed"}
                                    </Badge>
                                )}
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div className="flex items-center gap-2 text-brand-muted">
                            <DollarSign size={16} className="text-brand-orange" />
                            <span className="text-sm">{task.payment}</span>
                        </div>
                        <div className="flex items-center gap-2 text-brand-muted">
                            <Clock size={16} className="text-brand-orange" />
                            <span className="text-sm">{getLocalizedContent(task.time_required || task.timeRequired)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-brand-muted">
                            <MapPin size={16} className="text-brand-orange" />
                            <span className="text-sm">{getLocalizedContent(task.type)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-brand-muted col-span-2 md:col-span-1">
                            <Building2 size={16} className="text-brand-orange" />
                            <span className="text-sm font-medium">
                                {t('task.workersNeededLabel') || "Needed"}: {task.workers_needed || 1}
                                {task.workers_hired > 0 && ` / ${t('task.hired') || "Hired"}: ${task.workers_hired}`}
                            </span>
                        </div>
                    </div>

                    <p className="text-brand-muted line-clamp-2 mb-4">
                        {getLocalizedContent(task.description)}
                    </p>

                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pt-6 mt-6 border-t border-white/5">
                        <div className="flex flex-wrap gap-2">
                            {(task.tags || []) && (task.tags || []).map((tag, index) => (
                                <Badge key={index} variant="secondary" className="bg-white/5 border-white/5">{tag}</Badge>
                            ))}
                        </div>

                        <div className="flex flex-row gap-2">
                            <Tooltip content={t('common.edit') || "Edit"}>
                                <Button
                                    variant="secondary"
                                    size="icon"
                                    onClick={() => onEdit(task)}
                                    className="w-10 h-10 rounded-xl border-white/10 text-white/60 hover:text-white hover:bg-white/10"
                                >
                                    <Pencil size={18} />
                                </Button>
                            </Tooltip>

                            {task.status === 'open' && (
                                <Tooltip content={language === 'ru' ? 'Приостановить' : 'Pause'}>
                                    <Button
                                        variant="secondary"
                                        size="icon"
                                        onClick={task.onPause}
                                        className="w-10 h-10 rounded-xl border-orange-500/30 text-orange-400 hover:bg-orange-500/10"
                                    >
                                        <PauseCircle size={18} />
                                    </Button>
                                </Tooltip>
                            )}

                            {task.status === 'paused' && (
                                <Tooltip content={language === 'ru' ? 'Возобновить' : 'Resume'}>
                                    <Button
                                        variant="secondary"
                                        size="icon"
                                        onClick={task.onResume}
                                        className="w-10 h-10 rounded-xl border-green-500/30 text-green-400 hover:bg-green-500/10"
                                    >
                                        <PlayCircle size={18} />
                                    </Button>
                                </Tooltip>
                            )}

                            {task.status !== 'closed' && (
                                <Tooltip content={language === 'ru' ? 'Закрыть' : 'Close'}>
                                    <Button
                                        variant="secondary"
                                        size="icon"
                                        onClick={task.onCloseJob}
                                        className="w-10 h-10 rounded-xl border-red-500/30 text-red-400 hover:bg-red-500/10"
                                    >
                                        <XCircle size={18} />
                                    </Button>
                                </Tooltip>
                            )}

                            <Tooltip content={t('myJobs.editWorkers') || "Edit employee count"}>
                                <Button
                                    variant="secondary"
                                    size="icon"
                                    onClick={() => task.onEditWorkers && task.onEditWorkers(task)}
                                    className="w-10 h-10 rounded-xl border-white/10 text-white/60 hover:text-white hover:bg-white/10"
                                >
                                    <Building2 size={18} />
                                </Button>
                            </Tooltip>

                            <Tooltip content={language === 'ru' ? 'Кто заинтересовался' : 'Who is interested'}>
                                <Button
                                    variant="secondary"
                                    size="icon"
                                    onClick={() => task.onViewInterests && task.onViewInterests(task)}
                                    className="w-10 h-10 rounded-xl border-brand-orange/30 text-brand-orange hover:bg-brand-orange/10"
                                >
                                    <Users size={18} />
                                </Button>
                            </Tooltip>

                            <Tooltip content={language === 'ru' ? 'Сотрудники' : 'Employees'}>
                                <Button
                                    variant="secondary"
                                    size="icon"
                                    onClick={() => task.onViewEmployees && task.onViewEmployees(task)}
                                    className="w-10 h-10 rounded-xl border-green-500/30 text-green-400 hover:bg-green-500/10 relative"
                                >
                                    <UserCheck2 size={18} />
                                    {task.workers_hired > 0 && (
                                        <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-green-500 text-white text-[10px] font-bold flex items-center justify-center border-2 border-[#1A1A1A]">
                                            {task.workers_hired}
                                        </span>
                                    )}
                                </Button>
                            </Tooltip>

                            <Tooltip content={t('common.delete') || "Delete"}>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => onDelete(task.id)}
                                    className="w-10 h-10 rounded-xl text-red-400/40 hover:text-red-400 hover:bg-red-400/10"
                                >
                                    <Trash2 size={18} />
                                </Button>
                            </Tooltip>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

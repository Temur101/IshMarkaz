import { useState } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { useModal } from '../context/ModalContext';
import { Button } from '../components/ui/Button';
import { MyJobCard } from '../components/ui/MyJobCard';
import { Plus, Trash2, X, Users, MessageSquare, UserCheck, UserCheck2, UserX, Clock } from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { useLanguage } from '../context/LanguageContext';
import { useTasks } from '../context/TaskContext';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';

export default function MyJobs() {
    const { t, language } = useLanguage();
    const { user } = useAuth();
    const { tasks, deleteTask, loading, updateTask, hireWorker, fireWorker, completeTemporaryJob, updateJobStatus, hideHireFromHistory } = useTasks();
    const { openJobModal } = useModal();
    const { startChat } = useChat();
    const navigate = useNavigate();

    // ── Delete confirmation ──────────────────────────────────────────
    const [taskToDelete, setTaskToDelete] = useState(null);

    // ── Edit workers count ───────────────────────────────────────────
    const [taskToEditWorkers, setTaskToEditWorkers] = useState(null);
    const [newWorkerCount, setNewWorkerCount] = useState(1);
    const [workerUpdateError, setWorkerUpdateError] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);

    // ── "Кто заинтересовался" modal ──────────────────────────────────
    const [taskInterests, setTaskInterests] = useState(null);
    const [interestedUsers, setInterestedUsers] = useState([]);
    const [isInterestsLoading, setIsInterestsLoading] = useState(false);
    const [hiredIds, setHiredIds] = useState([]); // IDs уже нанятых в этой вакансии

    // ── "Сотрудники" modal ────────────────────────────────────────────
    const [taskEmployees, setTaskEmployees] = useState(null);
    const [employees, setEmployees] = useState([]);
    const [isEmployeesLoading, setIsEmployeesLoading] = useState(false);
    const [firingId, setFiringId] = useState(null);
    const [history, setHistory] = useState([]);

    const myTasks = tasks.filter(task => task.user_id === user?.id);

    // ── Helpers ──────────────────────────────────────────────────────
    const getDisplayName = (u) => {
        if (u.full_name && u.full_name.trim()) return u.full_name.trim();
        const first = u.first_name || '';
        const last = u.last_name || '';
        if (first || last) return `${first} ${last}`.trim();
        if (u.username && !u.username.includes('@')) return u.username;
        return language === 'ru' ? 'Специалист' : 'Specialist';
    };

    const getInitial = (u) => getDisplayName(u).charAt(0).toUpperCase();

    // ── Fetch hired IDs for a job ────────────────────────────────────
    const fetchHiredIds = async (jobId) => {
        const { data, error } = await supabase
            .from('job_hires')
            .select('worker_id')
            .eq('job_id', jobId)
            .eq('status', 'active');
        if (!error && data) return data.map(d => d.worker_id);
        return [];
    };

    // ── "Кто заинтересовался" ────────────────────────────────────────
    const openInterestsModal = async (task) => {
        setTaskInterests(task);
        setIsInterestsLoading(true);
        setInterestedUsers([]);
        setHiredIds([]);
        try {
            const [interestsRes, hiresRes] = await Promise.all([
                supabase.from('job_interests').select('user_id').eq('job_id', task.id),
                fetchHiredIds(task.id),
            ]);

            setHiredIds(hiresRes);

            if (interestsRes.error) { console.error(interestsRes.error); return; }
            if (!interestsRes.data?.length) return;

            const userIds = interestsRes.data.map(i => i.user_id);
            const { data: profiles, error: pError } = await supabase
                .from('profiles').select('*').in('id', userIds);

            if (!pError) setInterestedUsers(profiles || []);
        } catch (err) {
            console.error('Interests fetch error:', err);
        } finally {
            setIsInterestsLoading(false);
        }
    };

    const handleHire = async (workerId) => {
        if (!taskInterests) return;
        const result = await hireWorker(taskInterests.id, workerId);
        if (result.success) {
            setHiredIds(prev => [...prev, workerId]);
        } else {
            alert(result.error?.error || result.error?.message || 'Error');
        }
    };

    const handleMessageFromInterests = (workerId) => {
        startChat(workerId, taskInterests?.id);
        navigate('/messages');
    };

    // ── "Сотрудники" ─────────────────────────────────────────────────
    const openEmployeesModal = async (task) => {
        setTaskEmployees(task);
        setIsEmployeesLoading(true);
        setEmployees([]);
        setHistory([]);
        try {
            const { data: hires, error: hError } = await supabase
                .from('job_hires')
                .select('id, worker_id, hired_at, status, employment_type, expected_end_date, completed_at, is_visible_to_employer')
                .eq('job_id', task.id)
                .order('hired_at', { ascending: false });

            if (hError) { console.error(hError); return; }
            if (!hires?.length) return;

            const workerIds = hires.map(h => h.worker_id);
            const { data: profiles, error: pError } = await supabase
                .from('profiles').select('*').in('id', workerIds);

            if (!pError && profiles) {
                const merged = hires.map(h => {
                    const p = profiles.find(profile => profile.id === h.worker_id);
                    return { ...p, ...h };
                });

                setEmployees(merged.filter(e => e.status === 'active'));
                setHistory(merged.filter(e => e.status !== 'active' && e.is_visible_to_employer));
            }
        } catch (err) {
            console.error('Employees fetch error:', err);
        } finally {
            setIsEmployeesLoading(false);
        }
    };

    const handleFire = async (workerId) => {
        if (!taskEmployees) return;
        setFiringId(workerId);
        const result = await fireWorker(taskEmployees.id, workerId);
        if (result.success) {
            // Re-fetch to update lists
            openEmployeesModal(taskEmployees);
        } else {
            alert(result.error?.error || result.error?.message || 'Ошибка при увольнении');
        }
        setFiringId(null);
    };

    const handleCompleteTemp = async (workerId) => {
        if (!taskEmployees) return;
        setFiringId(workerId); // Use same loading state
        const result = await completeTemporaryJob(taskEmployees.id, workerId);
        if (result.success) {
            openEmployeesModal(taskEmployees);
        } else {
            alert(result.error?.error || result.error?.message || 'Ошибка');
        }
        setFiringId(null);
    };

    const handleHideHistory = async (hireId) => {
        const result = await hideHireFromHistory(hireId);
        if (result.success) {
            setHistory(prev => prev.filter(h => h.id !== hireId));
        }
    };

    const handleMessageFromEmployees = (workerId) => {
        startChat(workerId, taskEmployees?.id);
        navigate('/messages');
    };

    const handleUpdateJobStatus = async (jobId, newStatus) => {
        const result = await updateJobStatus(jobId, newStatus);
        if (!result.success) {
            alert(result.error?.message || 'Ошибка обновления статуса');
        }
    };

    const calculateDaysLeft = (expectedDate) => {
        if (!expectedDate) return null;
        const diff = new Date(expectedDate) - new Date();
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
        return days > 0 ? days : 0;
    };

    // ── Edit workers count ───────────────────────────────────────────
    const confirmDelete = async () => {
        if (taskToDelete) { await deleteTask(taskToDelete); setTaskToDelete(null); }
    };

    const handleWorkerUpdate = async () => {
        if (!taskToEditWorkers) return;
        const count = parseInt(newWorkerCount);
        const hired = taskToEditWorkers.workers_hired || 0;
        if (count < hired && count !== 0) {
            setWorkerUpdateError(`Нельзя установить меньше чем нанято (${hired}).`);
            return;
        }
        setIsUpdating(true);
        setWorkerUpdateError('');
        try {
            let newStatus = 'open';
            if (count === 0 || count === hired) newStatus = 'closed';
            const result = await updateTask({ id: taskToEditWorkers.id, workers_needed: count, status: newStatus });
            if (result.error) setWorkerUpdateError(result.error.message || 'Error');
            else setTaskToEditWorkers(null);
        } catch (err) {
            setWorkerUpdateError('Произошла непредвиденная ошибка');
        } finally {
            setIsUpdating(false);
        }
    };

    // ────────────────────────────────────────────────────────────────
    return (
        <DashboardLayout>

            {/* ── Header ── */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                <div>
                    <h1 className="text-3xl font-bold mb-2">{t('nav.myJobs') || 'My Jobs'}</h1>
                    <p className="text-brand-muted">{t('myJobs.description')}</p>
                </div>
                <Button onClick={() => openJobModal()} className="whitespace-nowrap">
                    <Plus size={20} className="mr-2" />
                    {t('nav.publish')}
                </Button>
            </div>

            {/* ── Job cards ── */}
            <div className="space-y-4">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="w-12 h-12 border-4 border-brand-orange border-t-transparent rounded-full animate-spin mb-4" />
                        <p className="text-brand-muted">Загрузка ваших вакансий...</p>
                    </div>
                ) : myTasks.length > 0 ? (
                    myTasks.map(task => (
                        <MyJobCard
                            key={task.id}
                            task={{
                                ...task,
                                onEditWorkers: (t) => { setTaskToEditWorkers(t); setNewWorkerCount(t.workers_needed || 1); setWorkerUpdateError(''); },
                                onViewInterests: openInterestsModal,
                                onViewEmployees: openEmployeesModal,
                                onPause: () => handleUpdateJobStatus(task.id, 'paused'),
                                onResume: () => handleUpdateJobStatus(task.id, 'open'),
                                onCloseJob: () => handleUpdateJobStatus(task.id, 'closed'),
                            }}
                            onEdit={(task) => openJobModal(task)}
                            onDelete={(id) => setTaskToDelete(id)}
                        />
                    ))
                ) : (
                    <div className="text-center py-20 bg-white/5 rounded-2xl border border-white/5">
                        <p className="text-xl font-medium text-white mb-2">{t('myJobs.noJobs')}</p>
                        <Button onClick={() => openJobModal()} variant="secondary" className="mt-4">
                            {t('nav.publish')}
                        </Button>
                    </div>
                )}
            </div>

            {/* ════════════════════════════════════════════════════════
                MODAL: Кто заинтересовался
            ════════════════════════════════════════════════════════ */}
            {taskInterests && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setTaskInterests(null)} />
                    <div className="relative w-full max-w-2xl bg-[#0F0F11] border border-white/10 rounded-2xl shadow-2xl flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95">

                        <div className="flex items-center justify-between p-6 border-b border-white/5">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <Users className="text-brand-orange" size={22} />
                                {language === 'ru' ? 'Заинтересованные специалисты' : 'Interested Specialists'}
                            </h3>
                            <button onClick={() => setTaskInterests(null)} className="text-white/40 hover:text-white transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-3 custom-scrollbar">
                            {isInterestsLoading ? (
                                <div className="py-12 flex justify-center">
                                    <div className="w-8 h-8 border-4 border-brand-orange/20 border-t-brand-orange rounded-full animate-spin" />
                                </div>
                            ) : interestedUsers.length === 0 ? (
                                <div className="text-center py-12 text-brand-muted">
                                    <Users size={40} className="mx-auto mb-3 opacity-10" />
                                    <p>Пока никто не заинтересовался</p>
                                </div>
                            ) : (
                                interestedUsers.map(u => {
                                    const isAlreadyHired = hiredIds.includes(u.id);
                                    return (
                                        <div key={u.id} className={`p-4 rounded-xl border flex items-center justify-between gap-4 transition-colors ${isAlreadyHired ? 'bg-green-500/5 border-green-500/20' : 'bg-white/5 border-white/5 hover:border-white/10'}`}>
                                            <div className="flex items-center gap-4 min-w-0">
                                                <div className="w-12 h-12 rounded-full bg-brand-orange/10 flex items-center justify-center text-brand-orange font-bold text-xl flex-shrink-0">
                                                    {getInitial(u)}
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="font-bold text-white flex items-center gap-2 flex-wrap">
                                                        {getDisplayName(u)}
                                                        {isAlreadyHired && (
                                                            <span className="text-xs font-semibold text-green-400 bg-green-500/15 border border-green-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                                                                <UserCheck size={11} /> Уже нанят
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="text-brand-muted text-sm truncate">
                                                        {u.occupation || u.role || (language === 'ru' ? 'Специалист' : 'Specialist')}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex gap-2 flex-shrink-0">
                                                <Button variant="secondary" size="sm" onClick={() => handleMessageFromInterests(u.id)} className="gap-1.5">
                                                    <MessageSquare size={15} />
                                                    <span className="hidden sm:inline">Написать</span>
                                                </Button>
                                                {isAlreadyHired ? (
                                                    <div className="px-3 py-2 text-xs font-semibold text-green-400 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center gap-1.5">
                                                        <UserCheck size={14} /> Нанят
                                                    </div>
                                                ) : (
                                                    <Button size="sm" onClick={() => handleHire(u.id)} className="gap-1.5 bg-green-500 hover:bg-green-600 border-green-500">
                                                        <UserCheck size={15} />
                                                        <span className="hidden sm:inline">Нанять</span>
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ════════════════════════════════════════════════════════
                MODAL: Сотрудники
            ════════════════════════════════════════════════════════ */}
            {taskEmployees && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setTaskEmployees(null)} />
                    <div className="relative w-full max-w-2xl bg-[#0F0F11] border border-white/10 rounded-2xl shadow-2xl flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95">

                        <div className="flex items-center justify-between p-6 border-b border-white/5">
                            <div>
                                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                    <UserCheck2 className="text-green-400" size={22} />
                                    {language === 'ru' ? 'Сотрудники' : 'Employees'}
                                </h3>
                                <p className="text-sm text-brand-muted mt-0.5">
                                    {employees.length > 0
                                        ? `${employees.length} ${language === 'ru' ? 'чел. нанято' : 'hired'}`
                                        : language === 'ru' ? 'Никого не нанято' : 'No one hired yet'}
                                </p>
                            </div>
                            <button onClick={() => setTaskEmployees(null)} className="text-white/40 hover:text-white transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-3 custom-scrollbar">
                            {isEmployeesLoading ? (
                                <div className="py-12 flex justify-center">
                                    <div className="w-8 h-8 border-4 border-brand-orange/20 border-t-brand-orange rounded-full animate-spin" />
                                </div>
                            ) : employees.length === 0 ? (
                                <div className="text-center py-12 text-brand-muted">
                                    <UserCheck2 size={40} className="mx-auto mb-3 opacity-10" />
                                    <p>Вы ещё никого не наняли</p>
                                    <p className="text-xs mt-1 opacity-60">Нажмите «Кто заинтересовался» чтобы нанять специалиста</p>
                                </div>
                            ) : (
                                employees.map(emp => {
                                    const daysLeft = calculateDaysLeft(emp.expected_end_date);
                                    return (
                                        <div key={emp.id} className="p-4 bg-white/5 rounded-xl border border-white/5 hover:border-green-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors group">
                                            <div className="flex items-center gap-4 min-w-0">
                                                <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center text-green-400 font-bold text-xl flex-shrink-0 border border-green-500/20">
                                                    {getInitial(emp)}
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="font-bold text-white flex items-center gap-2">
                                                        {getDisplayName(emp)}
                                                        {emp.employment_type === 'trial' && (
                                                            <Badge variant="orange" className="text-[10px] py-0 px-2 h-5">Trial</Badge>
                                                        )}
                                                        {emp.employment_type === 'temporary' && (
                                                            <Badge variant="secondary" className="text-[10px] py-0 px-2 h-5 bg-blue-500/10 text-blue-400 border-blue-500/20">Temp</Badge>
                                                        )}
                                                    </div>
                                                    <div className="text-brand-muted text-sm">
                                                        {emp.occupation || emp.role || (language === 'ru' ? 'Специалист' : 'Specialist')}
                                                    </div>
                                                    {emp.employment_type === 'trial' && daysLeft !== null && (
                                                        <div className="flex items-center gap-1.5 text-xs text-brand-orange mt-1">
                                                            <Clock size={12} />
                                                            {language === 'ru' ? `Осталось: ${daysLeft} дн.` : `${daysLeft} days left`}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex gap-2 w-full sm:w-auto">
                                                <Button
                                                    variant="secondary"
                                                    size="sm"
                                                    onClick={() => handleMessageFromEmployees(emp.worker_id)}
                                                    className="gap-1.5 flex-1 sm:flex-initial"
                                                >
                                                    <MessageSquare size={15} />
                                                    <span className="hidden sm:inline">Написать</span>
                                                </Button>

                                                {emp.employment_type === 'temporary' && (
                                                    <Button
                                                        size="sm"
                                                        onClick={() => handleCompleteTemp(emp.worker_id)}
                                                        disabled={firingId === emp.worker_id}
                                                        className="gap-1.5 bg-green-500/10 hover:bg-green-500/20 text-green-400 border-green-500/30 hover:border-green-500/50 flex-1 sm:flex-initial"
                                                    >
                                                        {firingId === emp.worker_id ? (
                                                            <div className="w-4 h-4 border-2 border-green-400/30 border-t-green-400 rounded-full animate-spin" />
                                                        ) : (
                                                            <>
                                                                <UserCheck size={15} />
                                                                <span>Завершил</span>
                                                            </>
                                                        )}
                                                    </Button>
                                                )}

                                                {emp.employment_type === 'permanent' && (
                                                    <Button
                                                        size="sm"
                                                        onClick={() => handleFire(emp.worker_id)}
                                                        disabled={firingId === emp.worker_id}
                                                        className="gap-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/30 hover:border-red-500/50 flex-1 sm:flex-initial"
                                                    >
                                                        {firingId === emp.worker_id ? (
                                                            <div className="w-4 h-4 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" />
                                                        ) : (
                                                            <>
                                                                <UserX size={15} />
                                                                <span className="hidden sm:inline">Уволить</span>
                                                            </>
                                                        )}
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
                            )}

                            {/* History Section */}
                            {history.length > 0 && (
                                <div className="mt-8 border-t border-white/5 pt-6">
                                    <h4 className="text-sm font-bold text-brand-muted uppercase tracking-widest mb-4">
                                        {language === 'ru' ? 'Завершенные работы' : 'Completed Work'}
                                    </h4>
                                    <div className="space-y-3">
                                        {history.map(emp => (
                                            <div key={emp.id} className="p-4 bg-white/[0.02] rounded-xl border border-white/5 flex items-center justify-between gap-4 opacity-80">
                                                <div className="flex items-center gap-4 min-w-0">
                                                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/40 font-bold text-lg flex-shrink-0">
                                                        {getInitial(emp)}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="font-bold text-white/60">{getDisplayName(emp)}</div>
                                                        <div className="text-white/30 text-xs">
                                                            {emp.status === 'trial_completed' ? (language === 'ru' ? 'Пробный период завершен' : 'Trial completed') :
                                                                emp.status === 'completed' ? (language === 'ru' ? 'Временная работа завершена' : 'Temporary work completed') :
                                                                    (language === 'ru' ? 'Уволен' : 'Fired')}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button variant="ghost" size="sm" onClick={() => handleMessageFromEmployees(emp.worker_id)} className="h-8 px-2">
                                                        <MessageSquare size={14} />
                                                    </Button>
                                                    <Button variant="ghost" size="sm" onClick={() => handleHideHistory(emp.id)} className="h-8 px-2 text-white/20 hover:text-red-400">
                                                        <Trash2 size={14} />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ════════════════════════════════════════════════════════
                MODAL: Изменить кол-во сотрудников
            ════════════════════════════════════════════════════════ */}
            {taskToEditWorkers && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setTaskToEditWorkers(null)} />
                    <div className="relative w-full max-w-md bg-[#0F0F11] border border-white/10 rounded-2xl p-6 animate-in fade-in zoom-in-95">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-white">{t('myJobs.editWorkersTitle')}</h3>
                            <button onClick={() => setTaskToEditWorkers(null)} className="text-white/40 hover:text-white"><X size={24} /></button>
                        </div>
                        <div className="space-y-4 mb-8">
                            <label className="block text-sm font-medium text-brand-muted mb-2">{t('jobCreation.workersNeeded')}</label>
                            <input type="number" min="0" value={newWorkerCount}
                                onChange={(e) => setNewWorkerCount(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg bg-brand-gray border border-white/10 text-white focus:border-brand-orange outline-none" />
                            <p className="text-xs text-brand-muted">{t('myJobs.hiredInfo')}: {taskToEditWorkers.workers_hired || 0}</p>
                            {workerUpdateError && <div className="p-3 bg-red-500/10 text-red-500 text-sm rounded-lg border border-red-500/20">{workerUpdateError}</div>}
                        </div>
                        <div className="flex gap-3">
                            <Button variant="ghost" className="flex-1" onClick={() => setTaskToEditWorkers(null)}>{t('common.cancel')}</Button>
                            <Button className="flex-1" onClick={handleWorkerUpdate} disabled={isUpdating}>{isUpdating ? t('common.saving') : t('common.save')}</Button>
                        </div>
                    </div>
                </div>
            )}

            {/* ════════════════════════════════════════════════════════
                MODAL: Подтверждение удаления
            ════════════════════════════════════════════════════════ */}
            {taskToDelete && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setTaskToDelete(null)} />
                    <div className="relative w-full max-w-md bg-[#0F0F11] border border-white/10 rounded-2xl p-6 animate-in fade-in zoom-in-95">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <Trash2 className="text-red-400" /> {t('myJobs.deleteConfirmTitle')}
                            </h3>
                            <button onClick={() => setTaskToDelete(null)} className="text-white/40 hover:text-white"><X size={24} /></button>
                        </div>
                        <p className="text-brand-muted mb-8">{t('myJobs.deleteConfirmText')}</p>
                        <div className="flex gap-3">
                            <Button variant="ghost" className="flex-1" onClick={() => setTaskToDelete(null)}>{t('common.cancel')}</Button>
                            <Button className="flex-1 bg-red-500 hover:bg-red-600 border-red-500" onClick={confirmDelete}>{t('common.delete')}</Button>
                        </div>
                    </div>
                </div>
            )}

        </DashboardLayout>
    );
}

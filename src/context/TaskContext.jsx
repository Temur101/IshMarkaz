import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from './AuthContext';

const TaskContext = createContext();

export const useTasks = () => useContext(TaskContext);

export const TaskProvider = ({ children }) => {
    const { user } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [interests, setInterests] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchInterests = async () => {
        if (!user) return;
        try {
            const { data, error } = await supabase
                .from('job_interests')
                .select('job_id')
                .eq('user_id', user.id);
            if (!error) setInterests(data.map(i => i.job_id));
        } catch (err) {
            console.error('Fetch Interests Error:', err);
        }
    };

    useEffect(() => {
        if (user) fetchInterests();
    }, [user]);

    const fetchTasks = async () => {
        setLoading(true);
        try {
            // Sync trial completions before fetching
            await supabase.rpc('sync_trial_completions');

            const { data, error } = await supabase
                .from('jobs')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching tasks:', error.message || error);
            } else {
                setTasks(data || []);
            }
        } catch (err) {
            console.error('Fetch Tasks Network Error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    const addTask = async (newTask) => {
        if (!user) return { error: { message: 'User must be authenticated' } };

        const taskData = {
            ...newTask,
            user_id: user.id,
            workers_needed: parseInt(newTask.workers_needed) || 1,
            workers_hired: 0,
            status: 'open'
        };

        // Remove ID if it's a temporary one
        if (taskData.id) delete taskData.id;

        try {
            const { data, error } = await supabase
                .from('jobs')
                .insert([taskData])
                .select();

            if (error) {
                console.error('Error adding task:', error.message || error);
                return { error };
            }
            if (data && data.length > 0) {
                setTasks(prev => [data[0], ...prev]);
                return { data: data[0] };
            }
            return { error: { message: 'Failed to create task (no data returned)' } };
        } catch (err) {
            console.error('TaskContext addTask catch:', err);
            return { error: err };
        }
    };

    const updateTask = async (updatedTask) => {
        try {
            const { id, ...updateData } = updatedTask;
            const { data, error } = await supabase
                .from('jobs')
                .update(updateData)
                .eq('id', id)
                .select();

            if (error) {
                console.error('Error updating task:', error);
                return { error };
            }
            if (data && data.length > 0) {
                setTasks(prev => prev.map(task => task.id === id ? data[0] : task));
                return { data: data[0] };
            }
            return { error: { message: 'Failed to update task (no data returned)' } };
        } catch (err) {
            console.error('TaskContext updateTask catch:', err);
            return { error: err };
        }
    };

    const deleteTask = async (taskId) => {
        const { error } = await supabase
            .from('jobs')
            .delete()
            .eq('id', taskId);

        if (error) {
            console.error('Error deleting task:', error);
            return { error };
        } else {
            setTasks(prev => prev.filter(task => task.id !== taskId));
            return { success: true };
        }
    };

    const toggleInterest = async (jobId) => {
        if (!user) return { error: { message: 'Auth required' } };

        const isInterested = interests.includes(jobId);

        try {
            if (isInterested) {
                const { error } = await supabase
                    .from('job_interests')
                    .delete()
                    .eq('job_id', jobId)
                    .eq('user_id', user.id);
                if (!error) setInterests(prev => prev.filter(id => id !== jobId));
                return { success: true, removed: true };
            } else {
                const { error } = await supabase
                    .from('job_interests')
                    .insert([{ job_id: jobId, user_id: user.id }]);
                if (!error) setInterests(prev => [...prev, jobId]);
                return { success: true, added: true };
            }
        } catch (err) {
            return { error: err };
        }
    };

    const hireWorker = async (jobId, workerId) => {
        try {
            const { data, error } = await supabase.rpc('hire_worker', {
                p_job_id: jobId,
                p_worker_id: workerId
            });

            if (error) throw error;
            if (data.error) return { error: data };

            await fetchTasks();
            return { success: true };
        } catch (err) {
            console.error('Hire Worker Error:', err);
            return { error: err };
        }
    };

    const fireWorker = async (jobId, workerId) => {
        try {
            const { data, error } = await supabase.rpc('fire_worker', {
                p_job_id: jobId,
                p_worker_id: workerId
            });

            if (error) throw error;
            if (data?.error) return { error: data };

            await fetchTasks();
            return { success: true };
        } catch (err) {
            console.error('Fire Worker Error:', err);
            return { error: err };
        }
    };

    const completeTemporaryJob = async (jobId, workerId) => {
        try {
            const { data, error } = await supabase.rpc('complete_temporary_job', {
                p_job_id: jobId,
                p_worker_id: workerId
            });
            if (error) throw error;
            if (data?.error) return { error: data };
            await fetchTasks();
            return { success: true };
        } catch (err) {
            console.error('Complete Temporary Job Error:', err);
            return { error: err };
        }
    };

    const updateJobStatus = async (jobId, newStatus) => {
        try {
            const { data, error } = await supabase.rpc('update_job_status', {
                p_job_id: jobId,
                p_new_status: newStatus
            });
            if (error) throw error;
            if (data?.error) return { error: data };
            await fetchTasks();
            return { success: true };
        } catch (err) {
            console.error('Update Job Status Error:', err);
            return { error: err };
        }
    };

    const hideHireFromHistory = async (hireId) => {
        try {
            const { data, error } = await supabase.rpc('hide_hire_from_history', {
                p_hire_id: hireId
            });
            if (error) throw error;
            if (data?.error) return { error: data };
            return { success: true };
        } catch (err) {
            console.error('Hide Hire Error:', err);
            return { error: err };
        }
    };

    return (
        <TaskContext.Provider value={{
            tasks,
            interests,
            loading,
            addTask,
            updateTask,
            deleteTask,
            toggleInterest,
            hireWorker,
            fireWorker,
            completeTemporaryJob,
            updateJobStatus,
            hideHireFromHistory,
            refreshTasks: fetchTasks
        }}>
            {children}
        </TaskContext.Provider>
    );
};

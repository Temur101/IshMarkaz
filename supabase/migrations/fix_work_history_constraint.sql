-- Hotfix: Update work_history constraint to allow new event types
ALTER TABLE public.work_history 
DROP CONSTRAINT IF EXISTS work_history_event_type_check;

ALTER TABLE public.work_history 
ADD CONSTRAINT work_history_event_type_check 
CHECK (event_type IN ('hired', 'fired', 'trial_completed', 'completed'));

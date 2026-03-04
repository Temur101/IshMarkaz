-- =====================================================
-- SQL: Employment Logic v2 (Trial, Temporary, Permanent)
-- =====================================================

-- 1. Update jobs table
ALTER TABLE public.jobs 
ADD COLUMN IF NOT EXISTS duration_value INT,
ADD COLUMN IF NOT EXISTS duration_unit TEXT CHECK (duration_unit IN ('hours', 'days'));

-- 2. Update job_hires table
ALTER TABLE public.job_hires
ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'trial_completed', 'completed', 'fired')),
ADD COLUMN IF NOT EXISTS employment_type TEXT NOT NULL DEFAULT 'permanent' CHECK (employment_type IN ('trial', 'temporary', 'permanent')),
ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS expected_end_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS is_visible_to_employer BOOLEAN NOT NULL DEFAULT true;

-- Ensure work_history table has event_type
-- If it doesn't exist, create it (just in case)
CREATE TABLE IF NOT EXISTS public.work_history (
  id BIGSERIAL PRIMARY KEY,
  worker_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  job_id BIGINT NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, -- 'hired', 'fired', 'trial_completed', 'completed'
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Update constraint if it exists
ALTER TABLE public.work_history 
DROP CONSTRAINT IF EXISTS work_history_event_type_check;

ALTER TABLE public.work_history 
ADD CONSTRAINT work_history_event_type_check 
CHECK (event_type IN ('hired', 'fired', 'trial_completed', 'completed'));

-- 3. Update hire_worker RPC
CREATE OR REPLACE FUNCTION public.hire_worker(p_job_id BIGINT, p_worker_id UUID)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_job            RECORD;
  v_workers_left   INT;
  v_emp_type       TEXT;
  v_target_end     TIMESTAMPTZ;
BEGIN
  -- Fetch job
  SELECT * INTO v_job FROM public.jobs WHERE id = p_job_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Job not found');
  END IF;

  -- Only the job owner can hire
  IF v_job.user_id <> auth.uid() THEN
    RETURN jsonb_build_object('error', 'Not authorized');
  END IF;

  -- Check slots
  v_workers_left := v_job.workers_needed - v_job.workers_hired;
  IF v_workers_left <= 0 THEN
    RETURN jsonb_build_object('error', 'No slots remaining');
  END IF;

  -- Determine employment type
  v_emp_type := CASE 
    WHEN v_job.original_type = 'Trial Week' THEN 'trial'
    WHEN v_job.original_type = 'Task' THEN 'temporary'
    ELSE 'permanent'
  END;

  v_target_end := CASE 
    WHEN v_emp_type = 'trial' THEN NOW() + INTERVAL '7 days'
    ELSE NULL
  END;

  -- Insert into job_hires
  INSERT INTO public.job_hires (
    job_id, 
    worker_id, 
    employment_type, 
    status, 
    started_at, 
    expected_end_date
  )
  VALUES (
    p_job_id, 
    p_worker_id, 
    v_emp_type, 
    'active', 
    NOW(), 
    v_target_end
  )
  ON CONFLICT (job_id, worker_id) DO UPDATE SET
    status = 'active',
    employment_type = v_emp_type,
    started_at = NOW(),
    expected_end_date = v_target_end,
    completed_at = NULL,
    is_visible_to_employer = true;

  -- Add to work_history
  INSERT INTO public.work_history (worker_id, job_id, event_type)
  VALUES (p_worker_id, p_job_id, 'hired');

  -- Update workers_hired counter
  UPDATE public.jobs
  SET workers_hired = (SELECT COUNT(*) FROM public.job_hires WHERE job_id = p_job_id AND status = 'active'),
      status = CASE 
        WHEN (SELECT COUNT(*) FROM public.job_hires WHERE job_id = p_job_id AND status = 'active') >= workers_needed 
        THEN 'closed' 
        ELSE status 
      END
  WHERE id = p_job_id;

  RETURN jsonb_build_object('success', true, 'employment_type', v_emp_type);
END;
$$;

-- 4. Update fire_worker RPC
CREATE OR REPLACE FUNCTION public.fire_worker(p_job_id BIGINT, p_worker_id UUID)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_hire RECORD;
BEGIN
  SELECT * INTO v_hire FROM public.job_hires 
  WHERE job_id = p_job_id AND worker_id = p_worker_id AND status = 'active';

  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Active employment not found');
  END IF;

  IF v_hire.employment_type <> 'permanent' THEN
    RETURN jsonb_build_object('error', 'Cannot fire trial or temporary workers.');
  END IF;

  UPDATE public.job_hires
  SET status = 'fired',
      completed_at = NOW()
  WHERE job_id = p_job_id AND worker_id = p_worker_id;

  -- Add to work_history
  INSERT INTO public.work_history (worker_id, job_id, event_type)
  VALUES (p_worker_id, p_job_id, 'fired');

  -- Recalculate
  UPDATE public.jobs
  SET workers_hired = (SELECT COUNT(*) FROM public.job_hires WHERE job_id = p_job_id AND status = 'active'),
      status = 'open'
  WHERE id = p_job_id AND status = 'closed';

  RETURN jsonb_build_object('success', true);
END;
$$;

-- 5. Create complete_temporary_job RPC
CREATE OR REPLACE FUNCTION public.complete_temporary_job(p_job_id BIGINT, p_worker_id UUID)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_hire RECORD;
BEGIN
  SELECT * INTO v_hire FROM public.job_hires 
  WHERE job_id = p_job_id AND worker_id = p_worker_id AND status = 'active';

  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Active employment not found');
  END IF;

  IF v_hire.employment_type <> 'temporary' THEN
    RETURN jsonb_build_object('error', 'Only temporary jobs can be completed this way.');
  END IF;

  UPDATE public.job_hires
  SET status = 'completed',
      completed_at = NOW()
  WHERE job_id = p_job_id AND worker_id = p_worker_id;

  -- Add to work_history
  INSERT INTO public.work_history (worker_id, job_id, event_type)
  VALUES (p_worker_id, p_job_id, 'completed');

  -- Recalculate
  UPDATE public.jobs
  SET workers_hired = (SELECT COUNT(*) FROM public.job_hires WHERE job_id = p_job_id AND status = 'active'),
      status = 'open'
  WHERE id = p_job_id AND status = 'closed';

  RETURN jsonb_build_object('success', true);
END;
$$;

-- 6. RPC for Job Status
CREATE OR REPLACE FUNCTION public.update_job_status(p_job_id BIGINT, p_new_status TEXT)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.jobs
  SET status = p_new_status
  WHERE id = p_job_id AND user_id = auth.uid();

  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Job not found or not authorized');
  END IF;

  RETURN jsonb_build_object('success', true);
END;
$$;

-- 7. Soft delete from history
CREATE OR REPLACE FUNCTION public.hide_hire_from_history(p_hire_id BIGINT)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.job_hires
  SET is_visible_to_employer = false
  WHERE id = p_hire_id AND EXISTS (
    SELECT 1 FROM public.jobs WHERE jobs.id = job_hires.job_id AND jobs.user_id = auth.uid()
  );

  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Record not found');
  END IF;

  RETURN jsonb_build_object('success', true);
END;
$$;

-- 8. Sync Trial Completions
CREATE OR REPLACE FUNCTION public.sync_trial_completions()
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  -- Insert into work_history first for those that will be updated
  INSERT INTO public.work_history (worker_id, job_id, event_type, created_at)
  SELECT worker_id, job_id, 'trial_completed', expected_end_date
  FROM public.job_hires
  WHERE status = 'active' 
    AND employment_type = 'trial' 
    AND expected_end_date <= NOW();

  UPDATE public.job_hires
  SET status = 'trial_completed',
      completed_at = expected_end_date
  WHERE status = 'active' 
    AND employment_type = 'trial' 
    AND expected_end_date <= NOW();
    
  UPDATE public.jobs j
  SET workers_hired = (SELECT COUNT(*) FROM public.job_hires jh WHERE jh.job_id = j.id AND jh.status = 'active')
  WHERE j.id IN (
    SELECT job_id FROM public.job_hires 
    WHERE status = 'trial_completed' AND completed_at >= NOW() - INTERVAL '1 minute'
  );
END;
$$;

-- =====================================================
-- SQL: Support for hired workers view + fire worker
-- Run in Supabase SQL Editor
-- =====================================================

-- 1. Create job_hires table if it doesn't exist
--    (tracks which workers were hired for which job)
CREATE TABLE IF NOT EXISTS public.job_hires (
  id         BIGSERIAL PRIMARY KEY,
  job_id     BIGINT      NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  worker_id  UUID        NOT NULL REFERENCES auth.users(id)  ON DELETE CASCADE,
  hired_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(job_id, worker_id)
);

ALTER TABLE public.job_hires ENABLE ROW LEVEL SECURITY;

-- Employer can read their own hires
DROP POLICY IF EXISTS "Employers can view their hires" ON public.job_hires;
CREATE POLICY "Employers can view their hires"
  ON public.job_hires FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.jobs
      WHERE jobs.id = job_hires.job_id
        AND jobs.user_id = auth.uid()
    )
  );

-- Employer can insert hires for their own jobs
DROP POLICY IF EXISTS "Employers can hire workers" ON public.job_hires;
CREATE POLICY "Employers can hire workers"
  ON public.job_hires FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.jobs
      WHERE jobs.id = job_hires.job_id
        AND jobs.user_id = auth.uid()
    )
  );

-- Employer can delete (fire) hires for their own jobs
DROP POLICY IF EXISTS "Employers can fire workers" ON public.job_hires;
CREATE POLICY "Employers can fire workers"
  ON public.job_hires FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.jobs
      WHERE jobs.id = job_hires.job_id
        AND jobs.user_id = auth.uid()
    )
  );

-- 2. Replace/create the hire_worker RPC so it also inserts into job_hires
CREATE OR REPLACE FUNCTION public.hire_worker(p_job_id BIGINT, p_worker_id UUID)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_job          RECORD;
  v_workers_left INT;
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

  v_workers_left := v_job.workers_needed - v_job.workers_hired;
  IF v_workers_left <= 0 THEN
    RETURN jsonb_build_object('error', 'No slots remaining');
  END IF;

  -- Insert into job_hires (ignore if already hired)
  INSERT INTO public.job_hires (job_id, worker_id)
  VALUES (p_job_id, p_worker_id)
  ON CONFLICT (job_id, worker_id) DO NOTHING;

  -- Increment workers_hired counter
  UPDATE public.jobs
  SET workers_hired = workers_hired + 1,
      status = CASE WHEN workers_hired + 1 >= workers_needed THEN 'closed' ELSE status END
  WHERE id = p_job_id
    AND NOT EXISTS (
      SELECT 1 FROM public.job_hires
      WHERE job_id = p_job_id AND worker_id = p_worker_id
      -- only increment if this was a fresh hire (not duplicate)
    );

  -- Simpler approach: just set workers_hired = count of actual hires
  UPDATE public.jobs
  SET workers_hired = (
        SELECT COUNT(*) FROM public.job_hires WHERE job_id = p_job_id
      ),
      status = CASE
        WHEN (SELECT COUNT(*) FROM public.job_hires WHERE job_id = p_job_id) >= workers_needed
        THEN 'closed'
        ELSE 'open'
      END
  WHERE id = p_job_id;

  RETURN jsonb_build_object('success', true);
END;
$$;

-- 3. Create fire_worker RPC
CREATE OR REPLACE FUNCTION public.fire_worker(p_job_id BIGINT, p_worker_id UUID)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_job RECORD;
BEGIN
  SELECT * INTO v_job FROM public.jobs WHERE id = p_job_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Job not found');
  END IF;

  IF v_job.user_id <> auth.uid() THEN
    RETURN jsonb_build_object('error', 'Not authorized');
  END IF;

  -- Remove from job_hires
  DELETE FROM public.job_hires
  WHERE job_id = p_job_id AND worker_id = p_worker_id;

  -- Recalculate workers_hired and reopen if needed
  UPDATE public.jobs
  SET workers_hired = (
        SELECT COUNT(*) FROM public.job_hires WHERE job_id = p_job_id
      ),
      status = 'open'
  WHERE id = p_job_id;

  RETURN jsonb_build_object('success', true);
END;
$$;

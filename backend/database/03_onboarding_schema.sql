-- Migration: Add Onboarding and Email Tracking Fields

-- 1. Update Users Table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS interests TEXT[] DEFAULT '{}';

-- 2. Update Email Settings Table
ALTER TABLE public.email_settings
ADD COLUMN IF NOT EXISTS marketing_opt_in BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS welcome_email_sent BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS day_1_email_sent BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS day_2_email_sent BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS day_7_email_sent BOOLEAN DEFAULT FALSE;

-- Comments
COMMENT ON COLUMN public.users.onboarding_completed_at IS 'When the user finished the onboarding wizard';
COMMENT ON COLUMN public.users.interests IS 'List of categories selected by user';
COMMENT ON COLUMN public.email_settings.welcome_email_sent IS 'Flag for Welcome Email';

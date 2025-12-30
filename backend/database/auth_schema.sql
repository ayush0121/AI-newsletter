-- Database Schema for Auth & Email System
-- Extends the existing SaaS Schema

-- 4. Users Table (Public Profile)
-- Syncs with auth.users via triggers
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Email Settings
-- Tracks opt-in status for the daily digest
CREATE TABLE IF NOT EXISTS public.email_settings (
    user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
    is_subscribed BOOLEAN DEFAULT FALSE,
    last_email_sent_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trigger Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert into public.users
  INSERT INTO public.users (id, email)
  VALUES (new.id, new.email);
  
  -- Insert default email settings (opt-out by default or opt-in, user choice)
  -- Safety first: Users must explicitly opt-in via UI, so default FALSE.
  INSERT INTO public.email_settings (user_id, is_subscribed)
  VALUES (new.id, FALSE);
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to fire on auth.users insert
-- Note: Check if trigger exists to avoid errors on re-run
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created') THEN
        CREATE TRIGGER on_auth_user_created
        AFTER INSERT ON auth.users
        FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
    END IF;
END
$$;

-- Comments
COMMENT ON TABLE public.users IS 'Public profile data synced from auth.users';
COMMENT ON TABLE public.email_settings IS 'User preferences for email digests';

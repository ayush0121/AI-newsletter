-- Migration: Add full_name and phone_number to public.users
-- And update the sync trigger

ALTER TABLE public.users ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS phone_number TEXT;

-- Update the Trigger Function to capture metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, phone_number)
  VALUES (
    new.id, 
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'phone_number'
  );
  
  -- Default email settings
  INSERT INTO public.email_settings (user_id, is_subscribed)
  VALUES (new.id, FALSE);
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

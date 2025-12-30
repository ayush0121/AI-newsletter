-- Migration: Admin System Support

-- 1. Add Role to Users
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user';

-- 2. Admin Audit Logs
-- Immutable log of all administrative actions
CREATE TABLE IF NOT EXISTS admin_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID NOT NULL REFERENCES public.users(id),
    action VARCHAR(50) NOT NULL, -- e.g. 'DELETE_ARTICLE', 'BAN_USER'
    resource VARCHAR(50) NOT NULL, -- e.g. 'article', 'user'
    resource_id UUID, -- Target ID
    details JSONB, -- Previous state or diff
    ip_address INET,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_audit_admin_id ON admin_audit_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_audit_created_at ON admin_audit_logs(created_at DESC);

-- Comments
COMMENT ON COLUMN public.users.role IS 'User role: "user" or "admin"';
COMMENT ON TABLE admin_audit_logs IS 'Security log for all admin actions';

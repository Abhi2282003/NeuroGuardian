-- Add volunteer role to existing app_role enum
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'volunteer';
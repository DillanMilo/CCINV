-- Supabase Database Setup for CCINV-2
-- Run this in your Supabase SQL Editor

-- Create the app_data table for storing all application data
CREATE TABLE IF NOT EXISTS app_data (
  id BIGSERIAL PRIMARY KEY,
  sync_key TEXT NOT NULL UNIQUE,
  data JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an index on sync_key for faster lookups
CREATE INDEX IF NOT EXISTS idx_app_data_sync_key ON app_data(sync_key);

-- Enable Row Level Security (RLS)
ALTER TABLE app_data ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows all operations (since we're using a simple sync key)
-- In production, you might want to add more restrictive policies
CREATE POLICY "Allow all operations for app_data" ON app_data
  FOR ALL USING (true);

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create a trigger to automatically update the updated_at column
CREATE TRIGGER update_app_data_updated_at 
  BEFORE UPDATE ON app_data 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

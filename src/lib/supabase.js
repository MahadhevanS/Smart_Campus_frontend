import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://eyeghemaqraflbphwmai.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV5ZWdoZW1hcXJhZmxicGh3bWFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0ODE4MDgsImV4cCI6MjA4OTA1NzgwOH0.ZKhrLy_lPuZCDItjWYfe8cdsDN32-3G0VaO7WQJkqOc';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
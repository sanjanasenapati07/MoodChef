import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kgcmvtzrsxwysaanitrc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtnY212dHpyc3h3eXNhYW5pdHJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY1ODc3MjMsImV4cCI6MjA4MjE2MzcyM30.yLzrTfXCAlM2Vo-fc75b2KWk7qaj2xcM81LnQa0XDm4';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://wtbilnlqbnkgwvnhwwod.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind0YmlsbmxxYm5rZ3d2bmh3d29kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwMzM0NDEsImV4cCI6MjA2NDYwOTQ0MX0.qoy5u57gvbz-HNq2lpfv2pkJ7e7MTv3PtfGLLTfXk58";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
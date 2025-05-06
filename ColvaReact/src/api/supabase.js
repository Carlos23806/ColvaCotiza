import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = 'https://rxiydekhbydlnudomfsp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ4aXlkZWtoYnlkbG51ZG9tZnNwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMxMDQwODEsImV4cCI6MjA1ODY4MDA4MX0.RlY0mQAOT431YezSh06CtpJ66isrfr2lDb42AqEpePs';

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
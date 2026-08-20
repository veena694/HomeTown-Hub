import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://yqfnpmfouuknxrqbqnjb.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlxZm5wbWZvdXVrbnhycWJxbmpiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDAwMDAwMDAsImV4cCI6MjAxNTAwMDAwMH0.placeholder';

const createSafeSupabaseClient = () => {
  try {
    return createClient(supabaseUrl, supabaseAnonKey, {
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    });
  } catch (err) {
    console.warn('Supabase Realtime client initialization deferred:', err);
    return null;
  }
};

const rawClient = createSafeSupabaseClient();

export const supabase: any = rawClient || {
  channel: () => ({
    on: () => ({ subscribe: () => {} }),
    send: () => {},
  }),
  removeChannel: () => {},
};

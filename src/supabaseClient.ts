
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ockxmstrfzugdywivriy.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ja3htc3RyZnp1Z2R5d2l2cml5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzY1NTkxNSwiZXhwIjoyMDczMjMxOTE1fQ.hnxI1ZA8m4X-SeMBum28oCI2dE2V7AF7CjJ_ozgg0VY';
export const supabase = createClient(supabaseUrl, supabaseAnonKey); 




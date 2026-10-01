import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://rnsanupcaldsqwvfcwnm.supabase.co'
const supabaseAnonKey = 'sb_publishable_Q3HRcTyktx0wI7cNbDK_Cw_Br_4aDqK'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
})
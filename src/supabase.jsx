import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = "https://yxlslbzwszivdpqbxhyy.supabase.co"
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl4bHNsYnp3c3ppdmRwcWJ4aHl5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkyMTA0NjIsImV4cCI6MjA5NDc4NjQ2Mn0.oJLc52GAyskoToAYEeUiYgF-oyISRLUr_n3_Obxraos"

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
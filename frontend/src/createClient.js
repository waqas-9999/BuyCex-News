import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  "https://clyhmaawslvgykkzakuh.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNseWhtYWF3c2x2Z3lra3pha3VoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg1MjAzNzcsImV4cCI6MjA3NDA5NjM3N30._qkn3-ztLvbcIatu0YEHs2n4z-yeSUQ5_PDFfkeINtg"
);
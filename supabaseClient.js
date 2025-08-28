const supabaseUrl = 'https://hpvpozhrsxlvtzolgfhj.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhwdnBvemhyc3hsdnR6b2xnZmhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYzODMzODQsImV4cCI6MjA3MTk1OTM4NH0.rHgWYjc5PFQNcDIvgmNy3XHROcbSYNUYSk34b5aAU4E'

// Wait for Supabase to be available before creating client
let supabaseClient;

function initializeSupabase() {
  if (typeof supabase !== 'undefined') {
    supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);
    console.log('Supabase client initialized');
    
    // Initialize clicks functionality after Supabase is ready
    if (typeof initializeClicks === 'function') {
      initializeClicks();
    }
  } else {
    console.error('Supabase not available yet');
    // Retry after a short delay
    setTimeout(initializeSupabase, 100);
  }
}

// Start initialization when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeSupabase);
} else {
  initializeSupabase();
}

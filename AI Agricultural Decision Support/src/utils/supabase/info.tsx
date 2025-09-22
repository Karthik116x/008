// Supabase configuration info
// In Figma Make environment, we get these values from the connected Supabase instance
declare global {
  interface Window {
    SUPABASE_URL?: string;
    SUPABASE_ANON_KEY?: string;
  }
}

// Extract project ID from Supabase URL if available
const getProjectId = (): string => {
  // Try to get from global variables first (Figma Make provides these)
  if (typeof window !== 'undefined' && window.SUPABASE_URL) {
    return window.SUPABASE_URL.split('//')[1]?.split('.')[0] || 'lcayooawvvjmiegfmxml';
  }
  
  // Fallback to hardcoded project ID for Figma Make environment
  return 'lcayooawvvjmiegfmxml';
};

const getAnonKey = (): string => {
  // Try to get from global variables first
  if (typeof window !== 'undefined' && window.SUPABASE_ANON_KEY) {
    return window.SUPABASE_ANON_KEY;
  }
  
  // Fallback for Figma Make environment
  return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxjYXlvb2F3dnZqbWllZ2ZteG1sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI1NTI4NjMsImV4cCI6MjA0ODEyODg2M30.2vLBzm6lDe5H7-pqjCfDNvqoqKLb6hb8jQa7_y2Pklw';
};

export const projectId = getProjectId();
export const publicAnonKey = getAnonKey();

// In a real application, these would be loaded from environment variables
// For this demo, we'll use values that work with the Figma Make environment
console.log('Supabase project configured for Smart Farm Assistant:', projectId);
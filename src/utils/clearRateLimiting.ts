// Utility to clear any existing rate limiting data for smooth user experience
export const clearEnrollmentRateLimiting = () => {
  // Clear all possible rate limiting keys
  const keysToRemove = [
    'enrollment-submit-limit',
    'contact-submit-limit', 
    'newsletter-submit-limit'
  ];
  
  keysToRemove.forEach(key => {
    localStorage.removeItem(key);
  });
};

// Clear rate limiting on page load to ensure fresh start
if (typeof window !== 'undefined') {
  clearEnrollmentRateLimiting();
}
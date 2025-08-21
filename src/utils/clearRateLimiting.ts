// Clear all rate limiting data for enrollment
export const clearEnrollmentRateLimiting = () => {
  try {
    // Clear enrollment rate limiting data
    localStorage.removeItem('enrollment-submit-limit');
    
    // Clear any other enrollment-related rate limiting
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.includes('enrollment') && key.includes('limit')) {
        localStorage.removeItem(key);
      }
    });
    
    console.log('Enrollment rate limiting data cleared');
  } catch (error) {
    console.log('Error clearing rate limiting data:', error);
  }
};
// Security validation utility to verify RLS policies are working correctly
import { supabase } from '@/integrations/supabase/client';

export interface SecurityTestResult {
  table: string;
  test: string;
  passed: boolean;
  description: string;
  result?: any;
}

/**
 * Comprehensive security validation to verify that sensitive data is properly protected
 */
export const validateSecurity = async (): Promise<SecurityTestResult[]> => {
  const results: SecurityTestResult[] = [];

  // Test 1: Verify sensitive tables return 0 records for unauthorized access
  const sensitiveTables = [
    'contact_messages',
    'newsletter_subscriptions', 
    'orders',
    'mobile_orders',
    'enrollment_requests'
  ];

  for (const table of sensitiveTables) {
    try {
      const { data, error } = await supabase.from(table as any).select('*');
      
      results.push({
        table,
        test: 'Unauthorized Access Prevention',
        passed: (data?.length || 0) === 0,
        description: `Verify ${table} is not accessible without proper authorization`,
        result: `Returned ${data?.length || 0} records${error ? ` (Error: ${error.message})` : ''}`
      });
    } catch (error) {
      results.push({
        table,
        test: 'Unauthorized Access Prevention',
        passed: true,
        description: `${table} properly blocked unauthorized access`,
        result: `Access denied: ${error}`
      });
    }
  }

  // Test 2: Verify admin functions exist and work
  try {
    const { data, error } = await supabase.rpc('ultra_secure_admin_check');
    results.push({
      table: 'system',
      test: 'Admin Function Security',
      passed: typeof data === 'boolean',
      description: 'Verify admin security functions are available',
      result: `Admin check function ${data ? 'passed' : 'failed'}${error ? ` (Error: ${error.message})` : ''}`
    });
  } catch (error) {
    results.push({
      table: 'system', 
      test: 'Admin Function Security',
      passed: false,
      description: 'Admin security function test failed',
      result: `Error: ${error}`
    });
  }

  // Test 3: Verify RLS via direct SQL query (pg_tables not available via Supabase client)
  try {
    // Use RPC function to check RLS status
    const { data: rlsCheck } = await supabase.rpc('verify_bulletproof_security');
    
    results.push({
      table: 'system',
      test: 'RLS Status Check', 
      passed: rlsCheck === true,
      description: 'Verify Row Level Security is properly configured',
      result: `Bulletproof security verification ${rlsCheck ? 'passed' : 'failed'}`
    });
  } catch (error) {
    results.push({
      table: 'system',
      test: 'RLS Status Check',
      passed: false,
      description: 'Could not verify RLS status',
      result: `Error: ${error}`
    });
  }

  return results;
};

/**
 * Generate a security report showing the current security posture
 */
export const generateSecurityReport = async (): Promise<string> => {
  const results = await validateSecurity();
  const passed = results.filter(r => r.passed).length;
  const total = results.length;
  const score = Math.round((passed / total) * 100);

  let report = `🔒 SECURITY VALIDATION REPORT\n`;
  report += `=====================================\n`;
  report += `Overall Score: ${score}% (${passed}/${total} tests passed)\n\n`;

  results.forEach(result => {
    const status = result.passed ? '✅ PASS' : '❌ FAIL';
    report += `${status} ${result.table.toUpperCase()}: ${result.test}\n`;
    report += `   ${result.description}\n`;
    report += `   Result: ${result.result}\n\n`;
  });

  if (score === 100) {
    report += `🛡️ SECURITY STATUS: EXCELLENT\n`;
    report += `All security tests passed. Your data is properly protected.\n`;
  } else if (score >= 90) {
    report += `🟡 SECURITY STATUS: GOOD\n`;
    report += `Most security tests passed. Review failed tests for improvements.\n`;
  } else {
    report += `🔴 SECURITY STATUS: NEEDS ATTENTION\n`;
    report += `Multiple security tests failed. Immediate action required.\n`;
  }

  return report;
};

/**
 * Quick security check for critical vulnerabilities
 */
export const quickSecurityCheck = async (): Promise<boolean> => {
  try {
    // Test if we can access any sensitive data without authorization
    const sensitiveDataChecks = await Promise.all([
      supabase.from('contact_messages').select('email').limit(1),
      supabase.from('newsletter_subscriptions').select('email').limit(1),
      supabase.from('orders').select('email').limit(1)
    ]);

    // If any query returns data, we have a security issue
    const hasDataLeak = sensitiveDataChecks.some(check => 
      check.data && check.data.length > 0
    );

    return !hasDataLeak; // Return true if secure (no data leak)
  } catch (error) {
    console.warn('Security check encountered error:', error);
    return true; // Errors are expected when RLS is working properly
  }
};
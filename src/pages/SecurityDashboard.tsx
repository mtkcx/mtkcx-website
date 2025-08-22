import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, AlertTriangle, CheckCircle, XCircle, Play, RefreshCw } from 'lucide-react';
import { SecurityTester, SecurityTestResult, SECURITY_CHECKLIST } from '@/utils/security-testing';
import { SecurityAuditLogger } from '@/utils/enhanced-security';
import AdminProtectedRoute from '@/components/AdminProtectedRoute';
import { useToast } from '@/hooks/use-toast';

const SecurityDashboard: React.FC = () => {
  const [testResults, setTestResults] = useState<SecurityTestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [securityLogs, setSecurityLogs] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadSecurityLogs();
  }, []);

  const loadSecurityLogs = () => {
    const logs = SecurityAuditLogger.getSecurityLogs();
    setSecurityLogs(logs.slice(-50)); // Show last 50 events
  };

  const runSecurityTests = async () => {
    setIsRunning(true);
    try {
      const results = await SecurityTester.runAllTests();
      setTestResults(results);
      
      const failedTests = results.filter(r => !r.passed).length;
      if (failedTests === 0) {
        toast({
          title: 'Security Tests Passed',
          description: 'All security tests completed successfully',
        });
      } else {
        toast({
          title: 'Security Issues Found',
          description: `${failedTests} security test(s) failed`,
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Test Error',
        description: error instanceof Error ? error.message : 'Failed to run security tests',
        variant: 'destructive',
      });
    } finally {
      setIsRunning(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getTestStatusIcon = (passed: boolean) => {
    return passed ? 
      <CheckCircle className="w-4 h-4 text-green-600" /> : 
      <XCircle className="w-4 h-4 text-red-600" />;
  };

  return (
    <AdminProtectedRoute>
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Shield className="w-8 h-8 text-primary" />
              Security Dashboard
            </h1>
            <Button
              onClick={runSecurityTests}
              disabled={isRunning}
              className="flex items-center gap-2"
            >
              {isRunning ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              {isRunning ? 'Running Tests...' : 'Run Security Tests'}
            </Button>
          </div>

          <Tabs defaultValue="tests" className="space-y-6">
            <TabsList>
              <TabsTrigger value="tests">Security Tests</TabsTrigger>
              <TabsTrigger value="logs">Security Logs</TabsTrigger>
              <TabsTrigger value="checklist">Security Checklist</TabsTrigger>
            </TabsList>

            <TabsContent value="tests" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Automated Security Tests
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {testResults.length === 0 ? (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        No security tests have been run yet. Click "Run Security Tests" to begin automated security verification.
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <div className="space-y-3">
                      {testResults.map((result, index) => (
                        <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                          {getTestStatusIcon(result.passed)}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium">{result.test}</span>
                              <Badge variant={result.passed ? 'default' : 'destructive'}>
                                {result.passed ? 'PASS' : 'FAIL'}
                              </Badge>
                            </div>
                            {result.details && (
                              <p className="text-sm text-muted-foreground">{result.details}</p>
                            )}
                            {result.error && (
                              <p className="text-sm text-red-600">{result.error}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="logs" className="space-y-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    Security Event Logs
                  </CardTitle>
                  <Button variant="outline" size="sm" onClick={loadSecurityLogs}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                  </Button>
                </CardHeader>
                <CardContent>
                  {securityLogs.length === 0 ? (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        No security events logged yet.
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {securityLogs.map((log, index) => (
                        <div key={index} className="flex items-start gap-3 p-3 border rounded-lg text-sm">
                          <Badge variant={getSeverityColor(log.severity)}>
                            {log.severity}
                          </Badge>
                          <div className="flex-1">
                            <div className="font-medium">{log.event}</div>
                            <div className="text-muted-foreground text-xs mt-1">
                              {new Date(log.timestamp).toLocaleString()}
                            </div>
                            {log.details && log.details !== '{}' && (
                              <div className="text-xs text-muted-foreground mt-1 bg-muted p-2 rounded">
                                {log.details}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="checklist" className="space-y-4">
              {SECURITY_CHECKLIST.map((category, categoryIndex) => (
                <Card key={categoryIndex}>
                  <CardHeader>
                    <CardTitle>{category.category}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {category.items.map((item, itemIndex) => (
                        <div key={itemIndex} className="flex items-center gap-2 p-2 border rounded">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="text-sm">{item}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AdminProtectedRoute>
  );
};

export default SecurityDashboard;
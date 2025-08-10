import React, { useEffect } from 'react';
import { SecurityAuditLogger } from '@/utils/enhanced-security';

interface SecurityMiddlewareProps {
  children: React.ReactNode;
}

const SecurityMiddleware: React.FC<SecurityMiddlewareProps> = ({ children }) => {
  useEffect(() => {
    // Set up global security headers and monitoring
    const setupSecurity = () => {
      // Add Content Security Policy via meta tag if not already present
      if (!document.querySelector('meta[http-equiv="Content-Security-Policy"]')) {
        const cspMeta = document.createElement('meta');
        cspMeta.setAttribute('http-equiv', 'Content-Security-Policy');
        cspMeta.setAttribute('content', 
          "default-src 'self'; " +
          "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://fonts.googleapis.com https://fonts.gstatic.com https://api.supabase.com; " +
          "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
          "img-src 'self' data: https: blob:; " +
          "font-src 'self' https://fonts.googleapis.com https://fonts.gstatic.com; " +
          "connect-src 'self' https://*.supabase.co https://*.supabase.com; " +
          "frame-ancestors 'none'; " +
          "form-action 'self';"
        );
        document.head.appendChild(cspMeta);
      }

      // Monitor for security events
      const originalConsoleError = console.error;
      console.error = (...args: any[]) => {
        // Log security-related errors
        const message = args.join(' ');
        if (message.includes('CSP') || message.includes('security') || message.includes('XSS')) {
          SecurityAuditLogger.logSecurityEvent('console_security_error', 'high', {
            message,
            stack: new Error().stack
          });
        }
        originalConsoleError.apply(console, args);
      };

      // Monitor for suspicious DOM manipulations
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'childList') {
            mutation.addedNodes.forEach((node) => {
              if (node.nodeType === Node.ELEMENT_NODE) {
                const element = node as Element;
                // Check for suspicious script injections
                if (element.tagName === 'SCRIPT' && element.getAttribute('src')?.includes('javascript:')) {
                  SecurityAuditLogger.logSecurityEvent('suspicious_script_injection', 'critical', {
                    src: element.getAttribute('src'),
                    innerHTML: element.innerHTML
                  });
                  element.remove();
                }
              }
            });
          }
        });
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true
      });

      // Monitor for clipboard access attempts
      document.addEventListener('paste', (event) => {
        SecurityAuditLogger.logSecurityEvent('clipboard_access', 'low', {
          timestamp: new Date().toISOString()
        });
      });

      // Monitor for devtools opening (basic detection)
      let devtools = {open: false, orientation: null};
      const threshold = 160;
      
      setInterval(() => {
        if (window.outerHeight - window.innerHeight > threshold || 
            window.outerWidth - window.innerWidth > threshold) {
          if (!devtools.open) {
            devtools.open = true;
            SecurityAuditLogger.logSecurityEvent('devtools_opened', 'medium', {
              timestamp: new Date().toISOString()
            });
          }
        } else {
          devtools.open = false;
        }
      }, 500);

      // Monitor for right-click context menu
      document.addEventListener('contextmenu', (event) => {
        SecurityAuditLogger.logSecurityEvent('context_menu_access', 'low', {
          timestamp: new Date().toISOString(),
          element: event.target?.constructor.name
        });
      });

      return () => {
        observer.disconnect();
        console.error = originalConsoleError;
      };
    };

    const cleanup = setupSecurity();

    // Log initial page load
    SecurityAuditLogger.logSecurityEvent('page_load', 'low', {
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString()
    });

    return cleanup;
  }, []);

  return <>{children}</>;
};

export default SecurityMiddleware;
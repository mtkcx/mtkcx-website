import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, AlertTriangle, LogIn } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';

interface MobileAdminProtectedRouteProps {
  children: React.ReactNode;
  onShowAuth?: () => void;
}

const MobileAdminProtectedRoute: React.FC<MobileAdminProtectedRouteProps> = ({ 
  children, 
  onShowAuth 
}) => {
  const { user, isAdmin, loading } = useAuth();
  const { t } = useLanguage();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="p-6 w-full max-w-md space-y-4">
          <div className="text-center space-y-3">
            <LogIn className="h-12 w-12 text-muted-foreground mx-auto" />
            <h2 className="text-xl font-semibold">{t('auth.sign_in_required')}</h2>
            <p className="text-muted-foreground text-sm">
              {t('auth.admin_access_required')}
            </p>
            {onShowAuth && (
              <Button onClick={onShowAuth} className="w-full">
                <LogIn className="h-4 w-4 mr-2" />
                {t('auth.sign_in')}
              </Button>
            )}
          </div>
        </Card>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="p-6 w-full max-w-md space-y-4">
          <div className="text-center space-y-3">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto" />
            <h2 className="text-xl font-semibold text-red-600">{t('auth.access_denied')}</h2>
            <p className="text-muted-foreground text-sm">
              {t('auth.admin_privileges_required')}
            </p>
            <div className="bg-red-50 p-3 rounded-lg">
              <p className="text-red-800 text-xs">
                {t('auth.contact_admin_access')}
              </p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Admin Badge */}
      <div className="absolute top-4 right-4 z-50">
        <div className="bg-primary text-primary-foreground px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
          <Shield className="h-3 w-3" />
          {t('mobile.nav.admin')}
        </div>
      </div>
      {children}
    </div>
  );
};

export default MobileAdminProtectedRoute;
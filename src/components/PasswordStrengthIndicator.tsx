import React from 'react';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, XCircle } from 'lucide-react';
import { PasswordSecurityManager } from '@/utils/enhanced-security';

interface PasswordStrengthIndicatorProps {
  password: string;
  showDetails?: boolean;
}

const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({
  password,
  showDetails = true
}) => {
  const validation = PasswordSecurityManager.validatePasswordStrength(password);

  const getStrengthLabel = (score: number) => {
    if (score < 40) return { label: 'Very Weak', color: 'bg-red-500' };
    if (score < 60) return { label: 'Weak', color: 'bg-orange-500' };
    if (score < 80) return { label: 'Good', color: 'bg-yellow-500' };
    if (score < 100) return { label: 'Strong', color: 'bg-green-500' };
    return { label: 'Very Strong', color: 'bg-green-600' };
  };

  const strength = getStrengthLabel(validation.score);

  if (!password) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Progress value={validation.score} className="flex-1 h-2" />
        <span className="text-xs font-medium text-muted-foreground min-w-[80px]">
          {strength.label}
        </span>
      </div>

      {showDetails && validation.feedback.length > 0 && (
        <div className="space-y-1">
          {validation.feedback.map((feedback, index) => (
            <div key={index} className="flex items-center gap-2 text-xs text-muted-foreground">
              <XCircle className="w-3 h-3 text-red-500" />
              <span>{feedback}</span>
            </div>
          ))}
        </div>
      )}

      {showDetails && validation.valid && (
        <div className="flex items-center gap-2 text-xs text-green-600">
          <CheckCircle className="w-3 h-3" />
          <span>Password meets all security requirements</span>
        </div>
      )}
    </div>
  );
};

export default PasswordStrengthIndicator;
// apps/frontend/src/components/common/NotificationBanner.tsx
import { useState } from 'react';
import { Bell, X } from 'lucide-react';

interface NotificationBannerProps {
  message: string;
  expiryDate?: string;
  type?: 'info' | 'warning' | 'success' | 'error';
  actionLabel?: string;
  onAction?: () => void;
}

export default function NotificationBanner({ 
  message, 
  expiryDate,
  type = 'warning',
  actionLabel = 'Activer',
  onAction
}: NotificationBannerProps) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  const bgColors = {
    info: 'bg-blue-100 border-blue-200',
    warning: 'bg-orange-100 border-orange-200',
    success: 'bg-green-100 border-green-200',
    error: 'bg-red-100 border-red-200',
  };

  const textColors = {
    info: 'text-blue-800',
    warning: 'text-orange-800',
    success: 'text-green-800',
    error: 'text-red-800',
  };

  const buttonColors = {
    info: 'bg-blue-600 hover:bg-blue-700',
    warning: 'bg-orange-600 hover:bg-orange-700',
    success: 'bg-green-600 hover:bg-green-700',
    error: 'bg-red-600 hover:bg-red-700',
  };

  return (
    <div className={`${bgColors[type]} border rounded-xl p-4 mb-6 shadow-sm`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Bell className={`w-5 h-5 ${textColors[type]}`} />
          <div className={`${textColors[type]}`}>
            <span className="font-semibold">MODE TEST : </span>
            <span>{message}</span>
            {expiryDate && (
              <>
                {' '}valable jusqu'au{' '}
                <span className="font-bold text-orange-600">{expiryDate}</span>
              </>
            )}
            <span>. Renouveler ou activer un abonnement pour continuer et débloquer toutes les fonctionnalités.</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {onAction && (
            <button
              onClick={onAction}
              className={`${buttonColors[type]} text-white px-4 py-2 rounded-lg font-medium transition-colors`}
            >
              {actionLabel}
            </button>
          )}
          <button
            onClick={() => setIsVisible(false)}
            className="p-1 hover:bg-white/50 rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
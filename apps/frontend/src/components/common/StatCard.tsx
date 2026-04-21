// apps/frontend/src/components/common/StatCard.tsx
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color?: 'purple' | 'blue' | 'green' | 'orange' | 'teal' | 'pink';
  subtitle?: string;
}

export default function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  color = 'purple',
  subtitle 
}: StatCardProps) {
  const gradients = {
    purple: 'from-purple-500 to-purple-600',
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    orange: 'from-orange-500 to-orange-600',
    teal: 'from-teal-500 to-teal-600',
    pink: 'from-pink-500 to-pink-600',
  };

  return (
    <div className={`bg-gradient-to-br ${gradients[color]} rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <p className="text-white/80 text-sm font-medium uppercase tracking-wide mb-2">
            {title}
          </p>
          <p className="text-3xl font-bold">
            {value}
          </p>
          {subtitle && (
            <p className="text-white/70 text-xs mt-1">{subtitle}</p>
          )}
        </div>
        
        <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
          <Icon className="w-8 h-8" />
        </div>
      </div>
    </div>
  );
}
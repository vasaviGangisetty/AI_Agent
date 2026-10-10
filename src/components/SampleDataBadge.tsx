import React from 'react';
import { Info } from 'lucide-react';

interface SampleDataBadgeProps {
  label?: string;
  tooltip?: string;
  className?: string;
}

export const SampleDataBadge: React.FC<SampleDataBadgeProps> = ({
  label = 'Simulated / Sample Data',
  tooltip = 'Based on historical averages & seasonal tourist models. Not real-time live quotes.',
  className = '',
}) => {
  return (
    <span
      title={tooltip}
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200/80 shadow-xs cursor-help ${className}`}
    >
      <Info className="w-3 h-3 text-amber-600 shrink-0" />
      <span>{label}</span>
    </span>
  );
};

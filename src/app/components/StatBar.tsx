interface StatBarProps {
  label: string;
  value: number;
  maxValue?: number;
  color?: string;
}

export function StatBar({ label, value, maxValue = 255, color = '#6890F0' }: StatBarProps) {
  const percentage = Math.min((value / maxValue) * 100, 100);
  
  return (
    <div className="flex items-center gap-3">
      <div className="w-16 text-sm font-medium text-gray-600 uppercase text-right">
        {label}
      </div>
      <div className="text-sm font-bold text-gray-900 w-8 text-right">
        {value}
      </div>
      <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div
          style={{ 
            width: `${percentage}%`,
            backgroundColor: color
          }}
          className="h-full rounded-full transition-all duration-500"
        />
      </div>
    </div>
  );
}

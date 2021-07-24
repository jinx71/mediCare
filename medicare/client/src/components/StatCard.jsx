import React from 'react';
import Card from './Card';

const StatCard = ({ label, value, tone = 'brand', icon }) => {
  const tones = {
    brand: 'text-brand-600 bg-brand-50',
    info: 'text-sky-600 bg-sky-50',
    success: 'text-green-600 bg-green-50',
    danger: 'text-red-600 bg-red-50',
  };
  return (
    <Card className="flex items-center gap-4 p-4">
      <div className={`flex h-11 w-11 items-center justify-center rounded-xl text-lg ${tones[tone]}`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-semibold text-ink-900">{value}</p>
        <p className="text-sm text-ink-500">{label}</p>
      </div>
    </Card>
  );
};

export default StatCard;

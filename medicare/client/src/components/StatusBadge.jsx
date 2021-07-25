import React from 'react';
import Badge from './Badge';

const MAP = {
  booked: { tone: 'info', label: 'Booked' },
  completed: { tone: 'success', label: 'Completed' },
  cancelled: { tone: 'danger', label: 'Cancelled' },
};

const StatusBadge = ({ status }) => {
  const { tone, label } = MAP[status] || { tone: 'neutral', label: status };
  return <Badge tone={tone}>{label}</Badge>;
};

export default StatusBadge;

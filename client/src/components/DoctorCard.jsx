import React from 'react';
import { Link } from 'react-router-dom';
import Card from './Card';
import Badge from './Badge';
import Avatar from './Avatar';
import Button from './Button';

const StarIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-amber-400">
    <path d="M12 2l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.8 5.9 21.4l1.4-6.8L2.2 9.9l6.9-.8L12 2z" />
  </svg>
);

const DoctorCard = ({ doctor }) => (
  <Card hover className="flex flex-col p-5">
    <div className="flex items-start gap-4">
      <Avatar name={doctor.name} src={doctor.photo} size="md" />
      <div className="min-w-0 flex-1">
        <h3 className="truncate font-semibold text-ink-900">{doctor.name}</h3>
        <Badge tone="brand" className="mt-1">
          {doctor.specialty}
        </Badge>
      </div>
    </div>

    {doctor.bio && <p className="mt-3 line-clamp-3 text-sm text-ink-500">{doctor.bio}</p>}

    <div className="mt-4 flex items-center justify-between text-sm text-ink-500">
      <span className="inline-flex items-center gap-1">
        <StarIcon />
        {doctor.rating?.toFixed(1)}
      </span>
      <span>{doctor.experienceYears} yrs exp</span>
      <span className="font-medium text-ink-900">€{doctor.consultationFee}</span>
    </div>

    <Link to={`/doctors/${doctor._id}`} className="mt-4">
      <Button className="w-full">View &amp; book</Button>
    </Link>
  </Card>
);

export default DoctorCard;

import React from 'react';
import { InteractiveEmergencyMap } from './InteractiveEmergencyMap';
import { Organization, BloodRequest } from '../../types';

interface BloodMapProps {
  organizations?: Organization[];
  requests?: BloodRequest[];
  center?: [number, number];
  zoom?: number;
  userCoords?: [number, number] | null;
  className?: string;
}

export const BloodMap: React.FC<BloodMapProps> = ({
  center = [22.5, 79.0], // Default India Center
  zoom = 5,              // Overview of India
  className = 'h-[500px] w-full',
}) => {
  return (
    <InteractiveEmergencyMap
      className={className}
      initialCenter={center}
      initialZoom={zoom}
    />
  );
};

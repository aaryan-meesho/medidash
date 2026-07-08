import { useEffect, useRef } from 'react';
import HospitalCard from './HospitalCard.jsx';

export default function HospitalList({
  hospitals,
  userLocation,
  onViewDetails,
  selectedHospitalId,
  firstCardRef,
  onHoverHospital,
}) {
  const cardRefs = useRef(new Map());

  useEffect(() => {
    if (selectedHospitalId == null) return;
    cardRefs.current.get(selectedHospitalId)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [selectedHospitalId]);

  if (hospitals.length === 0) {
    return <p className="empty-state">No hospitals found. Try zooming out.</p>;
  }

  return (
    <ul className="hospital-list">
      {hospitals.map((hospital, index) => (
        <HospitalCard
          key={hospital.id}
          innerRef={(node) => {
            if (node) cardRefs.current.set(hospital.id, node);
            else cardRefs.current.delete(hospital.id);
            if (index === 0 && firstCardRef) firstCardRef.current = node;
          }}
          hospital={hospital}
          rank={index + 1}
          userLocation={userLocation}
          isSelected={hospital.id === selectedHospitalId}
          onViewDetails={onViewDetails}
          onHoverChange={onHoverHospital}
        />
      ))}
    </ul>
  );
}

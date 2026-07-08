import { buildDirectionsUrl } from '../directions.js';
import { formatVerifiedDate, INSURER_HELPLINE } from '../demoMetadata.js';

export default function HospitalCard({
  hospital,
  rank,
  userLocation,
  onViewDetails,
  innerRef,
  isSelected,
  onHoverChange,
}) {
  return (
    <li
      ref={innerRef}
      className={`hospital-card${isSelected ? ' hospital-card--selected' : ''}`}
      onMouseEnter={() => onHoverChange?.(hospital.id)}
      onMouseLeave={() => onHoverChange?.(null)}
    >
      <div className="hospital-card__rank">{rank}</div>
      <div className="hospital-card__body">
        <div className="hospital-card__header">
          <h3>{hospital.name}</h3>
          {hospital.cashlessAvailable && <span className="badge badge--cashless">Cashless</span>}
        </div>

        <div className="hospital-card__meta">
          <span className="hospital-card__distance">{hospital.distance} km</span>
          <span className="hospital-card__drive">&#128663; {hospital.driveMinutes} min drive</span>
        </div>

        <p className="hospital-card__address">{hospital.address}</p>

        <p className="hospital-card__verified">
          <span className="hospital-card__insurer">&#128737; {hospital.insurer}</span>
          {' • '}
          Last verified: {formatVerifiedDate(hospital.lastVerified)}{' '}
          <span className="info-dot" title="Demo data for this preview - not yet verified with real providers">
            &#9432;
          </span>
        </p>

        <div className="hospital-card__tags">
          {hospital.tags.map((tag) => (
            <span key={tag} className="tag">
              {tag}
            </span>
          ))}
        </div>

        <div className="hospital-card__actions">
          <a
            className="action-button action-button--outline"
            href={buildDirectionsUrl(userLocation, hospital)}
            target="_blank"
            rel="noopener noreferrer"
          >
            &#129517; Directions
          </a>
          <a className="action-button action-button--outline" href={`tel:${INSURER_HELPLINE.tel}`}>
            &#128222; Call
          </a>
        </div>

        <button className="link-button hospital-card__details" onClick={() => onViewDetails(hospital)}>
          View details &rsaquo;
        </button>
      </div>
    </li>
  );
}

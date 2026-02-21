import './AccessibilityBadges.css';

const BADGE_MAP = {
  wheelchairPassable: { icon: '\u267F', label: 'Wheelchair', variant: 'green' },
  strollerFriendly: { icon: '\uD83D\uDEBC', label: 'Stroller', variant: 'green' },
  guideDogSuitable: { icon: '\uD83E\uDDAE', label: 'Guide Dog', variant: 'green' },
  restSeating: { icon: '\uD83E\uDE91', label: 'Benches', variant: 'green' },
  accessibleToilet: { icon: '\uD83D\uDEBB', label: 'Toilet', variant: 'green' },
  shadedSections: { icon: '\uD83C\uDF33', label: 'Shaded', variant: 'green' },
  clearSignage: { icon: '\uD83E\uDEA7', label: 'Signage', variant: 'green' },
};

export default function AccessibilityBadges({ accessibility, maxShow = 4 }) {
  if (!accessibility) return null;

  const active = Object.entries(accessibility)
    .filter(([key, val]) => val === true && BADGE_MAP[key])
    .map(([key]) => BADGE_MAP[key]);

  const shown = active.slice(0, maxShow);
  const remaining = active.length - maxShow;

  return (
    <div className="access-badges" aria-label="Accessibility features">
      {shown.map((badge, i) => (
        <span
          key={i}
          className={`access-badge access-badge--${badge.variant}`}
          title={badge.label}
          aria-label={badge.label}
        >
          <span aria-hidden="true">{badge.icon}</span>
          <span className="access-badge__label">{badge.label}</span>
        </span>
      ))}
      {remaining > 0 && (
        <span className="access-badge access-badge--more">+{remaining}</span>
      )}
    </div>
  );
}

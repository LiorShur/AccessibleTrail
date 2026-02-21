import './SegmentedControl.css';

export default function SegmentedControl({ options, value, onChange, ariaLabel }) {
  return (
    <div className="seg-control" role="radiogroup" aria-label={ariaLabel}>
      {options.map((opt) => {
        const optValue = typeof opt === 'string' ? opt : opt.value;
        const optLabel = typeof opt === 'string' ? opt : opt.label;
        const active = value === optValue;
        return (
          <button
            key={optValue}
            className={`seg-opt ${active ? 'seg-opt--active' : ''}`}
            role="radio"
            aria-checked={active}
            onClick={() => onChange(optValue)}
          >
            {optLabel}
          </button>
        );
      })}
    </div>
  );
}

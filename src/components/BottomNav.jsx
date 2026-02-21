import { useLocation, useNavigate } from 'react-router-dom';
import './BottomNav.css';

const tabs = [
  { path: '/', icon: '\uD83C\uDFE0', label: 'Home' },
  { path: '/browse', icon: '\uD83D\uDDFA\uFE0F', label: 'Explore' },
  { path: '/my-trails', icon: '\uD83D\uDCCD', label: 'My Trails' },
  { path: '/settings', icon: '\u2699\uFE0F', label: 'Settings' },
];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  // Hide bottom nav during recording
  if (location.pathname === '/record' || location.pathname === '/review') {
    return null;
  }

  return (
    <nav className="bottom-nav" aria-label="Main navigation">
      {tabs.map((tab) => {
        const active = location.pathname === tab.path;
        return (
          <button
            key={tab.path}
            className={`nav-tab ${active ? 'nav-tab--active' : ''}`}
            onClick={() => navigate(tab.path)}
            aria-current={active ? 'page' : undefined}
            aria-label={tab.label}
          >
            <span className="nav-tab__icon" aria-hidden="true">
              {tab.icon}
            </span>
            <span className="nav-tab__label">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

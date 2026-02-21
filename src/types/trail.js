/**
 * Trail data types and constants for AccessibleTrail.
 *
 * These are plain JS objects / config — components import these
 * for tag definitions, default values, etc.
 */

export const WAYPOINT_TAGS = {
  accessible: { label: 'Accessible', icon: '\u267F' },
  'rest-bench': { label: 'Rest Bench', icon: '\uD83E\uDE91' },
  steep: { label: 'Steep', icon: '\u26A0\uFE0F' },
  narrow: { label: 'Narrow', icon: '\u2194\uFE0F' },
  uneven: { label: 'Uneven', icon: '\u3030\uFE0F' },
  water: { label: 'Water', icon: '\uD83D\uDCA7' },
  toilet: { label: 'Toilet', icon: '\uD83D\uDEBB' },
  viewpoint: { label: 'View', icon: '\uD83D\uDC41\uFE0F' },
};

export const DIFFICULTY_OPTIONS = ['easy', 'moderate', 'hard'];
export const SURFACE_OPTIONS = ['paved', 'gravel', 'dirt', 'mixed'];
export const WIDTH_OPTIONS = [
  { value: 'narrow', label: '<1m' },
  { value: 'medium', label: '1\u20132m' },
  { value: 'wide', label: '>2m' },
];
export const MOBILITY_OPTIONS = ['full', 'partial', 'limited'];

export const ACCESSIBILITY_FIELDS = [
  { key: 'wheelchairPassable', label: 'Wheelchair passable throughout' },
  { key: 'strollerFriendly', label: 'Suitable for strollers / prams' },
  { key: 'guideDogSuitable', label: 'Suitable for guide dog users' },
  { key: 'restSeating', label: 'Rest seating available' },
  { key: 'accessibleToilet', label: 'Accessible toilet on route' },
  { key: 'shadedSections', label: 'Shaded sections present' },
  { key: 'hearingLoop', label: 'Hearing loop / audio guides' },
  { key: 'clearSignage', label: 'Clear wayfinding signage' },
];

export function createDefaultAccessibility() {
  return {
    wheelchairPassable: false,
    strollerFriendly: false,
    guideDogSuitable: false,
    restSeating: false,
    accessibleToilet: false,
    shadedSections: false,
    hearingLoop: false,
    clearSignage: false,
    mobilityRating: 'full',
  };
}

export function createDefaultMetadata() {
  return {
    name: '',
    difficulty: 'easy',
    surfaceType: 'paved',
    pathWidth: 'medium',
    notes: '',
  };
}

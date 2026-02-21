import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  GeoPoint,
} from 'firebase/firestore';

// Firebase configuration — replace with your own project credentials
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'demo-key',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'demo.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'demo-project',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'demo.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '000000000',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:000:web:000',
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ── Trail operations ──

export async function saveTrail(trail) {
  const trailData = {
    ...trail,
    path: trail.path.map((p) => ({
      lat: p.lat,
      lng: p.lng,
      altitude: p.altitude || null,
      timestamp: p.timestamp,
    })),
    waypoints: trail.waypoints.map((wp) => ({
      ...wp,
      position: { lat: wp.position.lat, lng: wp.position.lng },
    })),
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  const docRef = await addDoc(collection(db, 'trails'), trailData);
  return docRef.id;
}

export async function getTrail(id) {
  const docSnap = await getDoc(doc(db, 'trails', id));
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() };
  }
  return null;
}

export async function getTrails(filters = {}) {
  let q = collection(db, 'trails');
  const constraints = [where('published', '==', true)];

  if (filters.difficulty) {
    constraints.push(where('metadata.difficulty', '==', filters.difficulty));
  }

  q = query(q, ...constraints, orderBy('createdAt', 'desc'), limit(50));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function updateTrail(id, updates) {
  await updateDoc(doc(db, 'trails', id), {
    ...updates,
    updatedAt: Date.now(),
  });
}

export { db, GeoPoint };

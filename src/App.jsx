import { BrowserRouter, Routes, Route } from 'react-router-dom';
import BottomNav from './components/BottomNav';
import HomeScreen from './screens/HomeScreen';
import RecordScreen from './screens/RecordScreen';
import ReviewScreen from './screens/ReviewScreen';
import BrowseScreen from './screens/BrowseScreen';
import MyTrailsScreen from './screens/MyTrailsScreen';
import SettingsScreen from './screens/SettingsScreen';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomeScreen />} />
        <Route path="/record" element={<RecordScreen />} />
        <Route path="/review" element={<ReviewScreen />} />
        <Route path="/browse" element={<BrowseScreen />} />
        <Route path="/my-trails" element={<MyTrailsScreen />} />
        <Route path="/settings" element={<SettingsScreen />} />
      </Routes>
      <BottomNav />
    </BrowserRouter>
  );
}

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import BottomNav from './components/BottomNav';
import FridgePage from './pages/FridgePage';
import RecommendPage from './pages/RecommendPage';
import MenuPage from './pages/MenuPage';
import RecipesPage from './pages/RecipesPage';
import SettingsPage from './pages/SettingsPage';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 pb-20">
        <Routes>
          <Route path="/" element={<FridgePage />} />
          <Route path="/recommend" element={<RecommendPage />} />
          <Route path="/menu" element={<MenuPage />} />
          <Route path="/recipes" element={<RecipesPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
        <BottomNav />
      </div>
    </BrowserRouter>
  );
}

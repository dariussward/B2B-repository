import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Footer, Header } from './components/Layout';
import { LandingPage } from './pages/LandingPage';
import { ScoutPage } from './pages/ScoutPage';
import { LocationDetailPage } from './pages/LocationDetailPage';
import { IntelligencePage } from './pages/IntelligencePage';

export default function App() {
  return (
    <BrowserRouter>
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/scout" element={<ScoutPage />} />
          <Route path="/intelligence" element={<IntelligencePage />} />
          <Route path="/location/:id" element={<LocationDetailPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </BrowserRouter>
  );
}

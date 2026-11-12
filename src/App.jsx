import { BrowserRouter, Routes, Route } from 'react-router';
import NavBar from './components/NavBar';
import BenefitsCheckPage from './pages/BenefitsCheckPage';
import AboutPage from './pages/AboutPage';
import NotFoundPage from './pages/NotFoundPage';
import ListResultsPage from './pages/ListResultsPage';
import Footer from './components/Footer';
import ResourceDetailsPage from './pages/ResourceDetailsPage';

export default function App() {
  return (
    <BrowserRouter>
      <NavBar />

      <Routes>
        <Route path="/" element={<ListResultsPage />} />
        <Route path="/benefits-check" element={<BenefitsCheckPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/resource-details" element={<ResourceDetailsPage />} />

        <Route path="*" element={<NotFoundPage />} />
      </Routes>

      <Footer />
    </BrowserRouter>
  );
}

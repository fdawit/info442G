import { BrowserRouter, Routes, Route } from 'react-router';
import NavBar from './components/NavBar';
import BenefitsCheckPage from './pages/BenefitsCheckPage';
import AboutPage from './pages/AboutPage';
import NotFoundPage from './pages/NotFoundPage';
import ListResultsPage from './pages/ListResultsPage';

import { BenefitsDemoPage } from "./pages/BenefitsDemoPage.jsx"; //Delete once done testing

export default function App() {
  return (
    <BrowserRouter>
      <NavBar />

      <Routes>
        <Route path="/" element={<ListResultsPage />} />
        <Route path="/benefits-check" element={<BenefitsCheckPage />} />
        <Route path="/about" element={<AboutPage />} />

        <Route path="/benefits-test" element={<BenefitsDemoPage />} /> {/* Remove this route once done testing */}

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

//For issue 1, this only shows the results page

import ListResultsPage from './pages/ListResultsPage';
import { BenefitsDemoPage } from "./pages/BenefitsDemoPage.jsx";

export default function App() {
  const parameters = new URLSearchParams(window.location.search);
  const view = parameters.get("view");

  if (view === "benefits-s1") {return <BenefitsDemoPage />;}
  return <ListResultsPage />;
}

import { Route, Routes, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Report from './pages/Report';
import IssueDetail from './pages/IssueDetail';
import Admin from './pages/Admin';
import ReportWizard from './components/ReportWizard';

export default function App() {
  const location = useLocation();
  const state = location.state;
  const background = state?.background;

  return (
    <>
      <Routes location={background || location}>
        <Route path="/" element={<Home />} />
        <Route path="/report" element={<Report />} />
        <Route path="/issue/:id" element={<IssueDetail />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
      {background && location.pathname === '/report' && <ReportWizard modal />}
    </>
  );
}

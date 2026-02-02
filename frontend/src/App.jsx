import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Send from './pages/Send';
import Recharge from './pages/Recharge';
import History from './pages/History';
import Settings from './pages/Settings';
import Cards from './pages/Cards';
import HistoryDetail from './pages/HistoryDetail';
import Pagos from './pages/Pagos';

function App() {
  // Rutas principales de la app
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/send" element={<Send />} />
        <Route path="/recharge" element={<Recharge />} />
        <Route path="/history" element={<History />} />
        <Route path="/history/:id" element={<HistoryDetail />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/cards" element={<Cards />} />
        <Route path="/pagos" element={<Pagos />} />
      </Routes>
    </Router>
  );
}

export default App;

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Modeling from './pages/Modeling'
import FabSim from './pages/FabSim'
import HWSim from './pages/HWSim'

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/modeling" replace />} />
          <Route path="/modeling" element={<Modeling />} />
          <Route path="/fab-sim" element={<FabSim />} />
          <Route path="/hw-sim" element={<HWSim />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App


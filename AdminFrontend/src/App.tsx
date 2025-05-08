
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Layout from './components/layout/Layout';
import SignIn from './pages/SignIn';
import NotFound from './pages/NotFound';
import Destinations from './pages/Destinations';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import './index.css';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/sign-in" element={<SignIn />} />
            <Route path="/" element={
              <ProtectedRoute>
                <Layout>
                  <Destinations />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

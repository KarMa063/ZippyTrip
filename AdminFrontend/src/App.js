import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

// Import components
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Layout from './components/Layout';
import AddDestination from './pages/AddDestination';
// Import other pages as needed

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="add-destination" element={<AddDestination />} />
          {/* Add other routes as needed */}
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
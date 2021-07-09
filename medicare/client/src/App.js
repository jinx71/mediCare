import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import RoleRoute from './components/RoleRoute';

import Home from './pages/Home';
import Doctors from './pages/Doctors';
import DoctorDetail from './pages/DoctorDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import DrugLookup from './pages/DrugLookup';
import PatientDashboard from './pages/PatientDashboard';
import AdminDashboard from './pages/AdminDashboard';
import NotFound from './pages/NotFound';

const App = () => (
  <Routes>
    <Route element={<Layout />}>
      {/* Public */}
      <Route path="/" element={<Home />} />
      <Route path="/doctors" element={<Doctors />} />
      <Route path="/doctors/:id" element={<DoctorDetail />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Any signed-in user */}
      <Route
        path="/drugs"
        element={
          <ProtectedRoute>
            <DrugLookup />
          </ProtectedRoute>
        }
      />

      {/* Patient only */}
      <Route
        path="/dashboard"
        element={
          <RoleRoute role="patient">
            <PatientDashboard />
          </RoleRoute>
        }
      />

      {/* Admin only (RBAC) */}
      <Route
        path="/admin"
        element={
          <RoleRoute role="admin">
            <AdminDashboard />
          </RoleRoute>
        }
      />

      <Route path="*" element={<NotFound />} />
    </Route>
  </Routes>
);

export default App;

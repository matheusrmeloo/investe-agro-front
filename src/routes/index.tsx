import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Layout from '../components/Layout';
import Login from '../pages/Login';
import RegisterClient from '../pages/RegisterClient';
import ClientList from '../pages/ClientList';
import ClientDetails from '../pages/ClientDetails';
import ClientNotes from '../pages/ClientNotes';
import Reports from '../pages/Reports';

const AppRoutes: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route element={<Layout />}>
          <Route path="/register-client" element={<RegisterClient />} />
          <Route path="/clients" element={<ClientList />} />
          <Route path="/clients/:id" element={<ClientDetails />} />
          <Route path="/clients/:id/notes" element={<ClientNotes />} />
          <Route path="/reports" element={<Reports />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default AppRoutes;

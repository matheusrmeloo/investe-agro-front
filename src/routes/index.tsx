import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Layout from '../components/Layout';
import Login from '../pages/Login';
import RegisterClient from '../pages/RegisterClient';
import ClientList from '../pages/ClientList';
import ClientDetails from '../pages/ClientDetails';
import ClientNotes from '../pages/ClientNotes';
import Reports from '../pages/Reports';
import RegisterUser from '../pages/RegisterUser';
import RegisterNeighborhood from '../pages/RegisterNeighborhood';

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
          <Route path="/register-user" element={<RegisterUser />} />;
          <Route
            path="/register-neighborhood"
            element={<RegisterNeighborhood />}
          />
          ;
        </Route>
      </Routes>
    </Router>
  );
};

export default AppRoutes;

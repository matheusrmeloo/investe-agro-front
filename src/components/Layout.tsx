import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';

const Layout: React.FC = () => {
  return (
    <div>
      {/* Cabeçalho */}
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Investe Agro
          </Typography>
          <Button color="inherit" component={Link} to="/clients">
            Lista de Produtores
          </Button>
          <Button color="inherit" component={Link} to="/register-client">
            Cadastrar Produtor
          </Button>
          <Button color="inherit" component={Link} to="/reports">
            Relatórios
          </Button>
        </Toolbar>
      </AppBar>

      {/* Conteúdo */}
      <Box sx={{ padding: 2 }}>
        <Outlet />
      </Box>
    </div>
  );
};

export default Layout;

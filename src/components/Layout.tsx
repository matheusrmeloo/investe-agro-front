import React, { useState, useEffect } from 'react';
import { Outlet, Link } from 'react-router-dom';
import {
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Drawer,
  useMediaQuery,
  Toolbar,
  AppBar,
  Typography,
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import AppRegistrationIcon from '@mui/icons-material/AppRegistration';
import AssessmentIcon from '@mui/icons-material/Assessment';
import BadgeIcon from '@mui/icons-material/Badge';
import MenuIcon from '@mui/icons-material/Menu';
import logo from '../assets/logo.svg';

const Layout: React.FC = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const isLargeScreen = useMediaQuery(
    '(min-width: 1021px) and (min-height: 1361px)',
  );

  useEffect(() => {
    if (isLargeScreen) {
      setDrawerOpen(true);
    }
  }, [isLargeScreen]);

  const toggleDrawer = (open: boolean) => {
    setDrawerOpen(open);
  };

  const navigationList = (
    <List sx={{ width: '250px' }}>
      <ListItem
        component={Link}
        to="/clients"
        sx={{ textDecoration: 'none', color: 'inherit' }}
        onClick={() => toggleDrawer(false)}
      >
        <ListItemIcon>
          <PeopleIcon style={{ color: '#1E5F05' }} />
        </ListItemIcon>
        <ListItemText
          primary="Produtores"
          primaryTypographyProps={{
            fontFamily: 'Arial',
            fontSize: 16,
            color: '#1E5F05',
          }}
        />
      </ListItem>

      <ListItem
        component={Link}
        to="/register-client"
        sx={{ textDecoration: 'none', color: 'inherit' }}
        onClick={() => toggleDrawer(false)}
      >
        <ListItemIcon>
          <AppRegistrationIcon style={{ color: '#1E5F05' }} />
        </ListItemIcon>
        <ListItemText
          primary="Cadastro Produtor"
          primaryTypographyProps={{
            fontFamily: 'Arial',
            fontSize: 16,
            color: '#1E5F05',
          }}
        />
      </ListItem>

      <ListItem
        component={Link}
        to="/reports"
        sx={{ textDecoration: 'none', color: 'inherit' }}
        onClick={() => toggleDrawer(false)}
      >
        <ListItemIcon>
          <AssessmentIcon style={{ color: '#1E5F05' }} />
        </ListItemIcon>
        <ListItemText
          primary="Relatórios"
          primaryTypographyProps={{
            fontFamily: 'Arial',
            fontSize: 16,
            color: '#1E5F05',
          }}
        />
      </ListItem>

      <ListItem
        component={Link}
        to="/register-user"
        sx={{ textDecoration: 'none', color: 'inherit' }}
        onClick={() => toggleDrawer(false)}
      >
        <ListItemIcon>
          <BadgeIcon style={{ color: '#1E5F05' }} />
        </ListItemIcon>
        <ListItemText
          primary="Cadastro Usuário"
          primaryTypographyProps={{
            fontFamily: 'Arial',
            fontSize: 16,
            color: '#1E5F05',
          }}
        />
      </ListItem>
    </List>
  );

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      {/* Header */}
      <AppBar
        position="fixed"
        color="transparent"
        elevation={0}
        sx={{ background: '#ffffff', boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}
      >
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <IconButton
            onClick={() => toggleDrawer(!drawerOpen)}
            sx={{ display: 'flex', alignItems: 'center', color: '#1E5F05' }}
          >
            <MenuIcon />
            <Box
              component="img"
              src={logo}
              alt="Logo Investe Agro"
              sx={{
                height: 40,
                marginLeft: 2,
                display: { xs: 'none', md: 'block' },
              }}
            />
          </IconButton>
          <Box
            sx={{
              display: { xs: 'flex', md: 'none' },
              flex: 1,
              justifyContent: 'center',
            }}
          >
            <Box
              component="img"
              src={logo}
              alt="Logo Investe Agro"
              sx={{ height: 40 }}
            />
          </Box>
        </Toolbar>
      </AppBar>

      {/* Drawer */}
      <Drawer
        anchor="left"
        open={isLargeScreen ? true : drawerOpen}
        onClose={() => toggleDrawer(false)}
        PaperProps={{
          sx: {
            marginTop: '60px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: 2,
          },
        }}
      >
        {navigationList}
      </Drawer>

      {/* Conteúdo */}
      <Box
        sx={{
          flex: 1,
          padding: 4,
          backgroundColor: '#F9F9F9',
          overflowY: 'auto',
          marginLeft: { xs: 0, md: 0 },
          marginTop: { xs: '60px', md: '60px' },
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default Layout;

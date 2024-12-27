import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  IconButton,
  InputAdornment,
  Link,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import api from '../api/axiosConfig';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    try {
      const response = await api.post('/auth/login', { email, password });
      const { token } = response.data;
      localStorage.setItem('authToken', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      navigate('/clients'); // Redireciona para a página principal após login bem-sucedido
    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Erro ao tentar fazer login. Tente novamente mais tarde.');
      }
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      height="100vh"
      padding={2}
      bgcolor="#f5f5f5"
    >
      <Box
        component="form"
        onSubmit={handleLogin}
        bgcolor="#ffffff"
        padding={4}
        borderRadius={4}
        boxShadow={3}
        width={{ xs: '90%', sm: '400px' }}
      >
        <Typography variant="h4" gutterBottom>
          Login
        </Typography>
        {error && (
          <Alert severity="error" style={{ marginBottom: '16px' }}>
            {error}
          </Alert>
        )}
        <TextField
          fullWidth
          label="E-mail"
          type="email"
          variant="outlined"
          margin="normal"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <TextField
          fullWidth
          label="Senha"
          type={showPassword ? 'text' : 'password'}
          variant="outlined"
          margin="normal"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={togglePasswordVisibility} edge="end">
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        <Link
          href="/forgot-password"
          underline="hover"
          color="primary"
          style={{ display: 'block', marginTop: '8px', textAlign: 'right' }}
        >
          Esqueceu a senha?
        </Link>
        <Button
          type="submit"
          fullWidth
          variant="contained"
          color="primary"
          size="large"
          style={{ marginTop: '16px' }}
        >
          Entrar
        </Button>
      </Box>
    </Box>
  );
};

export default LoginPage;

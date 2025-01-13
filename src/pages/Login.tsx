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
  CircularProgress,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import api from '../api/axiosConfig';
import imageLeft from '../assets/bg-tablet.png';
import logoLC from '../assets/logoLC.svg';
import logo from '../assets/conectaLogo.svg';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await api.post('/auth/login', { email, password });

      if (response.status === 200) {
        const { token } = response.data.payload;
        localStorage.setItem('authToken', token);
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        navigate('/clients'); // Navegar para a página inicial
      } else {
        setError('Credenciais inválidas. Por favor, tente novamente.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao tentar fazer login.');
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Box
      display="flex"
      flexDirection={{ xs: 'column', md: 'row' }}
      height="100vh"
      width="100vw"
      sx={{
        overflow: 'hidden', // Remove rolagem
        backgroundColor: 'white',
      }}
    >
      {/* Seção da Imagem */}
      <Box
        flex={1}
        sx={{
          backgroundImage: `url(${imageLeft})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          height: { xs: '40vh', md: '100vh' }, // Altura para telas menores
        }}
      />

      {/* Formulário de Login */}
      <Box
        flex={1}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 1,
          height: { xs: '60vh', md: '100vh' }, // Altura para telas menores
        }}
      >
        {/* Logo da aplicação */}
        <Box
          component="img"
          src={logoLC}
          alt="Logo Lagoa da Canoa"
          sx={{
            width: { xs: 200, md: 300 }, // Ajusta o tamanho da logo em telas menores
            marginBottom: { xs: 1, md: 3 },
          }}
        />

        <Box
          component="img"
          src={logo}
          alt="Logo Investe Agro"
          sx={{
            width: { xs: 200, md: 300 }, // Ajusta o tamanho da logo em telas menores
            marginBottom: { xs: 1, md: 3 },
          }}
        />
        {error && (
          <Alert severity="error" sx={{ marginBottom: 2, width: '100%' }}>
            {error}
          </Alert>
        )}
        <TextField
          fullWidth
          label="Digite seu e-mail"
          type="email"
          variant="outlined"
          margin="normal"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '8px',
            },
            maxWidth: { xs: '90%', md: '400px' }, // Ajusta a largura em telas menores
          }}
        />
        <TextField
          fullWidth
          label="Digite sua senha"
          type={showPassword ? 'text' : 'password'}
          variant="outlined"
          margin="normal"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={togglePasswordVisibility}>
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '8px',
            },
            maxWidth: { xs: '90%', md: '400px' }, // Ajusta a largura em telas menores
          }}
        />
        <Link
          href="/forgot-password"
          underline="hover"
          sx={{ display: 'block', marginTop: 1, maxWidth: '400px' }}
        >
          Esqueci minha senha
        </Link>
        <Button
          type="submit"
          variant="contained"
          size="large"
          disabled={isLoading}
          onClick={handleLogin} // Função de login no clique
          sx={{
            marginTop: 3,
            borderRadius: '8px',
            bgcolor: '#1E5F05',
            color: 'white',
            maxWidth: { xs: '90%', md: '400px' }, // Ajusta largura em telas menores
            width: '100%',
            '&:hover': {
              bgcolor: '#2E7D32',
            },
          }}
        >
          {isLoading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            'Entrar'
          )}
        </Button>
        <Typography
          variant="body2"
          color="#6B6B6B"
          textAlign="center"
          marginTop={3}
        >
          © Copyright - MR Solutions
        </Typography>
      </Box>
    </Box>
  );
};

export default LoginPage;

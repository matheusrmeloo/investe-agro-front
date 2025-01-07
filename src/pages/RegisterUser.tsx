import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  CircularProgress,
  Snackbar,
  Alert,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import axios from 'axios';

const RegisterUser: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'admin' | 'user'>('user');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async () => {
    if (!name || !email || !password) {
      setError('Todos os campos são obrigatórios');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('authToken');
      await api.post(
        '/auth/register',
        { name, email, password, role },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      setSuccess(true);
      setTimeout(() => {
        navigate('/clients');
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao registrar usuário');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        maxWidth: 400,
        margin: 'auto',
        padding: 3,
        backgroundColor: '#ffffff',
        boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
        borderRadius: 2,
      }}
    >
      <Typography
        variant="h5"
        sx={{ textAlign: 'center', marginBottom: 2, color: '#1E5F05' }}
      >
        Registro de Usuário
      </Typography>

      {error && (
        <Alert severity="error" sx={{ marginBottom: 2 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ marginBottom: 2 }}>
          Usuário registrado com sucesso!
        </Alert>
      )}

      <TextField
        label="Nome"
        fullWidth
        variant="outlined"
        margin="normal"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <TextField
        label="Email"
        type="email"
        fullWidth
        variant="outlined"
        margin="normal"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <TextField
        label="Senha"
        type="password"
        fullWidth
        variant="outlined"
        margin="normal"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <FormControl fullWidth margin="normal">
        <InputLabel id="role-select-label">Tipo de Usuário</InputLabel>
        <Select
          labelId="role-select-label"
          value={role}
          onChange={(e) => setRole(e.target.value as 'admin' | 'user')}
        >
          <MenuItem value="user">Usuário</MenuItem>
          <MenuItem value="admin">Administrador</MenuItem>
        </Select>
      </FormControl>

      <Button
        variant="contained"
        color="primary"
        fullWidth
        sx={{
          marginTop: 2,
          backgroundColor: '#1E5F05',
          '&:hover': { backgroundColor: '#144103' },
        }}
        onClick={handleRegister}
        disabled={loading}
      >
        {loading ? <CircularProgress size={24} color="inherit" /> : 'Registrar'}
      </Button>
    </Box>
  );
};

export default RegisterUser;

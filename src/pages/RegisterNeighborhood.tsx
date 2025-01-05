import React, { useState, useEffect } from 'react';
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
  Alert,
} from '@mui/material';
import api from '../api/axiosConfig';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const RegisterNeighborhood: React.FC = () => {
  const [name, setName] = useState('');
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStates = async () => {
      try {
        const response = await axios.get(
          'https://servicodados.ibge.gov.br/api/v1/localidades/estados',
        );
        setStates(response.data);
      } catch (err) {
        console.error('Erro ao buscar estados:', err);
      }
    };

    fetchStates();
  }, []);

  const fetchCities = async (stateId: string) => {
    try {
      const response = await axios.get(
        `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${stateId}/municipios`,
      );
      setCities(response.data);
    } catch (err) {
      console.error('Erro ao buscar cidades:', err);
    }
  };

  const handleRegister = async () => {
    if (!name || !state || !city) {
      setError('Todos os campos são obrigatórios');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('authToken');
      await api.post(
        '/neighborhoods',
        { name, city, state },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      setSuccess(true);
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao registrar bairro');
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
        Registro de Bairro
      </Typography>

      {error && (
        <Alert severity="error" sx={{ marginBottom: 2 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ marginBottom: 2 }}>
          Bairro registrado com sucesso!
        </Alert>
      )}

      <FormControl fullWidth margin="normal">
        <InputLabel id="state-select-label">Estado</InputLabel>
        <Select
          labelId="state-select-label"
          value={state}
          onChange={(e) => {
            const selectedState = e.target.value;
            setState(selectedState);
            setCities([]);
            fetchCities(selectedState);
          }}
        >
          {states.map((s: any) => (
            <MenuItem key={s.id} value={s.sigla}>
              {s.nome}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl fullWidth margin="normal" disabled={!state}>
        <InputLabel id="city-select-label">Cidade</InputLabel>
        <Select
          labelId="city-select-label"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        >
          {cities.map((c: any) => (
            <MenuItem key={c.id} value={c.nome}>
              {c.nome}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <TextField
        label="Nome do Bairro"
        fullWidth
        variant="outlined"
        margin="normal"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

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

export default RegisterNeighborhood;

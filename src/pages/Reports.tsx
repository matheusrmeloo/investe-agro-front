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
import axios from 'axios';

const Reports: React.FC = () => {
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [neighborhoods, setNeighborhoods] = useState([]);

  const [selectedState, setSelectedState] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedNeighborhood, setSelectedNeighborhood] = useState('');
  const [production, setProduction] = useState('');
  const [name, setName] = useState('');
  const [documentNumber, setDocumentNumber] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [clients, setClients] = useState([]);

  useEffect(() => {
    const fetchStates = async () => {
      try {
        const response = await axios.get('/neighborhoods/states');
        setStates(response.data);
      } catch (err) {
        setError('Erro ao buscar estados.');
      }
    };

    fetchStates();
  }, []);

  const fetchCities = async (state: string) => {
    try {
      const response = await axios.get(`/neighborhoods/cities?state=${state}`);
      setCities(response.data);
    } catch (err) {
      setError('Erro ao buscar municípios.');
    }
  };

  const fetchNeighborhoods = async (state: string, city: string) => {
    try {
      const response = await axios.get(
        `/neighborhoods/names?state=${state}&city=${city}`,
      );
      setNeighborhoods(response.data);
    } catch (err) {
      setError('Erro ao buscar bairros.');
    }
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get('/clients', {
        params: {
          documentNumber,
          name,
          production,
          neighborhoodId: selectedNeighborhood,
        },
      });
      setClients(response.data);
    } catch (err) {
      setError('Erro ao buscar clientes.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        maxWidth: 600,
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
        Relatórios de Clientes
      </Typography>

      {error && (
        <Alert severity="error" sx={{ marginBottom: 2 }}>
          {error}
        </Alert>
      )}

      <FormControl fullWidth margin="normal">
        <InputLabel id="state-select-label">Estado</InputLabel>
        <Select
          labelId="state-select-label"
          value={selectedState}
          onChange={(e) => {
            const state = e.target.value;
            setSelectedState(state);
            fetchCities(state);
          }}
        >
          {states.map((state: any) => (
            <MenuItem key={state.id} value={state.name}>
              {state.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl fullWidth margin="normal" disabled={!selectedState}>
        <InputLabel id="city-select-label">Município</InputLabel>
        <Select
          labelId="city-select-label"
          value={selectedCity}
          onChange={(e) => {
            const city = e.target.value;
            setSelectedCity(city);
            fetchNeighborhoods(selectedState, city);
          }}
        >
          {cities.map((city: any) => (
            <MenuItem key={city.id} value={city.name}>
              {city.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl fullWidth margin="normal" disabled={!selectedCity}>
        <InputLabel id="neighborhood-select-label">Bairro</InputLabel>
        <Select
          labelId="neighborhood-select-label"
          value={selectedNeighborhood}
          onChange={(e) => setSelectedNeighborhood(e.target.value)}
        >
          {neighborhoods.map((neighborhood: any) => (
            <MenuItem key={neighborhood.id} value={neighborhood.id}>
              {neighborhood.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <TextField
        label="Nome do Cliente"
        fullWidth
        variant="outlined"
        margin="normal"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <TextField
        label="Número do Documento"
        fullWidth
        variant="outlined"
        margin="normal"
        value={documentNumber}
        onChange={(e) => setDocumentNumber(e.target.value)}
      />

      <TextField
        label="Tipo de Produção"
        fullWidth
        variant="outlined"
        margin="normal"
        value={production}
        onChange={(e) => setProduction(e.target.value)}
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
        onClick={handleSearch}
        disabled={loading}
      >
        {loading ? <CircularProgress size={24} color="inherit" /> : 'Buscar'}
      </Button>

      <Box sx={{ marginTop: 4 }}>
        {clients.length > 0 && (
          <Typography variant="h6" sx={{ marginBottom: 2 }}>
            Resultados:
          </Typography>
        )}

        {clients.map((client: any) => (
          <Box
            key={client.id}
            sx={{
              border: '1px solid #ddd',
              borderRadius: 2,
              padding: 2,
              marginBottom: 2,
            }}
          >
            <Typography>Nome: {client.name}</Typography>
            <Typography>Telefone: {client.phone}</Typography>
            <Typography>Produção: {client.production}</Typography>
            <Typography>Endereço: {client.address}</Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default Reports;

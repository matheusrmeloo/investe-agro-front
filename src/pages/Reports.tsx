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
  SelectChangeEvent,
  Grid,
} from '@mui/material';
import api, { backendUrl } from '../api/axiosConfig';

interface Neighborhood {
  id: string;
  name: string;
  city: string;
  state: string;
}

interface State {
  state: string;
}

interface City {
  city: string;
}

interface Production {
  id: string;
  type: string;
  custom_type: string | null;
}

interface Address {
  id: string;
  cep: string;
  street: string;
  number: string;
  complement: string | null;
  neighborhood: Neighborhood;
}

interface Client {
  id: string;
  name: string;
  phone: string;
  productions: Production[];
  address: Address;
}

interface ApiResponse<T> {
  status: number;
  payload: T;
}

type ProductionType =
  | 'batata doce'
  | 'fumo'
  | 'mandioca'
  | 'milho'
  | 'pecuaria'
  | 'outros';

const Reports: React.FC = () => {
  const [states, setStates] = useState<State[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([]);

  const [selectedState, setSelectedState] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedNeighborhood, setSelectedNeighborhood] = useState('');
  const [production, setProduction] = useState<ProductionType | ''>(
    '' as ProductionType,
  );
  const [name, setName] = useState('');
  const [documentNumber, setDocumentNumber] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [clients, setClients] = useState<Client[]>([]);

  useEffect(() => {
    const fetchStates = async () => {
      try {
        const response = await api.get<ApiResponse<State[]>>(
          '/neighborhoods/states',
        );
        if (response.data && response.data.payload) {
          setStates(response.data.payload);
        }
      } catch (err) {
        setError('Erro ao buscar estados.');
      }
    };

    fetchStates();
  }, []);

  const fetchCities = async (state: string) => {
    try {
      const response = await api.get<ApiResponse<City[]>>(
        `/neighborhoods/cities?state=${state}`,
      );
      if (response.data && response.data.payload) {
        setCities(response.data.payload);
      }
    } catch (err) {
      setError('Erro ao buscar municípios.');
    }
  };

  const fetchNeighborhoods = async (state: string, city: string) => {
    try {
      const response = await api.get<ApiResponse<Neighborhood[]>>(
        `/neighborhoods?city=${city}&state=${state}`,
      );
      if (response.data && response.data.payload) {
        setNeighborhoods(response.data.payload);
      }
    } catch (err) {
      setError('Erro ao buscar bairros.');
    }
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      setError('');
      const params: any = {};
      if (documentNumber) {
        params.documentNumber = documentNumber;
      }

      if (name) {
        params.name = name;
      }
      if (production) {
        params.production = production;
      }
      if (selectedNeighborhood) {
        params.neighborhoodId = selectedNeighborhood;
      }

      const response = await api.get<ApiResponse<Client[]>>('/clients', {
        params,
      });
      if (response.data && response.data.payload) {
        setClients(response.data.payload);
      }
    } catch (err: any) {
      setError(
        `Erro ao buscar clientes: ${
          err.response?.data?.message || err.message
        }`,
      );
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = async () => {
    try {
      setError('');

      const params: any = {};
      if (documentNumber) {
        params.documentNumber = documentNumber;
      }
      if (name) {
        params.name = name;
      }
      if (production) {
        params.production = production;
      }
      if (selectedNeighborhood) {
        params.neighborhoodId = selectedNeighborhood;
      }

      // Constrói a URL com os parâmetros
      const queryString = new URLSearchParams(params).toString();
      const url = `${backendUrl}/report?${queryString}`;
      window.open(url, '_blank');
    } catch (err: any) {
      setError(
        `Erro ao exportar relatório: ${
          err.response?.data?.message || err.message
        }`,
      );
    }
  };

  const handleProductionChange = (event: SelectChangeEvent<ProductionType>) => {
    setProduction(event.target.value as ProductionType);
  };

  const handleClearFilters = () => {
    setSelectedState('');
    setSelectedCity('');
    setSelectedNeighborhood('');
    setProduction('' as ProductionType);
    setName('');
    setDocumentNumber('');
    setClients([]); // limpa resultados
    setCities([]); // limpa cidades
    setNeighborhoods([]); // limpa bairros
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

      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} md={6}>
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
              {states.map((state) => (
                <MenuItem key={state.state} value={state.state}>
                  {state.state}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={6}>
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
              {cities.map((city) => (
                <MenuItem key={city.city} value={city.city}>
                  {city.city}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth margin="normal" disabled={!selectedCity}>
            <InputLabel id="neighborhood-select-label">Bairro</InputLabel>
            <Select
              labelId="neighborhood-select-label"
              value={selectedNeighborhood}
              onChange={(e) => setSelectedNeighborhood(e.target.value)}
            >
              {neighborhoods.map((neighborhood) => (
                <MenuItem key={neighborhood.id} value={neighborhood.id}>
                  {neighborhood.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            label="Nome do Cliente"
            fullWidth
            variant="outlined"
            margin="normal"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            label="Número do Documento"
            fullWidth
            variant="outlined"
            margin="normal"
            value={documentNumber}
            onChange={(e) => setDocumentNumber(e.target.value)}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth margin="normal">
            <InputLabel id="production-select-label">
              Tipo de Produção
            </InputLabel>
            <Select
              labelId="production-select-label"
              value={production}
              onChange={handleProductionChange}
            >
              <MenuItem value="batata doce">Batata Doce</MenuItem>
              <MenuItem value="fumo">Fumo</MenuItem>
              <MenuItem value="mandioca">Mandioca</MenuItem>
              <MenuItem value="milho">Milho</MenuItem>
              <MenuItem value="pecuaria">Pecuária</MenuItem>
              <MenuItem value="outros">Outros</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid
          item
          xs={12}
          sx={{ display: 'flex', justifyContent: 'flex-end', marginTop: 1 }}
        >
          <Button
            variant="outlined"
            color="primary"
            onClick={handleClearFilters}
            style={{ marginRight: 8, borderColor: '#1E5F05', color: '#1E5F05' }}
          >
            Limpar Filtros
          </Button>

          <Button
            variant="contained"
            color="primary"
            onClick={handleSearch}
            disabled={loading}
            sx={{
              backgroundColor: '#1E5F05',
              '&:hover': { backgroundColor: '#144103' },
            }}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              'Buscar'
            )}
          </Button>
        </Grid>
      </Grid>

      <Box
        sx={{
          marginTop: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
        }}
      >
        {clients.length > 0 && (
          <Button
            variant="outlined"
            color="primary"
            style={{
              marginBottom: 16,
              borderColor: '#1E5F05',
              color: '#1E5F05',
            }}
            onClick={handleExportExcel}
          >
            Exportar Excel
          </Button>
        )}
        {clients.length > 0 && (
          <Typography
            variant="h6"
            sx={{ marginBottom: 2, textAlign: 'left', width: '100%' }}
          >
            Resultados:
          </Typography>
        )}

        {clients.map((client) => (
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
            <Typography>
              Produção:
              {client.productions && client.productions.length > 0
                ? client.productions.map((prod) => prod.type).join(', ')
                : 'Não possui'}
            </Typography>
            {client.address && (
              <Typography>
                Endereço: {client.address.street}, {client.address.number}
                {client.address.complement &&
                  `, ${client.address.complement}`}{' '}
                -{client.address.neighborhood.name},{' '}
                {client.address.neighborhood.city}/
                {client.address.neighborhood.state}
              </Typography>
            )}
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default Reports;

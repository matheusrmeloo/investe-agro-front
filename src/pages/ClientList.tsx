import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Button,
  Alert,
  SelectChangeEvent,
  CardActionArea,
  Paper,
} from '@mui/material';
import api from '../api/axiosConfig';
import { Link } from 'react-router-dom';

interface Production {
  id: string;
  type: string;
  custom_type: string | null;
}

interface Neighborhood {
  id: string;
  name: string;
  city: string;
  state: string;
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
  document_number: string;
  phone: string;
  productions: Production[];
  address: Address | null;
}

interface ApiResponse {
  status: number;
  payload: Client[];
}

const ListClients: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    documentNumber: '',
    name: '',
    production: '',
  });
  const [searchTrigger, setSearchTrigger] = useState(0);

  useEffect(() => {
    const fetchClients = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        if (filters.documentNumber) {
          params.append('documentNumber', filters.documentNumber);
        }
        if (filters.name) {
          params.append('name', filters.name);
        }
        if (filters.production) {
          params.append('production', filters.production);
        }

        const response = await api.get<ApiResponse>('/clients', {
          params,
        });

        if (response.data && response.data.payload) {
          setClients(response.data.payload);
        } else {
          setError('Erro ao carregar produtores: Resposta da API inválida');
        }
      } catch (err: any) {
        setError(
          `Erro ao carregar produtores: ${
            err.response?.data?.message || err.message
          }`,
        );
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, [searchTrigger]);

  const handleTextFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
  };

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
  };

  const handleSearchClick = () => {
    setSearchTrigger((prev) => prev + 1);
  };

  return (
    <Box sx={{ flexGrow: 1, padding: 3 }}>
      <Typography
        variant="h4"
        gutterBottom
        sx={{ color: '#1e5f05', textAlign: 'center' }}
      >
        Lista de Produtores
      </Typography>

      <Paper sx={{ padding: 3, marginBottom: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="CPF"
              name="documentNumber"
              value={filters.documentNumber}
              onChange={handleTextFieldChange}
              margin="normal"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Nome"
              name="name"
              value={filters.name}
              onChange={handleTextFieldChange}
              margin="normal"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Tipo de Produção</InputLabel>
              <Select
                name="production"
                value={filters.production}
                onChange={handleSelectChange}
                label="Tipo de Produção"
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="batata doce">Batata Doce</MenuItem>
                <MenuItem value="fumo">Fumo</MenuItem>
                <MenuItem value="mandioca">Mandioca</MenuItem>
                <MenuItem value="milho">Milho</MenuItem>
                <MenuItem value="pecuaria">Pecuária</MenuItem>
                <MenuItem value="outros">Outros</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSearchClick}
              sx={{
                backgroundColor: '#1e5f05',
                '&:hover': { backgroundColor: '#144103' },
              }}
            >
              Pesquisar
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {loading ? (
        <Box display="flex" justifyContent="center" marginTop={4}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ marginTop: 2 }}>
          {error}
        </Alert>
      ) : clients.length === 0 ? (
        <Typography variant="h6" align="center" marginTop={2}>
          Nenhum cliente encontrado
        </Typography>
      ) : (
        <Grid container spacing={3} marginTop={1}>
          {clients.map((client) => (
            <Grid item xs={12} sm={6} md={4} key={client.id}>
              <Link
                to={`/clients/${client.id}`}
                style={{ textDecoration: 'none' }}
              >
                <Card
                  sx={{
                    '&:hover': {
                      backgroundColor: '#f0f0f0',
                      cursor: 'pointer',
                    },
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                  }}
                >
                  <CardActionArea
                    sx={{
                      flexGrow: 1,
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" component="div">
                        {client.name}
                      </Typography>
                      <Typography color="textSecondary">
                        Telefone: {client.phone}
                      </Typography>
                      {client.address && client.address.neighborhood && (
                        <Typography color="textSecondary">
                          {client.address.neighborhood.name} -{' '}
                          {client.address.neighborhood.city}/
                          {client.address.neighborhood.state}
                        </Typography>
                      )}
                      <Typography color="textSecondary">
                        Produção:
                        {client.productions && client.productions.length > 0 ? (
                          <ul>
                            {client.productions.map((production) => (
                              <li key={production.id}>
                                {production.type}
                                {production.custom_type &&
                                  ` (${production.custom_type})`}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          'Não possui'
                        )}
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Link>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default ListClients;

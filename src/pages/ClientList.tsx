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
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      padding={3}
      bgcolor="#f5f5f5"
      minHeight="100vh"
    >
      <Typography variant="h4" gutterBottom>
        Lista de Produtores
      </Typography>
      <Box width={{ xs: '95%', md: '80%' }} marginBottom={2}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="CPF"
              name="documentNumber"
              value={filters.documentNumber}
              onChange={handleTextFieldChange}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Nome"
              name="name"
              value={filters.name}
              onChange={handleTextFieldChange}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Tipo de Produção</InputLabel>
              <Select
                name="production"
                value={filters.production}
                onChange={handleSelectChange}
                label="Tipo de Produção"
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="milho">Milho</MenuItem>
                <MenuItem value="pecuaria">Pecuária</MenuItem>
                <MenuItem value="outros">Outros</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} style={{ marginTop: 16 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSearchClick}
            >
              Pesquisar
            </Button>
          </Grid>
        </Grid>
      </Box>
      <Box width={{ xs: '95%', md: '80%' }}>
        {loading ? (
          <Box display="flex" justifyContent="center" marginTop={4}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" style={{ marginTop: 16 }}>
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
                          CPF: {client.document_number}
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
                          {client.productions &&
                          client.productions.length > 0 ? (
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
    </Box>
  );
};

export default ListClients;

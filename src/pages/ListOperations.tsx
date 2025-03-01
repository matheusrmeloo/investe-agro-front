import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Button,
  Typography,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  CircularProgress,
  Alert,
  Grid,
  Pagination,
  PaginationItem,
  SelectChangeEvent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import api, { backendUrl } from '../api/axiosConfig';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Client {
  id: string;
  name: string;
  productions: Production[];
}

interface Production {
  id: string;
  type: string;
  custom_type: string | null;
}

interface Operation {
  id: string;
  created_at: string;
  observation: string;
  land_area: number | null;
  measurement_land_area: string | null;
  production_area: number | null;
  measurement_production_area: string | null;
  plowed_area: number | null;
  measurement_plowed_area: string | null;
  agricultural_production: string | null;
  measurement_agricultural_production: string | null;
  client: Client;
  production: Production;
}

interface ApiResponse<T> {
  status: number;
  payload: T;
}

interface OperationsApiResponse {
  operations: Operation[];
  total: number;
}

const ListOperations: React.FC = () => {
  const [clientId, setClientId] = useState('');
  const [productionId, setProductionId] = useState('');
  const [deleted, setDeleted] = useState<string | boolean>('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [operations, setOperations] = useState<Operation[]>([]);

  const [clients, setClients] = useState<Client[]>([]);
  const [productions, setProductions] = useState<Production[]>([]);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0); // Total number of operations
  const pageSizes = [10, 20, 50]; // Options for items per page
  const [totalPages, setTotalPages] = useState(1); // Total pages

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await api.get<ApiResponse<Client[]>>('/clients');
        if (
          response.data.status === 200 &&
          Array.isArray(response.data.payload)
        ) {
          setClients(response.data.payload);
        } else {
          setError('Erro ao carregar clientes.');
        }
      } catch (err) {
        setError('Erro ao buscar clientes.');
      }
    };

    fetchClients();
  }, []);

  useEffect(() => {
    if (clientId) {
      const selectedClient = clients.find((client) => client.id === clientId);
      setProductions(selectedClient ? selectedClient.productions : []);
      setProductionId('');
    } else {
      setProductions([]);
      setProductionId('');
    }
  }, [clientId, clients]);

  const fetchOperations = async () => {
    try {
      setLoading(true);
      setError('');

      const params: any = {
        page,
        size: pageSize,
      };
      if (clientId) {
        params.client_id = clientId;
      }
      if (productionId) {
        params.production_id = productionId;
      }
      if (deleted !== '') {
        params.deleted = deleted;
      }

      const response = await api.get<ApiResponse<OperationsApiResponse>>(
        '/operations',
        {
          params,
        },
      );

      if (response.data.status === 200 && response.data.payload) {
        setOperations(response.data.payload.operations);
        setTotal(response.data.payload.total);
        setTotalPages(Math.ceil(response.data.payload.total / pageSize));
      } else {
        setError('Erro ao buscar operações.');
      }
    } catch (err: any) {
      setError(`Erro ao buscar operações: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOperations();
  }, [clientId, productionId, deleted, page, pageSize]); // Dependency array includes filters and pagination states

  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    value: number,
  ) => {
    setPage(value);
  };

  const handlePageSizeChange = (event: SelectChangeEvent<number>) => {
    setPageSize(Number(event.target.value));
    setPage(1); // Reset to the first page when changing page size
  };

  const handleExportExcel = async () => {
    try {
      setError('');

      const params: any = {
        page,
        size: pageSize,
      };
      if (clientId) {
        params.client_id = clientId;
      }
      if (productionId) {
        params.production_id = productionId;
      }
      if (deleted !== '') {
        params.deleted = deleted;
      }

      const queryString = new URLSearchParams(params).toString();
      const url = `${backendUrl}/operations/report?${queryString}`;
      window.open(url, '_blank');
    } catch (err: any) {
      setError(`Erro ao exportar relatório: ${err.message}`);
    }
  };

  const handleClearFilters = () => {
    setClientId('');
    setProductionId('');
    setDeleted('');
    setOperations([]);
    setPage(1);
    setPageSize(10);
  };

  const handleSearch = () => {
    fetchOperations();
  };

  return (
    <Box sx={{ flexGrow: 1, padding: 3 }}>
      <Typography
        variant="h4"
        gutterBottom
        sx={{ color: '#1e5f05', textAlign: 'center' }}
      >
        Operações
      </Typography>

      <Paper sx={{ padding: 3, marginBottom: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ color: '#1e5f05' }}>
          Pesquisar operações por:
        </Typography>

        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel id="client-select-label">Cliente</InputLabel>
              <Select
                labelId="client-select-label"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                label="Cliente"
              >
                <MenuItem value="">Todos</MenuItem>
                {clients.map((client) => (
                  <MenuItem key={client.id} value={client.id}>
                    {client.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel id="production-select-label">Produção</InputLabel>
              <Select
                labelId="production-select-label"
                value={productionId}
                onChange={(e) => setProductionId(e.target.value)}
                label="Produção"
              >
                <MenuItem value="">Todas</MenuItem>
                {productions.map((production) => (
                  <MenuItem key={production.id} value={production.id}>
                    {production.type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sx={{ mt: 2 }}>
            <Box display="flex" justifyContent="flex-end">
              <Button
                variant="outlined"
                color="primary"
                onClick={handleClearFilters}
                startIcon={<ClearIcon />}
                sx={{ mr: 2, color: '#1e5f05', borderColor: '#1e5f05' }}
              >
                Limpar Filtros
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSearch}
                endIcon={<SearchIcon />}
                sx={{
                  backgroundColor: '#1e5f05',
                  '&:hover': { backgroundColor: '#144103' },
                }}
                disabled={loading}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  'Buscar'
                )}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ marginBottom: 2 }}>
          {error}
        </Alert>
      )}

      {operations.length > 0 && (
        <Paper sx={{ padding: 3, marginBottom: 3 }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 2,
            }}
          >
            <Typography variant="h6" sx={{ color: '#1e5f05' }}>
              Resultados:
            </Typography>
            <Button
              variant="outlined"
              color="primary"
              onClick={handleExportExcel}
              sx={{ color: '#1e5f05', borderColor: '#1e5f05' }}
            >
              Exportar Excel
            </Button>
          </Box>

          {operations.length > 0 && (
            <TableContainer component={Paper} sx={{ marginBottom: 3 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold', color: '#1e5f05' }}>
                      Cliente
                    </TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#1e5f05' }}>
                      Produção
                    </TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#1e5f05' }}>
                      Observação
                    </TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#1e5f05' }}>
                      Data de Criação
                    </TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#1e5f05' }}>
                      Área de Terra
                    </TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#1e5f05' }}>
                      Área de Produção
                    </TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#1e5f05' }}>
                      Área Arada
                    </TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#1e5f05' }}>
                      Produção Agrícola
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {operations.map((operation) => (
                    <TableRow key={operation.id}>
                      <TableCell>{operation.client.name}</TableCell>
                      <TableCell>{operation.production.type}</TableCell>
                      <TableCell>
                        {operation.observation || 'Nenhuma'}
                      </TableCell>
                      <TableCell>
                        {format(
                          parseISO(operation.created_at),
                          'dd/MM/yyyy HH:mm',
                          {
                            locale: ptBR,
                          },
                        )}
                      </TableCell>
                      <TableCell>
                        {operation.land_area &&
                          `${operation.land_area} ${operation.measurement_land_area}`}
                      </TableCell>
                      <TableCell>
                        {operation.production_area &&
                          `${operation.production_area} ${operation.measurement_production_area}`}
                      </TableCell>
                      <TableCell>
                        {operation.plowed_area &&
                          `${operation.plowed_area} ${operation.measurement_plowed_area}`}
                      </TableCell>
                      <TableCell>
                        {operation.agricultural_production &&
                          `${operation.agricultural_production} ${operation.measurement_agricultural_production}`}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      )}

      {operations.length > 0 && (
        <Box
          mt={3}
          display="flex"
          justifyContent="space-between"
          alignItems="center"
        >
          <FormControl>
            <InputLabel id="page-size-label">Itens por página</InputLabel>
            <Select
              labelId="page-size-label"
              value={pageSize}
              onChange={handlePageSizeChange}
              label="Itens por página"
            >
              {pageSizes.map((size) => (
                <MenuItem key={size} value={size}>
                  {size}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            renderItem={(item) => <PaginationItem {...item} color="primary" />}
          />
        </Box>
      )}
    </Box>
  );
};

export default ListOperations;

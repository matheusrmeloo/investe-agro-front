import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Paper,
  Grid,
  List,
  ListItem,
  ListItemText,
  Alert,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Select,
  MenuItem,
  FormControl,
  SelectChangeEvent,
  IconButton,
  Snackbar,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useParams, Link } from 'react-router-dom';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import api from '../api/axiosConfig';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const theme = createTheme({
  palette: {
    primary: {
      main: '#006400', // Verde escuro
    },
    secondary: {
      main: '#004d00', // Verde ainda mais escuro
    },
  },
});

interface Spouse {
  id: string;
  name: string;
  document_number: string;
  phone: string;
  birth_date: string;
}

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

interface Observation {
  id: string;
  text: string;
  created_at: string;
}

interface Client {
  id: string;
  name: string;
  document_number: string;
  phone: string;
  email: string;
  birth_date: string;
  social_status: string;
  car: boolean;
  caf_dap: boolean;
  caf_dap_number: string | null;
  spouses: Spouse[];
  productions: Production[];
  address: Address | null;
  observations: Observation[];
}

interface ApiResponse {
  status: number;
  payload: Client;
}

interface ObservationsApiResponse {
  status: number;
  payload: {
    observations: Observation[];
    total: number;
  };
}

// Helper function to title case a string
const titleCase = (str: string): string => {
  if (!str) return ''; // Handle null or empty strings
  return str
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Helper functions to format data
const formatCpf = (cpf: string): string => {
  if (!cpf) return '';
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
};

const formatPhone = (phone: string): string => {
  if (!phone) return '';
  return phone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
};

const formatDate = (date: string): string => {
  if (!date) return '';
  return format(parseISO(date), 'dd/MM/yyyy', { locale: ptBR });
};

const ClientDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const [newObservation, setNewObservation] = useState('');
  const [loadingObservation, setLoadingObservation] = useState(false);
  const [observations, setObservations] = useState<Observation[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loadingObservations, setLoadingObservations] = useState(true);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);
  const [snackbarType, setSnackbarType] = useState<'success' | 'error'>(
    'error',
  );

  const showSnackbar = (
    message: string,
    type: 'success' | 'error' = 'error',
  ) => {
    setSnackbarMessage(message);
    setSnackbarType(type);
    setSnackbarOpen(true);
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  useEffect(() => {
    const fetchClientDetails = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await api.get<ApiResponse>(`/clients/${id}`);
        if (response.data && response.data.payload) {
          setClient(response.data.payload);
        } else {
          setError(
            'Erro ao carregar detalhes do cliente: Resposta da API inválida',
          );
        }
      } catch (err: any) {
        showSnackbar(
          `Erro ao carregar detalhes do cliente: ${
            err.response?.data?.message || err.message
          }`,
        );
      } finally {
        setLoading(false);
      }
    };

    fetchClientDetails();
  }, [id]);

  useEffect(() => {
    const fetchObservations = async () => {
      if (client) {
        setLoadingObservations(true);
        try {
          const response = await api.get<ObservationsApiResponse>(
            `/clients/${id}/observations?page=${currentPage}&size=${pageSize}`,
          );

          if (response.data && response.data.payload) {
            setObservations(response.data.payload.observations);
            setTotalPages(Math.ceil(response.data.payload.total / pageSize));
          }
        } catch (err: any) {
          showSnackbar(
            `Erro ao carregar observações: ${
              err.response?.data?.message || err.message
            }`,
          );
        } finally {
          setLoadingObservations(false);
        }
      }
    };
    fetchObservations();
  }, [id, currentPage, pageSize, client]);

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
      >
        <CircularProgress color="primary" />
      </Box>
    );
  }
  if (error) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
      >
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!client) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
      >
        <Typography variant="h6">Cliente não encontrado</Typography>
      </Box>
    );
  }

  const handleAddObservation = async () => {
    setLoadingObservation(true);
    try {
      await api.post(`/clients/${id}/observations`, { text: newObservation });
      const response = await api.get<ApiResponse>(`/clients/${id}`);
      if (response.data && response.data.payload) {
        setClient(response.data.payload);
        showSnackbar('Observação adicionada com sucesso!', 'success');
      }
      setNewObservation('');
      handleCloseModal();
    } catch (err: any) {
      showSnackbar(
        `Erro ao adicionar observação: ${
          err.response?.data?.message || err.message
        }`,
        'error',
      );
    } finally {
      setLoadingObservation(false);
    }
  };

  const handleDeleteObservation = async (observationId: string) => {
    try {
      const token = localStorage.getItem('authToken');
      await api.delete(`/clients/${observationId}/observations`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      // Após deletar, recarregar as observações
      const response = await api.get<ObservationsApiResponse>(
        `/clients/${id}/observations?page=${currentPage}&size=${pageSize}`,
      );

      if (response.data && response.data.payload) {
        setObservations(response.data.payload.observations);
        setTotalPages(Math.ceil(response.data.payload.total / pageSize));
        showSnackbar('Observação deletada com sucesso!', 'success');
      }
    } catch (err: any) {
      showSnackbar(
        `Erro ao excluir observação: ${
          err.response?.data?.message || err.message
        }`,
        'error',
      );
    }
  };

  const handleClickOpenModal = () => {
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setNewObservation('');
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handlePageSizeChange = (event: SelectChangeEvent<number>) => {
    setPageSize(parseInt(event.target.value as string, 10));
    setCurrentPage(1); // Reinicia a página quando muda o tamanho
  };
  const renderPaginationControls = () => {
    const pageOptions = [10, 30, 50];
    return (
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        marginTop={2}
      >
        <Box display="flex" alignItems="center">
          <Typography style={{ marginRight: 8 }}>Exibir</Typography>
          <FormControl size="small" style={{ marginRight: 16 }}>
            <Select
              value={pageSize}
              onChange={handlePageSizeChange}
              color="primary"
            >
              {pageOptions.map((size) => (
                <MenuItem key={size} value={size}>
                  {size}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Typography>por página</Typography>
        </Box>
        <Box display="flex" alignItems="center">
          <Button
            disabled={currentPage === 1}
            onClick={() => handlePageChange(currentPage - 1)}
            color="primary"
          >
            Anterior
          </Button>
          <Typography style={{ marginRight: 8, marginLeft: 8 }}>
            Página {currentPage} de {totalPages}
          </Typography>
          <Button
            disabled={currentPage === totalPages}
            onClick={() => handlePageChange(currentPage + 1)}
            color="primary"
          >
            Próxima
          </Button>
        </Box>
      </Box>
    );
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ flexGrow: 1, padding: 3 }}>
        <Typography
          variant="h4"
          gutterBottom
          sx={{ color: '#1e5f05', textAlign: 'center' }}
        >
          Detalhes do Cliente
        </Typography>

        <Paper sx={{ padding: 3, marginBottom: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ color: '#1e5f05' }}>
            {client.name}
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <List>
                <ListItem>
                  <ListItemText
                    primary="CPF"
                    secondary={formatCpf(client.document_number)}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Telefone"
                    secondary={formatPhone(client.phone)}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Email" secondary={client.email} />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Data de Nascimento"
                    secondary={formatDate(client.birth_date)}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Status Social"
                    secondary={client.social_status}
                  />
                </ListItem>
              </List>
            </Grid>
            <Grid item xs={12} md={6}>
              <List>
                <ListItem>
                  <ListItemText
                    primary="Possui CAR"
                    secondary={client.car ? 'Sim' : 'Não'}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Possui CAF/DAP"
                    secondary={client.caf_dap ? 'Sim' : 'Não'}
                  />
                </ListItem>
                {client.caf_dap && client.caf_dap_number && (
                  <ListItem>
                    <ListItemText
                      primary="Número do CAF/DAP"
                      secondary={client.caf_dap_number}
                    />
                  </ListItem>
                )}
                {client.address && (
                  <ListItem>
                    <ListItemText
                      primary="Endereço"
                      secondary={
                        <>
                          {client.address.street}, {client.address.number},{' '}
                          {client.address.complement} - CEP:{' '}
                          {client.address.cep}
                          <br />
                          {client.address.neighborhood.name} -{' '}
                          {client.address.neighborhood.city}/
                          {client.address.neighborhood.state}
                        </>
                      }
                    />
                  </ListItem>
                )}
              </List>
            </Grid>
          </Grid>

          <Typography
            variant="h6"
            gutterBottom
            sx={{ color: '#1e5f05', mt: 2 }}
          >
            Cônjuge(s)
          </Typography>
          {client.spouses && client.spouses.length > 0 ? (
            <List>
              {client.spouses.map((spouse) => (
                <ListItem key={spouse.id}>
                  <ListItemText
                    primary={spouse.name}
                    secondary={`CPF: ${formatCpf(spouse.document_number)}, Telefone: ${formatPhone(spouse.phone)}, Data de Nascimento: ${formatDate(spouse.birth_date)}`}
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography>Não possui</Typography>
          )}

          <Typography
            variant="h6"
            gutterBottom
            sx={{ color: '#1e5f05', mt: 2 }}
          >
            Produção
          </Typography>
          {client.productions && client.productions.length > 0 ? (
            <List>
              {client.productions.map((production) => (
                <ListItem key={production.id}>
                  <ListItemText
                    primary={`- ${titleCase(production.type)}`}
                    secondary={
                      production.custom_type &&
                      `Tipo Customizado: ${titleCase(production.custom_type)}`
                    }
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography>Não possui</Typography>
          )}

          <Button
            variant="outlined"
            onClick={handleClickOpenModal}
            sx={{ mt: 2, color: '#1e5f05', borderColor: '#1e5f05' }}
          >
            Adicionar Observação
          </Button>

          <Typography
            variant="h6"
            gutterBottom
            sx={{ color: '#1e5f05', mt: 2 }}
          >
            Observações
          </Typography>
          {loadingObservations ? (
            <Box display="flex" justifyContent="center">
              <CircularProgress color="primary" />
            </Box>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold', color: '#1e5f05' }}>
                      Observação
                    </TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#1e5f05' }}>
                      Data
                    </TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#1e5f05' }}>
                      Ações
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {observations.map((observation) => (
                    <TableRow key={observation.id}>
                      <TableCell>{observation.text}</TableCell>
                      <TableCell>
                        {new Date(observation.created_at).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <IconButton
                          onClick={() =>
                            handleDeleteObservation(observation.id)
                          }
                          color="secondary"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
          {renderPaginationControls()}
        </Paper>

        <Dialog open={openModal} onClose={handleCloseModal}>
          <DialogTitle>Adicionar Observação</DialogTitle>
          <DialogContent>
            <TextField
              label="Observação"
              multiline
              rows={4}
              fullWidth
              value={newObservation}
              onChange={(e) => setNewObservation(e.target.value)}
              sx={{ mt: 2 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseModal} sx={{ color: '#1e5f05' }}>
              Cancelar
            </Button>
            <Button
              onClick={handleAddObservation}
              disabled={loadingObservation}
              sx={{ color: '#1e5f05' }}
            >
              {loadingObservation ? (
                <CircularProgress size={24} />
              ) : (
                'Adicionar'
              )}
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity={snackbarType}
            sx={{ width: '100%' }}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>

        <Box sx={{ mt: 2 }}>
          <Link to="/clients" style={{ color: '#1e5f05' }}>
            Voltar
          </Link>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default ClientDetails;

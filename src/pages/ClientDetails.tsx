import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Paper,
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
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        padding={3}
        bgcolor="#f5f5f5"
        minHeight="100vh"
      >
        <Typography variant="h4" gutterBottom color="primary">
          Detalhes do Cliente
        </Typography>
        <Paper
          elevation={3}
          style={{ padding: 20, width: '80%', maxWidth: 600 }}
        >
          <Typography variant="h6" gutterBottom color="secondary">
            {client.name}
          </Typography>
          <List>
            <ListItem>
              <ListItemText primary="CPF" secondary={client.document_number} />
            </ListItem>
            <ListItem>
              <ListItemText primary="Telefone" secondary={client.phone} />
            </ListItem>
            <ListItem>
              <ListItemText primary="Email" secondary={client.email} />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Data de Nascimento"
                secondary={client.birth_date}
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Status Social"
                secondary={client.social_status}
              />
            </ListItem>
            {client.address && (
              <ListItem>
                <ListItemText
                  primary="Endereço"
                  secondary={
                    <>
                      {client.address.street}, {client.address.number},{' '}
                      {client.address.complement} - CEP: {client.address.cep}
                      <br />
                      {client.address.neighborhood.name} -{' '}
                      {client.address.neighborhood.city}/
                      {client.address.neighborhood.state}
                    </>
                  }
                />
              </ListItem>
            )}
            <ListItem>
              <ListItemText primary="Cônjuge(s)" />
              {client.spouses && client.spouses.length > 0 ? (
                <List>
                  {client.spouses.map((spouse) => (
                    <ListItem key={spouse.id}>
                      <ListItemText
                        primary={spouse.name}
                        secondary={`CPF: ${spouse.document_number}, Telefone: ${spouse.phone}, Data de Nascimento: ${spouse.birth_date}`}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography>Não possui</Typography>
              )}
            </ListItem>
            <ListItem>
              <ListItemText primary="Produções" />
              {client.productions && client.productions.length > 0 ? (
                <List>
                  {client.productions.map((production) => (
                    <ListItem key={production.id}>
                      <ListItemText
                        primary={production.type}
                        secondary={
                          production.custom_type &&
                          `Tipo Customizado: ${production.custom_type}`
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography>Não possui</Typography>
              )}
            </ListItem>
            <ListItem>
              <Button
                variant="outlined"
                onClick={handleClickOpenModal}
                color="primary"
              >
                Adicionar Observação
              </Button>
            </ListItem>
            <Typography
              variant="h6"
              gutterBottom
              style={{ marginTop: 16 }}
              color="secondary"
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
                      <TableCell>Observação</TableCell>
                      <TableCell>Data</TableCell>
                      <TableCell>Ações</TableCell>
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
          </List>
          <Link to="/clients" style={{ color: theme.palette.primary.main }}>
            Voltar
          </Link>
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
              style={{ marginTop: '8px' }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseModal} color="secondary">
              Cancelar
            </Button>
            <Button
              onClick={handleAddObservation}
              disabled={loadingObservation}
              color="primary"
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
      </Box>
    </ThemeProvider>
  );
};

export default ClientDetails;

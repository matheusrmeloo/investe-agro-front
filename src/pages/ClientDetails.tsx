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
} from '@mui/material';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axiosConfig';

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
}

interface ApiResponse {
  status: number;
  payload: Client;
}

const ClientDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        setError(
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

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
      >
        <CircularProgress />
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
        Detalhes do Cliente
      </Typography>
      <Paper elevation={3} style={{ padding: 20, width: '80%', maxWidth: 600 }}>
        <Typography variant="h6" gutterBottom>
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
        </List>
        <Link to="/clients">Voltar</Link>
      </Paper>
    </Box>
  );
};

export default ClientDetails;

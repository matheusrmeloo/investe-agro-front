import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent,
  Grid,
  CircularProgress,
} from '@mui/material';
import api from '../api/axiosConfig';

interface OperationData {
  client: { id: string };
  production: { id: string };
  observation?: string;
  land_area?: number;
  measurement_land_area?: string;
  production_area?: number;
  measurement_production_area?: string;
  plowed_area?: number;
  measurement_plowed_area?: string;
  agricultural_production?: number;
  measurement_agricultural_production?: string;
}

const initialOperationData: OperationData = {
  client: { id: '' },
  production: { id: '' },
  observation: '',
  land_area: undefined,
  measurement_land_area: '',
  production_area: undefined,
  measurement_production_area: '',
  plowed_area: undefined,
  measurement_plowed_area: '',
  agricultural_production: undefined,
  measurement_agricultural_production: '',
};

interface Client {
  id: string;
  name: string;
  productions: Production[];
  // ... other properties
}

interface Production {
  id: string;
  type: string;
  custom_type: string | null;
}

interface ApiResponse {
  status: number;
  payload: Client[]; // Expect an array of clients
}

const RegisterOperation: React.FC = () => {
  const [operationData, setOperationData] =
    useState<OperationData>(initialOperationData);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [productions, setProductions] = useState<Production[]>([]); // Productions are now client-specific
  const [loadingClients, setLoadingClients] = useState<boolean>(true);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await api.get<ApiResponse>('/clients');
        if (
          response.data.status === 200 &&
          Array.isArray(response.data.payload)
        ) {
          setClients(response.data.payload);
        } else {
          setError(
            'Erro ao carregar clientes: Formato de resposta inesperado.',
          );
          setClients([]);
          console.error('Formato de resposta inesperado:', response.data);
        }
      } catch (err: any) {
        setError(
          `Erro ao carregar clientes: ${err?.response?.data?.message || err.message}`,
        );
        console.error(err);
        setClients([]);
      } finally {
        setLoadingClients(false);
      }
    };

    fetchClients();
  }, []);

  useEffect(() => {
    if (operationData.client.id) {
      const selectedClient = clients.find(
        (client) => client.id === operationData.client.id,
      );
      if (selectedClient) {
        setProductions(selectedClient.productions);
      } else {
        setProductions([]);
      }
    } else {
      setProductions([]);
    }
  }, [operationData.client.id, clients]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;

    if (
      name === 'land_area' ||
      name === 'production_area' ||
      name === 'plowed_area'
    ) {
      const parsedValue = value === '' ? undefined : parseInt(value, 10);
      setOperationData((prevData) => ({ ...prevData, [name]: parsedValue }));
    } else if (name === 'agricultural_production') {
      const parsedValue = value === '' ? undefined : parseFloat(value);
      setOperationData((prevData) => ({ ...prevData, [name]: parsedValue }));
    } else {
      setOperationData((prevData) => ({ ...prevData, [name]: value }));
    }
  };

  const handleClientChange = (event: SelectChangeEvent<string>) => {
    const clientId = event.target.value;
    setOperationData((prevData) => ({
      ...prevData,
      client: { id: clientId },
      production: { id: '' },
    }));
  };

  const handleProductionChange = (event: SelectChangeEvent<string>) => {
    setOperationData((prevData) => ({
      ...prevData,
      production: { id: event.target.value },
    }));
  };

  const handleMeasurementChange = (
    event: SelectChangeEvent<string>,
    name: string,
  ) => {
    setOperationData((prevData) => ({
      ...prevData,
      [name]: event.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      await api.post('/operations', operationData);
      setSuccess('Operação registrada com sucesso!');
      setOperationData(initialOperationData);
    } catch (err: any) {
      setError(
        `Erro ao registrar operação: ${err?.response?.data?.message || err.message || 'Erro desconhecido'}. Tente novamente mais tarde.`,
      );
      console.error(err);
    }
  };

  if (loadingClients) {
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

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      padding={3}
      bgcolor="#f5f5f5"
      height="100%"
    >
      <Typography variant="h4" gutterBottom>
        Registro de Operação
      </Typography>
      <Box
        component="form"
        onSubmit={handleSubmit}
        bgcolor="#ffffff"
        padding={4}
        borderRadius={4}
        boxShadow={3}
        width={{ xs: '90%', sm: '600px' }}
      >
        {error && <Alert severity="error">{error}</Alert>}
        {success && <Alert severity="success">{success}</Alert>}

        <FormControl fullWidth margin="normal" required>
          <InputLabel>Cliente</InputLabel>
          <Select value={operationData.client.id} onChange={handleClientChange}>
            {clients.map((client) => (
              <MenuItem key={client.id} value={client.id}>
                {client.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl
          fullWidth
          margin="normal"
          required
          disabled={!operationData.client.id}
        >
          <InputLabel>Produção</InputLabel>
          <Select
            value={operationData.production.id}
            onChange={handleProductionChange}
          >
            {productions.map((production) => (
              <MenuItem key={production.id} value={production.id}>
                {production.type}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          fullWidth
          label="Observação"
          name="observation"
          value={operationData.observation || ''}
          onChange={handleInputChange}
          margin="normal"
          multiline
          rows={2}
        />

        <TextField
          fullWidth
          label="Área de Terra"
          name="land_area"
          type="number"
          value={
            operationData.land_area !== undefined ? operationData.land_area : ''
          }
          onChange={handleInputChange}
          margin="normal"
        />
        <FormControl fullWidth margin="normal">
          <InputLabel>Unidade de Medida (Área de Terra)</InputLabel>
          <Select
            value={operationData.measurement_land_area || ''}
            onChange={(e) =>
              handleMeasurementChange(e, 'measurement_land_area')
            }
          >
            <MenuItem value="m2">m2</MenuItem>
            <MenuItem value="tarefa">Tarefa</MenuItem>
            <MenuItem value="hectare">Hectare</MenuItem>
          </Select>
        </FormControl>

        <TextField
          fullWidth
          label="Área de Produção"
          name="production_area"
          type="number"
          value={
            operationData.production_area !== undefined
              ? operationData.production_area
              : ''
          }
          onChange={handleInputChange}
          margin="normal"
        />
        <FormControl fullWidth margin="normal">
          <InputLabel>Unidade de Medida (Área de Produção)</InputLabel>
          <Select
            value={operationData.measurement_production_area || ''}
            onChange={(e) =>
              handleMeasurementChange(e, 'measurement_production_area')
            }
          >
            <MenuItem value="m2">m2</MenuItem>
            <MenuItem value="tarefa">Tarefa</MenuItem>
            <MenuItem value="hectare">Hectare</MenuItem>
          </Select>
        </FormControl>

        <TextField
          fullWidth
          label="Área Arada"
          name="plowed_area"
          type="number"
          value={
            operationData.plowed_area !== undefined
              ? operationData.plowed_area
              : ''
          }
          onChange={handleInputChange}
          margin="normal"
        />
        <FormControl fullWidth margin="normal">
          <InputLabel>Unidade de Medida (Área Arada)</InputLabel>
          <Select
            value={operationData.measurement_plowed_area || ''}
            onChange={(e) =>
              handleMeasurementChange(e, 'measurement_plowed_area')
            }
          >
            <MenuItem value="m2">m2</MenuItem>
            <MenuItem value="tarefa">Tarefa</MenuItem>
            <MenuItem value="hectare">Hectare</MenuItem>
          </Select>
        </FormControl>

        <TextField
          fullWidth
          label="Produção Agrícola"
          name="agricultural_production"
          type="number"
          value={
            operationData.agricultural_production !== undefined
              ? operationData.agricultural_production
              : ''
          }
          onChange={handleInputChange}
          margin="normal"
        />
        <FormControl fullWidth margin="normal">
          <InputLabel>Unidade de Medida (Produção Agrícola)</InputLabel>
          <Select
            value={operationData.measurement_agricultural_production || ''}
            onChange={(e) =>
              handleMeasurementChange(e, 'measurement_agricultural_production')
            }
          >
            <MenuItem value="g">g</MenuItem>
            <MenuItem value="kg">kg</MenuItem>
            <MenuItem value="t">t</MenuItem>
          </Select>
        </FormControl>

        <Button
          type="submit"
          fullWidth
          variant="contained"
          color="primary"
          style={{ marginTop: '16px' }}
        >
          Registrar Operação
        </Button>
      </Box>
    </Box>
  );
};

export default RegisterOperation;

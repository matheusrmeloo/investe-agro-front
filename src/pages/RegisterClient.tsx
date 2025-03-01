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
  Checkbox,
  FormControlLabel,
  Grid,
  CircularProgress,
  Paper,
} from '@mui/material';
import api from '../api/axiosConfig';
import axios from 'axios';

interface Neighborhood {
  id: string;
  name: string;
  city: string;
  state: string;
}

interface Address {
  cep: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: {
    id: string;
  };
}
interface Spouse {
  name: string;
  document_number: string;
  phone: string;
  birth_date: string;
}

interface Production {
  type:
    | 'milho'
    | 'pecuaria'
    | 'mandioca'
    | 'fumo'
    | 'batata doce'
    | 'trator'
    | 'outros';
  custom_type?: string;
}

interface FormData {
  name: string;
  document_number: string;
  phone: string;
  email: string;
  birth_date: string;
  social_status: string;
  car?: boolean;
  caf_dap?: boolean;
  caf_dap_number?: string;
  hasSpouse: boolean;
  spouses: Spouse[];
  productions: Production[];
  address: Address;
}

// Define a type for payload
type ApiPayload = Omit<FormData, 'hasSpouse' | 'spouses'> & {
  spouses?: Spouse[];
};

const initialFormData: FormData = {
  name: '',
  document_number: '',
  phone: '',
  email: '',
  birth_date: '',
  social_status: '',
  car: false,
  caf_dap: false,
  caf_dap_number: '',
  hasSpouse: false,
  spouses: [
    {
      name: '',
      document_number: '',
      phone: '',
      birth_date: '',
    },
  ],
  productions: [
    {
      type: 'milho',
    },
  ],
  address: {
    cep: '',
    street: '',
    number: '',
    neighborhood: {
      id: '',
    },
  },
};

const RegisterClient: React.FC = () => {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([]);
  const [loadingAddress, setLoadingAddress] = useState(false);
  const [loadingNeighborhoods, setLoadingNeighborhoods] = useState(true);

  useEffect(() => {
    const fetchNeighborhoods = async () => {
      try {
        const response = await api.get<{
          status: number;
          payload: Neighborhood[];
        }>('/neighborhoods');
        if (response.data && response.data.payload) {
          setNeighborhoods(response.data.payload);
        }
      } catch (err: any) {
        setError(
          `Erro ao carregar bairros: ${
            err.response?.data?.message || err.message
          }`,
        );
      } finally {
        setLoadingNeighborhoods(false);
      }
    };

    fetchNeighborhoods();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      address: {
        ...prevData.address,
        [name]: value,
      },
    }));
  };

  const handleNeighborhoodChange = (event: SelectChangeEvent<string>) => {
    setFormData((prevData) => ({
      ...prevData,
      address: {
        ...prevData.address,
        neighborhood: {
          id: event.target.value,
        },
      },
    }));
  };

  const handleSocialStatusChange = (event: SelectChangeEvent<string>) => {
    setFormData((prevData) => ({
      ...prevData,
      social_status: event.target.value,
    }));
  };

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prevData) => ({
      ...prevData,
      hasSpouse: event.target.checked,
      spouses: event.target.checked
        ? [
            {
              name: '',
              document_number: '',
              phone: '',
              birth_date: '',
            },
          ]
        : [],
    }));
  };

  const handleSpouseChange = (
    index: number,
    field: keyof Spouse,
    value: string,
  ) => {
    const updatedSpouses = [...formData.spouses];
    updatedSpouses[index][field] = value;
    setFormData((prevData) => ({
      ...prevData,
      spouses: updatedSpouses,
    }));
  };

  const handleProductionTypeChange = (
    index: number,
    event: SelectChangeEvent<
      | 'milho'
      | 'pecuaria'
      | 'mandioca'
      | 'fumo'
      | 'batata doce'
      | 'trator'
      | 'outros'
    >,
  ) => {
    const updatedProductions = [...formData.productions];
    updatedProductions[index].type = event.target.value as
      | 'milho'
      | 'pecuaria'
      | 'mandioca'
      | 'fumo'
      | 'batata doce'
      | 'trator'
      | 'outros';

    if (event.target.value !== 'outros') {
      delete updatedProductions[index].custom_type;
    } else {
      updatedProductions[index].custom_type = '';
    }

    setFormData((prevData) => ({
      ...prevData,
      productions: updatedProductions,
    }));
  };

  const handleCustomProductionChange = (index: number, value: string) => {
    const updatedProductions = [...formData.productions];
    updatedProductions[index].custom_type = value;
    setFormData((prevData) => ({
      ...prevData,
      productions: updatedProductions,
    }));
  };

  const handleAddProduction = () => {
    setFormData((prevData) => ({
      ...prevData,
      productions: [...prevData.productions, { type: 'milho' }],
    }));
  };

  const handleRemoveProduction = (index: number) => {
    const updatedProductions = [...formData.productions];
    updatedProductions.splice(index, 1);
    setFormData((prevData) => ({
      ...prevData,
      productions: updatedProductions,
    }));
  };

  const handleCepChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      address: {
        ...prevData.address,
        cep: value,
      },
    }));

    if (value.length === 8) {
      setLoadingAddress(true);
      try {
        const response = await axios.get(
          `https://viacep.com.br/ws/${value}/json/`,
        );
        if (response.data && !response.data.erro) {
          setFormData((prevData) => ({
            ...prevData,
            address: {
              ...prevData.address,
              street: response.data.logradouro,
              complement: response.data.complemento,
            },
          }));
        }
      } catch (err: any) {
        setError(`Erro ao buscar endereço pelo CEP: ${err.message}`);
      } finally {
        setLoadingAddress(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      const { hasSpouse, spouses, ...payload } = formData;
      let apiPayload: ApiPayload = { ...payload };

      if (hasSpouse) {
        apiPayload = { ...apiPayload, spouses };
      }

      await api.post('/clients', apiPayload);
      setSuccess('Cliente cadastrado com sucesso!');
      setFormData(initialFormData);
    } catch (err) {
      setError('Erro ao cadastrar cliente. Tente novamente mais tarde.');
    }
  };

  return (
    <Box sx={{ flexGrow: 1, padding: 3 }}>
      <Typography
        variant="h4"
        gutterBottom
        sx={{ color: '#1e5f05', textAlign: 'center' }}
      >
        Cadastro de Cliente
      </Typography>

      <Paper sx={{ padding: 3, marginBottom: 3 }}>
        {error && (
          <Alert severity="error" sx={{ marginBottom: 2 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ marginBottom: 2 }}>
            {success}
          </Alert>
        )}

        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Nome"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              margin="normal"
              required
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="CPF"
              name="document_number"
              value={formData.document_number}
              onChange={handleInputChange}
              margin="normal"
              required
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Telefone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              margin="normal"
              required
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="E-mail"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              margin="normal"
              required
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Data de Nascimento"
              name="birth_date"
              type="date"
              value={formData.birth_date}
              onChange={handleInputChange}
              InputLabelProps={{ shrink: true }}
              margin="normal"
              required
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth margin="normal" required>
              <InputLabel>Status Social</InputLabel>
              <Select
                value={formData.social_status}
                onChange={handleSocialStatusChange}
              >
                <MenuItem value="solteiro">Solteiro</MenuItem>
                <MenuItem value="casado">Casado</MenuItem>
                <MenuItem value="divorciado">Divorciado</MenuItem>
                <MenuItem value="viuvo">Viúvo</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.hasSpouse}
                  onChange={handleCheckboxChange}
                />
              }
              label="Possui cônjuge?"
            />
          </Grid>

          {formData.hasSpouse && (
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Cônjuge
              </Typography>
              {formData.spouses.map((spouse, index) => (
                <Box key={index} marginBottom={2}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Nome"
                        value={spouse.name}
                        onChange={(e) =>
                          handleSpouseChange(index, 'name', e.target.value)
                        }
                        margin="normal"
                        required
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="CPF"
                        value={spouse.document_number}
                        onChange={(e) =>
                          handleSpouseChange(
                            index,
                            'document_number',
                            e.target.value,
                          )
                        }
                        margin="normal"
                        required
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Telefone"
                        value={spouse.phone}
                        onChange={(e) =>
                          handleSpouseChange(index, 'phone', e.target.value)
                        }
                        margin="normal"
                        required
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Data de Nascimento"
                        type="date"
                        value={spouse.birth_date}
                        onChange={(e) =>
                          handleSpouseChange(
                            index,
                            'birth_date',
                            e.target.value,
                          )
                        }
                        InputLabelProps={{ shrink: true }}
                        margin="normal"
                        required
                      />
                    </Grid>
                  </Grid>
                </Box>
              ))}
            </Grid>
          )}

          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.car}
                  onChange={(event) =>
                    setFormData((prevData) => ({
                      ...prevData,
                      car: event.target.checked,
                    }))
                  }
                />
              }
              label="Possui CAR?"
            />
          </Grid>

          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.caf_dap}
                  onChange={(event) =>
                    setFormData((prevData) => ({
                      ...prevData,
                      caf_dap: event.target.checked,
                      caf_dap_number: event.target.checked
                        ? prevData.caf_dap_number
                        : '',
                    }))
                  }
                />
              }
              label="Possui CAF/DAP?"
            />
          </Grid>

          {formData.caf_dap && (
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Número do CAF/DAP"
                name="caf_dap_number"
                value={formData.caf_dap_number}
                onChange={handleInputChange}
                margin="normal"
                required
              />
            </Grid>
          )}

          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Endereço
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="CEP"
                  name="cep"
                  value={formData.address.cep}
                  onChange={handleCepChange}
                  margin="normal"
                  required
                />
              </Grid>
              <Grid item xs={12} md={8}>
                <TextField
                  fullWidth
                  label="Rua"
                  name="street"
                  value={formData.address.street}
                  onChange={handleAddressChange}
                  margin="normal"
                  required
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Número"
                  name="number"
                  value={formData.address.number}
                  onChange={handleAddressChange}
                  margin="normal"
                  required
                />
              </Grid>
              <Grid item xs={12} md={8}>
                <TextField
                  fullWidth
                  label="Complemento"
                  name="complement"
                  value={formData.address.complement || ''}
                  onChange={handleAddressChange}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth margin="normal" required>
                  <InputLabel>Bairro</InputLabel>
                  {loadingNeighborhoods ? (
                    <CircularProgress />
                  ) : (
                    <Select
                      value={formData.address.neighborhood.id}
                      onChange={handleNeighborhoodChange}
                    >
                      {neighborhoods.map((neighborhood) => (
                        <MenuItem value={neighborhood.id} key={neighborhood.id}>
                          {neighborhood.name} - {neighborhood.city}/
                          {neighborhood.state}
                        </MenuItem>
                      ))}
                    </Select>
                  )}
                </FormControl>
              </Grid>
            </Grid>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Produções
            </Typography>
            {formData.productions.map((production, index) => (
              <Box
                key={index}
                display="flex"
                alignItems="center"
                marginBottom={2}
              >
                <FormControl style={{ marginRight: 16, flex: 1 }}>
                  <InputLabel>Tipo de Produção</InputLabel>
                  <Select
                    value={production.type}
                    onChange={(e) =>
                      handleProductionTypeChange(
                        index,
                        e as SelectChangeEvent<
                          | 'milho'
                          | 'pecuaria'
                          | 'mandioca'
                          | 'fumo'
                          | 'batata doce'
                          | 'trator'
                          | 'outros'
                        >,
                      )
                    }
                    label="Tipo de Produção"
                  >
                    <MenuItem value="milho">Milho</MenuItem>
                    <MenuItem value="pecuaria">Pecuária</MenuItem>
                    <MenuItem value="mandioca">Mandioca</MenuItem>
                    <MenuItem value="fumo">Fumo</MenuItem>
                    <MenuItem value="batata doce">Batata Doce</MenuItem>
                    <MenuItem value="trator">Trator</MenuItem>
                    <MenuItem value="outros">Outros</MenuItem>
                  </Select>
                </FormControl>

                {production.type === 'outros' && (
                  <TextField
                    label="Especifique o tipo"
                    value={production.custom_type || ''}
                    onChange={(e) =>
                      handleCustomProductionChange(index, e.target.value)
                    }
                    style={{ marginRight: 16, flex: 2 }}
                    required
                  />
                )}

                <Button
                  variant="outlined"
                  color="error"
                  size="small"
                  onClick={() => handleRemoveProduction(index)}
                  style={{ height: '40px' }}
                >
                  Remover
                </Button>
              </Box>
            ))}
            <Button
              variant="outlined"
              color="primary"
              onClick={handleAddProduction}
              style={{ marginBottom: 16 }}
            >
              Adicionar Produção
            </Button>
          </Grid>

          <Grid item xs={12}>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              sx={{
                marginTop: '16px',
                backgroundColor: '#1e5f05',
                '&:hover': { backgroundColor: '#144103' },
              }}
            >
              Cadastrar Cliente
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default RegisterClient;

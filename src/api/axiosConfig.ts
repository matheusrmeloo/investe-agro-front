import axios from 'axios';

const api = axios.create({
  baseURL:
    process.env.REACT_APP_BACKEND_URL ||
    'https://investe-agro-api-production.up.railway.app',
});

export default api;

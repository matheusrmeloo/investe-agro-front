import axios from 'axios';

const api = axios.create({
  baseURL: 'https://investe-agro-api-production.up.railway.app',
});

export default api;

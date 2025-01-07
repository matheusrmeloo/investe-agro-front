import axios from 'axios';

const api = axios.create({
  baseURL: 'https://investe-agro-api-develop.up.railway.app',
});

export default api;

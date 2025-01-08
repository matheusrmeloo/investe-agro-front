import axios from 'axios';

export const backendUrl = 'https://investe-agro-api-production.up.railway.app';

const api = axios.create({
  baseURL: backendUrl,
});

export default api;

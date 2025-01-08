import axios from 'axios';

export const backendUrl = 'https://investe-agro-api-develop.up.railway.app';

const api = axios.create({
  baseURL: backendUrl,
});

export default api;

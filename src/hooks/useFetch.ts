import { useEffect, useState } from 'react';
import api from '../api/axiosConfig';

const useFetch = (endpoint: string) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get(endpoint)
      .then((response) => setData(response.data))
      .finally(() => setLoading(false));
  }, [endpoint]);

  return { data, loading };
};

export default useFetch;

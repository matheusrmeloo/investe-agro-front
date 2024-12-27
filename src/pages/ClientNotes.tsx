import React from 'react';
import { useParams } from 'react-router-dom';

const ClientNotes: React.FC = () => {
  const { id } = useParams();

  return <h1>Observações do Cliente {id}</h1>;
};

export default ClientNotes;

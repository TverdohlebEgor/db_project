import React, { useState, useEffect } from 'react';

import Comunicazione from "./Comunicazione";


function ListaComunicazioni({ progetto, reload }) {
  const [comunicazioni, setComunicazioni] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    const fetchComunicazioni = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/findComunicazioniByIdProgetto', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idProgetto: progetto.idProgetto, tipo: "Progetto" })
        });

        if (!response.ok) throw new Error("Errore nel caricamento comunicazioni");

        const data = await response.json();
        setComunicazioni(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchComunicazioni();
  }, [progetto, reload]);

  if (loading) return <p>Caricamento comunicazioni...</p>;
  if (comunicazioni.length === 0) return <p>Nessuna comunicazione trovata.</p>;

  return (
    <div>
      {comunicazioni.map(com => (
        <Comunicazione key={com.idComunicazione} comunicazione={com} />
      ))}
    </div>
  );
}

export default ListaComunicazioni;
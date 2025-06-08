import React, { useState, useEffect } from 'react';
import Comunicazione from '../progetti/comunicazioni/Comunicazione';


function ComunicazioniForum({ reload }) {
    const [comunicazioni, setComunicazioni] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);

        const fetchComunicazioni = async () => {
            try {
                const response = await fetch('http://localhost:8080/api/findComunicazioniByIdProgetto', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ idProgetto: 0})
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
    }, [ reload]);

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

export default ComunicazioniForum;
import React, { useEffect, useState } from "react";

import Rimborso from "./Rimborso";

function GestioneRimborsi({ manager }) {
    const [rimborsi, setRimborsi] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchRimborsi = async () => {
        try {
            setLoading(true);
            const response = await fetch("http://localhost:8080/api/rimborsiByManager", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ idManager: manager.idUtente }),
            });

            if (!response.ok) throw new Error("Errore nel recupero dei rimborsi");

            const data = await response.json();
            setRimborsi(data);
        } catch (error) {
            console.error("Errore:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (manager?.idUtente) {
            fetchRimborsi();
        }
    }, [manager]);

    if (loading) return <p>Caricamento rimborsi...</p>;
    if (rimborsi.length === 0) return <p>Nessun rimborso disponibile.</p>;

    return (
        <div>
            <h3>Rimborsi spese</h3>
            {rimborsi.map((rimborso) => (
                <Rimborso
                    key={rimborso.idRimborso}
                    rimborsoBase={rimborso}
                    onRimborsoAggiornato={fetchRimborsi}
                />
            ))}
        </div>
    );
}

export default GestioneRimborsi

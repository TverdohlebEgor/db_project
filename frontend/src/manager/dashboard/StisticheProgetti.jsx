import React, { useEffect, useState } from "react";

function StatisticheProgetti() {
    const [progetti, setProgetti] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchProgetti() {
            try {
                const res = await fetch("http://localhost:8080/api/statisticheProgetti");
                const data = await res.json();
                setProgetti(data);
            } catch (err) {
                console.error("Errore nel caricamento:", err);
            } finally {
                setLoading(false);
            }
        }

        fetchProgetti();
    }, []);

    if (loading) return <p>Caricamento statistiche progetti...</p>;

    return (
        <div className="container mt-4">
            <h3 className="text-center mb-4">Progetti con il Maggior Numero di Ore Assegnate</h3>

            <div className="card shadow-sm">
                <div className="card-header bg-primary text-white fw-semibold">
                    Classifica per Ore Totali Lavorate
                </div>
                <div className="card-body p-0">
                    <table className="table table-hover table-striped mb-0">
                        <thead className="table-light">
                            <tr>
                                <th>Progetto</th>
                                <th>Ore Totali</th>
                            </tr>
                        </thead>
                        <tbody>
                            {progetti.map((p, i) => (
                                <tr key={i}>
                                    <td className="fw-medium">{p.nomeprogetto}</td>
                                    <td>
                                        <span className="badge bg-primary">
                                            {parseFloat(p.oretotali).toFixed(2)} ore
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

    );
}

export default StatisticheProgetti;

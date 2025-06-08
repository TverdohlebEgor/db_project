import React, { useEffect, useState } from "react";

function StatistichePermessi() {
  const [statistiche, setStatistiche] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch("http://localhost:8080/api/dashboardStatistiche");
        const data = await response.json();
        setStatistiche(data);
      } catch (error) {
        console.error("Errore nel caricamento dashboard:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) return <p>Caricamento statistiche...</p>;
  if (!statistiche) return <p>Nessun dato disponibile.</p>;

  return (
   <div className="container mt-4">
  <h3 className="mb-4 text-center">Dashboard Statistiche</h3>

  <div className="row">
    <div className="col-md-6 mb-4">
      <div className="card shadow-sm">
        <div className="card-header bg-primary text-white">
          Eventi per Tipo
        </div>
        <ul className="list-group list-group-flush">
          {statistiche.perTipo.map((tipo, i) => (
            <li key={i} className="list-group-item d-flex justify-content-between align-items-center">
              {tipo.tipo}
              <span className="badge bg-primary rounded-pill">{tipo.conteggio}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>

    <div className="col-md-6 mb-4">
      <div className="card shadow-sm">
        <div className="card-body">
          <h5 className="card-title">Giorni medi di ferie per utente</h5>
          <p className="card-text display-6 text-success">{statistiche.ferieMedie.toFixed(2)}</p>
        </div>
      </div>
    </div>
  </div>

  <div className="card shadow-sm mt-4">
    <div className="card-header bg-secondary text-white">
      Permessi per Utente
    </div>
    <div className="card-body p-0">
      <table className="table table-striped mb-0">
        <thead className="table-light">
          <tr>
            <th>Nome</th>
            <th>Cognome</th>
            <th>Numero Permessi</th>
          </tr>
        </thead>
        <tbody>
          {statistiche.permessiUtente.map((p, i) => (
            <tr key={i}>
              <td>{p.nome}</td>
              <td>{p.cognome}</td>
              <td>
                <span className="badge bg-info text-dark">{p.numeropermessi}</span>
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

export default StatistichePermessi;

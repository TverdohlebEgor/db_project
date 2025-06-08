import React, { useEffect, useState } from "react";

function StatisticheFerieAccumulate() {
    const [utenti, setUtenti] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("http://localhost:8080/api/statisticheFerieAccumulate")
            .then(res => res.json())
            .then(data => setUtenti(data))
            .catch(err => console.error("Errore:", err))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <p>Caricamento...</p>;

    return (
       <div className="container mt-4">
  <h3 className="text-center mb-4">Dipendenti con oltre 30 giorni di ferie accumulate</h3>

  <div className="card shadow-sm">
    <div className="card-header bg-warning text-dark fw-bold">
      Elenco Dipendenti
    </div>
    <div className="card-body p-0">
      <table className="table table-striped table-hover mb-0">
        <thead className="table-light">
          <tr>
            <th>Nome</th>
            <th>Cognome</th>
            <th>Email</th>
            <th>Ferie Accumulate</th>
          </tr>
        </thead>
        <tbody>
          {utenti.map((utente) => (
            <tr key={utente.idUtente}>
              <td>{utente.nome}</td>
              <td>{utente.cognome}</td>
              <td>{utente.email}</td>
              <td>
                <span className="badge bg-warning text-dark">
                  {utente.ferieAccumulate} giorni
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

export default StatisticheFerieAccumulate


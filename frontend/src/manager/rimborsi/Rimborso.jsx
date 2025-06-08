import React, { useEffect, useState } from "react";
import Comunicazione from "../progetti/comunicazioni/Comunicazione";

function Rimborso({ rimborsoBase, onRimborsoAggiornato }) {
  const [rimborsoCompleto, setRimborsoCompleto] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDettagli() {
      try {
        // Fetch valuta
        const valutaResp = await fetch("http://localhost:8080/api/valutaById", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idValuta: rimborsoBase.idValuta }),
        });
        const valuta = await valutaResp.json();

        // Fetch comunicazione
        const comResp = await fetch("http://localhost:8080/api/findComunicazioniById", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idComunicazione: rimborsoBase.idComunicazione }),
        });
        const comunicazioni = await comResp.json();
        const comunicazione = comunicazioni.length > 0 ? comunicazioni[0] : null;

        // Fetch utente (nome, email)
        const utenteResp = await fetch("http://localhost:8080/api/getUtentebyId", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idUtente: rimborsoBase.idUtente }),
        });
        const utente = await utenteResp.json();

        setRimborsoCompleto({
          ...rimborsoBase,
          valutaSimbolo: valuta.simbolo,
          valutaNome: valuta.nome,
          comunicazione,
          nome: utente.nome + " " + utente.cognome,
          email: utente.email,
        });
      } catch (error) {
        console.error("Errore caricamento dettagli rimborso:", error);
      } finally {
        setLoading(false);
      }
    }

    if (rimborsoBase) fetchDettagli();
    else setLoading(false);
  }, [rimborsoBase]);

  const handleDecision = async (approvato) => {
    try {
      const response = await fetch("http://localhost:8080/api/gestisciRimborso", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idRimborso: rimborsoBase.idRimborso, approvato }),
      });

      if (!response.ok) throw new Error("Errore aggiornamento rimborso");

      if (onRimborsoAggiornato) {
        onRimborsoAggiornato();
      }
    } catch (error) {
      console.log("Errore nell'aggiornamento del rimborso");
    }
  };

  if (loading) return <p>Caricamento rimborso...</p>;
  if (!rimborsoCompleto) return <p>Nessun rimborso da mostrare.</p>;

  const {
    idRimborso,
    importo,
    data,
    approvato,
    valutaSimbolo,
    valutaNome,
    comunicazione,
    nome,
    email,
  } = rimborsoCompleto;
  const importoFormattato = `${importo.toFixed(2)} ${valutaSimbolo ?? valutaNome}`;

  let statoTesto;
  if (approvato === null) statoTesto = "In attesa";
  else if (approvato === true) statoTesto = "Approvato";
  else statoTesto = "Rifiutato";

  return (
    <div className="rimborso border p-3 mb-3 rounded shadow-sm bg-white">
      <h5>Rimborso #{idRimborso}</h5>
      <p>
        <b>Importo:</b> {importoFormattato}
      </p>
      <p>
        <b>Data:</b> {new Date(data).toLocaleDateString()}
      </p>
      <p>
        <b>Stato:</b> {statoTesto}
      </p>

      <p>
        <b>Richiesto da:</b> {nome} ({email})
      </p>

      {comunicazione && <Comunicazione comunicazione={comunicazione} />}

      {approvato === null && (
        <div className="mt-3">
          <button className="btn btn-success me-2" onClick={() => handleDecision(true)}>
            Accetta
          </button>
          <button className="btn btn-danger" onClick={() => handleDecision(false)}>
            Rifiuta
          </button>
        </div>
      )}
    </div>
  );
}

export default Rimborso;

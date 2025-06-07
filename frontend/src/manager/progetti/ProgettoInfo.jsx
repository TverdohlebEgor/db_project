import { useState } from "react";
import { Button } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";
import ChatProgetto from "./ChatProgetto";

function ProgettoInfo() {
    const navigate = useNavigate();
    const location = useLocation();

    const { progetto, manager } = location.state || {};
    const [concluso, setConcluso] = useState(progetto.concluso); // Stato locale aggiornabile

    const goToGestioneMembri = () => {
        navigate(`/progetto/${progetto.idProgetto}/gestione`, {
            state: { progetto, manager }
        });
    };

    const goToGestioneManager = () => {
        navigate(`/progetto/${progetto.idProgetto}/gestionemanager`, {
            state: { progetto, manager }
        });
    };

    const handleEliminaProgetto = async () => {
        if (window.confirm("Sei sicuro di voler eliminare questo progetto?")) {
            try {
                const response = await fetch('http://localhost:8080/api/progettoDelete', {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ idProgetto: progetto.idProgetto })
                });

                if (!response.ok) throw new Error("Errore nella richiesta");

                alert("Progetto eliminato con successo.");
                navigate("/home");
            } catch (error) {
                console.error(error);
                alert("Errore durante l'eliminazione del progetto.");
            }
        }
    };

    const handleToggleConcluso = async () => {
        try {
        
            const nuovoStato = !concluso;

            const response = await fetch('http://localhost:8080/api/progettoToggleConcluso', {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    idProgetto: progetto.idProgetto,
                    concluso: nuovoStato
                })
            });

            if (!response.ok) throw new Error("Errore nella richiesta");

            setConcluso(nuovoStato); 
        } catch (error) {
            console.error(error);
            alert("Errore durante l'aggiornamento dello stato.");
        }
    };

    return (
        <div className="user-card" style={{ margin: "10px", padding: "10px" }}>
            <Button onClick={goToGestioneMembri}>Gestisci dipendenti</Button>
            <Button onClick={goToGestioneManager}>Gestisci manager</Button>
            <hr />
            <Button variant="danger" onClick={handleEliminaProgetto}>Elimina Progetto</Button>{' '}
            <Button variant="warning" onClick={handleToggleConcluso}>
                {concluso ? "Segna come non concluso" : "Segna come concluso"}
            </Button>
            <hr />
            <ChatProgetto progetto={progetto} />
        </div>
    );
}

export default ProgettoInfo;

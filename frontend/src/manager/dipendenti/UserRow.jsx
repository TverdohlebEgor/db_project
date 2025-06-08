import React, { useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
import { useNavigate } from 'react-router-dom';

function UserRow({ utente, manager, ofManager, refreshList }) {
    const navigate = useNavigate();
    const [eventi, setEventi] = useState([]);

    const fetchEventiDipendente = async () => {
        try {
            const response = await fetch('http://localhost:8080/api/getEventiNonApprovati', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ idDipendente: utente.idUtente })
            });

            if (response.ok) {
                const data = await response.json();
                setEventi(data);
            } else {
                console.error('Errore nel recupero eventi non approvati');
            }
        } catch (err) {
            console.log('Errore fetch eventi:', err);
        }
    };

    useEffect(() => {
        if (ofManager) {
            fetchEventiDipendente();
        }
    }, [ofManager]);

    const handleApproval = async (eventId, approve, eventType) => {
        try {
            const response = await fetch(`http://localhost:8080/api/updateApprovazione`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ idEvento: eventId, approvato: approve })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Errore approvazione: ${response.status}. Messaggio: ${errorText}`);
            }

            if (approve && eventType === "LAVORO") {
                const ferieResponse = await fetch('http://localhost:8080/api/aggiornaFerie', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ idEvento: eventId })
                });

                if (!ferieResponse.ok) {
                    const msg = await ferieResponse.text();
                    throw new Error(`Errore aggiornamento ferie: ${ferieResponse.status} - ${msg}`);
                }
            }

            fetchEventiDipendente();

        } catch (error) {
            console.error('Errore durante approvazione evento:', error);
            alert(`Errore: ${error.message}`);
        }
    };

    const aggiungiDipendente = async () => {
        try {
            const response = await fetch('http://localhost:8080/api/addEmployeeToManager', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    idManager: manager.idUtente,
                    idDipendente: utente.idUtente
                })
            });

            if (response.ok) {
                refreshList();
            }
        } catch (err) {
            console.log(err);
        }
    };

    const rimuoviDipendente = async () => {
        try {
            const response = await fetch('http://localhost:8080/api/removeEmployeeFromManager', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    idManager: manager.idUtente,
                    idDipendente: utente.idUtente
                })
            });

            if (response.ok) {
                refreshList();
            }
        } catch (err) {
            console.log(err);
        }
    };

    const vaiAlCalendario = () => {
        navigate('/calendarioDipendente', { state: { utente } });
    };

    return (
        <div className="user-card" style={{ border: "1px solid gray", margin: "10px", padding: "10px" }}>
            <div>
                <strong>{utente.nome} {utente.cognome}</strong>
            </div>

            <p>Email: {utente.email}</p>

            {ofManager && <Button variant="secondary" onClick={vaiAlCalendario}>Vai al calendario</Button>}
            {ofManager && <Button variant="danger" onClick={rimuoviDipendente}>Rimuovi</Button>}
            {!ofManager && <Button variant="success" onClick={aggiungiDipendente}>Aggiungi</Button>}

            {ofManager && eventi.length > 0 && (
                <div style={{ marginTop: '15px' }}>
                    <h6>Eventi non approvati:</h6>
                    {eventi.map(ev => (
                        <div key={ev.idEvento || ev.IdEvento} style={{ border: '1px solid #ccc', padding: '8px', marginBottom: '8px' }}>
                            <p><strong>Data:</strong> {new Date(ev.data).toLocaleDateString()}</p>
                            <p><strong>Tipo:</strong> {ev.tipo}</p>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <Button variant="success" onClick={() => handleApproval(ev.IdEvento, true, ev.tipo)}>Approva</Button>
                                <Button variant="danger" onClick={() => handleApproval(ev.IdEvento, false, ev.tipo)}>Rifiuta</Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default UserRow;

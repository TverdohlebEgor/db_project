import { Button } from 'react-bootstrap';
import React, { useState, useEffect } from 'react';
import UserRow from './UserRow';

function GestioneDipendenti({ manager }) {
    const [utenti, setUtenti] = useState([]);
    const [ofManager, setOfManager] = useState(true); 

    const caricaDipendentiAssegnati = async () => {
        try {
            const response = await fetch('http://localhost:8080/api/employeesOfManager', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ idUtente: manager.idUtente }),
            });
            const data = await response.json();
            setUtenti(data);
            setOfManager(true);
        } catch (err) {
            console.error(err);
        }
    };

    const caricaDipendentiNonAssegnati = async () => {
        try {
            const response = await fetch('http://localhost:8080/api/allEmployeesNotAssociatedWith', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ idUtente: manager.idUtente }),
            });
            const data = await response.json();
            setUtenti(data);
            setOfManager(false);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        if (manager?.idUtente) {
            caricaDipendentiAssegnati();
        }
    }, [manager]);

    return (
        <div>
            <h3>Gestione Dipendenti</h3>

            <Button
                variant={ofManager ? "primary" : "outline-primary"}
                className="me-2"
                onClick={caricaDipendentiAssegnati}
            >
                Mostra dipendenti assegnati a me
            </Button>

            <Button
                variant={!ofManager ? "primary" : "outline-primary"}
                onClick={caricaDipendentiNonAssegnati}
            >
                Mostra dipendenti non assegnati a me
            </Button>

            {utenti.length > 0 ? (
                utenti.map((utente) => (
                    <UserRow
                        key={utente.idUtente}
                        utente={utente}
                        manager={manager}
                        ofManager={ofManager}
                        refreshList={ofManager ? caricaDipendentiAssegnati : caricaDipendentiNonAssegnati}
                    />
                ))
            ) : (
                <p>Nessun utente caricato</p>
            )}
        </div>
    );
}

export default GestioneDipendenti;

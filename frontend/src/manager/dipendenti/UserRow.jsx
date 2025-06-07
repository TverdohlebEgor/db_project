import React from 'react';
import Button from 'react-bootstrap/Button';
import { useNavigate } from 'react-router-dom';

function UserRow({ utente, manager, ofManager, refreshList }) {

    const navigate = useNavigate();

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
            <Button variant="secondary" onClick={vaiAlCalendario}>
                {utente.nome} {utente.cognome}
            </Button>

            <p>Email: {utente.email}</p>

            {ofManager && (
                <Button variant="danger" onClick={rimuoviDipendente}>
                    Rimuovi
                </Button>
            )}

            {!ofManager && (
                <Button variant="success" onClick={aggiungiDipendente}>
                    Aggiungi
                </Button>
            )}
        </div>
    );
}
export default UserRow;

import { Button } from 'react-bootstrap';
import { jsx } from 'react/jsx-runtime';
import React, { useState } from 'react';
import UserRow from './UserRow';


function GestioneDipendenti({manager}) {

    const [utenti, setUtenti] = useState([]);


    const caricaDipendentiAssegnati = async () => {

        try {
            const idUtente = manager.idUtente
            console.log(idUtente)
            const response = await fetch('http://localhost:8080/api/employeesOfManager', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({idUtente})
            });

            const data = await response.json();
            setUtenti(data);


        } catch (err) {
            console.log(err)

        }

    };

    const caricaTuttiIDipendenti = async () => {

        try {
            const response = await fetch('http://localhost:8080/api/allEmployees', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },

            });
            const data = await response.json();
            setUtenti(data);
        } catch (err) {
            console.log(err)

        }

    };



    return (
        <div>
            <h3>Gestione Dipendenti</h3>
            <Button className="me-2" onClick={caricaDipendentiAssegnati}>
                Carica Dipendenti Assegnati
            </Button>
            <Button onClick={caricaTuttiIDipendenti}>
                Carica Tutti i Dipendenti
            </Button>

            {utenti.length > 0 ? (
                utenti.map((utente) => (
                    <UserRow key={utente.idUtente} utente={utente} />
                ))
            ) : (
                <p>Nessun utente caricato</p>
            )}
        </div>
    );
}

export default GestioneDipendenti;

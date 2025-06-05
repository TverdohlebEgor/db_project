import { Button } from 'react-bootstrap';
import { jsx } from 'react/jsx-runtime';
import React, { useState } from 'react';
import UserRow from './UserRow';


function GestioneDipendenti({ manager }) {

    const [utenti, setUtenti] = useState([]);

    const [ofManger, setOfManger] = useState(false);


    const caricaDipendentiAssegnati = async () => {

        try {
            const idUtente = manager.idUtente
            const response = await fetch('http://localhost:8080/api/employeesOfManager', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ idUtente })
            });

            const data = await response.json();
            setOfManger(true)

            setUtenti(data);


        } catch (err) {
            console.log(err)

        }

    };

    const caricaDipendentiNonAssegnati = async () => {



        try {
            const idUtente = manager.idUtente
            const response = await fetch('http://localhost:8080/api/allEmployeesNotAssociatedWith', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ idUtente })
            });

            const data = await response.json();
            setOfManger(false)
            setUtenti(data);


        } catch (err) {
            console.log(err)

        }

    };



    return (
        <div>
            <h3>Gestione Dipendenti</h3>
            <Button className="me-2" onClick={caricaDipendentiAssegnati}>
                Carica Dipendenti assegnati a me
            </Button>
            <Button onClick={caricaDipendentiNonAssegnati}>
                Carica Dipendenti non asseganti a me
            </Button>

            {utenti.length > 0 ? (
                utenti.map((utente) => (
                    <UserRow key={utente.idUtente} utente={utente} manager={manager} ofManager={ofManger} />
                ))
            ) : (
                <p>Nessun utente caricato</p>
            )}
        </div>
    );
}

export default GestioneDipendenti;

import React, { useState } from 'react';
import ProgettoRow from './ProgettoRow';
import { Button } from 'react-bootstrap';






function GestioneProgetti(manager) {
    const [progetti, setprogetti] = useState([]);

    const caricaProgetti = async () => {



        try {
            const idUtente = manager.idUtente
            const response = await fetch('http://localhost:8080/api/getProjectsPerManager', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ idUtente })
            });

            const data = await response.json();
            setprogetti(data);


        } catch (err) {
            console.log(err)

        }

    };



    return (

        <div>
            <Button onClick={caricaProgetti}>Carica progetti</Button>

            {progetti.length > 0 ? (
                progetti.map((progetto) => (

                    <ProgettoRow progetto={progetto} />
                ))
            ) : (
                <p>Nessun progetto</p>
            )}

        </div>
    );
}

export default GestioneProgetti;

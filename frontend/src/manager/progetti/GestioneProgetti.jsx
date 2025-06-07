import React, { useState, useEffect } from 'react';
import ProgettoRow from './ProgettoRow';
import { Button, Form, Container, Row, Col } from 'react-bootstrap';

function GestioneProgetti({ manager }) {
    const [progetti, setProgetti] = useState([]);
    const [nomeProgetto, setNomeProgetto] = useState('');
    const [deadline, setDeadline] = useState('');

    const caricaProgetti = async () => {
        try {
            const idUtente = manager.idUtente;
            const response = await fetch('http://localhost:8080/api/getProjectsPerManager', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ idUtente })
            });

            const data = await response.json();
            setProgetti(data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        caricaProgetti();
    }, []);

    const creaProgetto = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch('http://localhost:8080/api/addProject', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    nomeProgetto,
                    deadline,
                    idManager: manager.idUtente 
                })
            });

            if (response.ok) {
                setNomeProgetto('');
                setDeadline('');
                caricaProgetti(); 
            } else {
                console.log("Errore durante la creazione del progetto");
            }
        } catch (err) {
            console.log(err);
        }
    };

    return (
        <Container className="mt-4">
            <h3 className="mb-3">Crea un Nuovo Progetto</h3>
            <Form onSubmit={creaProgetto}>
                <Row className="mb-3">
                    <Col md={5}>
                        <Form.Group controlId="formNomeProgetto">
                            <Form.Label>Nome Progetto</Form.Label>
                            <Form.Control
                                type="text"
                                value={nomeProgetto}
                                onChange={(e) => setNomeProgetto(e.target.value)}
                                required
                                placeholder="Inserisci nome progetto"
                            />
                        </Form.Group>
                    </Col>
                    <Col md={4}>
                        <Form.Group controlId="formDeadline">
                            <Form.Label>Deadline</Form.Label>
                            <Form.Control
                                type="date"
                                value={deadline}
                                onChange={(e) => setDeadline(e.target.value)}
                                required
                            />
                        </Form.Group>
                    </Col>
                    <Col md={3} className="d-flex align-items-end">
                        <Button type="submit" variant="primary" className="w-100">
                            Crea Progetto
                        </Button>
                    </Col>
                </Row>
            </Form>

            <hr />

            <h4 className="mb-3">I tuoi Progetti</h4>
            {progetti.length > 0 ? (
                progetti.map((progetto) => (
                    <ProgettoRow key={progetto.idProgetto} progetto={progetto} manager={manager} />
                ))
            ) : (
                <p>Nessun progetto disponibile.</p>
            )}
        </Container>
    );
}

export default GestioneProgetti;

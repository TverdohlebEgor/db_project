import React, { useState } from 'react';
import { Form, Button, Container, Row, Col, Alert, Spinner } from 'react-bootstrap';

function AggiungiValute({ amministratore }) {
  const [currencyCode, setCurrencyCode] = useState('');
  const [currencySymbol, setCurrencySymbol] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null); // To display success or error messages

  const handleSubmit = async (event) => {
    event.preventDefault(); // Prevent default form submission
    setLoading(true);
    setMessage(null); // Clear previous messages

    if (currencyCode.length !== 3) {
      setMessage({ type: 'danger', text: 'Il codice valuta deve essere di 3 caratteri (es. EUR).' });
      setLoading(false);
      return;
    }

    if (currencySymbol.length !== 1) {
      setMessage({ type: 'danger', text: 'Il simbolo valuta deve essere di 1 carattere (es. $).' });
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:8080/api/add/valuta', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json', // Keep this header
          },
          body: JSON.stringify({ // Send a JSON string
            code: currencyCode.toUpperCase(),
            symbol: currencySymbol,
            id: amministratore.idAmministratore // Make sure amministratore.idUtente is defined!
          }),
        });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Valuta aggiunta con successo!' });
        setCurrencyCode(''); // Clear form fields
        setCurrencySymbol('');
      } else {
        const errorData = await response.json();
        setMessage({ type: 'danger', text: `Errore nell'aggiunta della valuta: ${errorData.message || response.statusText}` });
      }
    } catch (error) {
      setMessage({ type: 'danger', text: `Si è verificato un errore di rete: ${error.message}` });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="my-4">
      <Row className="justify-content-md-center">
        <Col md={6}>
          {/* Aggiungi Valuta Form */}
          <h2 className="mb-3">Funzione amministrativa aggiunta valuta</h2>
          {message && <Alert variant={message.type}>{message.text}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="formCurrencyCode">
              <Form.Label>Codice Valuta (es. EUR)</Form.Label>
              <Form.Control
                type="text"
                placeholder="Inserisci codice valuta (3 caratteri)"
                maxLength={3}
                value={currencyCode}
                onChange={(e) => setCurrencyCode(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formCurrencySymbol">
              <Form.Label>Simbolo Valuta (es. $)</Form.Label>
              <Form.Control
                type="text"
                placeholder="Inserisci simbolo valuta (1 carattere)"
                maxLength={1}
                value={currencySymbol}
                onChange={(e) => setCurrencySymbol(e.target.value)}
                required
              />
            </Form.Group>

            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                    className="me-2"
                  />
                  Invio...
                </>
              ) : (
                'Aggiungi Valuta'
              )}
            </Button>
          </Form>
        </Col>
      </Row>
      {/* You can still use the 'data' prop here if needed for other functionalities */}
      {/* For example:
      <Row className="mt-4">
        <Col>
          <h3>Received Data:</h3>
          <pre>{JSON.stringify(data, null, 2)}</pre>
        </Col>
      </Row>
      */}
    </Container>
  );
}

export default AggiungiValute;
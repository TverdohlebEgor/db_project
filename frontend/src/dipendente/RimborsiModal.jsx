import React, { useState, useEffect } from 'react';
import { Modal, Button, Tabs, Tab, Form, Row, Col, Spinner, InputGroup } from 'react-bootstrap';

const RimborsiModal = ({ show, handleClose, selectedDate, idDipendente }) => {
  const [key, setKey] = useState('reimbursements');
  const [reimbursementsData, setReimbursementsData] = useState(null);
  const [isLoadingReimbursements, setIsLoadingReimbursements] = useState(false);
  const [reimbursementsError, setReimbursementsError] = useState(null);

  // States for the 'Add/Edit Rimborso' form
  const [reimbursementImport, setReimbursementImport] = useState('');
  const [reimbursementMessage, setReimbursementMessage] = useState('');
  const [selectedImages, setSelectedImages] = useState([]);

  // --- NEW STATES FOR CURRENCY ---
  const [valutaList, setValutaList] = useState([]);
  const [selectedValuta, setSelectedValuta] = useState('');
  const [selectedValutaId, setSelectedValutaId] = useState('');
  const [isLoadingValuta, setIsLoadingValuta] = useState(false);
  const [valutaError, setValutaError] = useState(null);

  // Effect to reset form fields and clear fetched data when modal opens or selectedDate changes
  useEffect(() => {
    if (show) {
      setKey('reimbursements');
      setReimbursementImport('');
      setReimbursementMessage('');
      setSelectedImages([]);
      setReimbursementsData(null);
      setReimbursementsError(null);
      setValutaList([]); // Clear currency list
      setSelectedValuta(''); // Reset selected currency
      setSelectedValutaId('');
      setValutaError(null);
    }
  }, [show, selectedDate]);

  // Effect for fetching Rimborsi data (already exists, no change needed here)
  useEffect(() => {
    const fetchReimbursements = async () => {
      if (show && selectedDate && key === 'reimbursements') {
        setIsLoadingReimbursements(true);
        setReimbursementsError(null);
        try {
            const dateString = `${selectedDate.getFullYear()}-${(selectedDate.getMonth() + 1).toString().padStart(2, '0')}-${selectedDate.getDate().toString().padStart(2, '0')}`;
          //const dateString = selectedDate.toISOString().split('T')[0];
          const response = await fetch(`http://localhost:8080/api/get/rimborsi/${dateString}/${idDipendente}`);
          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
          }
          const data = await response.json();
          const approvedRimborsi = data;
          setReimbursementsData(approvedRimborsi);
        } catch (err) {
          setReimbursementsError(`Failed to load reimbursements: ${err.message || 'Network error'}`);
        } finally {
          setIsLoadingReimbursements(false);
        }
      }
    };
    fetchReimbursements();
  }, [show, selectedDate, key, idDipendente]);

  // --- NEW EFFECT FOR FETCHING VALUTA LIST ---
  useEffect(() => {
    const fetchValuta = async () => {
      // Fetch only when modal is open, on 'form' tab, and list is empty
      if (show && key === 'form' && valutaList.length === 0) {
        setIsLoadingValuta(true);
        setValutaError(null);
        try {
          const response = await fetch('http://localhost:8080/api/get/valuta');
          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
          }
          const data = await response.json(); // Assuming API returns an array of currency strings or objects

          // Assuming 'data' is an array of currency strings like ["EUR", "USD", "GBP"]
          // If it's an array of objects like [{ code: "EUR", symbol: "€" }], you'll need to map it.
          const projectsList = [];
          for (const projectObject of data) { // 'projectObject' represents each item in the 'data' array
             projectsList.push(projectObject.simbolo); // Use projectObject.id as the key
          }
          setValutaList(projectsList);
          if (projectsList.length > 0) {
            setSelectedValuta(projectsList[0]); // Select the first currency by default
            setSelectedValutaId(data);
          }
        } catch (err) {
          setValutaError(`Failed to load currencies: ${err.message || 'Network error'}`);
        } finally {
          setIsLoadingValuta(false);
        }
      }
    };
    fetchValuta();
  }, [show, key, valutaList.length]); // Dependencies: re-run when modal shows, tab changes, or valutaList is empty


  const handleImageChange = (e) => {
    setSelectedImages(Array.from(e.target.files));
  };

  const handleSaveRimborso = async () => {
    if (!reimbursementImport || isNaN(parseFloat(reimbursementImport)) || parseFloat(reimbursementImport) <= 0) {
      alert('Please enter a valid positive Import amount.');
      return;
    }
    // Validate currency selection
    if (!selectedValuta) {
        alert('Please select a currency.');
        return;
    }

    const formData = new FormData();
    formData.append('date', selectedDate ? `${selectedDate.getFullYear()}-${(selectedDate.getMonth() + 1).toString().padStart(2, '0')}-${selectedDate.getDate().toString().padStart(2, '0')}` : '');
    formData.append('import', parseFloat(reimbursementImport));
    formData.append('message', reimbursementMessage);
    formData.append('idDipendente', idDipendente);
    let i = 0;
    for(let f of selectedValutaId){
        if(f.simbolo == selectedValuta){
            break;
            }
        i++;
        }
    formData.append('idValuta', selectedValutaId[i].idValuta); // --- ADDING SELECTED CURRENCY ---

    selectedImages.forEach((file) => {
      formData.append(`images`, file);
    });

    try {
      const response = await fetch('http://localhost:8080/api/add/rimborso', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to save reimbursement. Server responded with status: ${response.status}. Message: ${errorText}`);
      }

      const responseData = await response.json();
      alert('Reimbursement saved successfully!');
      handleClose();
    } catch (error) {
      alert(`Error saving reimbursement: ${error.message || 'Please check your network connection and try again.'}`);
    }
  };

  const handleDeleteRimborso = async (idToDelete) => {
    try {
      const response = await fetch(`http://localhost:8080/api/delete/rimborso/${idToDelete}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to delete reimbursement. Server responded with status: ${response.status}. Message: ${errorText}`);
      }

      setReimbursementsData(reimbursementsData => reimbursementsData.filter(rimborso => rimborso.idRimborso !== idToDelete));
      alert('Reimbursement deleted successfully!');
    } catch (error) {
      setReimbursementsError(`Failed to delete reimbursement ${idToDelete}: ${error.message || 'Network error'}`);
      alert(`Error deleting reimbursement: ${error.message || 'Please check your network connection and try again.'}`);
    }
  };

  return (
    <Modal show={show} onHide={handleClose} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          {selectedDate ? `Rimborsi for ${selectedDate.toLocaleDateString('en-US', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
          })}` : 'Select a Date'}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Tabs
          id="reimbursement-modal-tabs"
          activeKey={key}
          onSelect={(k) => setKey(k)}
          className="mb-3"
        >
          {/* Tab 1: Approved Rimborsi List (no changes here from last version) */}
          <Tab eventKey="reimbursements" title="Rimborsi Approvati">
            {isLoadingReimbursements && <p><Spinner animation="border" size="sm" /> Caricamento rimborsi...</p>}
            {reimbursementsError && <p className="text-danger">{reimbursementsError}</p>}

            {!isLoadingReimbursements && !reimbursementsError && (
              <>
                <h4>Panoramica Rimborsi Approvati</h4>
                {Array.isArray(reimbursementsData) && reimbursementsData.length > 0 ? (
                  <div>
                    {reimbursementsData.map((rimborso) => (
                      <div key={rimborso.id ?? `rimborso-${Math.random()}`}
                           style={{
                             border: '1px solid #ddd',
                             padding: '10px',
                             margin: '10px 0',
                             borderRadius: '5px',
                             position: 'relative',
                             backgroundColor: rimborso.approvato ? '#e6ffe6' : (rimborso.approvato === null ? 'transparent' : '#ffe6e6')
                           }}
                      >
                        <button
                          onClick={() => handleDeleteRimborso(rimborso.idRimborso)}
                          style={{
                            position: 'absolute',
                            top: '5px',
                            right: '5px',
                            background: 'none',
                            border: 'none',
                            fontSize: '1.2em',
                            cursor: 'pointer',
                            color: 'red'
                          }}
                          title="Elimina Rimborso"
                        >
                          &times;
                        </button>
                        <p><strong>Stato Approvazione:</strong> {rimborso.approvato ? 'Approvato' : (rimborso.approvato === null ? 'Pendente' : 'Rifiutato')}</p>
                        <p><strong>Importo:</strong> €{parseFloat(rimborso.importo)?.toFixed(2) ?? 'N/A'}</p>
                        <p><strong>Valuta:</strong> {rimborso.nome}</p>
                        <p><strong>Messaggio:</strong> {rimborso.testo ?? 'Nessun messaggio fornito.'}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted">Nessun rimborso per questo giorno.</p>
                )}
              </>
            )}
            <hr />
          </Tab>

          {/* Tab 2: Add/Edit Rimborso Form - MODIFIED TO INCLUDE CURRENCY */}
          <Tab eventKey="form" title="Aggiungi/Modifica Rimborso">
            <Form>
              <Form.Group as={Row} className="mb-3" controlId="formDate">
                <Form.Label column sm="3">Data</Form.Label>
                <Col sm="9">
                  <Form.Control
                    type="text"
                    readOnly
                    value={selectedDate ? selectedDate.toLocaleDateString() : ''}
                  />
                </Col>
              </Form.Group>

              <Form.Group as={Row} className="mb-3" controlId="formImport">
                <Form.Label column sm="3">Importo</Form.Label>
                <Col sm="9">
                  <InputGroup>
                    <InputGroup.Text>
                        {/* Dynamically show selected currency symbol or default */}
                        {'Valuta '}
                    </InputGroup.Text>
                    <Form.Control
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={reimbursementImport}
                      onChange={(e) => setReimbursementImport(e.target.value)}
                    />
                    {/* --- NEW CURRENCY SELECT --- */}
                    <Form.Select
                      value={selectedValuta}
                      onChange={(e) => setSelectedValuta(e.target.value)}
                      disabled={isLoadingValuta || valutaList.length === 0}
                      aria-label="Seleziona valuta"
                    >
                      {isLoadingValuta ? (
                        <option>Caricamento valute...</option>
                      ) : valutaError ? (
                        <option>Errore caricamento</option>
                      ) : valutaList.length > 0 ? (
                        <>
                          <option value="">Seleziona...</option>
                          {valutaList.map((valutaCode) => (
                            <option key={valutaCode} value={valutaCode}>
                              {valutaCode}
                            </option>
                          ))}
                        </>
                      ) : (
                        <option>Nessuna valuta disponibile</option>
                      )}
                    </Form.Select>
                  </InputGroup>
                </Col>
              </Form.Group>

              <Form.Group as={Row} className="mb-3" controlId="formMessage">
                <Form.Label column sm="3">Messaggio</Form.Label>
                <Col sm="9">
                  <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder="Descrivi il rimborso..."
                    value={reimbursementMessage}
                    onChange={(e) => setReimbursementMessage(e.target.value)}
                  />
                </Col>
              </Form.Group>

              <Form.Group as={Row} className="mb-3" controlId="formImages">
                <Form.Label column sm="3">Carica Immagini</Form.Label>
                <Col sm="9">
                  <Form.Control
                    type="file"
                    multiple
                    onChange={handleImageChange}
                  />
                  {selectedImages.length > 0 && (
                    <div className="mt-2">
                      <small className="text-muted">
                        Selezionate: {selectedImages.map(file => file.name).join(', ')}
                      </small>
                    </div>
                  )}
                </Col>
              </Form.Group>
            </Form>
          </Tab>
        </Tabs>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Chiudi
        </Button>
        {key === 'form' && (
          <Button variant="primary" onClick={handleSaveRimborso}>
            Salva Rimborso
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default RimborsiModal;
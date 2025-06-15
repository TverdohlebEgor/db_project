import React, { useState, useEffect } from 'react';
import { Modal, Button, Tabs, Tab, Form, Spinner, InputGroup } from 'react-bootstrap';

const RimborsiModal = ({ show, handleClose, selectedDate, idDipendente }) => {
  const [key, setKey] = useState('reimbursements');
  const [reimbursementsData, setReimbursementsData] = useState(null);
  const [isLoadingReimbursements, setIsLoadingReimbursements] = useState(false);
  const [reimbursementsError, setReimbursementsError] = useState(null);

  const [imagesByRimborso, setImagesByRimborso] = useState({});

  const [zoomImage, setZoomImage] = useState(null);

  const [reimbursementImport, setReimbursementImport] = useState('');
  const [reimbursementMessage, setReimbursementMessage] = useState('');
  const [selectedImages, setSelectedImages] = useState([]);

  const [valutaList, setValutaList] = useState([]);
  const [selectedValuta, setSelectedValuta] = useState('');
  const [selectedValutaId, setSelectedValutaId] = useState([]);
  const [isLoadingValuta, setIsLoadingValuta] = useState(false);
  const [valutaError, setValutaError] = useState(null);

  useEffect(() => {
    if (show) {
      setKey('reimbursements');
      setReimbursementImport('');
      setReimbursementMessage('');
      setSelectedImages([]);
      setReimbursementsData(null);
      setReimbursementsError(null);
      setValutaList([]);
      setSelectedValuta('');
      setSelectedValutaId([]);
      setValutaError(null);
      setImagesByRimborso({});
      setZoomImage(null);
    }
  }, [show, selectedDate]);

  useEffect(() => {
    const fetchReimbursements = async () => {
      if (show && selectedDate && key === 'reimbursements') {
        setIsLoadingReimbursements(true);
        setReimbursementsError(null);
        try {
          const dateString = `${selectedDate.getFullYear()}-${(selectedDate.getMonth() + 1)
            .toString()
            .padStart(2, '0')}-${selectedDate.getDate().toString().padStart(2, '0')}`;

          const response = await fetch(`http://localhost:8080/api/get/rimborsi/${dateString}/${idDipendente}`);
          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
          }
          const data = await response.json();

          setReimbursementsData(data);

          const imagesMap = {};
          await Promise.all(
            data.map(async (rimborso) => {
              try {
                const imgResponse = await fetch('http://localhost:8080/api/immaginiByComunicazione', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ idComunicazione: rimborso.idComunicazione }),
                });
                if (imgResponse.ok) {
                  const immaginiData = await imgResponse.json();
                  imagesMap[rimborso.idRimborso] = Array.isArray(immaginiData) ? immaginiData : [];
                } else {
                  imagesMap[rimborso.idRimborso] = [];
                }
              } catch {
                imagesMap[rimborso.idRimborso] = [];
              }
            })
          );
          setImagesByRimborso(imagesMap);
        } catch (err) {
          setReimbursementsError(`Failed to load reimbursements: ${err.message || 'Network error'}`);
        } finally {
          setIsLoadingReimbursements(false);
        }
      }
    };
    fetchReimbursements();
  }, [show, selectedDate, key, idDipendente]);

  useEffect(() => {
    const fetchValuta = async () => {
      if (show && key === 'form' && valutaList.length === 0) {
        setIsLoadingValuta(true);
        setValutaError(null);
        try {
          const response = await fetch('http://localhost:8080/api/get/valuta');
          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
          }
          const data = await response.json();
          const symbols = data.map((v) => v.simbolo);
          setValutaList(symbols);
          setSelectedValuta(symbols[0] || '');
          setSelectedValutaId(data);
        } catch (err) {
          setValutaError(`Failed to load currencies: ${err.message || 'Network error'}`);
        } finally {
          setIsLoadingValuta(false);
        }
      }
    };
    fetchValuta();
  }, [show, key, valutaList.length]);

  const handleImageChange = (e) => {
    setSelectedImages(Array.from(e.target.files));
  };

  const handleSaveRimborso = async () => {
    if (!reimbursementImport || isNaN(parseFloat(reimbursementImport)) || parseFloat(reimbursementImport) <= 0) {
      alert('Please enter a valid positive Import amount.');
      return;
    }
    if (!selectedValuta) {
      alert('Please select a currency.');
      return;
    }

    const formData = new FormData();
    formData.append(
      'date',
      selectedDate ? `${selectedDate.getFullYear()}-${(selectedDate.getMonth() + 1).toString().padStart(2, '0')}-${selectedDate.getDate().toString().padStart(2, '0')}` : ''
    );
    formData.append('import', parseFloat(reimbursementImport));
    formData.append('message', reimbursementMessage);
    formData.append('idDipendente', idDipendente);

    let i = 0;
    for (; i < selectedValutaId.length; i++) {
      if (selectedValutaId[i].simbolo === selectedValuta) break;
    }
    formData.append('idValuta', selectedValutaId[i]?.idValuta || '');

    selectedImages.forEach((file) => {
      formData.append('images', file);
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

      setReimbursementsData((prev) => prev.filter((rimborso) => rimborso.idRimborso !== idToDelete));
      alert('Reimbursement deleted successfully!');
    } catch (error) {
      setReimbursementsError(`Failed to delete reimbursement ${idToDelete}: ${error.message || 'Network error'}`);
      alert(`Error deleting reimbursement: ${error.message || 'Please check your network connection and try again.'}`);
    }
  };

  const openZoom = (imgUrl) => {
    setZoomImage(imgUrl);
  };

  const closeZoom = () => {
    setZoomImage(null);
  };

  return (
    <>
      <Modal show={show} onHide={handleClose} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {selectedDate
              ? `Rimborsi for ${selectedDate.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}`
              : 'Select a Date'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Tabs id="reimbursement-modal-tabs" activeKey={key} onSelect={(k) => setKey(k)} className="mb-3">
            <Tab eventKey="reimbursements" title="Rimborsi Approvati">
              {isLoadingReimbursements && (
                <p>
                  <Spinner animation="border" size="sm" /> Caricamento rimborsi...
                </p>
              )}
              {reimbursementsError && <p className="text-danger">{reimbursementsError}</p>}

              {!isLoadingReimbursements && !reimbursementsError && (
                <>
                  <h4>Panoramica Rimborsi Approvati</h4>
                  {Array.isArray(reimbursementsData) && reimbursementsData.length > 0 ? (
                    <div>
                      {reimbursementsData.map((rimborso) => (
                        <div
                          key={rimborso.idRimborso}
                          style={{
                            border: '1px solid #ddd',
                            padding: '10px',
                            margin: '10px 0',
                            borderRadius: '5px',
                            position: 'relative',
                            backgroundColor: rimborso.approvato ? '#e6ffe6' : rimborso.approvato === null ? 'transparent' : '#ffe6e6',
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
                              color: 'red',
                            }}
                            title="Elimina Rimborso"
                          >
                            &times;
                          </button>
                          <p>
                            <strong>Stato Approvazione:</strong>{' '}
                            {rimborso.approvato ? 'Approvato' : rimborso.approvato === null ? 'Pendente' : 'Rifiutato'}
                          </p>
                          <p>
                            <strong>Importo:</strong> {parseFloat(rimborso.importo)?.toFixed(2) ?? 'N/A'}
                          </p>
                          <p>
                            <strong>Valuta:</strong> {rimborso.nome}
                          </p>
                          <p>
                            <strong>Messaggio:</strong> {rimborso.testo ?? 'Nessun messaggio fornito.'}
                          </p>

                          {imagesByRimborso[rimborso.idRimborso] && imagesByRimborso[rimborso.idRimborso].length > 0 && (
                            <div style={{ marginTop: '10px' }}>
                              <strong>Immagini:</strong>
                              <div
                                style={{
                                  display: 'flex',
                                  gap: '10px',
                                  flexWrap: 'wrap',
                                  marginTop: '5px',
                                }}
                              >
                                {imagesByRimborso[rimborso.idRimborso].map((imgUrl, index) => (
                                  <img
                                    key={index}
                                    src={imgUrl}
                                    alt={`Rimborso ${rimborso.idRimborso} Img ${index + 1}`}
                                    style={{ width: '100px', height: 'auto', cursor: 'pointer', borderRadius: '4px' }}
                                    onClick={() => openZoom(imgUrl)}
                                  />
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p>Nessun rimborso approvato disponibile.</p>
                  )}
                </>
              )}
            </Tab>

            <Tab eventKey="form" title="Aggiungi Rimborso">
              {isLoadingValuta && (
                <p>
                  <Spinner animation="border" size="sm" /> Caricamento valute...
                </p>
              )}
              {valutaError && <p className="text-danger">{valutaError}</p>}

              {!isLoadingValuta && !valutaError && (
                <Form>
                  <Form.Group controlId="importo">
                    <Form.Label>Importo</Form.Label>
                    <InputGroup>
                     
                      <Form.Control
                        type="number"
                        min="0"
                        step="0.01"
                        value={reimbursementImport}
                        onChange={(e) => setReimbursementImport(e.target.value)}
                        placeholder="Inserisci importo"
                      />
                    </InputGroup>
                  </Form.Group>

                  <Form.Group controlId="valuta" className="mt-3">
                    <Form.Label>Valuta</Form.Label>
                    <Form.Select value={selectedValuta} onChange={(e) => setSelectedValuta(e.target.value)}>
                      {valutaList.map((valutaSymbol, idx) => (
                        <option key={idx} value={valutaSymbol}>
                          {valutaSymbol}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>

                  <Form.Group controlId="messaggio" className="mt-3">
                    <Form.Label>Messaggio</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      value={reimbursementMessage}
                      onChange={(e) => setReimbursementMessage(e.target.value)}
                      placeholder="Inserisci messaggio"
                    />
                  </Form.Group>

                  <Form.Group controlId="immagini" className="mt-3">
                    <Form.Label>Immagini</Form.Label>
                    <Form.Control type="file" multiple accept="image/*" onChange={handleImageChange} />
                    {selectedImages.length > 0 && (
                      <p>{selectedImages.length} immagine{selectedImages.length > 1 ? 'i' : ''} selezionata{selectedImages.length > 1 ? 'e' : ''}</p>
                    )}
                  </Form.Group>

                  <Button variant="primary" className="mt-4" onClick={handleSaveRimborso}>
                    Salva Rimborso
                  </Button>
                </Form>
              )}
            </Tab>
          </Tabs>
        </Modal.Body>
      </Modal>

      <Modal show={!!zoomImage} onHide={closeZoom} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Zoom Immagine</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ textAlign: 'center' }}>
          {zoomImage && (
            <img
              src={zoomImage}
              alt="Zoom Rimborso"
              style={{ maxWidth: '100%', maxHeight: '80vh', borderRadius: '5px' }}
            />
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeZoom}>
            Chiudi
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default RimborsiModal;

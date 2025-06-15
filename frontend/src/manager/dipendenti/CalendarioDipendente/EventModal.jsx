import React, { useState, useEffect } from 'react';
import { Modal, Button, Tabs, Tab, Form, Spinner } from 'react-bootstrap';

const EventModal = ({ show, handleClose, selectedDate, idDipendente }) => {
  const [key, setKey] = useState('hours');
  const [eventType, setEventType] = useState('Lavoro');
  const [isOvertime, setIsOvertime] = useState(false);
  const [hourStart, setHourStart] = useState('');
  const [hourEnd, setHourEnd] = useState('');
  const [message, setMessage] = useState('');
  const [selectedImages, setSelectedImages] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');

  const [dailyWorkData, setDailyWorkData] = useState(null);
  const [isLoadingDailyData, setIsLoadingDailyData] = useState(false);
  const [dailyDataError, setDailyDataError] = useState(null);

  const [projectsList, setProjectsList] = useState([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  const [projectsError, setProjectsError] = useState(null);

  const [eventImagesMap, setEventImagesMap] = useState({});

  useEffect(() => {
    if (show) {
      setKey('hours');
      setEventType('Lavoro');
      setIsOvertime(false);
      setHourStart('');
      setHourEnd('');
      setMessage('');
      setSelectedImages([]);
      setSelectedProject('');
      setDailyWorkData(null);
      setDailyDataError(null);
      setProjectsList([]);
      setProjectsError(null);
      setEventImagesMap({});
    }
  }, [show, selectedDate]);

  useEffect(() => {
    if (eventType !== 'Lavoro') {
      setIsOvertime(false);
      setHourStart('');
      setHourEnd('');
    }
  }, [eventType]);

  const fetchEventImages = async (idComunicazione) => {
    try {
      const imgResponse = await fetch(`http://localhost:8080/api/get/forum/images/${idComunicazione}`);
      if (!imgResponse.ok) {
        throw new Error(`Failed to fetch images for communication ${idComunicazione}, status: ${imgResponse.status}`);
      }
      const imagesData = await imgResponse.json();
      return imagesData;
    } catch (error) {
      console.error(error);
      return [];
    }
  };

 
  useEffect(() => {
    if (!dailyWorkData || dailyWorkData.length === 0) return;

    const loadAllImages = async () => {
      const imagesMap = {};
      for (const ev of dailyWorkData) {
        if (ev.idComunicazione) {
          imagesMap[ev.idComunicazione] = await fetchEventImages(ev.idComunicazione);
        } else {
          imagesMap[ev.idComunicazione] = [];
        }
      }
      setEventImagesMap(imagesMap);
    };

    loadAllImages();
  }, [dailyWorkData]);

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

      const approveStr = approve ? "t" : "f"
      setDailyWorkData(prev =>
        prev.map(ev =>
          ev.IdEvento === eventId ? { ...ev, approvato: approveStr } : ev
        )
      );
    } catch (error) {
      console.error('Errore durante approvazione evento:', error);
      alert(`Errore: ${error.message}`);
    }
  };

  useEffect(() => {
    const fetchDailyData = async () => {
      if (show && selectedDate && key === 'hours') {
        setIsLoadingDailyData(true);
        setDailyDataError(null);
        try {
          const dateString = `${selectedDate.getFullYear()}-${(selectedDate.getMonth() + 1).toString().padStart(2, '0')}-${selectedDate.getDate().toString().padStart(2, '0')}`;
          const response = await fetch(`http://localhost:8080/api/get/evento/${dateString}/${idDipendente}`);
          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
          }
          const data = await response.json();
          setDailyWorkData(data);
        } catch (err) {
          console.error("Failed to fetch daily work data:", err);
          setDailyDataError(`Failed to load data: ${err.message || 'Network error'}`);
        } finally {
          setIsLoadingDailyData(false);
        }
      }
    };

    fetchDailyData();
  }, [show, selectedDate, key]);

  useEffect(() => {
    const fetchProjects = async () => {
      if (show && key === 'form' && projectsList.length === 0) {
        setIsLoadingProjects(true);
        setProjectsError(null);
        try {
          const response = await fetch('http://localhost:8080/api/progetti/utente');
          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
          }
          const data = await response.json();
          const projectsList = data.map(projectObject => projectObject.nomeProgetto);
          setProjectsList(projectsList);
          if (data.length > 0) {
            setSelectedProject(data[0].nomeProgetto);
          }
        } catch (err) {
          console.error("Failed to fetch projects:", err);
          setProjectsError(`Failed to load projects: ${err.message || 'Network error'}`);
        } finally {
          setIsLoadingProjects(false);
        }
      }
    };

    fetchProjects();
  }, [show, key, projectsList.length]);

  const handleImageChange = (e) => {
    setSelectedImages(Array.from(e.target.files));
  };

  const handleSaveEvent = async () => {
    if (eventType === 'Lavoro' && (!hourStart || !hourEnd)) {
      alert('Please set both Hour Start and Hour End for Work events.');
      return;
    }
    if (eventType === 'Lavoro' && !selectedProject) {
      alert('Please select a project for Work events.');
      return;
    }

    const formData = new FormData();
    formData.append('date', selectedDate ? `${selectedDate.getFullYear()}-${(selectedDate.getMonth() + 1).toString().padStart(2, '0')}-${selectedDate.getDate().toString().padStart(2, '0')}` : '');
    formData.append('type', eventType);
    formData.append('overtime', isOvertime);
    formData.append('hourStart', hourStart);
    formData.append('hourEnd', hourEnd);
    formData.append('message', message);
    formData.append('projectId', selectedProject);
    formData.append('idDipendente', idDipendente);

    selectedImages.forEach((file) => {
      formData.append('images', file);
    });

    try {
      const response = await fetch('http://localhost:8080/api/add/event', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to save event. Server responded with status: ${response.status}. Message: ${errorText}`);
      }

      await response.json();
      alert('Event saved successfully!');
      handleClose();
    } catch (error) {
      console.error('Error saving event:', error);
      alert(`Error saving event: ${error.message || 'Please check your network connection and try again.'}`);
    }
  };

  const handleDelete = async (idToDelete) => {
    try {
      const response = await fetch(`http://localhost:8080/api/delete/evento/${idToDelete}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to delete event. Server responded with status: ${response.status}. Message: ${errorText}`);
      }

      setDailyWorkData(prev => prev.filter(ev => ev.IdEvento !== idToDelete));
    } catch (error) {
      console.error('Error deleting event:', error);
      alert(`Error deleting event: ${error.message || 'Network issue.'}`);
    }
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg" backdrop="static" keyboard={false} centered>
      <Modal.Header closeButton>
        <Modal.Title>Eventi per il giorno {selectedDate ? selectedDate.toLocaleDateString() : ''}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Tabs activeKey={key} onSelect={k => setKey(k)} className="mb-3">
          <Tab eventKey="hours" title="Ore lavorate">
            {isLoadingDailyData ? (
              <div className="text-center my-4"><Spinner animation="border" /></div>
            ) : dailyDataError ? (
              <div className="alert alert-danger">{dailyDataError}</div>
            ) : dailyWorkData && dailyWorkData.length > 0 ? (
              <div>
                {dailyWorkData.map(ev => {
                  const isFinalized = ev.approvato === "t" || ev.approvato === "f";

                  return (
                    <div key={ev.IdEvento} className="border rounded p-3 mb-3">
                      <p><strong>Tipo:</strong> {ev.tipo}</p>
                      <p><strong>Inizio:</strong> {ev.oraInizio || '-'}</p>
                      <p><strong>Fine:</strong> {ev.oraFine || '-'}</p>
                      <p><strong>Messaggio:</strong> {ev.messaggio || '-'}</p>
                      <p><strong>Progetto:</strong> {ev.nomeProgetto || '-'}</p>
                      <p><strong>Approvato:</strong> {
                        ev.approvato === "t"
                          ? "Sì"
                          : ev.approvato === "f"
                            ? "No"
                            : "In attesa"
                      }</p>

                      {ev.idComunicazione && eventImagesMap[ev.idComunicazione] && eventImagesMap[ev.idComunicazione].length > 0 && (
                        <div className="d-flex flex-wrap mb-2">
                          {eventImagesMap[ev.idComunicazione].map((imgUrl, index) => (
                            <img
                              key={index}
                              src={imgUrl}
                              alt={`Immagine evento ${ev.idComunicazione}-${index}`}
                              style={{
                                maxWidth: '100px',
                                maxHeight: '100px',
                                marginRight: '10px',
                                objectFit: 'cover',
                                borderRadius: '5px',
                                border: '1px solid #ccc'
                              }}
                            />
                          ))}
                        </div>
                      )}

                      <div className="d-flex justify-content-end gap-2">
                        <Button
                          variant="success"
                          size="sm"
                          disabled={isFinalized}
                          onClick={() => handleApproval(ev.IdEvento, true, ev.tipo)}
                        >
                          Approva
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          disabled={isFinalized}
                          onClick={() => handleApproval(ev.IdEvento, false, ev.tipo)}
                        >
                          Rifiuta
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleDelete(ev.IdEvento)}
                        >
                          Elimina
                        </Button>
                      </div>
                    </div>
                  );
                })}

              </div>
            ) : (
              <p>Nessun evento registrato per questa data.</p>
            )}
          </Tab>
          <Tab eventKey="form" title="Aggiungi evento">
            <Form>
              <Form.Group className="mb-3" controlId="eventType">
                <Form.Label>Tipo evento</Form.Label>
                <Form.Select
                  value={eventType}
                  onChange={e => setEventType(e.target.value)}
                >
                  <option value="Lavoro">Lavoro</option>
                  <option value="Ferie">Ferie</option>
                  <option value="Malattia">Malattia</option>
                  <option value="Altro">Altro</option>
                </Form.Select>
              </Form.Group>

              {eventType === 'Lavoro' && (
                <>
                  <Form.Group className="mb-3" controlId="isOvertime">
                    <Form.Check
                      type="checkbox"
                      label="Straordinario"
                      checked={isOvertime}
                      onChange={e => setIsOvertime(e.target.checked)}
                    />
                  </Form.Group>
                  <Form.Group className="mb-3" controlId="hourStart">
                    <Form.Label>Ora inizio</Form.Label>
                    <Form.Control
                      type="time"
                      value={hourStart}
                      onChange={e => setHourStart(e.target.value)}
                    />
                  </Form.Group>
                  <Form.Group className="mb-3" controlId="hourEnd">
                    <Form.Label>Ora fine</Form.Label>
                    <Form.Control
                      type="time"
                      value={hourEnd}
                      onChange={e => setHourEnd(e.target.value)}
                    />
                  </Form.Group>

                  {isLoadingProjects ? (
                    <div className="text-center"><Spinner animation="border" size="sm" /></div>
                  ) : projectsError ? (
                    <div className="alert alert-danger">{projectsError}</div>
                  ) : (
                    <Form.Group className="mb-3" controlId="projectSelect">
                      <Form.Label>Progetto</Form.Label>
                      <Form.Select
                        value={selectedProject}
                        onChange={e => setSelectedProject(e.target.value)}
                      >
                        {projectsList.map(proj => (
                          <option key={proj} value={proj}>{proj}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  )}
                </>
              )}

              <Form.Group className="mb-3" controlId="message">
                <Form.Label>Messaggio</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="fileUpload">
                <Form.Label>Allega immagini</Form.Label>
                <Form.Control
                  type="file"
                  multiple
                  onChange={handleImageChange}
                />
              </Form.Group>

              <Button variant="primary" onClick={handleSaveEvent}>
                Salva
              </Button>
            </Form>
          </Tab>
        </Tabs>
      </Modal.Body>
    </Modal>
  );
};

export default EventModal;

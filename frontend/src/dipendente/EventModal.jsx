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

  const [eventImages, setEventImages] = useState({});
  const [loadingImages, setLoadingImages] = useState({});
  const [imagesErrors, setImagesErrors] = useState({});

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
      setEventImages({});
      setLoadingImages({});
      setImagesErrors({});
    }
  }, [show, selectedDate]);

  useEffect(() => {
    if (eventType !== 'Lavoro') {
      setIsOvertime(false);
      setHourStart('');
      setHourEnd('');
    }
  }, [eventType]);

  useEffect(() => {
    const fetchDailyData = async () => {
      if (show && selectedDate && key === 'hours') {
        setIsLoadingDailyData(true);
        setDailyDataError(null);
        try {
          const dateString = `${selectedDate.getFullYear()}-${(selectedDate.getMonth() + 1).toString().padStart(2, '0')}-${selectedDate.getDate().toString().padStart(2, '0')}`;
          const response = await fetch(`http://localhost:8080/api/get/evento/${dateString}/${idDipendente}`);
          if (!response.ok) throw new Error(await response.text());
          const data = await response.json();
          setDailyWorkData(data);

          data.forEach(async (event) => {
            if (event.idComunicazione) {
              setLoadingImages(prev => ({ ...prev, [event.idComunicazione]: true }));
              try {
                const imgRes = await fetch(`http://localhost:8080/api/get/forum/images/${event.idComunicazione}`);
                if (!imgRes.ok) throw new Error(await imgRes.text());
                const imgs = await imgRes.json();
                setEventImages(prev => ({ ...prev, [event.idComunicazione]: imgs }));
              } catch (err) {
                setImagesErrors(prev => ({ ...prev, [event.idComunicazione]: err.message }));
                setEventImages(prev => ({ ...prev, [event.idComunicazione]: [] }));
              } finally {
                setLoadingImages(prev => ({ ...prev, [event.idComunicazione]: false }));
              }
            }
          });
        } catch (err) {
          setDailyDataError(`Errore caricamento eventi: ${err.message}`);
        } finally {
          setIsLoadingDailyData(false);
        }
      }
    };
    fetchDailyData();
  }, [show, selectedDate, key, idDipendente]);

  useEffect(() => {
    const fetchProjects = async () => {
      if (show && key === 'form' && projectsList.length === 0) {
        setIsLoadingProjects(true);
        try {
          const res = await fetch('http://localhost:8080/api/progetti/utente');
          if (!res.ok) throw new Error(await res.text());
          const data = await res.json();
          setProjectsList(data.map(p => p.nomeProgetto));
          if (data.length > 0) setSelectedProject(data[0].nomeProgetto);
        } catch (err) {
          setProjectsError(`Errore caricamento progetti: ${err.message}`);
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
    if (eventType === 'Lavoro' && (!hourStart || !hourEnd)) return alert('Specificare ora inizio e fine.');
    if (eventType === 'Lavoro' && !selectedProject) return alert('Selezionare un progetto.');

    const formData = new FormData();
    const dateStr = `${selectedDate.getFullYear()}-${(selectedDate.getMonth() + 1).toString().padStart(2, '0')}-${selectedDate.getDate().toString().padStart(2, '0')}`;
    formData.append('date', dateStr);
    formData.append('type', eventType);
    formData.append('overtime', isOvertime);
    formData.append('hourStart', hourStart);
    formData.append('hourEnd', hourEnd);
    formData.append('message', message);
    formData.append('projectId', selectedProject);
    formData.append('idDipendente', idDipendente);
    selectedImages.forEach(file => file && formData.append('images', file));

    try {
      const res = await fetch('http://localhost:8080/api/add/event', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error(await res.text());
      await res.json();
      alert('Evento salvato');
      handleClose();
    } catch (err) {
      alert(`Errore salvataggio evento: ${err.message}`);
    }
  };

  const handleDelete = async (idToDelete) => {
    try {
      const res = await fetch(`http://localhost:8080/api/delete/evento/${idToDelete}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(await res.text());
      setDailyWorkData(prev => prev.filter(e => e.IdEvento !== idToDelete));
      const deleted = dailyWorkData.find(e => e.IdEvento === idToDelete);
      if (deleted?.idComunicazione) {
        setEventImages(prev => {
          const copy = { ...prev };
          delete copy[deleted.idComunicazione];
          return copy;
        });
      }
      alert('Evento eliminato');
    } catch (err) {
      alert(`Errore eliminazione evento: ${err.message}`);
    }
  };

  const renderStatusBadge = (status) => {
    if (status === 't') return <span className="badge bg-success">Approvato</span>;
    if (status === 'f') return <span className="badge bg-danger">Rifiutato</span>;
    return <span className="badge bg-secondary text-dark">In attesa</span>;
  };

  return (
    <Modal show={show} onHide={handleClose} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          {selectedDate ? `Eventi per ${selectedDate.toLocaleDateString()}` : 'Eventi'}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Tabs activeKey={key} onSelect={(k) => setKey(k)} className="mb-3">
          <Tab eventKey="hours" title="Ore inserite">
            {isLoadingDailyData ? (
              <Spinner animation="border" />
            ) : dailyDataError ? (
              <div className="text-danger">{dailyDataError}</div>
            ) : dailyWorkData && dailyWorkData.length > 0 ? (
              <div>
                {dailyWorkData.map((event) => (
                  <div key={event.IdEvento} className="mb-3 p-3 border rounded bg-light">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <div><strong>Tipo:</strong> {event.tipo || 'N/A'}</div>
                      <div>{renderStatusBadge(event.approvato)}</div>
                    </div>
                    <div><strong>Messaggio:</strong> {event.messaggio || 'Nessun messaggio'}</div>
                    <div><strong>Ora inizio:</strong> {event.oraInizio || '-'}</div>
                    <div><strong>Ora fine:</strong> {event.oraFine || '-'}</div>

                    {loadingImages[event.idComunicazione] ? (
                      <Spinner animation="border" size="sm" />
                    ) : imagesErrors[event.idComunicazione] ? (
                      <div className="text-danger">Errore immagini: {imagesErrors[event.idComunicazione]}</div>
                    ) : eventImages[event.idComunicazione]?.length > 0 ? (
                      <div className="d-flex flex-wrap mt-2">
                        {eventImages[event.idComunicazione].map((img, i) => (
                          <img key={i} src={img.url || img.path || img} alt={`img-${i}`} style={{ width: 100, height: 100, objectFit: 'cover', margin: 5 }} />
                        ))}
                      </div>
                    ) : <div className="text-muted mt-2">Nessuna immagine</div>}

                    <Button
                      variant="danger"
                      size="sm"
                      className="mt-3"
                      onClick={() => handleDelete(event.IdEvento)}
                    >
                      Elimina
                    </Button>
                  </div>
                ))}
              </div>
            ) : <div>Nessun evento per questo giorno.</div>}
          </Tab>

          <Tab eventKey="form" title="Nuovo evento">
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Tipo evento</Form.Label>
                <Form.Select value={eventType} onChange={e => setEventType(e.target.value)}>
                  <option value="Lavoro">Lavoro</option>
                  <option value="Permesso">Permesso</option>
                  <option value="Malattia">Malattia</option>
                </Form.Select>
              </Form.Group>

              {eventType === 'Lavoro' && (
                <>
                  <Form.Group className="mb-3">
                    <Form.Label>Progetto</Form.Label>
                    {isLoadingProjects ? (
                      <Spinner animation="border" size="sm" />
                    ) : projectsError ? (
                      <div className="text-danger">{projectsError}</div>
                    ) : (
                      <Form.Select value={selectedProject} onChange={e => setSelectedProject(e.target.value)}>
                        {projectsList.map((p, i) => (
                          <option key={i} value={p}>{p}</option>
                        ))}
                      </Form.Select>
                    )}
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Ora inizio</Form.Label>
                    <Form.Control type="time" value={hourStart} onChange={e => setHourStart(e.target.value)} />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Ora fine</Form.Label>
                    <Form.Control type="time" value={hourEnd} onChange={e => setHourEnd(e.target.value)} />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Check type="checkbox" label="Straordinario" checked={isOvertime} onChange={e => setIsOvertime(e.target.checked)} />
                  </Form.Group>
                </>
              )}

              <Form.Group className="mb-3">
                <Form.Label>Messaggio</Form.Label>
                <Form.Control as="textarea" rows={3} value={message} onChange={e => setMessage(e.target.value)} />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Allega immagini</Form.Label>
                <Form.Control type="file" multiple accept="image/*" onChange={handleImageChange} />
              </Form.Group>
              <Button variant="primary" onClick={handleSaveEvent}>
                Salva evento
              </Button>
            </Form>
          </Tab>
        </Tabs>
      </Modal.Body>
    </Modal>
  );
};

export default EventModal;

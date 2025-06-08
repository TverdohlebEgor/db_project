// EventModal.jsx
import React, { useState, useEffect } from 'react';
import { Modal, Button, Tabs, Tab, Form, Row, Col, Spinner } from 'react-bootstrap'; // Added Spinner

const EventModal = ({ show, handleClose, selectedDate, idDipendente }) => {
  console.log(idDipendente);
  const [key, setKey] = useState('hours');
  const [eventType, setEventType] = useState('Work');
  const [isOvertime, setIsOvertime] = useState(false);
  const [hourStart, setHourStart] = useState('');
  const [hourEnd, setHourEnd] = useState('');
  const [message, setMessage] = useState(''); // New state for message
  const [selectedImages, setSelectedImages] = useState([]); // New state for selected image files
  const [selectedProject, setSelectedProject] = useState(''); // New state for selected project

  // States for fetching daily work data (for the 'Hours of Work' tab)
  const [dailyWorkData, setDailyWorkData] = useState(null);
  const [isLoadingDailyData, setIsLoadingDailyData] = useState(false);
  const [dailyDataError, setDailyDataError] = useState(null);

  // States for fetching projects list
  const [projectsList, setProjectsList] = useState([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  const [projectsError, setProjectsError] = useState(null);

  // Effect to reset form fields and clear fetched data when modal opens or selectedDate changes
  useEffect(() => {
    if (show) {
      setKey('hours'); // Default to hours tab when opening
      setEventType('Work');
      setIsOvertime(false);
      setHourStart('');
      setHourEnd('');
      setMessage('');
      setSelectedImages([]);
      setSelectedProject(''); // Reset selected project
      setDailyWorkData(null);
      setDailyDataError(null);
      setProjectsList([]); // Clear projects list
      setProjectsError(null);
    }
  }, [show, selectedDate]);

  // Effect to reset overtime if eventType changes to non-Work
  useEffect(() => {
    if (eventType !== 'Work') {
      setIsOvertime(false);
      setHourStart(''); // Also clear hours if not work
      setHourEnd('');
    }
  }, [eventType]);


  const handleApproval = async (eventId, approve) => {
    const approveStr = approve ? "t" : "f";  // Trasformo in stringa coerente con backend
    try {
      const response = await fetch(`http://localhost:8080/api/updateApprovazione`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idEvento: eventId, approvato: approveStr })  // Invio "t" o "f"
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Errore approvazione: ${response.status}. Messaggio: ${errorText}`);
      }

      setDailyWorkData(prev =>
        prev.map(ev =>
          ev.IdEvento === eventId ? { ...ev, approvato: approveStr } : ev  // Aggiorno con stringa
        )
      );
    } catch (error) {
      console.error('Errore durante approvazione evento:', error);
      alert(`Errore: ${error.message}`);
    }
  }


  useEffect(() => {
    const fetchDailyData = async () => {
      if (show && selectedDate && key === 'hours') {
        setIsLoadingDailyData(true);
        setDailyDataError(null);
        try {
          const dateString = `${selectedDate.getFullYear()}-${(selectedDate.getMonth() + 1).toString().padStart(2, '0')}-${selectedDate.getDate().toString().padStart(2, '0')}`;
          const response = await fetch(`http://localhost:8080/api/get/evento/` + dateString + '/' + idDipendente);
          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
          }
          const data = await response.json();
          console.log("Eventi");
          console.log(data);
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

  // Effect for fetching the list of projects
  useEffect(() => {
    const fetchProjects = async () => {
      if (show && key === 'form' && projectsList.length === 0) { // Fetch only when modal is open, on 'form' tab, and list is empty
        setIsLoadingProjects(true);
        setProjectsError(null);
        try {
          // Replace with your actual API endpoint for fetching projects
          const response = await fetch('http://localhost:8080/api/progetti/utente');
          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
          }
          const data = await response.json();
          const projectsList = [];
          for (const projectObject of data) { // 'projectObject' represents each item in the 'data' array
            projectsList.push(projectObject.nomeProgetto); // Use projectObject.id as the key
          }
          setProjectsList(projectsList); // Assuming data is an array of project objects like [{id: 1, name: "Project A"}]
          if (data.length > 0) {
            setSelectedProject(data[0].nomeProgetto); // Select the first project by default
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
  }, [show, key, projectsList.length]); // Dependencies: re-run when modal shows, tab changes, or projectsList is empty

  const handleImageChange = (e) => {
    setSelectedImages(Array.from(e.target.files)); // Store File objects
  };

  const handleSaveEvent = async () => {
    // Validation check: If eventType is 'Work' and hours are not set
    if (eventType === 'Work' && (!hourStart || !hourEnd)) {
      alert('Please set both Hour Start and Hour End for Work events.');
      return;
    }
    // Validation for project selection if needed (e.g., if project is mandatory for Work events)
    if (eventType === 'Work' && !selectedProject) {
      alert('Please select a project for Work events.');
      return;
    }


    // For sending files, you typically use FormData
    const formData = new FormData();
    formData.append('date', selectedDate ? selectedDate.toISOString().split('T')[0] : '');
    formData.append('type', eventType);
    formData.append('overtime', isOvertime);
    formData.append('hourStart', hourStart);
    formData.append('hourEnd', hourEnd);
    formData.append('message', message); // Add message to form data
    formData.append('projectId', selectedProject); // Add selected project ID
    formData.append('idDipendente', idDipendente)

    selectedImages.forEach((file, index) => {
      formData.append(`images`, file); // Append each image file
      // Or if your backend expects a simple array: formData.append('images', file);
    });

    try {
      // Replace with your actual API endpoint for adding event (might need to handle multipart/form-data)
      const response = await fetch('http://localhost:8080/api/add/event', {
        method: 'POST',
        // When sending FormData, DO NOT set 'Content-Type': 'application/json'
        // The browser sets it automatically as 'multipart/form-data' with the correct boundary
        body: formData, // Send FormData object directly
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to save event. Server responded with status: ${response.status}. Message: ${errorText}`);
      }

      const responseData = await response.json();
      alert('Event saved successfully!');
      handleClose();
    } catch (error) {
      console.error('Error saving event:', error);
      alert(`Error saving event: ${error.message || 'Please check your network connection and try again.'}`);
    }
  };
  const handleDelete = async (idToDelete) => {
    console.log(`Attempting to delete event with ID: ${idToDelete}`);
    try {
      // Replace with your actual API endpoint for deleting an event
      const response = await fetch(`http://localhost:8080/api/delete/evento/${idToDelete}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to delete event. Server responded with status: ${response.status}. Message: ${errorText}`);
      }

      console.log('Event deleted successfully:', idToDelete);
      // Update the state to remove the deleted event from the UI
      setDailyWorkData(prevEvents => prevEvents.filter(event => event.IdEvento !== idToDelete)); // Filter dailyWorkData (the events array)
      alert('Event deleted successfully!');
    } catch (error) {
      console.error('Error deleting event:', error);
      setDailyDataError(`Failed to delete event ${idToDelete}: ${error.message || 'Network error'}`); // Use unified error state
      alert(`Error deleting event: ${error.message || 'Please check your network connection and try again.'}`);
    }
  };

  return (
    <Modal show={show} onHide={handleClose} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          {selectedDate ? `Details for ${selectedDate.toLocaleDateString('en-US', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
          })}` : 'Select a Date'}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Tabs
          id="event-modal-tabs"
          activeKey={key}
          onSelect={(k) => setKey(k)}
          className="mb-3"
        >
          <Tab eventKey="hours" title="Hours of Work">
            {isLoadingDailyData && <p><Spinner animation="border" size="sm" /> Loading data...</p>}
            {dailyDataError && <p className="text-danger">{dailyDataError}</p>}

            {/* Daily Events List - Using dailyWorkData directly as it contains the array of Evento objects */}
            {!isLoadingDailyData && !dailyDataError && ( // Only render content when not loading and no error
              <>
                <h4>Daily Events Overview</h4> {/* Changed title for clarity */}
                {Array.isArray(dailyWorkData) && dailyWorkData.length > 0 ? (
                  <div>
                    {dailyWorkData.map((event) => (
                      <div key={event.IdEvento ?? `event-${Math.random()}`} // Fallback key for safety
                        style={{
                          border: '1px solid #ddd',
                          padding: '10px',
                          margin: '10px 0',
                          borderRadius: '5px',
                          position: 'relative',
                          backgroundColor: event.approvato === null ? 'transparent' : (event.approvato === "t" ? '#e6ffe6' : '#ffe6e6')
                        }}
                      >
                        {/* Delete button for each event */}
                        <button
                          onClick={() => handleDelete(event.IdEvento)}
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
                          title="Delete Event" // Hover tooltip
                        >
                          &times;
                        </button>

                        {/* Conditional rendering based on event.tipo */}
                        {event.tipo === 'LAVORO' ? (
                          <>
                            {/* Display full details for 'LAVORO' type */}
                            <p><strong>Type:</strong> {event.tipo ?? 'N/A'}</p>
                            <p><strong>Start Time:</strong> {event.oraInizio ?? 'N/A'}</p>
                            <p><strong>End Time:</strong> {event.oraFine ?? 'N/A'}</p>
                            <p><strong>Project:</strong> {event.nomeProgetto ?? 'No message provided.'}</p>
                            <p><strong>Message:</strong> {event.messaggio ?? 'No message provided.'}</p>
                            <p><strong>Overtime:</strong> {event.staordinario?.toString() ?? 'N/A'}</p>
                            <p><strong>Approved:</strong> {
                              event.approvato === null
                                ? 'Pending'
                                : event.approvato === "t"
                                  ? 'Yes'
                                  : 'No'
                            }</p>                            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                              <Button
                                variant="success"
                                size="sm"
                                onClick={() => handleApproval(event.IdEvento, true)}
                                disabled={false}
                              >
                                Approva
                              </Button>
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => handleApproval(event.IdEvento, false)}
                                disabled={false}
                              >
                                Rifiuta
                              </Button>
                            </div>
                          </>
                        ) : (
                          <>
                            {console.log(event.approvato)}
                            <p><strong>Type:</strong> {event.tipo ?? 'N/A'}</p>
                            <p><strong>Message:</strong> {event.messaggio ?? 'No message provided.'}</p>
                            <p><strong>Approved:</strong> {
                              event.approvato === null
                                ? 'Pending'
                                : event.approvato === "t"
                                  ? 'Yes'
                                  : 'No'
                            }</p>                            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                              <Button
                                variant="success"
                                size="sm"
                                onClick={() => handleApproval(event.IdEvento, true)}
                                disabled={false}
                              >
                                Approva
                              </Button>
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => handleApproval(event.IdEvento, false)}
                                disabled={false}
                              >
                                Rifiuta
                              </Button>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted">No events recorded for this day.</p>
                )}
              </>
            )}

            <hr />
          </Tab>
          <Tab eventKey="form" title="Add/Edit Event">
            <Form>
              <Form.Group as={Row} className="mb-3" controlId="formDate">
                <Form.Label column sm="3">Date</Form.Label>
                <Col sm="9">
                  <Form.Control
                    type="text"
                    readOnly
                    value={selectedDate ? selectedDate.toLocaleDateString() : ''}
                  />
                </Col>
              </Form.Group>

              <Form.Group as={Row} className="mb-3" controlId="formEventType">
                <Form.Label column sm="3">Event Type</Form.Label>
                <Col sm="9">
                  <Form.Select value={eventType} onChange={(e) => setEventType(e.target.value)}>
                    <option value="Work">Work</option>
                    <option value="Holiday">Holiday</option>
                    <option value="Permission">Permission</option>
                    <option value="Sickness">Sickness</option>
                  </Form.Select>
                </Col>
              </Form.Group>

              {/* Conditional rendering for Overtime checkbox, Hour inputs, and Project */}
              {eventType === 'Work' && (
                <>
                  <Form.Group as={Row} className="mb-3" controlId="formOvertime">
                    <Col sm={{ span: 9, offset: 3 }}>
                      <Form.Check
                        type="checkbox"
                        label="Overtime"
                        checked={isOvertime}
                        onChange={(e) => setIsOvertime(e.target.checked)}
                      />
                    </Col>
                  </Form.Group>

                  <Form.Group as={Row} className="mb-3" controlId="formHourStart">
                    <Form.Label column sm="3">Hour Start</Form.Label>
                    <Col sm="9">
                      <Form.Control
                        type="time"
                        value={hourStart}
                        onChange={(e) => setHourStart(e.target.value)}
                      />
                    </Col>
                  </Form.Group>

                  <Form.Group as={Row} className="mb-3" controlId="formHourEnd">
                    <Form.Label column sm="3">Hour End</Form.Label>
                    <Col sm="9">
                      <Form.Control
                        type="time"
                        value={hourEnd}
                        onChange={(e) => setHourEnd(e.target.value)}
                      />
                    </Col>
                  </Form.Group>

                  {/* Project Dropdown */}
                  <Form.Group as={Row} className="mb-3" controlId="formProject">
                    <Form.Label column sm="3">Project</Form.Label>
                    <Col sm="9">
                      {isLoadingProjects ? (
                        <p><Spinner animation="border" size="sm" /> Loading projects...</p>
                      ) : projectsError ? (
                        <p className="text-danger">{projectsError}</p>
                      ) : (
                        <Form.Select
                          value={selectedProject}
                          onChange={(e) => setSelectedProject(e.target.value)}
                          disabled={projectsList.length === 0}
                        >
                          <option value="">Select a Project</option>
                          {projectsList.map((projectName, index) => ( // 'projectName' is the string value, 'index' is its position
                            <option key={projectName} value={projectName}>
                              {projectName}
                            </option>
                          ))}
                        </Form.Select>
                      )}
                    </Col>
                  </Form.Group>
                </>
              )}

              {/* Message Textarea (visible for all event types, if desired) */}
              <Form.Group as={Row} className="mb-3" controlId="formMessage">
                <Form.Label column sm="3">Message</Form.Label>
                <Col sm="9">
                  <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder="Add a message for this event..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                </Col>
              </Form.Group>

              {/* Image Upload Input */}
              <Form.Group as={Row} className="mb-3" controlId="formImages">
                <Form.Label column sm="3">Upload Images</Form.Label>
                <Col sm="9">
                  <Form.Control
                    type="file"
                    multiple // Allows selecting multiple files
                    onChange={handleImageChange}
                  />
                  {selectedImages.length > 0 && (
                    <div className="mt-2">
                      <small className="text-muted">
                        Selected: {selectedImages.map(file => file.name).join(', ')}
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
          Close
        </Button>
        {key === 'form' && (
          <Button variant="primary" onClick={handleSaveEvent}>
            Save Event
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default EventModal;
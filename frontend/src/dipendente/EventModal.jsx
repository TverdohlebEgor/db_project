// EventModal.jsx
import React, { useState, useEffect } from 'react';
import { Modal, Button, Tabs, Tab, Form, Row, Col } from 'react-bootstrap';

const EventModal = ({ show, handleClose, selectedDate }) => {
  const [key, setKey] = useState('hours');
  const [eventType, setEventType] = useState('Work');
  const [isOvertime, setIsOvertime] = useState(false);
  const [hourStart, setHourStart] = useState('');
  const [hourEnd, setHourEnd] = useState('');

  // Reset form fields when modal opens or selectedDate changes
  useEffect(() => {
    if (show) {
      setKey('hours');
      setEventType('Work'); // Default to Work for new selections
      setIsOvertime(false);
      setHourStart('');
      setHourEnd('');
    }
  }, [show, selectedDate]);

  // Reset overtime if eventType changes to non-Work
  useEffect(() => {
    if (eventType !== 'Work') {
      setIsOvertime(false);
    }
  }, [eventType]);

  const handleSaveEvent = () => {
    // Validation check: If eventType is 'Work' and hours are not set
    if (eventType === 'Work' && (!hourStart || !hourEnd)) {
      alert('Please set both Hour Start and Hour End for Work events.');
      return; // Stop the function execution
    }

    const eventData = {
      date: selectedDate ? selectedDate.toISOString().split('T')[0] : null,
      type: eventType,
      overtime: isOvertime,
      hourStart: hourStart,
      hourEnd: hourEnd,
    };
    console.log('Saving event:', eventData);
    alert(`Event saved for ${selectedDate ? selectedDate.toLocaleDateString() : 'N/A'}:
    Type: ${eventType}, Overtime: ${isOvertime}, Hours: ${hourStart}-${hourEnd}`);
    handleClose();
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
            <h4>Daily Hours Overview</h4>
            <p className="text-muted">
              This section will display work hours data, holidays, permissions, and sickness for {selectedDate ? selectedDate.toLocaleDateString() : 'the selected day'}.
              (Data to be loaded via API call)
            </p>
            <hr />
            <h5>Summary (Placeholder):</h5>
            <ul>
              <li>Scheduled Hours: 8 hours</li>
              <li>Worked Hours: (e.g., 7.5 hours)</li>
              <li>Overtime: (e.g., 0.5 hours)</li>
              <li>Leave/Absence: (e.g., 0 hours)</li>
            </ul>
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

              {/* Conditional rendering for Overtime checkbox and Hour inputs */}
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
                </>
              )}
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
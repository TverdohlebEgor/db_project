import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Row,
  Col,
  ListGroup,
  Card,
  Spinner,
  Form,
  Button,
  Alert
} from 'react-bootstrap';

// --- NEW MessageItem Component ---
const MessageItem = ({ message, handleVisualizedChange, fetchImagesForMessage, imagesByMessage, isLoadingImages, imagesError }) => {

  // This useEffect now runs correctly for each individual MessageItem instance
  useEffect(() => {
    // Only fetch if images for this message haven't been loaded/are not loading/no error yet
    if (!isLoadingImages[message.idComunicazione] && !imagesByMessage[message.idComunicazione] && !imagesError[message.idComunicazione]) {
      fetchImagesForMessage(message.idComunicazione);
    }
  }, [
    message.idComunicazione,       // Dependency: if the message ID changes, re-fetch
    fetchImagesForMessage,     // Dependency: the function itself (memoized with useCallback in Forum)
    isLoadingImages,           // Dependency: for checking current loading state
    imagesByMessage,           // Dependency: for checking if already loaded
    imagesError                // Dependency: for checking current error state
  ]);

  return (
    <Card key={message.idComunicazione} className="mb-3">
      <Card.Body>
        <Row>
          <Col>
            {/* Main message text and visualized checkbox */}
            <div className="d-flex justify-content-between align-items-start">
              <Card.Text className="mb-0 me-3 flex-grow-1">
                {message.testo ?? 'Nessun contenuto del messaggio.'}
              </Card.Text>
              <Form.Check
                type="checkbox"
                label="Visualized"
                checked={message.isVisualized ?? false}
                onChange={() => handleVisualizedChange(message.idComunicazione, message.isVisualized)}
                className="flex-shrink-0"
              />
            </div>
          </Col>
        </Row>

        {/* --- Image Display for Message --- */}
        <div className="mt-3">
          {isLoadingImages[message.idComunicazione] ? (
            <div className="text-center">
              <Spinner animation="border" size="sm" /> Caricamento immagini...
            </div>
          ) : imagesError[message.idComunicazione] ? (
            <Alert variant="warning" className="p-2">
              {imagesError[message.idComunicazione]}
            </Alert>
          ) : imagesByMessage[message.idComunicazione] && imagesByMessage[message.idComunicazione].length > 0 ? (
            <Row xs={1} md={2} lg={3} className="g-2">
              {imagesByMessage[message.idComunicazione].map((imgUrl, idx) => (
                <Col key={idx}>
                  <img
                    src={imgUrl}
                    alt={`Allegato ${idx + 1}`}
                    className="img-fluid rounded"
                    onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/150x100/CCCCCC/000000?text=Image+Error'; }}
                    style={{ maxWidth: '150px', maxHeight: '100px', objectFit: 'cover' }}
                  />
                </Col>
              ))}
            </Row>
          ) : (
            null // If not loading, no error, and no images, display nothing for the image section
          )}
        </div>
      </Card.Body>
    </Card>
  );
};
// --- END NEW MessageItem Component ---


const Forum = ({dipendente}) => {
  // State for forum topics
  const [topics, setTopics] = useState([]);
  const [isLoadingTopics, setIsLoadingTopics] = useState(false);
  const [topicsError, setTopicsError] = useState(null);

  // State for selected topic and its messages
  const [selectedTopicId, setSelectedTopicId] = useState(null);
  const [selectedTopicName, setSelectedTopicName] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [messagesError, setMessagesError] = useState(null);

  // State to store images for each message (keyed by message ID)
  const [imagesByMessage, setImagesByMessage] = useState({});
  const [isLoadingImages, setIsLoadingImages] = useState({});
  const [imagesError, setImagesError] = useState({});

  // --- API Call: Fetch Forum Topics ---
  useEffect(() => {
    const fetchTopics = async () => {
      setIsLoadingTopics(true);
      setTopicsError(null);
      try {
        const response = await fetch('http://localhost:8080/api/progetti/utente');
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        data.splice(0,0,{"idProgetto" : 0, "nomeProgetto" : "Forum", "concluso" : false, "deadline" : ""})
        setTopics(data);
        if (data.length > 0) {
          setSelectedTopicId(data[0].idProgetto);
          setSelectedTopicName(data[0].nomeProgetto)
        }
      } catch (err) {
        console.error("Failed to fetch topics:", err);
        setTopicsError(`Failed to load topics: ${err.message}`);
      } finally {
        setIsLoadingTopics(false);
      }
    };

    fetchTopics();
  }, []);

  // --- API Call: Fetch Messages for Selected Topic ---
  useEffect(() => {
    const fetchMessages = async () => {
      if (selectedTopicId !== null) {
        setIsLoadingMessages(true);
        setMessagesError(null);
        try {
          const response = await fetch(`http://localhost:8080/api/get/forum/messages/${selectedTopicId}`);
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          const data = await response.json();
          setMessages(data);
          // Reset images and image loading/error states for new topic
          setImagesByMessage({});
          setIsLoadingImages({});
          setImagesError({});
        } catch (err) {
          console.error("Failed to fetch messages:", err);
          setMessagesError(`Failed to load messages: ${err.message}`);
        } finally {
          setIsLoadingMessages(false);
        }
      }
    };

    fetchMessages();
  }, [selectedTopicId]);

  // --- API Call: Fetch Images for a Specific Message (Memoized with useCallback) ---
  const fetchImagesForMessage = useCallback(async (messageId) => {
    // Only fetch if not already loading or loaded for this specific messageId
    if (isLoadingImages[messageId] || imagesByMessage[messageId]) {
      return;
    }

    setIsLoadingImages(prev => ({ ...prev, [messageId]: true }));
    setImagesError(prev => ({ ...prev, [messageId]: null }));
    try {
      const response = await fetch(`http://localhost:8080/api/get/forum/images/${messageId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      setImagesByMessage(prev => ({ ...prev, [messageId]: data }));
    } catch (err) {
      console.error(`Failed to fetch images for message ${messageId}:`, err);
      setImagesError(prev => ({ ...prev, [messageId]: `Failed to load images: ${err.message}` }));
    } finally {
      setIsLoadingImages(prev => ({ ...prev, [messageId]: false }));
    }
  }, [isLoadingImages, imagesByMessage, imagesError]);

  // --- API Call: Update Message Visualized Status ---
  const handleVisualizedChange = async (messageId, currentVisualizedStatus) => {
    setMessages(prevMessages =>
      prevMessages.map(msg =>
        msg.idComunicazione === messageId ? { ...msg, isVisualized: !currentVisualizedStatus } : msg
      )
    );

    try {
      let tbody = {}
      tbody["isVisualized"] = !currentVisualizedStatus;
      tbody["idDipendente"] = dipendente.idUtente;
      tbody["idMessagio"] = messageId;
      const response = await fetch(`http://localhost:8080/api/update/visualized`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tbody),
      });

      if (!response.ok) {
        setMessages(prevMessages =>
          prevMessages.map(msg =>
            msg.idComunicazione === messageId ? { ...msg, isVisualized: currentVisualizedStatus } : msg
          )
        );
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
    } catch (err) {
      console.error(`Failed to update visualized status for message ${messageId}:`, err);
      alert(`Failed to update visualized status: ${err.message}. Please try again.`);
    }
  };


  return (
    <Container className="my-4">
      <h1 className="text-center mb-4">Forum</h1>
      <Row>
        {/* --- Forum Topics List (Left Column) --- */}
        <Col md={4} className="mb-4 mb-md-0">
          <Card>
            <Card.Header className="fw-bold">Progetti</Card.Header>
            <ListGroup variant="flush">
              {isLoadingTopics ? (
                <ListGroup.Item className="text-center">
                  <Spinner animation="border" size="sm" /> Loading topics...
                </ListGroup.Item>
              ) : topicsError ? (
                <ListGroup.Item className="text-danger text-center">{topicsError}</ListGroup.Item>
              ) : topics.length > 0 ? (
                topics.map(topic => (
                  <ListGroup.Item
                    key={topic.idProgetto}
                    action
                    onClick={() => {setSelectedTopicId(topic.idProgetto);setSelectedTopicName(topic.nomeProgetto)}}
                    active={topic.idProgetto === selectedTopicId}
                  >
                    {topic.nomeProgetto}
                  </ListGroup.Item>
                ))
              ) : (
                <ListGroup.Item className="text-muted text-center">Nessun Progetto disponibile </ListGroup.Item>
              )}
            </ListGroup>
          </Card>
        </Col>

        {/* --- Messages/Chat Section (Right Column) --- */}
        <Col md={8}>
          <Card>
            <Card.Header className="fw-bold">
              {selectedTopicName ? `Messaggi di ${selectedTopicName}` : 'Scegli un progetto'}
            </Card.Header>
            <Card.Body style={{ maxHeight: '600px', overflowY: 'auto' }}>
              {isLoadingMessages ? (
                <div className="text-center">
                  <Spinner animation="border" /> Loading messages...
                </div>
              ) : messagesError ? (
                <Alert variant="danger">{messagesError}</Alert>
              ) : messages.length > 0 ? (
                messages.map(message => (
                  // --- RENDER MessageItem for each message ---
                  <MessageItem
                    key={message.idComunicazione}
                    message={message}
                    handleVisualizedChange={handleVisualizedChange}
                    fetchImagesForMessage={fetchImagesForMessage}
                    imagesByMessage={imagesByMessage}
                    isLoadingImages={isLoadingImages}
                    imagesError={imagesError}
                  />
                ))
              ) : (
                <p className="text-muted text-center">Nessun messaggio per questo argomento. Seleziona un argomento o aggiungi un nuovo messaggio.</p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Forum;
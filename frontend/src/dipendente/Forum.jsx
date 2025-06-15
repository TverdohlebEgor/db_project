import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Row,
  Col,
  ListGroup,
  Card,
  Spinner,
  Form,
  Alert
} from 'react-bootstrap';

// --- MessageItem Component ---
const MessageItem = ({
  message,
  handleVisualizedChange,
  fetchImagesForMessage,
  imagesByMessage,
  isLoadingImages,
  imagesError
}) => {
  const [zoomedImage, setZoomedImage] = useState(null);

  useEffect(() => {
    if (
      !isLoadingImages[message.idComunicazione] &&
      !imagesByMessage[message.idComunicazione] &&
      !imagesError[message.idComunicazione]
    ) {
      fetchImagesForMessage(message.idComunicazione);
    }
  }, [
    message.idComunicazione,
    fetchImagesForMessage,
    isLoadingImages,
    imagesByMessage,
    imagesError
  ]);

  // Funzione per chiudere lightbox
  const closeZoom = () => setZoomedImage(null);

  return (
    <>
      <Card key={message.idComunicazione} className="mb-3">
        <Card.Body>
          <Row>
            <Col>
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

          <div className="mt-3">
            {isLoadingImages[message.idComunicazione] ? (
              <div className="text-center">
                <Spinner animation="border" size="sm" /> Caricamento immagini...
              </div>
            ) : imagesError[message.idComunicazione] ? (
              <Alert variant="warning" className="p-2">
                {imagesError[message.idComunicazione]}
              </Alert>
            ) : imagesByMessage[message.idComunicazione] &&
              imagesByMessage[message.idComunicazione].length > 0 ? (
              <Row xs={1} md={2} lg={3} className="g-3"> {/* g-3 dà più spazio */}
                {imagesByMessage[message.idComunicazione].map((imgUrl, idx) => (
                  <Col key={`${message.idComunicazione}_${idx}`}>
                    <img
                      src={imgUrl}
                      alt={`Allegato ${idx + 1}`}
                      className="img-fluid rounded"
                      style={{
                        maxWidth: '150px',
                        maxHeight: '100px',
                        objectFit: 'cover',
                        cursor: 'pointer',
                        border: '1px solid #ddd',
                        padding: '2px',
                        backgroundColor: '#fff',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
                      }}
                      onClick={() => setZoomedImage(imgUrl)}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://placehold.co/150x100/CCCCCC/000000?text=Image+Error';
                      }}
                    />
                  </Col>
                ))}
              </Row>
            ) : null}
          </div>
        </Card.Body>
      </Card>

      {/* Lightbox semplice */}
      {zoomedImage && (
        <div
          onClick={closeZoom}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0,0,0,0.8)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            cursor: 'zoom-out',
            zIndex: 1050
          }}
          aria-label="Close image zoom"
        >
          <img
            src={zoomedImage}
            alt="Zoomed"
            style={{
              maxWidth: '90%',
              maxHeight: '90%',
              boxShadow: '0 0 20px rgba(255,255,255,0.6)',
              borderRadius: '8px'
            }}
            onClick={(e) => e.stopPropagation()} // Previene chiusura se clicco sull’immagine
          />
        </div>
      )}
    </>
  );
};
// --- END MessageItem ---

const Forum = ({ dipendente }) => {
  // Topics
  const [topics, setTopics] = useState([]);
  const [isLoadingTopics, setIsLoadingTopics] = useState(false);
  const [topicsError, setTopicsError] = useState(null);

  // Selected Topic & Messages
  const [selectedTopicId, setSelectedTopicId] = useState(null);
  const [selectedTopicName, setSelectedTopicName] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [messagesError, setMessagesError] = useState(null);

  // Images state keyed by message ID
  const [imagesByMessage, setImagesByMessage] = useState({});
  const [isLoadingImages, setIsLoadingImages] = useState({});
  const [imagesError, setImagesError] = useState({});

  // --- Fetch Topics ---
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
        data.splice(0, 0, {
          idProgetto: 0,
          nomeProgetto: 'Forum',
          concluso: false,
          deadline: ''
        });
        setTopics(data);
        if (data.length > 0) {
          setSelectedTopicId(data[0].idProgetto);
          setSelectedTopicName(data[0].nomeProgetto);
        }
      } catch (err) {
        console.error('Failed to fetch topics:', err);
        setTopicsError(`Failed to load topics: ${err.message}`);
      } finally {
        setIsLoadingTopics(false);
      }
    };
    fetchTopics();
  }, []);

  // --- Fetch Messages for Selected Topic ---
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
          // Reset image caches on topic change
          setImagesByMessage({});
          setIsLoadingImages({});
          setImagesError({});
        } catch (err) {
          console.error('Failed to fetch messages:', err);
          setMessagesError(`Failed to load messages: ${err.message}`);
        } finally {
          setIsLoadingMessages(false);
        }
      }
    };
    fetchMessages();
  }, [selectedTopicId]);

  // --- Fetch Images for a Message ---
  const fetchImagesForMessage = useCallback(
    async (messageId) => {
      if (isLoadingImages[messageId] || imagesByMessage[messageId]) return;

      setIsLoadingImages((prev) => ({ ...prev, [messageId]: true }));
      setImagesError((prev) => ({ ...prev, [messageId]: null }));
      try {
        const response = await fetch(`http://localhost:8080/api/get/forum/images/${messageId}`);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();

        console.log(`Immagini per messaggio ${messageId}:`, data); // Debug

        if (!Array.isArray(data)) {
          throw new Error('La risposta non è un array di immagini');
        }

        setImagesByMessage((prev) => ({ ...prev, [messageId]: data }));
      } catch (err) {
        console.error(`Failed to fetch images for message ${messageId}:`, err);
        setImagesError((prev) => ({ ...prev, [messageId]: `Failed to load images: ${err.message}` }));
      } finally {
        setIsLoadingImages((prev) => ({ ...prev, [messageId]: false }));
      }
    },
    [isLoadingImages, imagesByMessage]
  );

  // --- Update Visualized Status ---
  const handleVisualizedChange = async (messageId, currentVisualizedStatus) => {
    setMessages((prevMessages) =>
      prevMessages.map((msg) =>
        msg.idComunicazione === messageId ? { ...msg, isVisualized: !currentVisualizedStatus } : msg
      )
    );

    try {
      const body = {
        isVisualized: !currentVisualizedStatus,
        idDipendente: dipendente.idUtente,
        idMessagio: messageId
      };
      const response = await fetch(`http://localhost:8080/api/update/visualized`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (!response.ok) {
        // Rollback UI change on error
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
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
        {/* Topics */}
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
                topics.map((topic) => (
                  <ListGroup.Item
                    key={topic.idProgetto}
                    action
                    onClick={() => {
                      setSelectedTopicId(topic.idProgetto);
                      setSelectedTopicName(topic.nomeProgetto);
                    }}
                    active={topic.idProgetto === selectedTopicId}
                  >
                    {topic.nomeProgetto}
                  </ListGroup.Item>
                ))
              ) : (
                <ListGroup.Item className="text-muted text-center">Nessun Progetto disponibile</ListGroup.Item>
              )}
            </ListGroup>
          </Card>
        </Col>

        {/* Messages */}
        <Col md={8}>
          <Card>
            <Card.Header className="fw-bold">Messaggi: {selectedTopicName || '-'}</Card.Header>
            <Card.Body style={{ maxHeight: '70vh', overflowY: 'auto' }}>
              {isLoadingMessages ? (
                <div className="text-center">
                  <Spinner animation="border" /> Loading messages...
                </div>
              ) : messagesError ? (
                <Alert variant="danger">{messagesError}</Alert>
              ) : messages.length > 0 ? (
                messages.map((message) => (
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
                <div className="text-center text-muted">Nessun messaggio disponibile.</div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Forum;

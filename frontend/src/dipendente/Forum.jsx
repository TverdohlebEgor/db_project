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


const MessageItem = ({
  message,
  handleVisualizedChange,
  fetchImagesForMessage,
  imagesByMessage,
  isLoadingImages,
  imagesError,
  isAlreadyVisualized
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
                  disabled={isAlreadyVisualized}
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
              <Row xs={1} md={2} lg={3} className="g-3">
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
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
};

const Forum = ({ dipendente }) => {
  const [topics, setTopics] = useState([]);
  const [isLoadingTopics, setIsLoadingTopics] = useState(false);
  const [topicsError, setTopicsError] = useState(null);

  const [selectedTopicId, setSelectedTopicId] = useState(null);
  const [selectedTopicName, setSelectedTopicName] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [messagesError, setMessagesError] = useState(null);

  const [imagesByMessage, setImagesByMessage] = useState({});
  const [isLoadingImages, setIsLoadingImages] = useState({});
  const [imagesError, setImagesError] = useState({});

  const [alreadyVisualizedMap, setAlreadyVisualizedMap] = useState({});

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

  const checkIsVisualized = useCallback(async (messageId) => {
    try {
      const response = await fetch('http://localhost:8080/api/isVisualized', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idComunicazione: messageId.toString(),
          idUtente: dipendente.idUtente.toString()
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const isVisualized = await response.json();
      setAlreadyVisualizedMap((prev) => ({ ...prev, [messageId]: isVisualized }));
    } catch (err) {
      console.error(`Failed to check visualized status for message ${messageId}:`, err);
      setAlreadyVisualizedMap((prev) => ({ ...prev, [messageId]: false })); 
    }
  }, [dipendente.idUtente]);

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
          setImagesByMessage({});
          setIsLoadingImages({});
          setImagesError({});

          setAlreadyVisualizedMap({});
          data.forEach(msg => {
            checkIsVisualized(msg.idComunicazione);
          });

        } catch (err) {
          console.error('Failed to fetch messages:', err);
          setMessagesError(`Failed to load messages: ${err.message}`);
        } finally {
          setIsLoadingMessages(false);
        }
      }
    };
    fetchMessages();
  }, [selectedTopicId, checkIsVisualized]);

  const handleVisualizedChange = async (messageId, currentVisualizedStatus) => {
    if (alreadyVisualizedMap[messageId]) return;

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
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg.idComunicazione === messageId ? { ...msg, isVisualized: currentVisualizedStatus } : msg
          )
        );
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      setAlreadyVisualizedMap((prev) => ({ ...prev, [messageId]: true }));

    } catch (err) {
      console.error(`Failed to update visualized status for message ${messageId}:`, err);
      alert(`Failed to update visualized status: ${err.message}. Please try again.`);
    }
  };

  return (
    <Container className="my-4">
      <h1 className="text-center mb-4">Forum</h1>
      <Row>
        <Col md={4} className="mb-4 mb-md-0">
          <Card>
            <Card.Header className="fw-bold">Progetti</Card.Header>
            <ListGroup variant="flush">
              {isLoadingTopics ? (
                <ListGroup.Item className="text-center">
                  <Spinner animation="border" size="sm" /> Loading topics...
                </ListGroup.Item>
              ) : topicsError ? (
                <ListGroup.Item className="text-danger">{topicsError}</ListGroup.Item>
              ) : topics.length === 0 ? (
                <ListGroup.Item>No projects found</ListGroup.Item>
              ) : (
                topics.map((topic) => (
                  <ListGroup.Item
                    key={topic.idProgetto}
                    action
                    active={topic.idProgetto === selectedTopicId}
                    onClick={() => {
                      setSelectedTopicId(topic.idProgetto);
                      setSelectedTopicName(topic.nomeProgetto);
                    }}
                  >
                    {topic.nomeProgetto}
                  </ListGroup.Item>
                ))
              )}
            </ListGroup>
          </Card>
        </Col>

        <Col md={8}>
          <h3>{selectedTopicName ?? 'Seleziona un progetto'}</h3>
          {isLoadingMessages ? (
            <div className="text-center my-4">
              <Spinner animation="border" size="lg" />
            </div>
          ) : messagesError ? (
            <Alert variant="danger">{messagesError}</Alert>
          ) : messages.length === 0 ? (
            <Alert variant="info">Nessun messaggio per questo progetto.</Alert>
          ) : (
            messages.map((message) => (
              <MessageItem
                key={message.idComunicazione}
                message={{
                  ...message,
                  isVisualized:
                    typeof message.isVisualized === 'boolean'
                      ? message.isVisualized
                      : alreadyVisualizedMap[message.idComunicazione] || false,
                }}
                handleVisualizedChange={handleVisualizedChange}
                fetchImagesForMessage={fetchImagesForMessage}
                imagesByMessage={imagesByMessage}
                isLoadingImages={isLoadingImages}
                imagesError={imagesError}
                isAlreadyVisualized={alreadyVisualizedMap[message.idComunicazione]}
              />
            ))
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default Forum;

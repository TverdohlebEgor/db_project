import React, { useState, useEffect } from 'react';
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
} from 'react-bootstrap'; // Import necessary Bootstrap components

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
  // Example: { messageId1: ['img1.jpg', 'img2.png'], messageId2: ['img3.gif'] }
  const [imagesByMessage, setImagesByMessage] = useState({});
  const [isLoadingImages, setIsLoadingImages] = useState({}); // Stores loading state per message
  const [imagesError, setImagesError] = useState({});       // Stores error state per message

  // --- API Call: Fetch Forum Topics ---
  useEffect(() => {
    const fetchTopics = async () => {
      setIsLoadingTopics(true);
      setTopicsError(null);
      try {
        // Replace with your actual API endpoint to get forum topics
        const response = await fetch('http://localhost:8080/api/progetti/utente');
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        data.splice(0,0,{"idProgetto" : 0, "nomeProgetto" : "Forum", "concluso" : false, "deadline" : ""})
        setTopics(data);
        if (data.length > 0) {
          setSelectedTopicId(data[0].idProgetto); // Select the first topic by default
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
  }, []); // Run once on component mount

  // --- API Call: Fetch Messages for Selected Topic ---
  useEffect(() => {
    const fetchMessages = async () => {
      if (selectedTopicId !== null) {
        setIsLoadingMessages(true);
        setMessagesError(null);
        try {
          // Replace with your actual API endpoint to get messages for a topic
          const response = await fetch(`http://localhost:8080/api/get/forum/messages/${selectedTopicId}`);
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          const data = await response.json();
          console.log(data);
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
  }, [selectedTopicId]); // Re-fetch messages when selectedTopicId changes

  // --- API Call: Fetch Images for a Specific Message ---
  // This function is called individually for each message that might have images
  const fetchImagesForMessage = async (messageId) => {
    if (imagesByMessage[messageId]) return; // Don't re-fetch if already loaded

    setIsLoadingImages(prev => ({ ...prev, [messageId]: true }));
    setImagesError(prev => ({ ...prev, [messageId]: null }));
    try {
      // Replace with your actual API endpoint to get images for a message
      const response = await fetch(`http://localhost:8080/api/get/forum/images/${messageId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json(); // Assuming 'data' is an array of image URLs
      setImagesByMessage(prev => ({ ...prev, [messageId]: data }));
    } catch (err) {
      console.error(`Failed to fetch images for message ${messageId}:`, err);
      setImagesError(prev => ({ ...prev, [messageId]: `Failed to load images: ${err.message}` }));
    } finally {
      setIsLoadingImages(prev => ({ ...prev, [messageId]: false }));
    }
  };

  // --- API Call: Update Message Visualized Status ---
  const handleVisualizedChange = async (messageId, currentVisualizedStatus) => {
    // Optimistic UI update: update state immediately
    setMessages(prevMessages =>
      prevMessages.map(msg =>
        msg.idComunicazione === messageId ? { ...msg, isVisualized: !currentVisualizedStatus } : msg
      )
    );

    try {
      // Replace with your actual API endpoint to update the 'visualized' status
      let tbody = {}
      tbody["isVisualized"] = !currentVisualizedStatus;
      tbody["idDipendente"] = dipendente.idUtente;
      tbody["idMessagio"] = messageId;
      const response = await fetch(`http://localhost:8080/api/update/visualized`, {
        method: 'POST', // Or POST, depending on your backend
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tbody),
      });

      if (!response.ok) {
        // If API call fails, revert the UI state (pessimistic update after optimistic)
        setMessages(prevMessages =>
          prevMessages.map(msg =>
            msg.id === messageId ? { ...msg, isVisualized: currentVisualizedStatus } : msg
          )
        );
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      console.log(`Message ${messageId} visualized status updated successfully.`);
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
                  <Card key={message.id} className="mb-3">
                    <Card.Body>
                      <Row>
                        <Col> {/* Use a single column to contain both the text and the checkbox */}
                          <div className="d-flex justify-content-between align-items-start">
                            {/* Message Text - allow it to take available space */}
                            <Card.Text className="mb-0 me-3 flex-grow-1">
                              {message.testo ?? 'Messaggio vuoto'}
                            </Card.Text>

                            {/* Visualized Checkbox - ensure it stays compact */}
                            <Form.Check
                              type="checkbox"
                              label="Visualized"
                              checked={message.isVisualized ?? false} // Default to false if null
                              onChange={() => handleVisualizedChange(message.idComunicazione, message.isVisualized)}
                              // Add classes for styling, e.g., to keep it from growing
                              className="flex-shrink-0"
                            />
                          </div>
                        </Col>
                      </Row>
                      {/* Image Display for Message */}
                      {message.hasImages && ( // Assume message object has a boolean 'hasImages' property
                        <div className="mt-3">
                          {isLoadingImages[message.id] ? (
                            <div className="text-center">
                              <Spinner animation="border" size="sm" /> Loading images...
                            </div>
                          ) : imagesError[message.id] ? (
                            <Alert variant="warning" className="p-2">
                              {imagesError[message.id]}
                            </Alert>
                          ) : imagesByMessage[message.id] && imagesByMessage[message.id].length > 0 ? (
                            <Row xs={1} md={2} lg={3} className="g-2">
                              {imagesByMessage[message.id].map((imgUrl, idx) => (
                                <Col key={idx}>
                                  <img
                                    src={imgUrl}
                                    alt={`Attachment ${idx + 1}`}
                                    className="img-fluid rounded"
                                    onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/150x100/CCCCCC/000000?text=Image+Error'; }} // Fallback on error
                                    style={{ maxWidth: '150px', maxHeight: '100px', objectFit: 'cover' }}
                                  />
                                </Col>
                              ))}
                            </Row>
                          ) : (
                            <Button
                              variant="outline-secondary"
                              size="sm"
                              onClick={() => fetchImagesForMessage(message.id)}
                            >
                              Show Images
                            </Button>
                          )}
                        </div>
                      )}
                    </Card.Body>
                  </Card>
                ))
              ) : (
                <p className="text-muted text-center">No messages for this topic. Select a topic or add a new message.</p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Forum;
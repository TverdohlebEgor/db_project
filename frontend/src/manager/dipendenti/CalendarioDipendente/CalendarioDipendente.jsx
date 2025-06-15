import { useLocation } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import EventModal from './EventModal';
import './Calendario.css';

const Calendar = ({dipendente}) => {



  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [currentDisplayDate, setCurrentDisplayDate] = useState(new Date()); 

  const currentMonth = currentDisplayDate.getMonth();
  const currentYear = currentDisplayDate.getFullYear();

  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const handleDayClick = (day) => {
    setSelectedDate(new Date(currentYear, currentMonth, day));
    setShowModal(true);
  };

  

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedDate(null);
  };

  const handlePreviousMonth = () => {
    setCurrentDisplayDate(prevDate => {
      const prevMonth = new Date(prevDate.getFullYear(), prevDate.getMonth() - 1, 1);
      return prevMonth;
    });
  };

  const handleNextMonth = () => {
    setCurrentDisplayDate(prevDate => {
      const nextMonth = new Date(prevDate.getFullYear(), prevDate.getMonth() + 1, 1);
      return nextMonth;
    });
  };

  const getMonthName = (monthIndex) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[monthIndex];
  };

  const renderCalendarDays = () => {
    const days = [];
    const today = new Date(); 

  
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<Col key={`empty-${i}`} className="calendar-day empty-day"></Col>);
    }

    
    for (let day = 1; day <= daysInMonth; day++) {
     
      const isToday = day === today.getDate() &&
                      currentMonth === today.getMonth() &&
                      currentYear === today.getFullYear();

      days.push(
        <Col key={day} className="calendar-day">
          <Button
            variant={isToday ? "primary" : "outline-secondary"}
            className="w-100 h-100" 
            onClick={() => handleDayClick(day)}
          >
            {day}
          </Button>
        </Col>
      );
    }
    return days;
  };

  return (
    <Container className="my-4">
      <Row className="align-items-center mb-4">
        <Col className="text-start">
          <Button variant="outline-primary" onClick={handlePreviousMonth}>&lt; Previous</Button>
        </Col>
        <Col className="text-center">
          <h2>
            {getMonthName(currentMonth)} {currentYear}
          </h2>
        </Col>
        <Col className="text-end">
          <Button variant="outline-primary" onClick={handleNextMonth}>Next &gt;</Button>
        </Col>
      </Row>

    
      <Row className="text-center fw-bold mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <Col key={day}>{day}</Col>
        ))}
      </Row>  
    
      <Row className="g-1">
        {renderCalendarDays().map((dayCol, index) => (
          (index % 7 === 0 && index !== 0) ? (
            <React.Fragment key={`row-wrap-${index}`}>
              <div className="w-100"></div> 
              {dayCol}
            </React.Fragment>
          ) : (
            dayCol
          )
        ))}
      </Row>

      <EventModal
        show={showModal}
        handleClose={handleCloseModal}
        selectedDate={selectedDate}
        idDipendente={dipendente.idUtente}
      />

      
    </Container>
  );
};


function CalendarioDipendente() {
  const location = useLocation();
  const utente = location.state?.utente;  
  return <Calendar dipendente={utente} />

}

export default CalendarioDipendente;

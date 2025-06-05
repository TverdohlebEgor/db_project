import React, { useState } from 'react';
import { Form, Button } from 'react-bootstrap';
import Manager from './manager/Manager';
import Dipendente from './dipendente/Dipendente';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [userType, setUserType] = useState(null);




  const handleSubmit = (e) => {
    e.preventDefault();
    fetchUsers();
  };


  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();
      const userType = data.tipo
      if (userType === 'MANAGER') {
        setUserType('MANAGER');
      } else if (userType === 'DIPENDENTE') {
        setUserType('DIPENDENTE');
      }
    } catch (err) {
      setMessage("Errore email o password errati")

    }
  };

  if (userType === 'MANAGER') {
    return <Manager />;
  }

  if (userType === 'DIPENDENTE') {
    return <Dipendente />;
  }

  return (
    <div>
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3" controlId="formBasicEmail">
          <Form.Control type="email" placeholder="Inserire email" value={email}
            onChange={(e) => setEmail(e.target.value)} />

        </Form.Group>

        <Form.Group className="mb-3" controlId="formBasicPassword">

          <Form.Control type="password" placeholder="Inserire password" value={password}
            onChange={(e) => setPassword(e.target.value)} />
        </Form.Group>
        <Button variant="primary" type="submit" className="mt-3">
          Invia
        </Button>
      </Form>
      {message}

    </div>

  );
}

export default LoginForm;
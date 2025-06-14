import React, { useState } from 'react';
import { Form, Button } from 'react-bootstrap';
import Manager from './manager/Manager';
import Dipendente from './dipendente/Dipendente';
import Amministratore from './amministratore/Amministratore';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [data, setData] = useState('')
  const [amministratoreData, setAmministratoreData] = useState('')
  const [isAmministratore, setIsAmministratore] = useState(false)




  const handleSubmit = (e) => {
    e.preventDefault();
    updateEventi();
    fetchUsers();
    fetchAmministratore();
    setMessage("Errore email o password errati")

  };

  const updateEventi = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/update/eventi', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ date: new Date() })
      });

    } catch (err) {
      console.log(err)

    }
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

      setData(data)
    } catch (err) {
      console.log(err)

    }
  };

  const fetchAmministratore = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/amministratore/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();
      setAmministratoreData(data);
      if (response.ok && data !== null) {
        setIsAmministratore(true);
      }
    } catch (err) {
      console.log(err)
    }
  }
  if (data.tipo === 'MANAGER') {
    return <Manager manager={data} />;
  }
  else if (data.tipo === 'DIPENDENTE') {
    return <Dipendente dipendente={data} />;
  }
  else if (isAmministratore === true) {
    return <Amministratore amministratore={amministratoreData} />;
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
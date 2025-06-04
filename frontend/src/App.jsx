import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Badge from 'react-bootstrap/Badge';
import Button from 'react-bootstrap/Button';

function App() {
  return (
    <div>
      <h2>Login</h2>
      <form action="http://localhost:8080/api/login" method="POST">
        <label htmlFor="email">Email:</label>
        <input type="email" id="email" name="email" required /><br /><br />

        <label htmlFor="password">Password:</label>
        <input type="password" id="password" name="password" required /><br /><br />

        <input type="submit" value="Accedi" />
      </form>
    </div>
  );
}

export default App

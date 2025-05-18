import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Badge from 'react-bootstrap/Badge';
import Button from 'react-bootstrap/Button';

function App() {
  return (
    <div>
      <h1>
        Example heading
        <Badge bg="secondary" as={Button}>
          New
        </Badge>
      </h1>
    </div>
  );
}

export default App

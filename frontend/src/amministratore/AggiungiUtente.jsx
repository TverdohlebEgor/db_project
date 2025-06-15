import React, { useState } from 'react';

// Main App component
const AggiungiUtente = ({ amministratore }) => {
  // State to hold form data
  const [formData, setFormData] = useState({
    tipo: '',
    nome: '',
    cognome: '',
    email: '',
    password: '',
    dataDiNascita: '',
    residenza: '',
    ral: '',
    dataDiAssunzione: '',
    tipoDiContratto: '',
    iban: '',
  });

  // State to hold validation errors
  const [errors, setErrors] = useState({});

  // State for submission message (success/error)
  const [submitMessage, setSubmitMessage] = useState('');
  const [submitMessageType, setSubmitMessageType] = useState(''); // 'success' or 'danger'

  // Options for dropdowns
  const tipoOptions = ['Dipendente', 'Manager'];
  const contrattoOptions = ['FullTime', 'PartTime', 'Stage', 'Apprendistato'];

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value,
    }));
    // Clear error for the current field as user types
    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: undefined,
    }));
  };

  // Basic validation function
  const validateForm = () => {
    const newErrors = {};
    if (!formData.tipo) newErrors.tipo = 'Il tipo di utente è obbligatorio.';
    if (!formData.nome.trim()) newErrors.nome = 'Il nome è obbligatorio.';
    if (!formData.cognome.trim()) newErrors.cognome = 'Il cognome è obbligatorio.';
    if (!formData.email.trim()) {
      newErrors.email = 'L\'email è obbligatoria.';
    }
    if (!formData.password) {
      newErrors.password = 'La password è obbligatoria.';
    }
    if (!formData.dataDiNascita) newErrors.dataDiNascita = 'La data di nascita è obbligatoria.';
    if (!formData.residenza.trim()) newErrors.residenza = 'La residenza è obbligatoria.';
    if (isNaN(parseFloat(formData.ral)) || parseFloat(formData.ral) <= 0) newErrors.ral = 'Il RAL deve essere un numero positivo.';
    else if (parseFloat(formData.ral) >= 100000000) newErrors.ral = 'Il RAL non puo 10 milioni';
    if (!formData.dataDiAssunzione) newErrors.dataDiAssunzione = 'La data di assunzione è obbligatoria.';
    if (!formData.tipoDiContratto) newErrors.tipoDiContratto = 'Il tipo di contratto è obbligatorio.';
    if (formData.iban && formData.iban.length !== 27) newErrors.iban = 'L\'IBAN deve contenere 27 caratteri.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // Return true if no errors
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior

    if (!validateForm()) {
      setSubmitMessage('Per favore, correggi gli errori nel modulo.');
      setSubmitMessageType('danger');
      return;
    }

    setSubmitMessage('Invio in corso...');
    setSubmitMessageType('info');

    try {
      const response = await fetch('http://localhost:8080/api/add/utente', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const result = await response.json();
        setSubmitMessage('Utente registrato con successo!');
        setSubmitMessageType('success');
        setFormData({
          tipo: '', nome: '', cognome: '', email: '', password: '', dataDiNascita: '',
          residenza: '', ral: '', dataDiAssunzione: '', tipoDiContratto: '',
          iban: ''
        });
        setErrors({}); // Clear any residual errors
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Errore sconosciuto' }));
        setSubmitMessage(`Errore durante la registrazione: ${errorData.message || response.statusText}`);
        setSubmitMessageType('danger');
      }
    } catch (error) {
      console.error('Submission error:', error);
      setSubmitMessage(`Si è verificato un errore di rete: ${error.message}`);
      setSubmitMessageType('danger');
    }
  };

  return (
    <div className="container my-5 font-inter">
      <h2 className="text-center mb-4 text-2xl font-bold">Registrazione Nuovo Utente</h2>
      <div className="p-4 rounded-lg shadow-lg bg-white max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Tipo (Select) */}
          <div className="mb-3">
            <label htmlFor="tipo" className="block text-gray-700 text-sm font-bold mb-2">Tipo Utente:</label>
            <select
              className={`form-select block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${errors.tipo ? 'border-red-500' : 'border-gray-300'}`}
              id="tipo"
              name="tipo"
              value={formData.tipo}
              onChange={handleChange}
              required
            >
              <option value="">Seleziona Tipo</option>
              {tipoOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
            {errors.tipo && <div className="text-red-500 text-xs mt-1">{errors.tipo}</div>}
          </div>

          {/* Nome */}
          <div className="mb-3">
            <label htmlFor="nome" className="block text-gray-700 text-sm font-bold mb-2">Nome:</label>
            <input
              type="text"
              className={`form-control block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${errors.nome ? 'border-red-500' : 'border-gray-300'}`}
              id="nome"
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              required
            />
            {errors.nome && <div className="text-red-500 text-xs mt-1">{errors.nome}</div>}
          </div>

          {/* Cognome */}
          <div className="mb-3">
            <label htmlFor="cognome" className="block text-gray-700 text-sm font-bold mb-2">Cognome:</label>
            <input
              type="text"
              className={`form-control block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${errors.cognome ? 'border-red-500' : 'border-gray-300'}`}
              id="cognome"
              name="cognome"
              value={formData.cognome}
              onChange={handleChange}
              required
            />
            {errors.cognome && <div className="text-red-500 text-xs mt-1">{errors.cognome}</div>}
          </div>

          {/* Email */}
          <div className="mb-3">
            <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">Email:</label>
            <input
              type="email"
              className={`form-control block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
            {errors.email && <div className="text-red-500 text-xs mt-1">{errors.email}</div>}
          </div>

          {/* Password */}
          <div className="mb-3">
            <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">Password:</label>
            <input
              type="password"
              className={`form-control block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            {errors.password && <div className="text-red-500 text-xs mt-1">{errors.password}</div>}
          </div>

          {/* DataDiNascita */}
          <div className="mb-3">
            <label htmlFor="dataDiNascita" className="block text-gray-700 text-sm font-bold mb-2">Data di Nascita:</label>
            <input
              type="date"
              className={`form-control block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${errors.dataDiNascita ? 'border-red-500' : 'border-gray-300'}`}
              id="dataDiNascita"
              name="dataDiNascita"
              value={formData.dataDiNascita}
              onChange={handleChange}
              required
            />
            {errors.dataDiNascita && <div className="text-red-500 text-xs mt-1">{errors.dataDiNascita}</div>}
          </div>

          {/* Residenza */}
          <div className="mb-3">
            <label htmlFor="residenza" className="block text-gray-700 text-sm font-bold mb-2">Residenza:</label>
            <input
              type="text"
              className={`form-control block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${errors.residenza ? 'border-red-500' : 'border-gray-300'}`}
              id="residenza"
              name="residenza"
              value={formData.residenza}
              onChange={handleChange}
              required
            />
            {errors.residenza && <div className="text-red-500 text-xs mt-1">{errors.residenza}</div>}
          </div>

          {/* RAL */}
          <div className="mb-3">
            <label htmlFor="ral" className="block text-gray-700 text-sm font-bold mb-2">RAL (€):</label>
            <input
              type="number"
              step="0.01"
              className={`form-control block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${errors.ral ? 'border-red-500' : 'border-gray-300'}`}
              id="ral"
              name="ral"
              value={formData.ral}
              onChange={handleChange}
              required
            />
            {errors.ral && <div className="text-red-500 text-xs mt-1">{errors.ral}</div>}
          </div>

          {/* DataDiAssunzione */}
          <div className="mb-3">
            <label htmlFor="dataDiAssunzione" className="block text-gray-700 text-sm font-bold mb-2">Data di Assunzione:</label>
            <input
              type="date"
              className={`form-control block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${errors.dataDiAssunzione ? 'border-red-500' : 'border-gray-300'}`}
              id="dataDiAssunzione"
              name="dataDiAssunzione"
              value={formData.dataDiAssunzione}
              onChange={handleChange}
              required
            />
            {errors.dataDiAssunzione && <div className="text-red-500 text-xs mt-1">{errors.dataDiAssunzione}</div>}
          </div>

          {/* TipoDiContratto (Select) */}
          <div className="mb-3">
            <label htmlFor="tipoDiContratto" className="block text-gray-700 text-sm font-bold mb-2">Tipo di Contratto:</label>
            <select
              className={`form-select block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${errors.tipoDiContratto ? 'border-red-500' : 'border-gray-300'}`}
              id="tipoDiContratto"
              name="tipoDiContratto"
              value={formData.tipoDiContratto}
              onChange={handleChange}
              required
            >
              <option value="">Seleziona Tipo Contratto</option>
              {contrattoOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
            {errors.tipoDiContratto && <div className="text-red-500 text-xs mt-1">{errors.tipoDiContratto}</div>}
          </div>

          {/* IBAN */}
          <div className="mb-3">
            <label htmlFor="iban" className="block text-gray-700 text-sm font-bold mb-2">IBAN (27 caratteri):</label>
            <input
              type="text"
              className={`form-control block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${errors.iban ? 'border-red-500' : 'border-gray-300'}`}
              id="iban"
              name="iban"
              value={formData.iban}
              onChange={handleChange}
              maxLength="27"
            />
            {errors.iban && <div className="text-red-500 text-xs mt-1">{errors.iban}</div>}
          </div>


          {/* Submit Button */}
          <div className="md:col-span-2 text-center mt-4">
            <button
              type="submit"
              className="px-6 py-2 rounded-2xl border-2 border-blue-600 text-blue-700 font-semibold bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1 transition-all duration-200 ease-in-out transform hover:scale-[1.02] active:scale-[0.98]"
            >
              Registra Utente
            </button>
          </div>
        </form>

        {/* Submission Message */}
        {submitMessage && (
          <div
            className={`mt-4 p-3 rounded-md text-center ${submitMessageType === 'success' ? 'bg-green-100 text-green-800' : submitMessageType === 'danger' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}
            role="alert"
          >
            {submitMessage}
          </div>
        )}
      </div>
    </div>
  );
};

export default AggiungiUtente;
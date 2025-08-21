import React, { useState, useEffect } from 'react';
import './App.css';
import CreateIncidentTicket from './CreateIncTicket';
import GetAllIncidentTickets from './GetAllIncTickets';

export default function App() {
  const [view, setView] = useState('');  // '' | 'create' | 'view'
  const [message, setMessage] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const [selectedIncident, setSelectedIncident] = useState(null);

  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(''), 5000);
    return () => clearTimeout(t);
  }, [message]);

  useEffect(() => {
    if (view === 'create') setMessage('');
  }, [view]);

  const onCreated = () => {
    setView('view');
    setReloadKey(k => k + 1);
    setMessage('✅ Incident ticket saved successfully!');
    setSelectedIncident(null);
  };

  const onEditClick = (incident) => {
    setSelectedIncident(incident);
    setView('create');
  };

  return (
    <div>
      {/* NAVBAR */}
      <div className="navbar">
        <ul className="navbar-menu">
          <li className="navbar-logo" onClick={() => { setView(''); setReloadKey(k => k + 1);setMessage('') }}>
            🧾 Ticket Manager
          </li>
          <li onClick={() => { setSelectedIncident(null); setView('create'); setMessage('')}}>Create Incident Ticket</li>
          <li onClick={() => { setView('view'); setReloadKey(k => k + 1); setMessage('')}}>View All Incident Tickets</li>
        </ul>
      </div>

      {/* CONTENT */}
      <div className="container">
        {message && <div className="message">{message}</div>}

        {view === 'create' && (
          <CreateIncidentTicket
            onCreated={onCreated}
            setMessage={setMessage}
            incidentData={selectedIncident}
          />
        )}

        {view === 'view' && (
          <GetAllIncidentTickets
            forceReloadKey={reloadKey}
            onEditClick={onEditClick}
          />
        )}

        {view === '' && (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#555' }}>
            <h2>Welcome</h2>
            <p>Select “Create Incident Ticket” or “View All Incident Tickets” from the menu.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// App.js
import React, { useState, useEffect } from 'react';
import './App.css';
import CreateTicketForm from './CreateTicketForm';
import ViewTickets from './ViewTickets';

export default function App() {
  // Start on list page
  const [view, setView] = useState('');
  const [message, setMessage] = useState('');
  const [reloadKey, setReloadKey] = useState(0); // bump to refetch table

  // Auto-hide top banner after 5s
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(''), 5000);
    return () => clearTimeout(t);
  }, [message]);

  // When entering "create", clear any existing banner (e.g., fetch errors from view)
  useEffect(() => {
    if (view === 'create') setMessage('');
  }, [view]);

  // After successful create: go to view + refresh + show success
  const onCreated = () => {
    setView('view');
    setReloadKey(k => k + 1);
    setMessage('✅ Ticket created successfully!');
  };

  return (
    <div>
      {/* NAVBAR */}
      <div className="navbar">
        <ul className="navbar-menu">
          <li className="navbar-logo" onClick={() => { setView(''); setReloadKey(k => k + 1); }}>
            🧾 Ticket Manager
          </li>
          <li onClick={() => setView('create')}>Create a Ticket</li>
          <li onClick={() => { setView('view'); setReloadKey(k => k + 1); }}>
            View All Tickets
          </li>
        </ul>
      </div>

      {/* CONTENT */}
      <div className="container">
        {message && <div className="message">{message}</div>}

        {view === 'create' && (
          <CreateTicketForm onCreated={onCreated} setMessage={setMessage} />
        )}

        {view === 'view' && (
          <ViewTickets forceReloadKey={reloadKey} />
        )}

        {view === '' && (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#555' }}>
            <h2>Welcome</h2>
            <p>Select “Create a Ticket” or “View All Tickets” from the menu.</p>
          </div>
        )}
      </div>
    </div>
  );
}
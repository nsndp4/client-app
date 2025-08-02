import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  // ── STATE ──
  const [view, setView] = useState('');             // '', 'create', 'view', 'delete'
  const [message, setMessage] = useState('');       // feedback
  const [formData, setFormData] = useState({        // form
    shortDesc:'',problemDesc:'',assignee:'',reporter:'',priority:'',comment:''
  });
  const [ticketList, setTicketList] = useState([]); // all tickets
  const [deleteId, setDeleteId] = useState('');     // for deletion
  const [editingTicket, setEditingTicket] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isEditingEnabled, setIsEditingEnabled] = useState(false);
  const [cancelledTickets, setCancelledTickets] = useState([]); // persisted

  const apiBase = 'http://localhost:8080/api/v1/tickets';

  // ── INITIAL LOAD ──
  useEffect(() => {
    // 1) restore cancelled IDs
    const saved = JSON.parse(localStorage.getItem('cancelledTickets') || '[]');
    setCancelledTickets(saved);

    // 2) fetch tickets once
    fetch(`${apiBase}/displaysCertainNumberOfTicketsBasedOnPageNumber`)
      .then(r => r.json())
      .then(data => {
        setTicketList(data);
        localStorage.setItem('ticketList', JSON.stringify(data));
      })
      .catch(() => setMessage('⚠️ Failed to fetch tickets.'));
  }, []);

  // ── MESSAGES ──
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(''), 3000);
    return () => clearTimeout(t);
  }, [message]);

  // ── HANDLERS ──
  const handleInput = e => {
    const { name, value } = e.target;
    setFormData(fd => ({ ...fd, [name]: value }));
  };
  const clearForm = () => setFormData({
    shortDesc:'',problemDesc:'',assignee:'',reporter:'',priority:'',comment:''
  });

  const handleCreate = async e => {
    e.preventDefault();
    try {
      const res = await fetch(`${apiBase}/createNewTicket`, {
        method:'POST',
        headers:{ 'Content-Type':'application/json' },
        body:JSON.stringify({
          shortDesc:formData.shortDesc,
          problemDesc:formData.problemDesc,
          assignee:formData.assignee,
          reporter:formData.reporter,
          priority:formData.priority,
          comment:[formData.comment],
        })
      });
      if (!res.ok) throw 0;
      setMessage('✅ Ticket created!');
      clearForm();
      // re-fetch to include new ticket
      const data = await (await fetch(`${apiBase}/displaysCertainNumberOfTicketsBasedOnPageNumber`)).json();
      setTicketList(data);
      localStorage.setItem('ticketList', JSON.stringify(data));
      setView('view');
    } catch {
      setMessage('❌ Create failed.');
    }
  };

  const handleDelete = async e => {
    e.preventDefault();
    try {
      const res = await fetch(`${apiBase}/deletesATicketByIds/${deleteId}`, { method:'DELETE' });
      const txt = await res.text();
      setMessage(txt||'❌ Not found');
      setDeleteId('');
      // re-fetch to remove
      const data = await (await fetch(`${apiBase}/displaysCertainNumberOfTicketsBasedOnPageNumber`)).json();
      setTicketList(data);
      localStorage.setItem('ticketList', JSON.stringify(data));
    } catch {
      setMessage('⚠️ Delete failed.');
    }
  };

  // ── RENDER ──
  return (
    <div>
      {/* NAV */}
      <div className="navbar">
        <ul className="navbar-menu">
          <li className="navbar-logo" onClick={()=>{setView('');setMessage('');}}>🧾 Ticket Manager</li>
          <li onClick={()=>{clearForm();setView('create');setMessage('');setIsEditMode(false);setIsEditingEnabled(false);}}>Create a Ticket</li>
          <li onClick={()=>{setView('view');setMessage('');}}>View All Tickets</li>
          <li onClick={()=>{setView('delete');setMessage('');}}>Delete a Ticket</li>
        </ul>
      </div>

      <div className="container">
        {message && <div className="message">{message}</div>}

        {/* CREATE/EDIT */}
        {view==='create' && (
          <form onSubmit={handleCreate}>
            {isEditMode && (
              <div style={{textAlign:'right',marginBottom:'1rem'}}>
                <button type="button" onClick={()=>setIsEditingEnabled(true)} style={{marginRight:'10px'}}>Edit</button>
                <button type="button" onClick={()=>{
                  const updated = [...cancelledTickets, editingTicket.ids];
                  setCancelledTickets(updated);
                  localStorage.setItem('cancelledTickets', JSON.stringify(updated));
                  setMessage('⛔ Ticket cancelled.');
                  setView('view');
                  setIsEditMode(false);
                  setEditingTicket(null);
                  clearForm();
                }}>Cancel</button>
              </div>
            )}

            <label>Short Description</label>
            <input name="shortDesc" value={formData.shortDesc} onChange={handleInput}
              required disabled={isEditMode && !isEditingEnabled} />

            <label>Problem Description</label>
            <input name="problemDesc" value={formData.problemDesc} onChange={handleInput}
              required disabled={isEditMode && !isEditingEnabled} />

            <label>Assignee</label>
            <input name="assignee" value={formData.assignee} onChange={handleInput}
              required disabled={isEditMode && !isEditingEnabled} />

            <label>Reporter</label>
            <input name="reporter" value={formData.reporter} onChange={handleInput}
              required disabled={isEditMode && !isEditingEnabled} />

            <label>Priority</label>
            <select name="priority" value={formData.priority} onChange={handleInput}
              required disabled={isEditMode && !isEditingEnabled}>
              <option value="">Select</option><option value="low">Low</option>
              <option value="medium">Medium</option><option value="high">High</option>
            </select>

            <label>Comment</label>
            <input name="comment" value={formData.comment} onChange={handleInput}
              required disabled={isEditMode && !isEditingEnabled} />

            {!isEditMode
              ? <button type="submit">Submit Ticket</button>
              : isEditingEnabled && (
                <button type="button" onClick={()=>{
                  setTicketList(list=>list.map(t=>
                    t.ids===editingTicket.ids
                      ? {...t, ...formData, comment:[formData.comment]}
                      : t
                  ));
                  setMessage('✅ Ticket updated!');
                  setView('view');
                  setIsEditMode(false);
                  setEditingTicket(null);
                  setIsEditingEnabled(false);
                  clearForm();
                }}>Save</button>
              )
            }
          </form>
        )}

        {/* VIEW */}
        {view==='view' && (
          <div className="ticket-view">
            <h2>All Tickets</h2>
            <table>
              <thead><tr>
                <th>ID</th><th>IDs</th><th>Status</th><th>Assignee</th>
                <th>Reporter</th><th>Priority</th><th>Comment</th>
                <th>Short Desc</th><th>Problem Desc</th>
              </tr></thead>
              <tbody>
                {ticketList.map((ticket,i)=>(
                  <tr key={i}>
                    <td>{ticket.id}</td>
                    <td style={cancelledTickets.includes(ticket.ids)?{backgroundColor:'#ccc'}:{}}>
                      {cancelledTickets.includes(ticket.ids)
                        ? <span style={{color:'#999',pointerEvents:'none',cursor:'not-allowed'}}>{ticket.ids}</span>
                        : <a href="#" onClick={e=>{
                            e.preventDefault();
                            setView('create');
                            setEditingTicket(ticket);
                            setFormData({
                              shortDesc:ticket.shortDesc,
                              problemDesc:ticket.problemDesc,
                              assignee:ticket.assignee,
                              reporter:ticket.reporter,
                              priority:ticket.priority,
                              comment:ticket.comment.join(', ')
                            });
                            setIsEditMode(true);
                            setIsEditingEnabled(false);
                          }}>{ticket.ids}</a>
                      }
                    </td>
                    <td>{ticket.status}</td>
                    <td>{ticket.assignee}</td>
                    <td>{ticket.reporter}</td>
                    <td>{ticket.priority}</td>
                    <td>{ticket.comment.join(', ')}</td>
                    <td>{ticket.shortDesc}</td>
                    <td>{ticket.problemDesc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* DELETE */}
        {view==='delete' && (
          <form onSubmit={handleDelete} className="ticket-delete">
            <label>Enter Ticket IDS (e.g., INC12345)</label>
            <input value={deleteId} onChange={e=>setDeleteId(e.target.value)} required />
            <button type="submit">Delete Ticket</button>
          </form>
        )}
      </div>
    </div>
  );
}

export default App;
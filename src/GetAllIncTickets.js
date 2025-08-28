import React, { useEffect, useState } from 'react';

const apiBase = 'http://localhost:8080/api/incidents';

export default function GetAllIncidentTickets({ forceReloadKey, onEditClick }) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchTickets = async (signal) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${apiBase}/getAllIncidentTickets`, { signal });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();
      setTickets(Array.isArray(data) ? data : []);
    } catch (err) {
      if (err.name !== 'AbortError') setError('⚠️ Failed to fetch incident tickets.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    fetchTickets(controller.signal);
    return () => controller.abort();
  }, []);

  useEffect(() => {
    setError('');
    const controller = new AbortController();
    if (forceReloadKey !== undefined) fetchTickets(controller.signal);
    return () => controller.abort();
  }, [forceReloadKey]);

  useEffect(() => {
    if (!error) return;
    const t = setTimeout(() => setError(''), 5000);
    return () => clearTimeout(t);
  }, [error]);

  return (
    <div className="tickets-wrapper">
      <h2>All Incident Tickets</h2>
      {error && <div className="message" style={{ background:'#fdecea', color:'#611a15' }}>{error}</div>}

      {loading ? <div>Loading…</div> :
        <table className="tickets-table">
          <thead>
            <tr>
              <th>Ticket Number</th>
              <th>Status</th>
              <th>On Behalf Of</th>
              <th>Support Agreement</th>
              <th>Configuration Item</th>
              <th>Platform</th>
              <th>Category</th>
              <th>Subcategory</th>
              <th>Impacted LOB</th>
              <th>JIRA Ref</th>
              <th>Short Description</th>
              <th>Description</th>
              <th>Created By</th>
              <th>Created Date</th>
              <th>Last Modified Date</th>
              <th>Impact</th>
              <th>Urgency</th>
              <th>Priority</th>
              <th>Assigned Group</th>
              <th>Assigned To</th>
              <th>Reported By</th>
              <th>Regulatory Impact</th>
              <th>Total Impact Duration</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {tickets.length === 0 ? (
              <tr><td colSpan="23" style={{ textAlign:'center' }}>No tickets found.</td></tr>
            ) : tickets.map(ticket => (
              <tr key={ticket.id}>
                <td>
                  <a href="#" className="id-link" onClick={() => onEditClick(ticket)}>
                    {ticket.ticketNumber}
                  </a>
                </td>
                <td>{ticket.status}</td>
                <td>{ticket.onBehalfOf}</td>
                <td>{ticket.supportAgreementName}</td>
                <td>{ticket.configurationItem}</td>
                <td>{ticket.platform}</td>
                <td>{ticket.category}</td>
                <td>{ticket.subcategory}</td>
                <td>{ticket.impactedLOB}</td>
                <td>{ticket.jiraReference}</td>
                <td>{ticket.shortDescription}</td>
                <td>{ticket.description}</td>
                <td>{ticket.createdBy}</td>
                <td>{ticket.createdDate}</td>
                <td>{ticket.lastModifiedDate}</td>
                <td>{ticket.impact}</td>
                <td>{ticket.urgency}</td>
                <td>{ticket.priority}</td>
                <td>{ticket.assignedGroup}</td>
                <td>{ticket.assignedTo}</td>
                <td>{ticket.reportedBy}</td>
                <td>{ticket.regulatoryImpact}</td>
                <td>{ticket.totalImpactDuration}</td>
                <td>{ticket.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      }
    </div>
  );
}

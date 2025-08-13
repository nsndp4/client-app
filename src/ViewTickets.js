// ViewTickets.jsx
import React, { useEffect, useState } from 'react';

const apiBase = 'http://localhost:8080/api/v1/tickets';

export default function ViewTickets({ forceReloadKey }) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  const fetchTickets = async (signal) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(
        `${apiBase}/displaysCertainNumberOfTicketsBasedOnPageNumber`,
        { signal }
      );
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();

      const extras = JSON.parse(localStorage.getItem('ticketExtras') || '{}');

      const normalized = (Array.isArray(data) ? data : []).map((raw) => {
        const val = (obj, keys, fb = '') => {
          for (const k of keys) {
            if (obj && obj[k] !== undefined && obj[k] !== null && obj[k] !== '') return obj[k];
          }
          return fb;
        };

        const id = val(raw, ['ticketsIds','TicketIds','ticketIds','ids']);
        const local = id ? extras[id] || {} : {};

        // Normalize comments from server/local to a single display string.
        // Accept shapes: ["a","b"] OR [{comment:"a"},{comment:"b"}] OR "a, b"
        const normalizeComments = (v) => {
          if (Array.isArray(v)) {
            return v.map(item =>
              typeof item === 'string'
                ? item
                : (item && typeof item.comment === 'string' ? item.comment : '')
            ).filter(Boolean).join(', ');
          }
          return typeof v === 'string' ? v : '';
        };

        const serverCommentsRaw =
          raw?.comments ?? raw?.comment ?? raw?.Comments ?? raw?.Comment ?? '';
        const localCommentsRaw = local?.comments ?? '';

        const commentsStr =
          normalizeComments(serverCommentsRaw) || normalizeComments(localCommentsRaw);

        return {
          ticketsIds:       id || '',
          createdDate:      val(raw, ['createdDate','created','created_at'], local.createdDate || ''),
          reportedBy:       val(raw, ['reportedBy','ReportedBy','reporter'], local.reportedBy || ''),
          shortDescription: val(raw, ['shortDescription','shortDesc','short_description'], local.shortDescription || ''),
          description:      val(raw, ['description','Description','desc','problemDesc'], local.description || ''),
          priority:         val(raw, ['priority'], local.priority || ''),
          severity:         val(raw, ['severity'], local.severity || ''),
          status:           val(raw, ['status','Status'], local.status || ''), // backend-owned ideally
          assignedTo:       val(raw, ['assignedTo','assignee','AssignedTo'], local.assignedTo || ''),
          comments:         commentsStr || '',
          appName:          val(raw, ['appName','configurationItem','configurationitem'], local.appName || ''),
        };
      });

      setTickets(normalized);
    } catch (err) {
      if (err.name !== 'AbortError') setError('⚠️ Failed to fetch tickets.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch on mount with abort safety
  useEffect(() => {
    const controller = new AbortController();
    fetchTickets(controller.signal);
    return () => controller.abort();
  }, []);

  // Refetch when parent bumps key
  useEffect(() => {
    const controller = new AbortController();
    if (forceReloadKey !== undefined) fetchTickets(controller.signal);
    return () => controller.abort();
  }, [forceReloadKey]);

  // Auto-hide local error after 5s
  useEffect(() => {
    if (!error) return;
    const t = setTimeout(() => setError(''), 5000);
    return () => clearTimeout(t);
  }, [error]);

  return (
    <div className="ticket-view">
      <h2>All Tickets</h2>

      {error && (
        <div className="message" style={{ background:'#fdecea', color:'#611a15' }}>
          {error}
        </div>
      )}

      {loading ? (
        <div>Loading…</div>
      ) : (
        <div className="tickets-table-scroll">
          <table className="tickets-table">
            <colgroup>
              <col style={{ width: '10%' }} />
              <col style={{ width: '12%' }} />
              <col style={{ width: '10%' }} />
              <col style={{ width: '12%' }} />
              <col style={{ width: '16%' }} />
              <col style={{ width: '7%'  }} />
              <col style={{ width: '7%'  }} />
              <col style={{ width: '8%'  }} />
              <col style={{ width: '10%' }} />
              <col style={{ width: '16%' }} />
              <col style={{ width: '12%' }} />
            </colgroup>

            <thead>
              <tr>
                <th>ticketsIds</th>
                <th>createdDate</th>
                <th>reportedBy</th>
                <th>shortDescription</th>
                <th>description</th>
                <th>priority</th>
                <th>severity</th>
                <th>status</th>
                <th>assignedTo</th>
                <th>comments</th>
                <th>appName</th>
              </tr>
            </thead>

            <tbody>
              {tickets.length === 0 ? (
                <tr>
                  <td colSpan="11" style={{ textAlign: 'center' }}>No tickets found.</td>
                </tr>
              ) : (
                tickets.map((t, idx) => (
                  <tr key={idx}>
                    <td>{t.ticketsIds || '-'}</td>
                    <td>{t.createdDate || '-'}</td>
                    <td>{t.reportedBy || '-'}</td>
                    <td>{t.shortDescription || '-'}</td>
                    <td>{t.description || '-'}</td>
                    <td>{t.priority || '-'}</td>
                    <td>{t.severity || '-'}</td>
                    <td>{t.status || '-'}</td>
                    <td>{t.assignedTo || '-'}</td>
                    <td>{t.comments || '-'}</td>
                    <td>{t.appName || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

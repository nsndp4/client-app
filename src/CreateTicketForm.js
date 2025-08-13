// CreateTicketForm.jsx
import React, { useState } from 'react';

const apiBase = 'http://localhost:8080/api/v1/tickets';

/**
 * Collects (all required in UI, except server-set fields):
 * - reportedBy, shortDescription, description, priority(P4..P1),
 *   severity(high/medium/low), assignedTo, comments, appName
 *
 * Server sets:
 * - ticketsIds, createdDate, status
 *
 * Backend payload (compatible with your model),
 * NOTE: 'comments' is now an array of objects: [{comment:"..."}]
 *   reporter     <- reportedBy
 *   shortDesc    <- shortDescription
 *   problemDesc  <- description
 *   assignee     <- assignedTo
 *   priority     <- priority
 *   comments     <- [{ comment: "..." }, ...]
 */
export default function CreateTicketForm({ onCreated, setMessage }) {
  // Form state (status REMOVED — backend will set it)
  const [reportedBy, setReportedBy]               = useState('');
  const [shortDescription, setShortDescription]   = useState('');
  const [description, setDescription]             = useState('');
  const [priority, setPriority]                   = useState('');
  const [severity, setSeverity]                   = useState('');
  const [assignedTo, setAssignedTo]               = useState('');
  const [comments, setComments]                   = useState('');  // comma-separated entry
  const [appName, setAppName]                     = useState('');

  const [submitting, setSubmitting]               = useState(false);
  const [errors, setErrors]                       = useState({});

  const notify = (msg) => setMessage?.(msg);

  const validate = () => {
    const next = {};
    if (!reportedBy.trim())       next.reportedBy       = 'Reported By is required';
    if (!shortDescription.trim()) next.shortDescription = 'Short Description is required';
    if (!description.trim())      next.description      = 'Description is required';
    if (!priority)                next.priority         = 'Priority is required';
    if (!severity)                next.severity         = 'Severity is required';
    if (!assignedTo.trim())       next.assignedTo       = 'Assigned To is required';
    if (!comments.trim())         next.comments         = 'Comments are required';
    if (!appName)                 next.appName          = 'App name is required';

    setErrors(next);
    if (Object.keys(next).length) {
      notify('⚠️ Please fill all required fields.');
      return false;
    }
    return true;
  };

  const clearForm = () => {
    setReportedBy('');
    setShortDescription('');
    setDescription('');
    setPriority('');
    setSeverity('');
    setAssignedTo('');
    setComments('');
    setAppName('');
    setErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);

    // Build comments as array of objects: [{comment:"..."}]
    const commentsArr = comments
      .split(',')
      .map(s => s.trim())
      .filter(Boolean)
      .map(text => ({ comment: text }));

    // Backend payload: only fields the server knows (status/ticketsIds/createdDate set server-side)
    const payload = {
      reportedBy: reportedBy,
      shortDescription: shortDescription,
      description: description,
      priority: priority,
      severity:severity,
      assignedTo: assignedTo,
      comments: commentsArr, // <- array of objects
      // severity/appName are not sent if backend doesn't support them yet
      appName:appName
    };

    try {
      const res = await fetch(`${apiBase}/createNewTicket`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        notify('❌ Failed to create ticket.');
        return;
      }

      const created = await res.json().catch(() => null);

      // Persist "extras" locally so View can display full columns even if backend doesn't store them yet
      if (created) {
        const id =
          created.ticketsIds || created.TicketIds || created.ticketIds || created.ids;

        if (id) {
          const extras = JSON.parse(localStorage.getItem('ticketExtras') || '{}');
          extras[id] = {
            createdDate: created.createdDate || new Date().toISOString(),
            reportedBy,
            shortDescription,
            description,
            priority,
            severity,
            assignedTo,
            comments: commentsArr, // keep same array-of-objects shape
            appName
          };
          localStorage.setItem('ticketExtras', JSON.stringify(extras));
        }
      }

      notify('✅ Ticket created successfully!');
      clearForm();
      onCreated?.();
    } catch (err) {
      notify('⚠️ Error occurred while creating ticket.');
    } finally {
      setSubmitting(false);
    }
  };

  const FieldError = ({ name }) =>
    errors[name] ? (
      <div style={{ color: '#c0392b', fontSize: '0.85rem', marginTop: '0.25rem' }}>
        {errors[name]}
      </div>
    ) : null;

  return (
    <form onSubmit={handleSubmit} noValidate>
      <label>Reported By *</label>
      <input
        type="text"
        value={reportedBy}
        onChange={(e) => { setReportedBy(e.target.value); if (errors.reportedBy) setErrors(p=>({...p,reportedBy:undefined})); }}
        aria-invalid={!!errors.reportedBy}
      />
      <FieldError name="reportedBy" />

      <label>shortDescription *</label>
      <input
        type="text"
        value={shortDescription}
        onChange={(e) => { setShortDescription(e.target.value); if (errors.shortDescription) setErrors(p=>({...p,shortDescription:undefined})); }}
        aria-invalid={!!errors.shortDescription}
      />
      <FieldError name="shortDescription" />

      <label>description *</label>
      <input
        type="text"
        value={description}
        onChange={(e) => { setDescription(e.target.value); if (errors.description) setErrors(p=>({...p,description:undefined})); }}
        aria-invalid={!!errors.description}
      />
      <FieldError name="description" />

      <label>priority *</label>
      <select
        value={priority}
        onChange={(e) => { setPriority(e.target.value); if (errors.priority) setErrors(p=>({...p,priority:undefined})); }}
        aria-invalid={!!errors.priority}
      >
        <option value="">Select</option>
        <option value="P4">P4</option>
        <option value="P3">P3</option>
        <option value="P2">P2</option>
        <option value="P1">P1</option>
      </select>
      <FieldError name="priority" />

      <label>severity *</label>
      <select
        value={severity}
        onChange={(e) => { setSeverity(e.target.value); if (errors.severity) setErrors(p=>({...p,severity:undefined})); }}
        aria-invalid={!!errors.severity}
      >
        <option value="">Select</option>
        <option value="high">high</option>
        <option value="medium">medium</option>
        <option value="low">low</option>
      </select>
      <FieldError name="severity" />

      <label>assignedTo *</label>
      <input
        type="text"
        value={assignedTo}
        onChange={(e) => { setAssignedTo(e.target.value); if (errors.assignedTo) setErrors(p=>({...p,assignedTo:undefined})); }}
        aria-invalid={!!errors.assignedTo}
      />
      <FieldError name="assignedTo" />

      <label>comments (comma separated) *</label>
      <input
        type="text"
        value={comments}
        onChange={(e) => { setComments(e.target.value); if (errors.comments) setErrors(p=>({...p,comments:undefined})); }}
        aria-invalid={!!errors.comments}
        placeholder="e.g., first note, second note"
      />
      <FieldError name="comments" />

      <label>appName *</label>
      <select
        value={appName}
        onChange={(e) => { setAppName(e.target.value); if (errors.appName) setErrors(p=>({...p,appName:undefined})); }}
        aria-invalid={!!errors.appName}
      >
        <option value="">Select</option>
        <option value="Frontend">Frontend</option>
        <option value="Backend">Backend</option>
        <option value="Network">Network</option>
        <option value="Service">Service</option>
      </select>
      <FieldError name="appName" />

      <button type="submit" disabled={submitting}>
        {submitting ? 'Submitting…' : 'Submit Ticket'}
      </button>
    </form>
  );
}

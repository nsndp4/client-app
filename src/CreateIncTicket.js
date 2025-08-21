import React, { useState, useEffect } from 'react';
import './App.css';

const apiBase = 'http://localhost:8080/api/incidents';

export default function CreateIncidentTicket({ onCreated, setMessage, incidentData }) {
  const initialForm = {
    ticketNumber: '',
    status: 'New',
    onBehalfOf: '',
    supportAgreementName: '',
    configurationItem: '',
    platform: '',
    category: '',
    subcategory: '',
    impactedLOB: '',
    jiraReference: '',
    shortDescription: '',
    description: '',
    createdBy: '',
    createdDate: '',
    impact: '',
    urgency: '',
    priority: '',
    assignedGroup: '',
    assignedTo: '',
    reportedBy: '',
    regulatoryImpact: '',
    totalImpactDuration: '',
    notes: ''
  };

  const configurationOptions = ['Frontend', 'Backend', 'Network', 'Service'];
  const impactOptions = ['High', 'Medium', 'Low'];
  const priorityOptions = ['P4', 'P3', 'P2', 'P1'];
  const urgencyOptions = ['High', 'Medium', 'Low'];
  const allStates = ['New', 'InProgress', 'OnHold', 'Resolved', 'Closed', 'Canceled'];

  const nonEditableFieldsInEdit = [
    'onBehalfOf', 'platform', 'impactedLOB', 'impact', 'regulatoryImpact',
    'supportAgreementName', 'category', 'jiraReference', 'urgency',
    'totalImpactDuration', 'configurationItem', 'subcategory', 'createdBy',
    'priority', 'reportedBy','createdDate'
  ];

  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [editable, setEditable] = useState(true);

  useEffect(() => {
    if (incidentData) {
      setForm({ ...incidentData });
      setEditable(false);
    } else {
      setForm(initialForm);
      setEditable(true);
    }
  }, [incidentData]);

  const notify = (msg) => setMessage?.(msg);

  const validate = () => {
    const next = {};
    const requiredFields = ['onBehalfOf','configurationItem','category','subcategory','shortDescription','assignedTo','assignedGroup','createdBy'];
    requiredFields.forEach(f => {
      if (!form[f]?.trim()) next[f] = `${f} is required`;
    });
    setErrors(next);
    if (Object.keys(next).length) {
      notify('⚠️ Please fill all required fields.');
      return false;
    }
    return true;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(p => ({ ...p, [name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const res = await fetch(`${apiBase}/createIncidentTicket`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (!res.ok) {
        notify('❌ Failed to save incident ticket.');
        return;
      }
      await res.json();
      onCreated?.();
    } catch (err) {
      notify('⚠️ Error occurred while saving incident ticket.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = () => setEditable(true);
  const handleCancel = () => onCreated?.();

  const isStateSelectable = (stateOption) => {
    const current = form.status;

    if (!editable) return false;

    if (current === "Closed" || current === "Canceled") {
      return stateOption === current;
    }

    if (current === "Resolved") {
      return ["Resolved", "Closed", "Canceled"].includes(stateOption);
    }

    const currentIndex = allStates.indexOf(current);
    const optionIndex = allStates.indexOf(stateOption);

    if (current === "OnHold") {
      return optionIndex <= currentIndex || optionIndex === currentIndex + 1;
    }

    return optionIndex >= currentIndex && optionIndex <= currentIndex + 1;
  };

  const fullWidthFields = ['shortDescription', 'description', 'notes'];

  const formatLabel = (key) => {
    if(key==="impactedLOB") return "Impacted LOB";
    return key
      .replace(/([A-Z])/g, ' $1')
      .trim()
      .split(' ')
      .map(word => word.toUpperCase() === "LOB" ? "LOB" : word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const renderField = (key) => {
    const isDisabled = !editable || (incidentData && nonEditableFieldsInEdit.includes(key));

    if (key === 'configurationItem') {
      return (
        <select name={key} value={form[key]} onChange={handleChange} disabled={isDisabled} className="animated-input">
          <option value="">-- Select --</option>
          {configurationOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      );
    }
    if (key === 'impact') {
      return (
        <select name={key} value={form[key]} onChange={handleChange} disabled={isDisabled} className="animated-input">
          <option value="">-- Select --</option>
          {impactOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      );
    }
    if (key === 'priority') {
      return (
        <select name={key} value={form[key]} onChange={handleChange} disabled={isDisabled} className="animated-input">
          <option value="">-- Select --</option>
          {priorityOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      );
    }
    if (key === 'urgency') {
      return (
        <select name={key} value={form[key]} onChange={handleChange} disabled={isDisabled} className="animated-input">
          <option value="">-- Select --</option>
          {urgencyOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      );
    }

    return (
      <input type="text" name={key} value={form[key]} onChange={handleChange} disabled={isDisabled} className="animated-input"/>
    );
  };

  return (
    <div>
      {incidentData && (
        <div className="actions-bar">
          <button type="button" onClick={handleEdit}>Edit</button>
          <button type="button" onClick={handleCancel}>Cancel</button>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        {incidentData && (
          <>
            <div className="state-header">
              {allStates.map((state, index) => {
                const selectable = isStateSelectable(state);
                return (
                  <React.Fragment key={state}>
                    <span
                      className={`state-item ${form.status === state ? "active" : ""} ${!selectable ? "disabled" : ""}`}
                      onClick={() => selectable && setForm(prev => ({ ...prev, status: state }))}
                    >
                      {state}
                    </span>
                    {index < allStates.length - 1 && <span className="arrow">→</span>}
                  </React.Fragment>
                );
              })}
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label>Ticket Number</label>
              <input type="text" name="ticketNumber" value={form.ticketNumber} disabled />
            </div>
          </>
        )}

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '1rem 2rem',
          alignItems: 'center',
        }}>
          {Object.keys(form)
            .filter(
              k => 
                !fullWidthFields.includes(k) && 
                k !=='id' &&
                k !== 'ticketNumber' && 
                k !== 'status' &&
                (incidentData?true:k!=='createdDate')
              )
            .map((key) => (
              <React.Fragment key={key}>
                <label style={{ textAlign: 'right' }}>
                  {formatLabel(key)}{['onBehalfOf','configurationItem','category','subcategory','assignedTo'].includes(key) ? '*' : ''}
                </label>
                <div>
                  {renderField(key)}
                  {errors[key] && (
                    <div style={{ color: '#c0392b', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                      {errors[key]}
                    </div>
                  )}
                </div>
              </React.Fragment>
            ))}

          {fullWidthFields.map((key) => (
            <React.Fragment key={key}>
              <label style={{ gridColumn: '1 / -1' }}>{formatLabel(key)}{key==='shortDescription'?'*':''}</label>
              <div style={{ gridColumn: '1 / -1' }}>
                <textarea
                  name={key}
                  value={form[key]}
                  onChange={handleChange}
                  disabled={!editable}
                  rows={key==='notes'?4:3}
                  className="animated-input"
                />
                {errors[key] && (
                  <div style={{ color: '#c0392b', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                    {errors[key]}
                  </div>
                )}
              </div>
            </React.Fragment>
          ))}
        </div>

        <div style={{ marginTop: '1.5rem' }}>
          <button type="submit" disabled={submitting || !editable}>
            {submitting ? 'Submitting…' : 'Save Incident Ticket'}
          </button>
        </div>
      </form>
    </div>
  );
}

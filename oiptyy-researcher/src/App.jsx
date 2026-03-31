import React, { useState, useEffect, useRef } from 'react'

// ─── Styles ───────────────────────────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: 'Inter', system-ui, sans-serif;
    background: #0B2239;
    color: #D6E1EA;
    -webkit-font-smoothing: antialiased;
  }

  .layout { display: flex; min-height: 100vh; }

  /* ── Sidebar ── */
  .sidebar {
    width: 232px; flex-shrink: 0;
    background: #0B2239;
    border-right: 1px solid rgba(255,255,255,0.06);
    display: flex; flex-direction: column;
    position: fixed; top: 0; left: 0; bottom: 0;
    z-index: 100;
  }

  .sidebar-logo {
    padding: 28px 24px 24px;
    border-bottom: 1px solid rgba(255,255,255,0.06);
    display: flex; align-items: center; gap: 10px;
  }
  .logo-shield {
    width: 30px; height: 30px;
    background: linear-gradient(135deg, #19C37D, #1FB6A6);
    border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .logo-wordmark {
    font-size: 16px; font-weight: 700;
    letter-spacing: 0.04em;
    color: #D6E1EA;
  }
  .logo-wordmark span { color: #19C37D; }

  .sidebar-nav { padding: 16px 12px; flex: 1; }

  .nav-section {
    font-size: 10px; font-weight: 600;
    color: #2a4a62;
    letter-spacing: 0.1em; text-transform: uppercase;
    padding: 0 12px;
    margin-bottom: 8px; margin-top: 20px;
  }
  .nav-section:first-child { margin-top: 0; }

  .nav-item {
    display: flex; align-items: center; gap: 10px;
    padding: 9px 12px;
    font-size: 13.5px; font-weight: 500; color: #9FB3C8;
    cursor: pointer; border: none; background: none;
    width: 100%; text-align: left;
    transition: all 0.15s;
    border-radius: 8px;
    font-family: 'Inter', sans-serif;
    letter-spacing: -0.1px;
    position: relative;
  }
  .nav-item:hover { color: #D6E1EA; background: rgba(255,255,255,0.04); }
  .nav-item.active { color: #D6E1EA; background: rgba(25,195,125,0.1); }
  .nav-item.active::before {
    content: '';
    position: absolute; left: 0; top: 50%;
    transform: translateY(-50%);
    width: 3px; height: 16px;
    background: linear-gradient(180deg, #19C37D, #1FB6A6);
    border-radius: 0 2px 2px 0;
  }
  .nav-item svg { opacity: 0.55; flex-shrink: 0; }
  .nav-item.active svg { opacity: 1; color: #19C37D; }
  .nav-item:hover svg { opacity: 0.8; }

  .sidebar-footer {
    padding: 16px 24px;
    border-top: 1px solid rgba(255,255,255,0.06);
  }
  .connection-status {
    display: flex; align-items: center; gap: 8px;
    font-size: 12px; color: #2a4a62;
  }
  .status-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }

  /* ── Main ── */
  .main { margin-left: 232px; flex: 1; min-height: 100vh; background: #0D2540; }
  .page { padding: 48px 52px; max-width: 980px; }

  .page-header { margin-bottom: 36px; }
  .page-title { font-size: 24px; font-weight: 700; color: #D6E1EA; letter-spacing: -0.5px; margin-bottom: 6px; }
  .page-sub { font-size: 13.5px; color: #9FB3C8; line-height: 1.6; }

  /* ── Cards ── */
  .card {
    background: #0F2A44;
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 14px; padding: 24px;
    margin-bottom: 16px;
  }
  .card-sm { padding: 16px 20px; }
  .card-header {
    font-size: 11px; font-weight: 600; color: #19C37D;
    text-transform: uppercase; letter-spacing: 0.09em;
    margin-bottom: 20px;
    display: flex; align-items: center; gap: 8px;
  }
  .card-header::before {
    content: '';
    width: 3px; height: 14px;
    background: linear-gradient(180deg, #19C37D, #1FB6A6);
    border-radius: 2px;
  }

  /* ── Upload ── */
  .upload-zone {
    border: 1.5px dashed rgba(255,255,255,0.1);
    border-radius: 14px; padding: 52px 32px; text-align: center;
    cursor: pointer; transition: all 0.2s; margin-bottom: 24px;
    background: rgba(255,255,255,0.01);
  }
  .upload-zone:hover, .upload-zone.drag {
    border-color: #19C37D;
    background: rgba(25,195,125,0.04);
  }
  .upload-icon { font-size: 36px; margin-bottom: 16px; opacity: 0.5; }
  .upload-zone p { font-size: 14px; color: #9FB3C8; line-height: 1.7; }
  .upload-zone strong { color: #D6E1EA; font-weight: 600; }
  .upload-zone code {
    font-family: 'JetBrains Mono', 'DM Mono', monospace; font-size: 12px;
    color: #19C37D; background: rgba(25,195,125,0.1);
    padding: 2px 7px; border-radius: 4px;
  }

  /* ── Stats ── */
  .stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 28px; }
  .stat-card {
    background: #0F2A44; border: 1px solid rgba(255,255,255,0.07);
    border-radius: 12px; padding: 18px 20px; transition: border-color 0.2s;
  }
  .stat-card:hover { border-color: rgba(25,195,125,0.18); }
  .stat-value { font-size: 28px; font-weight: 700; color: #D6E1EA; letter-spacing: -0.8px; line-height: 1; }
  .stat-label { font-size: 12px; color: #9FB3C8; margin-top: 6px; }

  /* ── Buttons ── */
  .btn {
    display: inline-flex; align-items: center; gap: 7px;
    padding: 10px 18px; border-radius: 9px;
    font-size: 13.5px; font-weight: 500;
    cursor: pointer; border: none;
    font-family: 'Inter', sans-serif;
    transition: all 0.15s; letter-spacing: -0.1px; white-space: nowrap;
  }
  .btn:active { transform: scale(0.98); }
  .btn:disabled { opacity: 0.35; cursor: not-allowed; transform: none; }

  .btn-primary {
    background: linear-gradient(135deg, #19C37D, #1FB6A6);
    color: #fff;
    box-shadow: 0 1px 12px rgba(25,195,125,0.25);
  }
  .btn-primary:hover:not(:disabled) { box-shadow: 0 1px 20px rgba(25,195,125,0.4); opacity: 0.95; }

  .btn-ghost {
    background: rgba(255,255,255,0.04); color: #9FB3C8;
    border: 1px solid rgba(255,255,255,0.09);
  }
  .btn-ghost:hover:not(:disabled) {
    background: rgba(255,255,255,0.07); color: #D6E1EA;
    border-color: rgba(255,255,255,0.13);
  }

  /* ── Badge ── */
  .badge { display: inline-flex; align-items: center; gap: 5px; font-size: 11px; font-weight: 500; padding: 3px 10px; border-radius: 20px; }
  .badge-pending  { background: rgba(255,255,255,0.04); color: #2a4a62; }
  .badge-working  { background: rgba(251,191,36,0.1);   color: #fbbf24; }
  .badge-done     { background: rgba(25,195,125,0.1);   color: #19C37D; }
  .badge-error    { background: rgba(239,68,68,0.1);    color: #f87171; }
  .badge-synced   { background: rgba(31,182,166,0.12);  color: #1FB6A6; }

  /* ── Progress ── */
  .progress-track { height: 3px; background: rgba(255,255,255,0.06); border-radius: 2px; margin: 14px 0 8px; overflow: hidden; }
  .progress-fill { height: 100%; background: linear-gradient(90deg, #19C37D, #1FB6A6); border-radius: 2px; transition: width 0.4s ease; }
  .progress-label { font-size: 12px; color: #2a4a62; font-family: 'JetBrains Mono', monospace; }

  /* ── Company cards ── */
  .company-card {
    background: #0F2A44; border: 1px solid rgba(255,255,255,0.07);
    border-radius: 12px; margin-bottom: 10px; overflow: hidden; transition: border-color 0.2s;
  }
  .company-card:hover { border-color: rgba(255,255,255,0.1); }
  .company-card.active { border-color: rgba(25,195,125,0.22); }

  .company-card-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 16px 20px; cursor: pointer;
  }
  .company-card-header:hover { background: rgba(255,255,255,0.02); }

  .company-name { font-size: 14px; font-weight: 600; color: #D6E1EA; }
  .company-email { font-size: 12px; color: #2a4a62; margin-top: 3px; font-family: 'JetBrains Mono', 'DM Mono', monospace; }
  .company-card-body { padding: 0 20px 20px; border-top: 1px solid rgba(255,255,255,0.05); }

  .research-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 16px; }
  .research-block {
    background: rgba(11,34,57,0.7); border: 1px solid rgba(255,255,255,0.05);
    border-radius: 10px; padding: 12px 14px;
  }
  .research-label { font-size: 10px; font-weight: 600; color: #2a4a62; text-transform: uppercase; letter-spacing: 0.09em; margin-bottom: 7px; }
  .research-value { font-size: 12.5px; color: #9FB3C8; line-height: 1.65; }

  .email-angle-block {
    margin-top: 12px; background: rgba(25,195,125,0.05);
    border: 1px solid rgba(25,195,125,0.14); border-radius: 10px; padding: 14px 16px;
  }
  .email-angle-label { font-size: 10px; font-weight: 600; color: #19C37D; text-transform: uppercase; letter-spacing: 0.09em; margin-bottom: 7px; }
  .email-angle-value { font-size: 13px; color: #a7f3d0; line-height: 1.7; }
  .card-actions { display: flex; gap: 8px; margin-top: 16px; align-items: center; }

  /* ── Spinner ── */
  .spinner { width: 12px; height: 12px; border: 1.5px solid currentColor; border-top-color: transparent; border-radius: 50%; animation: spin 0.65s linear infinite; display: inline-block; flex-shrink: 0; }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* ── Settings ── */
  .setting-row { display: flex; flex-direction: column; gap: 7px; margin-bottom: 22px; }
  .setting-label { font-size: 13px; font-weight: 600; color: #D6E1EA; }
  .setting-desc { font-size: 12px; color: #9FB3C8; line-height: 1.5; }
  .setting-input {
    background: rgba(11,34,57,0.8); border: 1px solid rgba(255,255,255,0.09);
    border-radius: 9px; padding: 10px 14px;
    font-size: 13px; color: #D6E1EA;
    font-family: 'JetBrains Mono', 'DM Mono', monospace;
    width: 100%; max-width: 480px; outline: none; transition: border-color 0.15s;
  }
  .setting-input:focus { border-color: #19C37D; }
  .setting-input::placeholder { color: #2a4a62; }
  .setting-divider { height: 1px; background: rgba(255,255,255,0.06); margin: 24px 0; }
  .code-block {
    font-family: 'JetBrains Mono', 'DM Mono', monospace; font-size: 12px; color: #9FB3C8;
    background: rgba(11,34,57,0.8); border: 1px solid rgba(255,255,255,0.06);
    border-radius: 8px; padding: 12px 14px; max-width: 480px; line-height: 1.7;
  }

  /* ── Toast ── */
  .toast-wrap { position: fixed; bottom: 24px; right: 24px; z-index: 999; display: flex; flex-direction: column; gap: 8px; }
  .toast {
    background: #132F4B; border: 1px solid rgba(255,255,255,0.09);
    border-radius: 10px; padding: 12px 16px; font-size: 13px; color: #D6E1EA;
    max-width: 320px; animation: slideUp 0.2s ease; box-shadow: 0 4px 24px rgba(0,0,0,0.4);
  }
  .toast.success { border-color: rgba(25,195,125,0.3);  color: #19C37D; }
  .toast.error   { border-color: rgba(239,68,68,0.3);   color: #f87171; }
  @keyframes slideUp { from { opacity:0; transform: translateY(10px); } to { opacity:1; transform: translateY(0); } }

  .row { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
  .mt8  { margin-top: 8px;  }
  .mt16 { margin-top: 16px; }
  .mt24 { margin-top: 24px; }

  select.setting-input { cursor: pointer; }
  select.setting-input option { background: #0F2A44; color: #D6E1EA; }
`

// ─── Storage ──────────────────────────────────────────────────────────────────
const SETTINGS_KEY  = 'oiptyy_settings'
const COMPANIES_KEY = 'oiptyy_companies'
const PIPELINES_KEY = 'oiptyy_pipelines'

function load(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key) || 'null') ?? fallback }
  catch { return fallback }
}
function save(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)) } catch {}
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function parseCSV(text) {
  const lines = text.trim().split('\n').filter(l => l.trim())
  if (lines.length < 2) return null
  const headers  = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/['"]/g, ''))
  const nameIdx  = headers.findIndex(h => h.includes('company') || h.includes('name'))
  const emailIdx = headers.findIndex(h => h.includes('email'))
  if (nameIdx === -1 || emailIdx === -1) return null
  return lines.slice(1).map((line, i) => {
    const cols = line.split(',').map(c => c.trim().replace(/^"|"$/g, ''))
    return { id: i, name: cols[nameIdx] || '', email: cols[emailIdx] || '', status: 'pending', data: null, ghlStatus: null }
  }).filter(r => r.name && r.email)
}

function exportCSV(results) {
  const headers = ['company_name','email','industry','pain_points','tech_stack','recent_news','email_angle','ghl_status']
  const rows = results.filter(r => r.data).map(r => {
    const d = r.data
    return [r.name, r.email, d.industry||'', d.pain_points||'', d.tech_stack||'', d.recent_news||'', d.email_angle||'', r.ghlStatus||'']
      .map(v => `"${String(v).replace(/"/g,'""')}"`).join(',')
  })
  const blob = new Blob([[headers.join(','), ...rows].join('\n')], { type: 'text/csv' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a'); a.href = url; a.download = 'oiptyy_prospects.csv'; a.click()
  URL.revokeObjectURL(url)
}

// ─── API ──────────────────────────────────────────────────────────────────────
async function researchCompany(name) {
  const prompt = `You are a B2B sales research assistant helping sell OPTYy — a communication control platform that protects customer conversations across all messaging systems.

Research the company: "${name}"

Use web search to find current, accurate information. Return ONLY a valid JSON object, no markdown, no preamble:
{
  "industry": "Industry and estimated company size",
  "pain_points": "2-3 specific operational challenges this company likely faces",
  "tech_stack": "Known or likely tools: CRM, ERP, marketing automation, etc.",
  "recent_news": "Notable news in past 12 months, or 'No recent news found.'",
  "email_angle": "A specific 2-3 sentence cold email opening for OPTYy. Reference their actual situation."
}`
  const res = await fetch('/api/claude', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514', max_tokens: 1000,
      tools: [{ type: 'web_search_20250305', name: 'web_search' }],
      messages: [{ role: 'user', content: prompt }]
    })
  })
  if (!res.ok) throw new Error('API error ' + res.status)
  const data  = await res.json()
  const text  = data.content.filter(b => b.type === 'text').map(b => b.text).join('')
  const match = text.match(/\{[\s\S]*\}/)
  if (!match) throw new Error('No JSON in response')
  return JSON.parse(match[0])
}

async function ghlCreateContact(company, apiKey, locationId) {
  const parts     = (company.name || 'Unknown').trim().split(' ')
  const firstName = parts[0] || 'Unknown'
  const lastName  = parts.slice(1).join(' ') || ''
  const res = await fetch('/api/ghl/contacts/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
    body: JSON.stringify({
      firstName, lastName,
      email: company.email, companyName: company.name, locationId,
      tags: ['oiptyy-prospect'],
      customFields: [
        { id: 'industry',    value: company.data?.industry    || '' },
        { id: 'pain_points', value: company.data?.pain_points || '' },
        { id: 'email_angle', value: company.data?.email_angle || '' },
      ]
    })
  })
  const data = await res.json()
  if (!res.ok) throw new Error(Array.isArray(data.message) ? data.message.join(', ') : data.message || 'Contact creation failed')
  return data.contact?.id || data.id
}

async function ghlCreateOpportunity(company, contactId, apiKey, locationId, pipelineId, stageId) {
  const res = await fetch('/api/ghl/opportunities/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
    body: JSON.stringify({
      title: `${company.name} — OPTYy`, status: 'open',
      pipelineId, pipelineStageId: stageId, locationId, contactId, monetaryValue: 0,
      customFields: [
        { id: 'industry',    value: company.data?.industry    || '' },
        { id: 'pain_points', value: company.data?.pain_points || '' },
        { id: 'email_angle', value: company.data?.email_angle || '' },
      ]
    })
  })
  const data = await res.json()
  if (!res.ok) throw new Error(Array.isArray(data.message) ? data.message.join(', ') : data.message || 'Opportunity creation failed')
  return data.opportunity?.id || data.id
}

async function ghlGetPipelines(apiKey, locationId) {
  const res  = await fetch(`/api/ghl/opportunities/pipelines/?locationId=${locationId}`, {
    headers: { 'Authorization': `Bearer ${apiKey}` }
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Failed to fetch pipelines')
  return data.pipelines || []
}

// ─── Icons ────────────────────────────────────────────────────────────────────
const IconSearch = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
  </svg>
)
const IconSettings = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
  </svg>
)
const ShieldIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
)

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toasts({ toasts }) {
  return (
    <div className="toast-wrap">
      {toasts.map(t => <div key={t.id} className={`toast ${t.type}`}>{t.msg}</div>)}
    </div>
  )
}

// ─── Company Card ─────────────────────────────────────────────────────────────
function CompanyCard({ company: c, expanded, onToggle, onPushGHL, ghlReady }) {
  const badgeClass = { pending: 'badge-pending', working: 'badge-working', done: 'badge-done', error: 'badge-error' }[c.status] || 'badge-pending'
  const badgeLabel = { pending: 'Pending', working: 'Researching', done: 'Done', error: 'Error' }[c.status]

  return (
    <div className={`company-card ${expanded ? 'active' : ''}`}>
      <div className="company-card-header" onClick={onToggle}>
        <div>
          <div className="company-name">{c.name}</div>
          <div className="company-email">{c.email}</div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {c.ghlStatus === 'synced'  && <span className="badge badge-synced">Protected</span>}
          {c.ghlStatus === 'syncing' && <span className="badge badge-working"><span className="spinner" /> Syncing</span>}
          {c.ghlStatus === 'error'   && <span className="badge badge-error">GHL Error</span>}
          <span className={`badge ${badgeClass}`}>
            {c.status === 'working' && <span className="spinner" />}{badgeLabel}
          </span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2a4a62" strokeWidth="2" strokeLinecap="round"
            style={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }}>
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </div>
      </div>

      {expanded && c.data && (
        <div className="company-card-body">
          <div className="research-grid">
            <div className="research-block"><div className="research-label">Industry & size</div><div className="research-value">{c.data.industry}</div></div>
            <div className="research-block"><div className="research-label">Pain points</div><div className="research-value">{c.data.pain_points}</div></div>
            <div className="research-block"><div className="research-label">Tech stack</div><div className="research-value">{c.data.tech_stack}</div></div>
            <div className="research-block"><div className="research-label">Recent news</div><div className="research-value">{c.data.recent_news}</div></div>
          </div>
          <div className="email-angle-block">
            <div className="email-angle-label">OPTYy email angle</div>
            <div className="email-angle-value">{c.data.email_angle}</div>
          </div>
          {c.status === 'done' && c.ghlStatus !== 'synced' && ghlReady && (
            <div className="card-actions">
              <button className="btn btn-ghost" onClick={onPushGHL} disabled={c.ghlStatus === 'syncing'}>
                {c.ghlStatus === 'syncing' ? <><span className="spinner" /> Pushing…</> : 'Push to GHL'}
              </button>
            </div>
          )}
        </div>
      )}

      {expanded && c.status === 'error' && (
        <div className="company-card-body">
          <p style={{ fontSize: 13, color: '#2a4a62', marginTop: 14 }}>Research failed for this company.</p>
        </div>
      )}

      {expanded && c.status === 'pending' && (
        <div className="company-card-body">
          <p style={{ fontSize: 13, color: '#2a4a62', marginTop: 14 }}>Waiting to be researched…</p>
        </div>
      )}
    </div>
  )
}

// ─── Settings ─────────────────────────────────────────────────────────────────
function SettingsPage({ settings, pipelines, onSave, onPipelinesLoaded, addToast }) {
  const [form, setForm]                     = useState(settings)
  const [loadingPipelines, setLoading]      = useState(false)

  useEffect(() => { setForm(settings) }, [settings])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const fetchPipelines = async () => {
    if (!form.ghlApiKey || !form.ghlLocationId) { addToast('Enter API key and Location ID first', 'error'); return }
    setLoading(true)
    try {
      const pl = await ghlGetPipelines(form.ghlApiKey, form.ghlLocationId)
      onPipelinesLoaded(pl)
      addToast(`Found ${pl.length} pipeline(s)`, 'success')
    } catch (e) { addToast('Could not fetch pipelines: ' + e.message, 'error') }
    setLoading(false)
  }

  const selectedPipeline = pipelines.find(p => p.id === form.ghlPipelineId)

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-title">Settings</div>
        <div className="page-sub">Configure your integrations and API connections.</div>
      </div>

      <div className="card">
        <div className="card-header">GoHighLevel</div>

        <div className="setting-row">
          <div className="setting-label">API Key</div>
          <div className="setting-desc">Your GoHighLevel Private Integration API key</div>
          <input className="setting-input" type="password" placeholder="eyJ…" value={form.ghlApiKey || ''} onChange={e => set('ghlApiKey', e.target.value)} />
        </div>

        <div className="setting-row">
          <div className="setting-label">Location ID</div>
          <div className="setting-desc">Found in GHL → Settings → Business Info</div>
          <input className="setting-input" type="text" placeholder="abc123xyz…" value={form.ghlLocationId || ''} onChange={e => set('ghlLocationId', e.target.value)} />
        </div>

        <div className="row mt8">
          <button className="btn btn-ghost" onClick={fetchPipelines} disabled={loadingPipelines}>
            {loadingPipelines ? <><span className="spinner" /> Loading…</> : 'Load Pipelines'}
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <span className="status-dot" style={{ background: pipelines.length ? '#19C37D' : '#1a3a52' }} />
            <span style={{ fontSize: 12, color: '#2a4a62' }}>
              {pipelines.length ? `${pipelines.length} pipeline(s) loaded` : 'Not connected'}
            </span>
          </div>
        </div>

        {pipelines.length > 0 && (
          <>
            <div className="setting-divider" />
            <div className="setting-row">
              <div className="setting-label">Pipeline</div>
              <select className="setting-input" value={form.ghlPipelineId || ''} onChange={e => { set('ghlPipelineId', e.target.value); set('ghlStageId', '') }}>
                <option value="">Select pipeline…</option>
                {pipelines.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            {selectedPipeline && (
              <div className="setting-row">
                <div className="setting-label">Stage</div>
                <div className="setting-desc">New leads will be placed in this stage</div>
                <select className="setting-input" value={form.ghlStageId || ''} onChange={e => set('ghlStageId', e.target.value)}>
                  <option value="">Select stage…</option>
                  {(selectedPipeline.stages || []).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
            )}
          </>
        )}
      </div>

      <div className="card">
        <div className="card-header">Anthropic</div>
        <div className="setting-row">
          <div className="setting-label">API Key</div>
          <div className="setting-desc">Used for AI research. Set as an environment variable in Netlify — not stored in the browser.</div>
          <div className="code-block">
            Netlify → Site → Environment Variables<br />
            Key: <span style={{ color: '#19C37D' }}>ANTHROPIC_API_KEY</span>
          </div>
        </div>
      </div>

      <div className="mt24">
        <button className="btn btn-primary" onClick={() => { onSave(form); addToast('Settings saved', 'success') }}>
          Save settings
        </button>
      </div>
    </div>
  )
}

// ─── Research ─────────────────────────────────────────────────────────────────
function ResearchPage({ settings, addToast }) {
  const [companies, setCompanies] = useState(() => load(COMPANIES_KEY, []))
  const [running, setRunning]     = useState(false)
  const [progress, setProgress]   = useState(0)
  const [statusMsg, setStatusMsg] = useState('')
  const [expanded, setExpanded]   = useState({})
  const fileRef  = useRef()
  const abortRef = useRef(false)

  useEffect(() => { save(COMPANIES_KEY, companies) }, [companies])

  const done   = companies.filter(c => c.status === 'done').length
  const errors = companies.filter(c => c.status === 'error').length
  const synced = companies.filter(c => c.ghlStatus === 'synced').length
  const total  = companies.length

  const handleFile = (file) => {
    const reader = new FileReader()
    reader.onload = e => {
      const rows = parseCSV(e.target.result)
      if (!rows)        { addToast('Could not parse CSV. Need company_name and email columns.', 'error'); return }
      if (!rows.length) { addToast('CSV has no valid rows', 'error'); return }
      setCompanies(rows); setProgress(0); setStatusMsg('')
    }
    reader.readAsText(file)
  }

  const updateCompany = (id, patch) =>
    setCompanies(prev => prev.map(c => c.id === id ? { ...c, ...patch } : c))

  const startResearch = async () => {
    if (running || !companies.length) return
    setRunning(true); abortRef.current = false
    for (let i = 0; i < companies.length; i++) {
      if (abortRef.current) break
      const c = companies[i]
      if (c.status === 'done') continue
      updateCompany(c.id, { status: 'working' })
      setStatusMsg(`Researching ${i + 1} / ${companies.length}: ${c.name}`)
      setProgress(Math.round((i / companies.length) * 100))
      try {
        const data = await researchCompany(c.name)
        updateCompany(c.id, { status: 'done', data })
      } catch {
        updateCompany(c.id, { status: 'error' })
        addToast(`Failed: ${c.name}`, 'error')
      }
    }
    setProgress(100)
    setStatusMsg(`Complete — ${companies.filter(c => c.status === 'done').length} researched`)
    setRunning(false)
  }

  const pushToGHL = async (company) => {
    const { ghlApiKey, ghlLocationId, ghlPipelineId, ghlStageId } = settings
    if (!ghlApiKey || !ghlLocationId || !ghlPipelineId || !ghlStageId) {
      addToast('Configure GHL settings first', 'error'); return
    }
    updateCompany(company.id, { ghlStatus: 'syncing' })
    try {
      const contactId = await ghlCreateContact(company, ghlApiKey, ghlLocationId)
      await ghlCreateOpportunity(company, contactId, ghlApiKey, ghlLocationId, ghlPipelineId, ghlStageId)
      updateCompany(company.id, { ghlStatus: 'synced' })
      addToast(`${company.name} added to GHL`, 'success')
    } catch (e) {
      updateCompany(company.id, { ghlStatus: 'error' })
      addToast(`GHL error: ${e.message}`, 'error')
    }
  }

  const pushAllToGHL = async () => {
    const ready = companies.filter(c => c.status === 'done' && c.ghlStatus !== 'synced')
    for (const c of ready) await pushToGHL(c)
  }

  const ghlReady = settings.ghlApiKey && settings.ghlLocationId && settings.ghlPipelineId && settings.ghlStageId

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-title">Prospect Research</div>
        <div className="page-sub">Upload a CSV, research every company with AI, then push to GoHighLevel.</div>
      </div>

      {!companies.length ? (
        <>
          <div
            className="upload-zone"
            onDragOver={e => { e.preventDefault(); e.currentTarget.classList.add('drag') }}
            onDragLeave={e => e.currentTarget.classList.remove('drag')}
            onDrop={e => { e.preventDefault(); e.currentTarget.classList.remove('drag'); if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]) }}
            onClick={() => fileRef.current.click()}
          >
            <div className="upload-icon">📄</div>
            <p><strong>Click to upload</strong> or drag and drop your CSV</p>
            <p style={{ marginTop: 10 }}>Required columns: <code>company_name</code> and <code>email</code></p>
          </div>
          <input ref={fileRef} type="file" accept=".csv" style={{ display: 'none' }} onChange={e => { if (e.target.files[0]) handleFile(e.target.files[0]) }} />
        </>
      ) : (
        <>
          <div className="stats-row">
            <div className="stat-card">
              <div className="stat-value">{total}</div>
              <div className="stat-label">Total companies</div>
            </div>
            <div className="stat-card">
              <div className="stat-value" style={{ color: '#19C37D' }}>{done}</div>
              <div className="stat-label">Researched</div>
            </div>
            <div className="stat-card">
              <div className="stat-value" style={{ color: errors ? '#f87171' : '#D6E1EA' }}>{errors}</div>
              <div className="stat-label">Errors</div>
            </div>
            <div className="stat-card">
              <div className="stat-value" style={{ color: '#1FB6A6' }}>{synced}</div>
              <div className="stat-label">Protected in GHL</div>
            </div>
          </div>

          <div className="row" style={{ marginBottom: 24 }}>
            <button className="btn btn-primary" onClick={startResearch} disabled={running || done === total}>
              {running ? <><span className="spinner" /> Researching…</> : done === total ? 'All done' : `Research ${total - done} companies`}
            </button>
            {running && <button className="btn btn-ghost" onClick={() => abortRef.current = true}>Stop</button>}
            {done > 0 && !running && ghlReady && <button className="btn btn-ghost" onClick={pushAllToGHL}>Push all to GHL</button>}
            {done > 0 && <button className="btn btn-ghost" onClick={() => exportCSV(companies)}>Export CSV</button>}
            <button className="btn btn-ghost" onClick={() => { setCompanies([]); setProgress(0); setStatusMsg(''); setExpanded({}) }}>New upload</button>
          </div>

          {(running || progress > 0) && (
            <div className="card card-sm" style={{ marginBottom: 20 }}>
              <div className="progress-track"><div className="progress-fill" style={{ width: progress + '%' }} /></div>
              <div className="progress-label">{statusMsg}</div>
            </div>
          )}

          <div>
            {companies.map(c => (
              <CompanyCard
                key={c.id} company={c} expanded={!!expanded[c.id]}
                onToggle={() => setExpanded(e => ({ ...e, [c.id]: !e[c.id] }))}
                onPushGHL={() => pushToGHL(c)} ghlReady={ghlReady}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage]           = useState('research')
  const [settings, setSettings]   = useState(() => load(SETTINGS_KEY, {}))
  const [pipelines, setPipelines] = useState(() => load(PIPELINES_KEY, []))
  const [toasts, setToasts]       = useState([])

  const addToast = (msg, type = 'default') => {
    const id = Date.now()
    setToasts(t => [...t, { id, msg, type }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500)
  }

  const saveSettings  = s  => { setSettings(s);  save(SETTINGS_KEY, s)   }
  const savePipelines = pl => { setPipelines(pl); save(PIPELINES_KEY, pl) }

  const ghlOk = settings.ghlApiKey && settings.ghlLocationId && settings.ghlPipelineId && settings.ghlStageId

  return (
    <>
      <style>{css}</style>
      <div className="layout">

        <aside className="sidebar">
          <div className="sidebar-logo">
            <div className="logo-shield"><ShieldIcon /></div>
            <div className="logo-wordmark">OPT<span>Yy</span></div>
          </div>

          <nav className="sidebar-nav">
            <div className="nav-section">Platform</div>
            {[
              { id: 'research', label: 'Research',  icon: <IconSearch /> },
              { id: 'settings', label: 'Settings',  icon: <IconSettings /> },
            ].map(n => (
              <button key={n.id} className={`nav-item ${page === n.id ? 'active' : ''}`} onClick={() => setPage(n.id)}>
                {n.icon}
                {n.label}
                {n.id === 'settings' && !ghlOk && (
                  <span style={{ marginLeft: 'auto', width: 6, height: 6, borderRadius: '50%', background: '#fbbf24', flexShrink: 0 }} />
                )}
              </button>
            ))}
          </nav>

          <div className="sidebar-footer">
            <div className="connection-status">
              <span className="status-dot" style={{ background: ghlOk ? '#19C37D' : '#1a3a52' }} />
              <span>{ghlOk ? 'GHL connected' : 'GHL not configured'}</span>
            </div>
          </div>
        </aside>

        <main className="main">
          {page === 'research' && <ResearchPage settings={settings} addToast={addToast} />}
          {page === 'settings' && (
            <SettingsPage
              settings={settings} pipelines={pipelines}
              onSave={saveSettings} onPipelinesLoaded={savePipelines}
              addToast={addToast}
            />
          )}
        </main>
      </div>

      <Toasts toasts={toasts} />
    </>
  )
}
import React, { useState, useEffect, useRef } from 'react'

// ─── Styles ───────────────────────────────────────────────────────────────────
const css = `
  .layout { display: flex; min-height: 100vh; }

  /* Sidebar */
  .sidebar {
    width: 220px; flex-shrink: 0;
    background: #111;
    border-right: 1px solid #1e1e1e;
    display: flex; flex-direction: column;
    padding: 0;
    position: fixed; top: 0; left: 0; bottom: 0;
    z-index: 100;
  }
  .sidebar-logo {
    padding: 24px 20px 20px;
    border-bottom: 1px solid #1e1e1e;
    font-size: 17px; font-weight: 600;
    letter-spacing: -0.3px;
    color: #e8e6e0;
  }
  .sidebar-logo span { color: #6ee7b7; }
  .sidebar-nav { padding: 12px 0; flex: 1; }
  .nav-item {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 20px;
    font-size: 13.5px; color: #666;
    cursor: pointer; border: none; background: none;
    width: 100%; text-align: left;
    transition: color 0.15s, background 0.15s;
    border-radius: 0;
    font-family: 'DM Sans', sans-serif;
    letter-spacing: -0.1px;
  }
  .nav-item:hover { color: #aaa; background: #161616; }
  .nav-item.active { color: #e8e6e0; background: #1a1a1a; }
  .nav-item svg { opacity: 0.7; flex-shrink: 0; }
  .nav-item.active svg { opacity: 1; }

  /* Main */
  .main { margin-left: 220px; flex: 1; min-height: 100vh; }
  .page { padding: 40px 48px; max-width: 960px; }
  .page-title { font-size: 22px; font-weight: 600; color: #e8e6e0; letter-spacing: -0.4px; margin-bottom: 6px; }
  .page-sub { font-size: 13.5px; color: #555; margin-bottom: 32px; }

  /* Cards */
  .card {
    background: #111; border: 1px solid #1e1e1e;
    border-radius: 12px; padding: 24px;
    margin-bottom: 16px;
  }
  .card-sm { padding: 16px 20px; }

  /* Upload zone */
  .upload-zone {
    border: 1.5px dashed #2a2a2a; border-radius: 12px;
    padding: 40px 24px; text-align: center;
    cursor: pointer; transition: border-color 0.15s, background 0.15s;
    margin-bottom: 20px;
  }
  .upload-zone:hover, .upload-zone.drag { border-color: #6ee7b7; background: rgba(110,231,183,0.03); }
  .upload-icon { font-size: 32px; margin-bottom: 12px; }
  .upload-zone p { font-size: 14px; color: #555; }
  .upload-zone strong { color: #aaa; font-weight: 500; }
  .upload-zone code { font-family: 'DM Mono', monospace; font-size: 12px; color: #6ee7b7; background: rgba(110,231,183,0.08); padding: 2px 6px; border-radius: 4px; }

  /* Table */
  .data-table { width: 100%; border-collapse: collapse; font-size: 13px; }
  .data-table th { text-align: left; padding: 8px 12px; color: #444; font-weight: 500; border-bottom: 1px solid #1e1e1e; }
  .data-table td { padding: 10px 12px; border-bottom: 1px solid #161616; color: #aaa; }
  .data-table tr:last-child td { border-bottom: none; }
  .data-table td:first-child { color: #e8e6e0; }

  /* Buttons */
  .btn {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 10px 18px; border-radius: 8px;
    font-size: 13.5px; font-weight: 500;
    cursor: pointer; border: none;
    font-family: 'DM Sans', sans-serif;
    transition: opacity 0.15s, transform 0.1s;
    letter-spacing: -0.1px;
  }
  .btn:active { transform: scale(0.98); }
  .btn:disabled { opacity: 0.35; cursor: not-allowed; }
  .btn-green { background: #6ee7b7; color: #052e1a; }
  .btn-green:hover:not(:disabled) { opacity: 0.9; }
  .btn-ghost { background: #1a1a1a; color: #aaa; border: 1px solid #2a2a2a; }
  .btn-ghost:hover:not(:disabled) { background: #222; color: #ccc; }
  .btn-danger { background: rgba(239,68,68,0.1); color: #f87171; border: 1px solid rgba(239,68,68,0.2); }

  /* Badge */
  .badge { display: inline-flex; align-items: center; gap: 5px; font-size: 11px; font-weight: 500; padding: 3px 9px; border-radius: 20px; }
  .badge-pending { background: #1a1a1a; color: #555; }
  .badge-working { background: rgba(251,191,36,0.1); color: #fbbf24; }
  .badge-done { background: rgba(110,231,183,0.1); color: #6ee7b7; }
  .badge-error { background: rgba(239,68,68,0.1); color: #f87171; }
  .badge-synced { background: rgba(99,102,241,0.12); color: #a5b4fc; }

  /* Progress */
  .progress-track { height: 3px; background: #1e1e1e; border-radius: 2px; margin: 16px 0 8px; }
  .progress-fill { height: 100%; background: #6ee7b7; border-radius: 2px; transition: width 0.4s ease; }
  .progress-label { font-size: 12px; color: #555; font-family: 'DM Mono', monospace; }

  /* Company card */
  .company-card { background: #111; border: 1px solid #1e1e1e; border-radius: 12px; margin-bottom: 12px; overflow: hidden; transition: border-color 0.2s; }
  .company-card.active { border-color: #2a2a2a; }
  .company-card-header { display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; cursor: pointer; }
  .company-card-header:hover { background: #141414; }
  .company-name { font-size: 14.5px; font-weight: 500; color: #e8e6e0; }
  .company-email { font-size: 12px; color: #444; margin-top: 2px; font-family: 'DM Mono', monospace; }
  .company-card-body { padding: 0 20px 20px; border-top: 1px solid #1a1a1a; }
  .research-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 16px; }
  .research-block { background: #0d0d0d; border: 1px solid #1a1a1a; border-radius: 8px; padding: 12px 14px; }
  .research-label { font-size: 10px; font-weight: 500; color: #444; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 6px; }
  .research-value { font-size: 12.5px; color: #888; line-height: 1.6; }
  .email-angle-block { margin-top: 12px; background: rgba(110,231,183,0.04); border: 1px solid rgba(110,231,183,0.12); border-radius: 8px; padding: 14px 16px; }
  .email-angle-label { font-size: 10px; font-weight: 500; color: #6ee7b7; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 6px; }
  .email-angle-value { font-size: 13px; color: #a7f3d0; line-height: 1.65; }
  .card-actions { display: flex; gap: 8px; margin-top: 14px; align-items: center; }

  /* Spinner */
  .spinner { width: 12px; height: 12px; border: 1.5px solid currentColor; border-top-color: transparent; border-radius: 50%; animation: spin 0.65s linear infinite; display: inline-block; }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* Settings */
  .setting-row { display: flex; flex-direction: column; gap: 8px; margin-bottom: 20px; }
  .setting-label { font-size: 13px; font-weight: 500; color: #aaa; }
  .setting-desc { font-size: 12px; color: #444; margin-top: -4px; }
  .setting-input {
    background: #0d0d0d; border: 1px solid #2a2a2a;
    border-radius: 8px; padding: 10px 14px;
    font-size: 13px; color: #e8e6e0;
    font-family: 'DM Mono', monospace;
    width: 100%; max-width: 480px;
    outline: none; transition: border-color 0.15s;
  }
  .setting-input:focus { border-color: #6ee7b7; }
  .setting-divider { height: 1px; background: #1a1a1a; margin: 24px 0; }
  .status-dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; }
  .dot-green { background: #6ee7b7; }
  .dot-red { background: #f87171; }
  .dot-gray { background: #333; }

  /* Toast */
  .toast-wrap { position: fixed; bottom: 24px; right: 24px; z-index: 999; display: flex; flex-direction: column; gap: 8px; }
  .toast { background: #1a1a1a; border: 1px solid #2a2a2a; border-radius: 8px; padding: 12px 16px; font-size: 13px; color: #ccc; max-width: 320px; animation: slideUp 0.2s ease; }
  .toast.success { border-color: rgba(110,231,183,0.3); color: #6ee7b7; }
  .toast.error { border-color: rgba(239,68,68,0.3); color: #f87171; }
  @keyframes slideUp { from { opacity:0; transform: translateY(8px); } to { opacity:1; transform: translateY(0); } }

  /* Stat cards */
  .stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 24px; }
  .stat-card { background: #111; border: 1px solid #1e1e1e; border-radius: 10px; padding: 16px 18px; }
  .stat-value { font-size: 26px; font-weight: 600; color: #e8e6e0; letter-spacing: -0.5px; }
  .stat-label { font-size: 12px; color: #444; margin-top: 4px; }

  .row { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
  .flex1 { flex: 1; }
  .mt8 { margin-top: 8px; }
  .mt16 { margin-top: 16px; }
  .mt24 { margin-top: 24px; }

  select.setting-input { cursor: pointer; }
`

// ─── Helpers ──────────────────────────────────────────────────────────────────
function parseCSV(text) {
  const lines = text.trim().split('\n').filter(l => l.trim())
  if (lines.length < 2) return null
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/['"]/g, ''))
  const nameIdx = headers.findIndex(h => h.includes('company') || h.includes('name'))
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
    return [r.name, r.email, d.industry||'', d.pain_points||'', d.tech_stack||'', d.recent_news||'', d.email_angle||'', r.ghlStatus||''].map(v => `"${String(v).replace(/"/g,'""')}"`).join(',')
  })
  const blob = new Blob([[headers.join(','), ...rows].join('\n')], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a'); a.href = url; a.download = 'oiptyy_prospects.csv'; a.click()
  URL.revokeObjectURL(url)
}

// ─── API calls ────────────────────────────────────────────────────────────────
async function researchCompany(name) {
  const prompt = `You are a B2B sales research assistant helping sell Oiptyy — an AI-powered workflow optimization and automation platform for businesses.

Research the company: "${name}"

Use web search to find current, accurate information. Return ONLY a valid JSON object, no markdown, no preamble:
{
  "industry": "Industry and estimated company size (headcount/revenue range)",
  "pain_points": "2-3 specific operational challenges this company likely faces",
  "tech_stack": "Known or likely tools: CRM, ERP, marketing automation, etc.",
  "recent_news": "Notable news, funding, expansions, or leadership changes in past 12 months. If none found, say 'No recent news found.'",
  "email_angle": "A specific, personalized 2-3 sentence cold email opening for selling Oiptyy to this company. Reference their actual situation and how Oiptyy can help."
}`

  const res = await fetch('/api/claude', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      tools: [{ type: 'web_search_20250305', name: 'web_search' }],
      messages: [{ role: 'user', content: prompt }]
    })
  })
  if (!res.ok) throw new Error('API error ' + res.status)
  const data = await res.json()
  const text = data.content.filter(b => b.type === 'text').map(b => b.text).join('')
  const match = text.match(/\{[\s\S]*\}/)
  if (!match) throw new Error('No JSON in response')
  return JSON.parse(match[0])
}

async function ghlCreateContact(company, apiKey, locationId) {
  const nameParts = company.email.split('@')[0].split('.')
  const firstName = nameParts[0] ? nameParts[0].charAt(0).toUpperCase() + nameParts[0].slice(1) : 'Contact'
  const lastName = nameParts[1] ? nameParts[1].charAt(0).toUpperCase() + nameParts[1].slice(1) : company.name

async function ghlCreateContact(company, apiKey, locationId) {
  const [firstName, ...lastParts] = (company.name || 'Unknown').split(' ')
  const lastName = lastParts.join(' ') || ''

  const res = await fetch('/api/ghl/contacts/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
    body: JSON.stringify({
      firstName,
      lastName,
      email: company.email,
      companyName: company.name,
      locationId,
      tags: ['oiptyy-prospect'],
      customFields: [
        { id: 'industry',    value: company.data?.industry    || '' },
        { id: 'pain_points', value: company.data?.pain_points || '' },
        { id: 'email_angle', value: company.data?.email_angle || '' },
        { id: 'notes',       value: company.data?.email_angle || '' },
      ]
    })
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Contact creation failed')
  return data.contact?.id || data.id
}

async function ghlCreateOpportunity(company, contactId, apiKey, locationId, pipelineId, stageId) {
  const res = await fetch('/api/ghl/opportunities/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
    body: JSON.stringify({
      title: `${company.name} — Oiptyy`,
      status: 'open',
      pipelineId,
      pipelineStageId: stageId,
      locationId,
      contactId,
      monetaryValue: 0,
      customFields: [
        { id: 'industry',    value: company.data?.industry    || '' },
        { id: 'pain_points', value: company.data?.pain_points || '' },
        { id: 'email_angle', value: company.data?.email_angle || '' },
      ]
    })
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Opportunity creation failed')
  return data.opportunity?.id || data.id
}
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Opportunity creation failed')
  return data.opportunity?.id || data.id
}

async function ghlGetPipelines(apiKey, locationId) {
  const res = await fetch(`/api/ghl/opportunities/pipelines/?locationId=${locationId}`, {
    headers: { 'Authorization': `Bearer ${apiKey}` }
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Failed to fetch pipelines')
  return data.pipelines || []
}

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toasts({ toasts }) {
  return (
    <div className="toast-wrap">
      {toasts.map(t => <div key={t.id} className={`toast ${t.type}`}>{t.msg}</div>)}
    </div>
  )
}

// ─── Settings page ────────────────────────────────────────────────────────────
function SettingsPage({ settings, onSave, addToast }) {
  const [form, setForm] = useState(settings)
  const [pipelines, setPipelines] = useState([])
  const [loadingPipelines, setLoadingPipelines] = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const fetchPipelines = async () => {
    if (!form.ghlApiKey || !form.ghlLocationId) { addToast('Enter API key and Location ID first', 'error'); return }
    setLoadingPipelines(true)
    try {
      const pl = await ghlGetPipelines(form.ghlApiKey, form.ghlLocationId)
      setPipelines(pl)
      addToast(`Found ${pl.length} pipeline(s)`, 'success')
    } catch (e) { addToast('Could not fetch pipelines: ' + e.message, 'error') }
    setLoadingPipelines(false)
  }

  const save = () => { onSave(form); addToast('Settings saved', 'success') }

  const selectedPipeline = pipelines.find(p => p.id === form.ghlPipelineId)

  return (
    <div className="page">
      <div className="page-title">Settings</div>
      <div className="page-sub">Configure your API keys and GoHighLevel integration</div>

      <div className="card">
        <div style={{ fontSize: 13, fontWeight: 600, color: '#6ee7b7', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 20 }}>GoHighLevel</div>

        <div className="setting-row">
          <div className="setting-label">GHL API Key</div>
          <div className="setting-desc">Your GoHighLevel Private Integration API key</div>
          <input className="setting-input" type="password" placeholder="eyJ..." value={form.ghlApiKey || ''} onChange={e => set('ghlApiKey', e.target.value)} />
        </div>

        <div className="setting-row">
          <div className="setting-label">Location ID</div>
          <div className="setting-desc">Found in GHL → Settings → Business Info</div>
          <input className="setting-input" type="text" placeholder="abc123xyz..." value={form.ghlLocationId || ''} onChange={e => set('ghlLocationId', e.target.value)} />
        </div>

        <div className="row mt8">
          <button className="btn btn-ghost" onClick={fetchPipelines} disabled={loadingPipelines}>
            {loadingPipelines ? <><span className="spinner" /> Loading...</> : 'Load Pipelines'}
          </button>
          <span className="status-dot" style={{ background: pipelines.length ? '#6ee7b7' : '#333' }} />
          <span style={{ fontSize: 12, color: '#444' }}>{pipelines.length ? `${pipelines.length} pipeline(s) loaded` : 'Not connected'}</span>
        </div>

        {pipelines.length > 0 && (
          <>
            <div className="setting-divider" />
            <div className="setting-row">
              <div className="setting-label">Pipeline</div>
              <select className="setting-input" value={form.ghlPipelineId || ''} onChange={e => { set('ghlPipelineId', e.target.value); set('ghlStageId', '') }}>
                <option value="">Select pipeline...</option>
                {pipelines.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>

            {selectedPipeline && (
              <div className="setting-row">
                <div className="setting-label">Stage (New Lead)</div>
                <select className="setting-input" value={form.ghlStageId || ''} onChange={e => set('ghlStageId', e.target.value)}>
                  <option value="">Select stage...</option>
                  {(selectedPipeline.stages || []).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
            )}
          </>
        )}
      </div>

      <div className="card mt8">
        <div style={{ fontSize: 13, fontWeight: 600, color: '#6ee7b7', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 20 }}>Anthropic</div>
        <div className="setting-row">
          <div className="setting-label">Anthropic API Key</div>
          <div className="setting-desc">Used for AI research. Set as ANTHROPIC_API_KEY in Netlify environment variables — not stored here.</div>
          <div style={{ fontSize: 12, color: '#555', fontFamily: 'DM Mono, monospace', background: '#0d0d0d', border: '1px solid #1e1e1e', borderRadius: 8, padding: '10px 14px', maxWidth: 480 }}>
            Set in Netlify: Site → Environment Variables → ANTHROPIC_API_KEY
          </div>
        </div>
      </div>

      <div className="mt24">
        <button className="btn btn-green" onClick={save}>Save settings</button>
      </div>
    </div>
  )
}

// ─── Research page ────────────────────────────────────────────────────────────
function ResearchPage({ settings, addToast }) {
  const [companies, setCompanies] = useState([])
  const [running, setRunning] = useState(false)
  const [progress, setProgress] = useState(0)
  const [statusMsg, setStatusMsg] = useState('')
  const [expanded, setExpanded] = useState({})
  const fileRef = useRef()
  const abortRef = useRef(false)

  const done = companies.filter(c => c.status === 'done').length
  const errors = companies.filter(c => c.status === 'error').length
  const synced = companies.filter(c => c.ghlStatus === 'synced').length
  const total = companies.length

  const handleFile = (file) => {
    const reader = new FileReader()
    reader.onload = e => {
      const rows = parseCSV(e.target.result)
      if (!rows) { addToast('Could not parse CSV. Need company_name and email columns.', 'error'); return }
      if (!rows.length) { addToast('CSV has no valid rows', 'error'); return }
      setCompanies(rows)
      setProgress(0); setStatusMsg('')
    }
    reader.readAsText(file)
  }

  const updateCompany = (id, patch) => {
    setCompanies(prev => prev.map(c => c.id === id ? { ...c, ...patch } : c))
  }

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
      } catch (e) {
        updateCompany(c.id, { status: 'error' })
        addToast(`Failed: ${c.name}`, 'error')
      }
    }
    setProgress(100); setStatusMsg(`Done — ${companies.filter(c => c.status === 'done').length} researched`)
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
      addToast(`GHL error for ${company.name}: ${e.message}`, 'error')
    }
  }

  const pushAllToGHL = async () => {
    const ready = companies.filter(c => c.status === 'done' && c.ghlStatus !== 'synced')
    for (const c of ready) await pushToGHL(c)
  }

  const ghlReady = settings.ghlApiKey && settings.ghlLocationId && settings.ghlPipelineId && settings.ghlStageId

  return (
    <div className="page">
      <div className="page-title">Prospect researcher</div>
      <div className="page-sub">Upload a CSV, research every company with AI, then push to GoHighLevel.</div>

      {!companies.length ? (
        <>
          <div className="upload-zone" onDragOver={e => { e.preventDefault(); e.currentTarget.classList.add('drag') }} onDragLeave={e => e.currentTarget.classList.remove('drag')} onDrop={e => { e.preventDefault(); e.currentTarget.classList.remove('drag'); if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]) }} onClick={() => fileRef.current.click()}>
            <div className="upload-icon">📄</div>
            <p><strong>Click to upload</strong> or drag and drop your CSV</p>
            <p style={{ marginTop: 8 }}>Required columns: <code>company_name</code> and <code>email</code></p>
          </div>
          <input ref={fileRef} type="file" accept=".csv" style={{ display: 'none' }} onChange={e => { if (e.target.files[0]) handleFile(e.target.files[0]) }} />
        </>
      ) : (
        <>
          <div className="stats-row">
            <div className="stat-card"><div className="stat-value">{total}</div><div className="stat-label">Total companies</div></div>
            <div className="stat-card"><div className="stat-value" style={{ color: '#6ee7b7' }}>{done}</div><div className="stat-label">Researched</div></div>
            <div className="stat-card"><div className="stat-value" style={{ color: errors ? '#f87171' : '#e8e6e0' }}>{errors}</div><div className="stat-label">Errors</div></div>
            <div className="stat-card"><div className="stat-value" style={{ color: '#a5b4fc' }}>{synced}</div><div className="stat-label">In GHL</div></div>
          </div>

          <div className="row" style={{ marginBottom: 20 }}>
            <button className="btn btn-green" onClick={startResearch} disabled={running || done === total}>
              {running ? <><span className="spinner" /> Researching…</> : done === total ? 'All done' : `Research ${total - done} companies`}
            </button>
            {running && <button className="btn btn-ghost" onClick={() => abortRef.current = true}>Stop</button>}
            {done > 0 && !running && ghlReady && (
              <button className="btn btn-ghost" onClick={pushAllToGHL}>Push all to GHL</button>
            )}
            {done > 0 && <button className="btn btn-ghost" onClick={() => exportCSV(companies)}>Export CSV</button>}
            <button className="btn btn-ghost" onClick={() => { setCompanies([]); setProgress(0); setStatusMsg('') }}>New upload</button>
          </div>

          {(running || progress > 0) && (
            <div className="card card-sm" style={{ marginBottom: 20 }}>
              <div className="progress-track"><div className="progress-fill" style={{ width: progress + '%' }} /></div>
              <div className="progress-label">{statusMsg}</div>
            </div>
          )}

          <div>
            {companies.map(c => (
              <CompanyCard key={c.id} company={c} expanded={!!expanded[c.id]} onToggle={() => setExpanded(e => ({ ...e, [c.id]: !e[c.id] }))} onPushGHL={() => pushToGHL(c)} ghlReady={ghlReady} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

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
          {c.ghlStatus === 'synced' && <span className="badge badge-synced">In GHL</span>}
          {c.ghlStatus === 'syncing' && <span className="badge badge-working"><span className="spinner" /> Syncing</span>}
          <span className={`badge ${badgeClass}`}>
            {c.status === 'working' && <span className="spinner" />}{badgeLabel}
          </span>
          <span style={{ color: '#333', fontSize: 12 }}>{expanded ? '▲' : '▼'}</span>
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
            <div className="email-angle-label">Oiptyy email angle</div>
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
          <p style={{ fontSize: 13, color: '#555', marginTop: 12 }}>Research failed for this company. It will be skipped in exports.</p>
        </div>
      )}

      {expanded && c.status === 'pending' && (
        <div className="company-card-body">
          <p style={{ fontSize: 13, color: '#444', marginTop: 12 }}>Waiting to be researched…</p>
        </div>
      )}
    </div>
  )
}

// ─── Main App ─────────────────────────────────────────────────────────────────
const SETTINGS_KEY = 'oiptyy_settings'

export default function App() {
  const [page, setPage] = useState('research')
  const [settings, setSettings] = useState(() => {
    try { return JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}') } catch { return {} }
  })
  const [toasts, setToasts] = useState([])

  const addToast = (msg, type = 'default') => {
    const id = Date.now()
    setToasts(t => [...t, { id, msg, type }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500)
  }

  const saveSettings = (s) => {
    setSettings(s)
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(s))
  }

  const ghlOk = settings.ghlApiKey && settings.ghlLocationId && settings.ghlPipelineId && settings.ghlStageId

  return (
    <>
      <style>{css}</style>
      <div className="layout">
        <aside className="sidebar">
          <div className="sidebar-logo">oiptyy<span>.</span></div>
          <nav className="sidebar-nav">
            {[
              { id: 'research', label: 'Research', icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg> },
              { id: 'settings', label: 'Settings', icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg> },
            ].map(n => (
              <button key={n.id} className={`nav-item ${page === n.id ? 'active' : ''}`} onClick={() => setPage(n.id)}>
                {n.icon}{n.label}
                {n.id === 'settings' && !ghlOk && <span style={{ marginLeft: 'auto', width: 6, height: 6, borderRadius: '50%', background: '#fbbf24', flexShrink: 0 }} />}
              </button>
            ))}
          </nav>
          <div style={{ padding: '16px 20px', borderTop: '1px solid #1a1a1a' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="status-dot" style={{ background: ghlOk ? '#6ee7b7' : '#333' }} />
              <span style={{ fontSize: 11, color: '#444' }}>{ghlOk ? 'GHL connected' : 'GHL not configured'}</span>
            </div>
          </div>
        </aside>

        <main className="main">
          {page === 'research' && <ResearchPage settings={settings} addToast={addToast} />}
          {page === 'settings' && <SettingsPage settings={settings} onSave={saveSettings} addToast={addToast} />}
        </main>
      </div>
      <Toasts toasts={toasts} />
    </>
  )
}

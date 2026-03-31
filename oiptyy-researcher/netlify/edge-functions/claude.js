// Standard Netlify Function (not Edge) — supports up to 26s default, 
// set netlify.toml [functions] timeout = 60 for longer

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

async function callAnthropic(apiKey, payload) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'anthropic-version': '2023-06-01',
      'x-api-key': apiKey,
    },
    body: JSON.stringify(payload)
  })
  const text = await res.text()
  let data
  try { data = JSON.parse(text) } catch { data = { raw: text } }
  return { ok: res.ok, status: res.status, data }
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: CORS, body: '' }
  }

  const anthropicKey = process.env.ANTHROPIC_API_KEY
  if (!anthropicKey) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json', ...CORS },
      body: JSON.stringify({ error: 'ANTHROPIC_API_KEY not set' })
    }
  }

  let body
  try {
    body = JSON.parse(event.body || '{}')
  } catch (e) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json', ...CORS },
      body: JSON.stringify({ error: 'Invalid JSON', detail: e.message })
    }
  }

  // ── Research mode ─────────────────────────────────────────────────────────
  if (body.research_company) {
    const name = body.research_company

    try {
      const { ok, status, data } = await callAnthropic(anthropicKey, {
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 2000,
        system: `You are a B2B intelligence researcher. Use web_search to research companies. Search for: (1) company owner/CEO, (2) owner background and hobbies, (3) company reviews and complaints. Then write your JSON answer.`,
        tools: [{ type: 'web_search_20250305', name: 'web_search', max_uses: 3 }],
        messages: [{
          role: 'user',
          content: `Research "${name}" and return ONLY this JSON (no markdown, no preamble, no code blocks):
{
  "industry": "what they do, size, revenue estimate",
  "ownership": "privately held or public, owner name(s) and source",
  "owner_profiles": "owner background, location, education, career history",
  "owner_hobbies": "personal interests, sports, hobbies found online",
  "owner_family": "spouse, children if publicly mentioned",
  "pain_points": "3 operational challenges this business faces",
  "tech_stack": "software tools they likely use",
  "recent_news": "notable news in past 12 months",
  "reviews_negative": "common complaints from Google/Yelp/BBB with quote snippets if found",
  "reviews_positive": "common praise themes from reviews",
  "company_struggles": "real operational problems based on research",
  "email_angle": "personalized 2-3 sentence OPTYy cold email opener using owner first name and a specific struggle found"
}`
        }]
      })

      if (!ok) {
        return {
          statusCode: 500,
          headers: { 'Content-Type': 'application/json', ...CORS },
          body: JSON.stringify({ error: `Anthropic API error ${status}`, detail: data })
        }
      }

      const textBlocks = (data.content || []).filter(b => b.type === 'text').map(b => b.text).join('')
      const match = textBlocks.match(/\{[\s\S]*\}/)

      if (!match) {
        return {
          statusCode: 500,
          headers: { 'Content-Type': 'application/json', ...CORS },
          body: JSON.stringify({ error: 'No JSON in response', stop_reason: data.stop_reason, raw: textBlocks.slice(0, 500) })
        }
      }

      let result
      try { result = JSON.parse(match[0]) }
      catch (e) {
        return {
          statusCode: 500,
          headers: { 'Content-Type': 'application/json', ...CORS },
          body: JSON.stringify({ error: 'JSON parse failed', detail: e.message, raw: match[0].slice(0, 300) })
        }
      }

      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json', ...CORS },
        body: JSON.stringify({ result })
      }

    } catch (e) {
      return {
        statusCode: 500,
        headers: { 'Content-Type': 'application/json', ...CORS },
        body: JSON.stringify({ error: e.message })
      }
    }
  }

  // ── Standard pass-through ─────────────────────────────────────────────────
  try {
    const { ok, status, data } = await callAnthropic(anthropicKey, body)
    return {
      statusCode: status,
      headers: { 'Content-Type': 'application/json', ...CORS },
      body: JSON.stringify(data)
    }
  } catch (e) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json', ...CORS },
      body: JSON.stringify({ error: e.message })
    }
  }
}
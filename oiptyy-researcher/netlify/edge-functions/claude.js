const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

const ANTHROPIC_HEADERS = {
  'Content-Type': 'application/json',
  'anthropic-version': '2023-06-01',
}

async function callAnthropic(apiKey, payload) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { ...ANTHROPIC_HEADERS, 'x-api-key': apiKey },
    body: JSON.stringify(payload)
  })
  const text = await res.text()
  let data
  try { data = JSON.parse(text) } catch { data = { raw: text } }
  return { ok: res.ok, status: res.status, data }
}

export default async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: CORS })
  }

  const anthropicKey = Deno.env.get('ANTHROPIC_API_KEY')
  if (!anthropicKey) {
    return new Response(JSON.stringify({ error: 'ANTHROPIC_API_KEY not set' }), {
      status: 500, headers: { 'Content-Type': 'application/json', ...CORS }
    })
  }

  let body
  try {
    const text = await req.text()
    body = JSON.parse(text)
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Invalid JSON', detail: e.message }), {
      status: 400, headers: { 'Content-Type': 'application/json', ...CORS }
    })
  }

  // ── Research mode ─────────────────────────────────────────────────────────
  if (body.research_company) {
    const name = body.research_company

    try {
      const { ok, status, data } = await callAnthropic(anthropicKey, {
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4000,
        system: `You are a B2B intelligence researcher. Use web_search multiple times to research companies thoroughly before writing your final JSON answer. Search for: (1) company owner/CEO, (2) owner background and hobbies, (3) company reviews and complaints, (4) recent news.`,
        tools: [{ type: 'web_search_20250305', name: 'web_search', max_uses: 8 }],
        messages: [{
          role: 'user',
          content: `Research "${name}" and return ONLY this JSON (no markdown, no preamble):
{
  "industry": "what they do, size, revenue estimate",
  "ownership": "privately held or public, owner name(s) and source",
  "owner_profiles": "owner background, location, education, career",
  "owner_hobbies": "personal interests, sports, hobbies found online",
  "owner_family": "spouse, children if publicly mentioned",
  "pain_points": "3 operational challenges this business faces",
  "tech_stack": "software tools they likely use",
  "recent_news": "notable news in past 12 months",
  "reviews_negative": "common complaints from Google/Yelp/BBB with quote snippets",
  "reviews_positive": "common praise themes",
  "company_struggles": "real operational problems based on research",
  "email_angle": "personalized 2-3 sentence OPTYy cold email opener using owner first name and a specific struggle found"
}`
        }]
      })

      if (!ok) {
        return new Response(JSON.stringify({
          error: `Anthropic API error ${status}`,
          detail: data
        }), { status: 500, headers: { 'Content-Type': 'application/json', ...CORS } })
      }

      // Extract the final text content (Claude may do multiple search rounds internally)
      const textBlocks = (data.content || []).filter(b => b.type === 'text').map(b => b.text).join('')
      const match = textBlocks.match(/\{[\s\S]*\}/)

      if (!match) {
        return new Response(JSON.stringify({
          error: 'No JSON found in response',
          stop_reason: data.stop_reason,
          raw: textBlocks.slice(0, 1000)
        }), { status: 500, headers: { 'Content-Type': 'application/json', ...CORS } })
      }

      let result
      try {
        result = JSON.parse(match[0])
      } catch (e) {
        return new Response(JSON.stringify({
          error: 'JSON parse failed',
          detail: e.message,
          raw: match[0].slice(0, 500)
        }), { status: 500, headers: { 'Content-Type': 'application/json', ...CORS } })
      }

      return new Response(JSON.stringify({ result }), {
        status: 200, headers: { 'Content-Type': 'application/json', ...CORS }
      })

    } catch (e) {
      return new Response(JSON.stringify({ error: e.message, stack: e.stack?.slice(0, 500) }), {
        status: 500, headers: { 'Content-Type': 'application/json', ...CORS }
      })
    }
  }

  // ── Standard pass-through ─────────────────────────────────────────────────
  try {
    const { ok, status, data } = await callAnthropic(anthropicKey, body)
    return new Response(JSON.stringify(data), {
      status,
      headers: { 'Content-Type': 'application/json', ...CORS }
    })
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500, headers: { 'Content-Type': 'application/json', ...CORS }
    })
  }
}

export const config = { path: '/api/claude' }
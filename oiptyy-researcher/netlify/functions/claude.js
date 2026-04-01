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

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
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

  if (body.research_company) {
    const name = body.research_company

    try {
      const { ok, status, data } = await callAnthropic(apiKey, {
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: 2000,
        tools: [{ type: 'web_search_20250305', name: 'web_search', max_uses: 4 }],
        messages: [{
          role: 'user',
          content: `Research the company "${name}". Search for: (1) owner/CEO name and background, (2) customer reviews across multiple years, (3) their website pricing page, (4) the local market they serve. Return ONLY this JSON with no markdown or extra text:
{
  "industry": "what they do and estimated size",
  "ownership": "privately held or public, owner name if found",
  "owner_profiles": "owner background and location if found",
  "owner_hobbies": "owner interests or hobbies if found online",
  "owner_family": "spouse or children if publicly mentioned",
  "pain_points": "3 operational challenges this business likely faces",
  "tech_stack": "software tools they likely use",
  "recent_news": "any notable news in past 12 months",
  "reviews_negative": "common complaints from reviews if found",
  "reviews_positive": "common praise from reviews if found",
  "reviews_trend": "is review sentiment improving or declining over time? Compare older vs newer reviews. State: Improving / Declining / Stable and explain why.",
  "online_pricing": "does the company show transparent pricing on their website? Yes or No, and describe what is visible.",
  "market_population": "estimate households or businesses in the geographic market they serve. Include city/region and population.",
  "market_competition": "how competitive is their local market? Name 2-3 direct local competitors if found. Is market saturated, growing, or underserved?",
  "company_struggles": "real problems this business appears to face based on all research",
  "email_angle": "personalized 2-3 sentence OPTYy cold email opener referencing owner by first name and a specific struggle"
}`
        }]
      })

      if (!ok) {
        return {
          statusCode: 500,
          headers: { 'Content-Type': 'application/json', ...CORS },
          body: JSON.stringify({ error: `Anthropic ${status}`, detail: data })
        }
      }

      const textBlocks = (data.content || []).filter(b => b.type === 'text').map(b => b.text).join('')
      const match = textBlocks.match(/\{[\s\S]*\}/)

      if (!match) {
        return {
          statusCode: 500,
          headers: { 'Content-Type': 'application/json', ...CORS },
          body: JSON.stringify({ error: 'No JSON in response', raw: textBlocks.slice(0, 500) })
        }
      }

      let result
      try { result = JSON.parse(match[0]) }
      catch (e) {
        return {
          statusCode: 500,
          headers: { 'Content-Type': 'application/json', ...CORS },
          body: JSON.stringify({ error: 'JSON parse failed', detail: e.message })
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

  // Standard pass-through
  try {
    const { ok, status, data } = await callAnthropic(apiKey, body)
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
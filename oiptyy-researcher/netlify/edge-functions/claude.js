const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export default async (req, context) => {
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
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'anthropic-version': '2023-06-01',
          'x-api-key': anthropicKey,
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-5-20250929',
          max_tokens: 1500,
          tools: [{ type: 'web_search_20250305', name: 'web_search', max_uses: 4 }],
          messages: [{
            role: 'user',
            content: `Research the company "${name}". Search for: (1) owner/CEO name and background, (2) customer reviews and complaints across multiple years, (3) their pricing page or any online pricing, (4) the local market they serve. Return ONLY this JSON with no markdown or extra text:
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
  "reviews_trend": "is the review sentiment improving or declining over time? Compare older vs newer reviews — note any shift in rating, tone, or recurring themes. State direction: Improving / Declining / Stable, and explain why.",
  "online_pricing": "does the company display transparent pricing on their website? Yes or No, and describe what pricing info is visible if any (e.g. starting at $X, package tiers, call for quote, etc.)",
  "market_population": "estimate the number of households or businesses in the geographic market they serve. Include the city/region name, approximate population, and household count if available.",
  "market_competition": "how competitive is their local market? Name 2-3 direct local competitors if found. Is the market saturated, growing, or underserved?",
  "company_struggles": "real problems this business appears to face based on all research",
  "email_angle": "personalized 2-3 sentence OPTYy cold email opener referencing owner by first name and a specific struggle found in research"
}`
          }]
        })
      })

      const rawText = await res.text()

      if (!res.ok) {
        return new Response(JSON.stringify({ error: `Anthropic ${res.status}`, detail: rawText }), {
          status: 500, headers: { 'Content-Type': 'application/json', ...CORS }
        })
      }

      const data = JSON.parse(rawText)
      const textBlocks = (data.content || []).filter(b => b.type === 'text').map(b => b.text).join('')
      const match = textBlocks.match(/\{[\s\S]*\}/)

      if (!match) {
        return new Response(JSON.stringify({ error: 'No JSON in response', raw: textBlocks.slice(0, 500) }), {
          status: 500, headers: { 'Content-Type': 'application/json', ...CORS }
        })
      }

      return new Response(JSON.stringify({ result: JSON.parse(match[0]) }), {
        status: 200, headers: { 'Content-Type': 'application/json', ...CORS }
      })

    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), {
        status: 500, headers: { 'Content-Type': 'application/json', ...CORS }
      })
    }
  }

  // ── Standard pass-through ─────────────────────────────────────────────────
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
        'x-api-key': anthropicKey,
      },
      body: JSON.stringify(body)
    })
    const data = await res.text()
    return new Response(data, {
      status: res.status,
      headers: { 'Content-Type': 'application/json', ...CORS }
    })
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500, headers: { 'Content-Type': 'application/json', ...CORS }
    })
  }
}

export const config = { path: '/api/claude' }
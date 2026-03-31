const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
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
  try { body = await req.json() } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400, headers: { 'Content-Type': 'application/json', ...CORS }
    })
  }

  // ── Research mode ─────────────────────────────────────────────────────────
  // web_search_20250305 executes automatically on Anthropic's servers.
  // We just make ONE call — Claude runs all its searches internally and
  // returns end_turn with the final JSON when done.
  if (body.research_company) {
    const name = body.research_company

    const systemPrompt = `You are a deep B2B intelligence researcher. You MUST use the web_search tool multiple times before writing your final JSON answer. Do NOT skip searches or invent information.

Required searches before answering:
1. Search "[company name] owner founder CEO" to find who owns it
2. Search "[owner name] background hobbies family LinkedIn" to find owner profile
3. Search "[company name] reviews complaints BBB Yelp Google" to find customer feedback
4. Search "[company name] news 2024 2025" for recent developments

Only after completing all 4 searches, output your final JSON.`

    const userPrompt = `Research this company thoroughly using web search: "${name}"

After completing all required searches, return ONLY a valid JSON object — no markdown, no preamble:
{
  "industry": "What the company does, their industry, estimated headcount and revenue range",
  "ownership": "Privately held or public? Owner/founder full name(s) and source where found",
  "owner_profiles": "Owner background: where they live, education, career history, how long they have owned the business",
  "owner_hobbies": "Owner personal interests found online: sports, golf, fishing, hunting, church, charity, teams they follow",
  "owner_family": "Spouse name, children if publicly mentioned in interviews or social media. Only public info.",
  "pain_points": "3 specific operational challenges this type of business faces",
  "tech_stack": "Software tools they likely use: CRM, scheduling, marketing, communication tools",
  "recent_news": "News, awards, expansions, hires, or problems from the past 12 months",
  "reviews_negative": "Most common complaints from Google, Yelp, BBB, or Trustpilot. Include 1-2 direct quote snippets from real reviews if found.",
  "reviews_positive": "Most common praise themes from reviews",
  "company_struggles": "Based on reviews and research, what real problems is this business facing operationally right now?",
  "email_angle": "Personalized 2-3 sentence cold email opener for OPTYy. Use owner first name if found, reference a specific real struggle or complaint."
}`

    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': anthropicKey,
          'anthropic-version': '2023-06-01',
          'anthropic-beta': 'web-search-2025-03-05',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 4000,
          system: systemPrompt,
          tools: [{ type: 'web_search_20250305', name: 'web_search' }],
          messages: [{ role: 'user', content: userPrompt }]
        })
      })

      if (!res.ok) {
        const err = await res.text()
        return new Response(JSON.stringify({ error: `Anthropic ${res.status}`, detail: err }), {
          status: 500, headers: { 'Content-Type': 'application/json', ...CORS }
        })
      }

      const data = await res.json()
      const text  = data.content.filter(b => b.type === 'text').map(b => b.text).join('')
      const match = text.match(/\{[\s\S]*\}/)

      if (!match) {
        return new Response(JSON.stringify({ error: 'No JSON in response', raw: text.slice(0, 800) }), {
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
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': anthropicKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(body)
    })
    const data = await response.text()
    return new Response(data, {
      status: response.status,
      headers: { 'Content-Type': 'application/json', ...CORS }
    })
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500, headers: { 'Content-Type': 'application/json', ...CORS }
    })
  }
}

export const config = { path: '/api/claude' }
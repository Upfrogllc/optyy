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

  // ── Research mode: full agentic loop handled server-side ──────────────────
  if (body.research_company) {
    const name = body.research_company

    const systemPrompt = `You are a deep B2B intelligence researcher. You MUST use the web_search tool multiple times before writing your final JSON answer. Do NOT skip searches or invent information.

Required searches before answering:
1. "[company name] owner founder CEO" — who owns it
2. "[owner name] background hobbies family" — owner profile  
3. "[company name] reviews complaints BBB Yelp Google" — customer feedback
4. "[company name] news 2024 2025" — recent developments`

    const userPrompt = `Research this company thoroughly: "${name}"

After completing all required searches, return ONLY a valid JSON object with no markdown, no preamble, no trailing commas:
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

    const tools = [{ type: 'web_search_20250305', name: 'web_search' }]
    const messages = [{ role: 'user', content: userPrompt }]

    try {
      for (let round = 0; round < 10; round++) {
        const res = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': anthropicKey,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 3000,
            system: systemPrompt,
            tools,
            messages
          })
        })

        if (!res.ok) {
          const err = await res.text()
          return new Response(JSON.stringify({ error: `Anthropic ${res.status}: ${err}` }), {
            status: 500, headers: { 'Content-Type': 'application/json', ...CORS }
          })
        }

        const data = await res.json()
        messages.push({ role: 'assistant', content: data.content })

        // Claude finished — extract JSON from final text
        if (data.stop_reason === 'end_turn') {
          const text  = data.content.filter(b => b.type === 'text').map(b => b.text).join('')
          const match = text.match(/\{[\s\S]*\}/)
          if (!match) {
            return new Response(JSON.stringify({ error: 'No JSON in response', raw: text.slice(0, 500) }), {
              status: 500, headers: { 'Content-Type': 'application/json', ...CORS }
            })
          }
          return new Response(JSON.stringify({ result: JSON.parse(match[0]) }), {
            status: 200, headers: { 'Content-Type': 'application/json', ...CORS }
          })
        }

        // Claude used tools — the web_search tool is server-executed by Anthropic
        // We just need to pass tool_result blocks back to continue the loop
        const toolUses = data.content.filter(b => b.type === 'tool_use')
        if (!toolUses.length) break

        messages.push({
          role: 'user',
          content: toolUses.map(tu => ({
            type: 'tool_result',
            tool_use_id: tu.id,
            content: 'Search complete. Continue with remaining searches then write final JSON.'
          }))
        })
      }

      return new Response(JSON.stringify({ error: 'Research loop did not complete' }), {
        status: 500, headers: { 'Content-Type': 'application/json', ...CORS }
      })

    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), {
        status: 500, headers: { 'Content-Type': 'application/json', ...CORS }
      })
    }
  }

  // ── Standard pass-through for all other Claude calls ─────────────────────
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

export default async (req, context) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    })
  }

  const url = new URL(req.url)
  const path = url.pathname.replace('/api/ghl', '')
  const ghlUrl = `https://services.leadconnectorhq.com${path}${url.search}`

  const body = req.method !== 'GET' ? await req.text() : undefined
  const authHeader = req.headers.get('Authorization') || ''

  const response = await fetch(ghlUrl, {
    method: req.method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': authHeader,
      'Version': '2021-07-28',
    },
    body
  })

  const data = await response.text()

  return new Response(data, {
    status: response.status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    }
  })
}

export const config = { path: '/api/ghl/*' }

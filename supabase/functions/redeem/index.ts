import { createClient } from 'npm:@supabase/supabase-js@2'

type RequestBody = {
  token?: string
  station_id?: string
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

  if (!supabaseUrl || !serviceRoleKey) {
    return new Response(JSON.stringify({ error: 'Missing server configuration' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  let body: RequestBody
  try {
    body = (await req.json()) as RequestBody
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  if (!body.token) {
    return new Response(JSON.stringify({ error: 'token is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const serviceClient = createClient(supabaseUrl, serviceRoleKey)

  const { data, error } = await serviceClient.rpc('redeem_drink_ticket', {
    p_token: body.token,
    p_station_id: body.station_id ?? 'UNKNOWN',
  })

  if (error || !data?.[0]) {
    return new Response(JSON.stringify({ error: error?.message ?? 'Failed to redeem' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const result = data[0]

  return new Response(
    JSON.stringify({
      status: result.status,
      remaining_tickets: result.remaining_tickets,
      user_id: result.user_id,
      event_id: result.event_id,
      redemption_id: result.redemption_id,
    }),
    {
      status: result.status === 'success' ? 200 : 409,
      headers: { 'Content-Type': 'application/json' },
    }
  )
})

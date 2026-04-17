import { createClient } from 'npm:@supabase/supabase-js@2'

type RequestBody = {
  user_id?: string
  event_id?: string
  ttl_seconds?: number
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY')
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    return new Response(JSON.stringify({ error: 'Missing server configuration' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const authHeader = req.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const token = authHeader.replace('Bearer ', '').trim()
  const userClient = createClient(supabaseUrl, anonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  })

  const {
    data: { user },
    error: userError,
  } = await userClient.auth.getUser()

  if (userError || !user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
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

  if (!body.event_id) {
    return new Response(JSON.stringify({ error: 'event_id is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const userId = body.user_id ?? user.id
  if (userId !== user.id) {
    return new Response(JSON.stringify({ error: 'Cannot request token for another user' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const serviceClient = createClient(supabaseUrl, serviceRoleKey)
  const ttl = Math.max(30, Math.min(60, body.ttl_seconds ?? 45))

  const { data, error } = await serviceClient.rpc('issue_redemption_token', {
    p_user_id: user.id,
    p_event_id: body.event_id,
    p_ttl_seconds: ttl,
  })

  if (error || !data?.[0]) {
    const message = error?.message ?? 'Failed to generate token'
    return new Response(JSON.stringify({ error: message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  return new Response(
    JSON.stringify({
      token: data[0].token,
      expires_at: data[0].expires_at,
      ttl_seconds: ttl,
    }),
    {
      headers: { 'Content-Type': 'application/json' },
    }
  )
})

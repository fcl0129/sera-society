-- Send a premium "Request received" email to the requester and allow sender customization.

ALTER TABLE public.app_settings
  ADD COLUMN IF NOT EXISTS access_request_from_email TEXT NOT NULL DEFAULT 'noreply@serasociety.com',
  ADD COLUMN IF NOT EXISTS access_request_platform_url TEXT NOT NULL DEFAULT 'https://serasociety.com/platform';

CREATE OR REPLACE FUNCTION public.enqueue_access_request_email()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  owner_email TEXT;
  from_email TEXT;
  platform_url TEXT;
  owner_message_id TEXT;
  requester_message_id TEXT;
  requester_html TEXT;
  requester_text TEXT;
BEGIN
  SELECT
    owner_notification_email,
    access_request_from_email,
    access_request_platform_url
  INTO
    owner_email,
    from_email,
    platform_url
  FROM public.app_settings
  WHERE id = 1;

  IF owner_email IS NULL OR owner_email = '' THEN
    owner_email := 'admin@serasociety.com';
  END IF;

  IF from_email IS NULL OR from_email = '' THEN
    from_email := 'noreply@serasociety.com';
  END IF;

  IF platform_url IS NULL OR platform_url = '' THEN
    platform_url := 'https://serasociety.com/platform';
  END IF;

  owner_message_id := gen_random_uuid()::text;

  INSERT INTO public.email_send_log (message_id, template_name, recipient_email, status, metadata)
  VALUES (
    owner_message_id,
    'access_request_owner_notification',
    owner_email,
    'pending',
    jsonb_build_object(
      'request_id', NEW.id,
      'requester_email', NEW.email
    )
  );

  PERFORM pgmq.send(
    'transactional_emails',
    jsonb_build_object(
      'run_id', owner_message_id,
      'message_id', owner_message_id,
      'to', owner_email,
      'from', format('Sera Society <%s>', from_email),
      'sender_domain', 'admin.serasociety.com',
      'subject', 'Ny ansökan om access till Sera Society',
      'html', format(
        '<h2>Ny ansökan mottagen</h2><p><strong>Namn:</strong> %s</p><p><strong>E-post:</strong> %s</p><p><strong>Event:</strong> %s</p><p>Öppna adminpanelen för att godkänna eller avslå ansökan.</p>',
        NEW.name,
        NEW.email,
        coalesce(NEW.events_details, '—')
      ),
      'text', format(
        'Ny ansökan mottagen.\nNamn: %s\nE-post: %s\nEvent: %s\nÖppna adminpanelen för att godkänna eller avslå ansökan.',
        NEW.name,
        NEW.email,
        coalesce(NEW.events_details, '—')
      ),
      'label', 'access_request_owner_notification',
      'queued_at', now()
    )
  );

  requester_message_id := gen_random_uuid()::text;

  requester_html := format(
    '<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#f6f3ee;font-family:Inter,-apple-system,BlinkMacSystemFont,''Segoe UI'',Roboto,Helvetica,Arial,sans-serif;color:#1b2a44;">
    <table role="presentation" width="100%%" cellspacing="0" cellpadding="0" style="padding:36px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%%" cellspacing="0" cellpadding="0" style="max-width:480px;background:#f6f3ee;">
            <tr>
              <td style="padding:10px 0 28px 0;text-align:center;">
                <div style="font-size:28px;line-height:1.1;font-family:Georgia,''Times New Roman'',serif;letter-spacing:0.01em;color:#1b2a44;">Sera Society</div>
              </td>
            </tr>
            <tr>
              <td style="padding:0 8px 8px 8px;text-align:center;">
                <h1 style="margin:0;font-family:Georgia,''Times New Roman'',serif;font-size:36px;font-weight:500;line-height:1.2;color:#1b2a44;">Request received</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:0 8px 24px 8px;text-align:center;">
                <p style="margin:0;font-size:16px;line-height:1.6;color:#1b2a44;opacity:0.85;">We&rsquo;re reviewing your request</p>
              </td>
            </tr>
            <tr>
              <td style="padding:0 8px 30px 8px;">
                <p style="margin:0;font-size:16px;line-height:1.9;color:#1b2a44;">
                  We&rsquo;re currently onboarding a limited number of events.<br /><br />
                  We&rsquo;ll get back to you shortly with next steps.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:0 8px 40px 8px;">
                <a href="%s" style="display:inline-block;padding:12px 20px;border:1px solid #1b2a44;color:#1b2a44;text-decoration:none;font-size:13px;letter-spacing:0.12em;text-transform:uppercase;">View platform</a>
              </td>
            </tr>
            <tr>
              <td style="padding:0 8px 4px 8px;">
                <p style="margin:0;font-size:12px;line-height:1.6;color:#1b2a44;opacity:0.45;">Sera Society</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>',
    platform_url
  );

  requester_text := format(
    'Request received\n\nWe''re reviewing your request\n\nWe''re currently onboarding a limited number of events.\n\nWe''ll get back to you shortly with next steps.\n\nView platform: %s\n\nSera Society',
    platform_url
  );

  INSERT INTO public.email_send_log (message_id, template_name, recipient_email, status, metadata)
  VALUES (
    requester_message_id,
    'access_request_request_received',
    NEW.email,
    'pending',
    jsonb_build_object(
      'request_id', NEW.id,
      'requester_email', NEW.email
    )
  );

  PERFORM pgmq.send(
    'transactional_emails',
    jsonb_build_object(
      'run_id', requester_message_id,
      'message_id', requester_message_id,
      'to', NEW.email,
      'from', format('Sera Society <%s>', from_email),
      'sender_domain', 'admin.serasociety.com',
      'subject', 'Request received',
      'html', requester_html,
      'text', requester_text,
      'label', 'access_request_request_received',
      'queued_at', now()
    )
  );

  RETURN NEW;
END;
$$;

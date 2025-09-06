import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { email, business_name, contact_person } = await req.json();
    if (!email) return NextResponse.json({ error: 'email required' }, { status: 400 });

    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 1) Create user if not exists (confirmed so they can log in after setting password)
    await admin.auth.admin.createUser({ email, email_confirm: true }).catch(() => { });

    // 2) Generate set-password (recovery) link with redirect to our reset page
    const { data: linkData, error: linkErr } = await admin.auth.admin.generateLink({
      type: 'recovery',
      email,
      options: { redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password` }
    });
    if (linkErr || !linkData?.properties?.action_link) {
      return NextResponse.json({ error: linkErr?.message || 'link_failed' }, { status: 500 });
    }
    const resetUrl = linkData.properties.action_link as string;

    // 3) Upsert a shell business row (optional convenience)
    await admin.from('business_profiles').upsert(
      { email, business_name: business_name || '', contact_person: contact_person || '' },
      { onConflict: 'email' }
    );

    // 4) INSERT into invites (this is the missing piece)
    //    status 'pending', type 'merchant', store the action_link for audit/UX
    const expiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(); // 72h, optional
    const { error: inviteErr } = await admin.from('invites').insert({
      email,
      token: crypto.randomUUID(),         // optional; not used by recovery flow but keeps schema happy
      status: 'pending',
      invite_type: 'merchant',
      action_link: resetUrl,
      meta: { business_name, contact_person, channel: 'email' },
      created_by: null,                   // or set current admin id if you track it
      expires_at: expiresAt
    });
    if (inviteErr) {
      // not fatal to user, but log it so you can debug
      console.error('Invite insert failed:', inviteErr.message);
    }

    // 4) Email the link
    const { data: sendData, error: sendErr } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
      to: email,
      subject: `You're invited to Social Media AI Agent`,
      html: `
      <p>Hi ${contact_person || ''},</p>
      <p>You’ve been invited to onboard <b>${business_name || 'your business'}</b>.</p>
      <p><a href="${resetUrl}">Click here to set your password</a>, then sign in.</p>
      <p>After login, you’ll land on your merchant dashboard to complete your business profile and subscribe.</p>
    `,
      text: `Set your password: ${resetUrl}`,
    }) as any;
    if (sendErr) {
      console.error('Resend send error:', sendErr);
      return NextResponse.json({ error: sendErr.message || 'send_failed' }, { status: 500 });
    }
    return NextResponse.json({ ok: true, messageId: sendData?.id || null });
  } catch (e: any) {
    console.error('Invite route fatal error:', e?.message);
    return NextResponse.json({ error: e?.message || 'unexpected_error' }, { status: 500 });
  }
}

export async function GET() {
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const { data, error } = await admin
    .from('invites')
    .select('id,email,status,invite_type,created_at,action_link')
    .order('created_at', { ascending: false })
    .limit(10);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ invites: data || [] });
}

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function POST(req: Request) {
  try {
    const sb = createRouteHandlerClient({ cookies });
    const { data: { session } } = await sb.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const preferenceId: string | undefined = body.preferenceId;

    // Optionally load the selected preference
    let prefs: any = null;
    if (preferenceId) {
      const { data: prefData, error: prefErr } = await sb
        .from('content_preferences')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('id', preferenceId)
        .maybeSingle();
      if (prefErr) {
        console.error('[generate] load prefs error:', prefErr);
        return NextResponse.json({ error: prefErr.message }, { status: 500 });
      }
      prefs = prefData;
    }

    // Persist a snapshot of criteria (optional) — handle errors without .catch()
    if (body.persistPreferenceSnapshot) {
      const { error: insErr } = await sb.from('content_preferences').insert({
        user_id: session.user.id,
        name: body.name || 'Generated Snapshot',
        content_type: body.content_type || prefs?.content_type || 'text',
        categories: Array.isArray(body.categories) && body.categories.length ? body.categories : (prefs?.categories || []),
        idea: body.idea || prefs?.idea || null,
        tone: prefs?.tone || null,
        audience: prefs?.audience || null,
        geo_focus: prefs?.geo_focus || null,
        preferred_hashtags: prefs?.preferred_hashtags || [],
        banned_hashtags: prefs?.banned_hashtags || [],
        platforms: prefs?.platforms || [],
        emoji_style: prefs?.emoji_style || 'minimal',
        frequency: prefs?.frequency ?? null,
        preferred_times: prefs?.preferred_times || [],
        timezone: prefs?.timezone || null,
        approval_required: prefs?.approval_required ?? true,
      });
      // ignore insErr on purpose
      if (insErr) console.warn('[generate] snapshot insert ignored:', insErr.message);
    }

    // Merge request with prefs
    const content_type: 'text'|'image'|'video' = body.content_type || prefs?.content_type || 'text';
    if (content_type !== 'text') {
      return NextResponse.json({ error: 'Only text generation is implemented in this endpoint.' }, { status: 400 });
    }

    const categories: string[] =
      (Array.isArray(body.categories) && body.categories.length ? body.categories : (prefs?.categories || []));

    const idea: string = body.idea || prefs?.idea || 'General brand awareness';
    const tone = prefs?.tone;
    const audience = prefs?.audience;
    const geo = prefs?.geo_focus;
    const prefTags = (prefs?.preferred_hashtags || []).map((t: string)=>'#'+t);
    const banned = (prefs?.banned_hashtags || []).map((t: string)=>'#'+t);
    const emoji = prefs?.emoji_style || 'minimal';
    const platforms = (prefs?.platforms || []);

    const extras: string[] = [];
    if (tone) extras.push(`Tone: ${tone}.`);
    if (audience) extras.push(`Audience: ${audience}.`);
    if (geo) extras.push(`Geography: ${geo}.`);
    if (prefTags.length) extras.push(`Prefer these hashtags when relevant: ${prefTags.join(' ')}.`);
    if (banned.length) extras.push(`Never use these hashtags: ${banned.join(' ')}.`);
    extras.push(`Emoji usage: ${emoji}.`);
    if (platforms.length) extras.push(`Target platforms: ${platforms.join(', ')}.`);

    const categoryLine = categories.length ? `Themes: ${categories.join(', ')}.` : '';

    const prompt = `
You are a social media copywriter for a small business.

${extras.join('\n')}

Write 5 distinct, catchy TEXT posts based on:
- Core idea: "${idea}"
- ${categoryLine}

Rules:
- Compelling first line, clear value, authentic voice aligned with tone.
- Add 3–6 relevant hashtags per post (mix broad + niche). Avoid banned/spammy tags.
- Keep each post under 280 characters including hashtags.
- No numbering or commentary in output. Return strict JSON only:
{
  "posts": [
    {"text": "<post 1>"},
    {"text": "<post 2>"},
    {"text": "<post 3>"},
    {"text": "<post 4>"},
    {"text": "<post 5>"}
  ]
}
`.trim();

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: 'You write concise social media posts with tasteful hashtags.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.9,
    });

    const raw = completion.choices[0]?.message?.content || '{}';
    let parsed: any = {};
    try { parsed = JSON.parse(raw); } catch (e) {
      console.error('[generate] JSON parse fail. raw:', raw);
      return NextResponse.json({ error: 'Model returned non-JSON output. Try again.' }, { status: 502 });
    }

    const posts: string[] = Array.isArray(parsed.posts)
      ? parsed.posts.map((p: any) => (typeof p?.text === 'string' ? p.text.trim() : '')).filter(Boolean)
      : [];

    if (posts.length < 1) {
      return NextResponse.json({ error: 'No posts generated. Try adjusting your idea/categories.' }, { status: 502 });
    }

    // Limit to 5
    return NextResponse.json({ posts: posts.slice(0, 5) });

  } catch (e: any) {
    console.error('[generate] fatal', e?.message, e);
    return NextResponse.json({ error: e?.message || 'unexpected_error' }, { status: 500 });
  }
}

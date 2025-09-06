import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

const INDUSTRIES = [
    'Real Estate', 'Technology', 'Healthcare', 'Finance', 'Restaurant',
    'Education', 'Retail', 'Automotive', 'Fitness', 'Other'
] as const;
type Industry = (typeof INDUSTRIES)[number];

function normalizePhone(p: string | null | undefined) {
    if (!p) return null;
    // strip non-digits
    const digits = p.replace(/[^0-9]/g, '');
    if (digits.length < 10 || digits.length > 15) return null;
    // naive E.164-like (no country detection): assume US if 10 digits
    if (digits.length === 10) return `+1${digits}`;
    return `+${digits}`;
}

export async function GET() {
    try {
        const sb = createRouteHandlerClient({ cookies });
        const { data: { session } } = await sb.auth.getSession();
        if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

        const { data, error } = await sb
            .from('business_profiles')
            .select(`
                id,user_id,email,business_name,
                website,
                address1,address2,city,state,zip,
                phone,
                contact_person,
                ein,
                industry,
                created_at
                `)
            .eq('user_id', session.user.id)
            .maybeSingle();

        // if (data) return NextResponse.json({ profile: data || null, industries: INDUSTRIES });

        // // Fallback (best-effort): if no row by user_id, try by email (may be blocked by RLS depending on your policies)
        // const { data: fallback } = await sb
        //     .from('business_profiles')
        //     .select('id,email,business_name,website,address1,address2,city,state,zip,phone,contact_person,ein,industry,created_at,updated_at')
        //     .eq('email', session.user.email)
        //     .maybeSingle()
        //     .catch(() => ({ data: null as any }));

        // if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        if (error) {
            console.error('[GET profile] supabase error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
        return NextResponse.json({ profile: data || null, industries: INDUSTRIES });
    } catch (e: any) {
        console.error('[GET profile] fatal:', e?.message, e);
        return NextResponse.json({ error: e?.message || 'unexpected_error' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const sb = createRouteHandlerClient({ cookies });
    const { data: { session } } = await sb.auth.getSession();
    if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

    const body = await req.json();

    // Validate industry
    const industry: Industry | null =
        body.industry && INDUSTRIES.includes(body.industry) ? body.industry : null;

    // Validate/normalize phone
    const phone = normalizePhone(body.phone);
    if (body.phone && !phone) {
        return NextResponse.json({ error: 'Invalid phone number. Use a valid number (10–15 digits).' }, { status: 400 });
    }

    const payload = {
        user_id: session.user.id,
        email: body.email || session.user.email,
        business_name: body.business_name ?? '',
        website: body.website ?? null,
        address1: body.address1 ?? null,
        address2: body.address2 ?? null,
        city: body.city ?? null,
        state: body.state ?? null,
        zip: body.zip ?? null,
        phone,
        contact_person: body.contact_person ?? null,
        ein: body.ein ?? null,
        industry, // enum
    };

    const { data: existing } = await sb
        .from('business_profiles').select('id').eq('user_id', session.user.id).maybeSingle();

    const q = existing
        ? sb.from('business_profiles').update(payload).eq('id', existing.id).select().single()
        : sb.from('business_profiles').insert(payload).select().single();

    const { data, error } = await q;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ profile: data });
}

'use client';
import { useEffect, useState } from 'react';
import { Pencil, ChevronDown } from 'lucide-react';

type Profile = {
  id?: string;
  email?: string | null;
  business_name?: string;
  website?: string | null;
  address1?: string | null;
  address2?: string | null;
  city?: string | null;
  state?: string | null;
  zip?: string | null;
  phone?: string | null;
  contact_person?: string | null;
  industry?: string | null;
  ein?: string | null;
};

const INDUSTRY_FALLBACK = [
  'Real Estate', 'Technology', 'Healthcare', 'Finance', 'Restaurant',
  'Education', 'Retail', 'Automotive', 'Fitness', 'Other'
];

export default function BusinessInfoPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [industries, setIndustries] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Profile>({});
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/merchant/profile', { cache: 'no-store' });
        const data = await res.json();
        setProfile(data.profile);
        setForm(data.profile || {});
        setIndustries((data.industries && data.industries.length) ? data.industries : INDUSTRY_FALLBACK);
      } catch {
        setIndustries(INDUSTRY_FALLBACK); // fallback if API fails
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  function set<K extends keyof Profile>(key: K, value: Profile[K]) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  // simple client validation for phone (let server be the final judge)
  function isPhoneValid(p?: string | null) {
    if (!p) return true;
    const digits = p.replace(/[^0-9]/g, '');
    return digits.length >= 10 && digits.length <= 15;
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (!form.business_name || form.business_name.trim() === '') {
      setErr('Business name is required.');
      return;
    }
    if (!isPhoneValid(form.phone)) {
      setErr('Invalid phone number. Use a valid number (10–15 digits).');
      return;
    }
    setSaving(true);
    const res = await fetch('/api/merchant/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (res.ok) {
      const data = await res.json();
      setProfile(data.profile);
      setEditing(false);
    } else {
      const j = await res.json().catch(() => ({}));
      setErr(j.error || 'Save failed');
    }
  }

  if (loading) return <div className="p-6">Loading…</div>;

  // CARD view
  if (profile && !editing) {
    return (
      <div className="card max-w-3xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">Business Information</h1>
            <p className="text-sm text-[rgb(var(--muted))]">Your merchant profile</p>
          </div>
          <button
            onClick={() => { setForm(profile); setEditing(true); }}
            className="btn btn-outline"
            aria-label="Edit business info"
            title="Edit"
          >
            <Pencil className="w-4 h-4" />
            Edit
          </button>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoItem label="Business Name" value={profile.business_name || '—'} />
          <InfoItem label="Contact Person" value={profile.contact_person || '—'} />
          <InfoItem label="Email" value={profile.email || '—'} />
          <InfoItem label="Phone" value={profile.phone || '—'} />
          <InfoItem label="EIN / SSN" value={profile.ein || '—'} />
          <InfoItem label="Industry" value={profile.industry || '—'} />
          <InfoItem label="Website" value={profile.website || '—'} />
          <div className="md:col-span-2">
            <InfoItem label="Address 1" value={profile.address1 || '—'} />
          </div>
          <div className="md:col-span-2">
            <InfoItem label="Address 2" value={profile.address2 || '—'} />
          </div>
          <InfoItem label="City" value={profile.city || '—'} />
          <InfoItem label="State" value={profile.state || '—'} />
          <InfoItem label="ZIP" value={profile.zip || '—'} />
          
        </div>
      </div>
    );
  }

  // EDIT/CREATE form
  return (
    <div className="card max-w-3xl mx-auto">
      <h1 className="text-xl font-semibold mb-2">{profile ? 'Edit Business Info' : 'Add Business Info'}</h1>
      <p className="text-sm text-[rgb(var(--muted))] mb-4">
        {profile ? 'Update your details below.' : 'Tell us about your business to get started.'}
      </p>

      {err && <div className="mb-3 text-sm text-red-600">{err}</div>}

      <form onSubmit={save} className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="md:col-span-2">
          <label className="text-sm">Business Name *</label>
          <input className="input mt-1" value={form.business_name || ''} onChange={e => set('business_name', e.target.value)} required />
        </div>

        <div>
          <label className="text-sm">Contact Person</label>
          <input className="input mt-1" value={form.contact_person || ''} onChange={e => set('contact_person', e.target.value)} />
        </div>
        <div>
          <label className="text-sm">Phone</label>
          <input className="input mt-1" value={form.phone || ''} onChange={e => set('phone', e.target.value)} placeholder="(555) 555-5555 or +1 555 555 5555" />
          {!isPhoneValid(form.phone) && <div className="text-xs text-red-600 mt-1">10–15 digits required.</div>}
        </div>
        <div>
          <label className="text-sm">EIN / SSN</label>
          <input
            className="input mt-1"
            value={form.ein || ''}
            onChange={e => set('ein', e.target.value)}
            placeholder="12-3456789"
          />
        </div>

        <div>
          <label className="text-sm">Industry</label>
          <div className="relative mt-1">
            <select
              className="select pr-10" /* pr-10 so text doesn't overlap with the chevron */
              value={form.industry || ''}
              onChange={(e) => set('industry', e.target.value)}
            >
              <option value="">Select industry</option>
              {industries.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            <ChevronDown
              className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[rgb(var(--muted))]"
              aria-hidden="true"
            />
          </div>
        </div>

        <div>
          <label className="text-sm">Website</label>
          <input className="input mt-1" value={form.website || ''} onChange={e => set('website', e.target.value)} placeholder="https://example.com" />
        </div>

        <div className="md:col-span-2">
          <label className="text-sm">Address 1</label>
          <input className="input mt-1" value={form.address1 || ''} onChange={e => set('address1', e.target.value)} />
        </div>
        <div className="md:col-span-2">
          <label className="text-sm">Address 2</label>
          <input className="input mt-1" value={form.address2 || ''} onChange={e => set('address2', e.target.value)} />
        </div>

        <div>
          <label className="text-sm">City</label>
          <input className="input mt-1" value={form.city || ''} onChange={e => set('city', e.target.value)} />
        </div>
        <div>
          <label className="text-sm">State</label>
          <input className="input mt-1" value={form.state || ''} onChange={e => set('state', e.target.value)} />
        </div>
        <div>
          <label className="text-sm">ZIP</label>
          <input className="input mt-1" value={form.zip || ''} onChange={e => set('zip', e.target.value)} />
        </div>

        <div className="md:col-span-2 flex gap-2 pt-2">
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </button>
          {profile && (
            <button type="button" className="btn btn-outline" onClick={() => setEditing(false)} disabled={saving}>
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[rgb(var(--ring))] p-3 bg-white dark:bg-[rgb(var(--bg-muted))]">
      <div className="text-xs text-[rgb(var(--muted))]">{label}</div>
      <div className="mt-1 font-medium break-words">{value}</div>
    </div>
  );
}

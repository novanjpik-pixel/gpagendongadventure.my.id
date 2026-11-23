import { createServiceClient } from '@/lib/adminAuth';
import { ALL_FIELDS } from '@/lib/content-schema';

export type { Struktur, SiteContent } from '@/lib/content-defaults';
import { CONTENT_DEFAULTS, type SiteContent } from '@/lib/content-defaults';
export { CONTENT_DEFAULTS };

export const CONTENT_KEYS = ['struktur', ...ALL_FIELDS.map((f) => f.key)] as (keyof SiteContent)[];

/** Gabungkan nilai tersimpan dengan bawaan; untuk objek (map) kunci yang kosong memakai bawaan. */
function merge(def: unknown, val: unknown): unknown {
  if (val == null) return def;
  if (def && typeof def === 'object' && !Array.isArray(def) && typeof val === 'object' && !Array.isArray(val)) {
    const o: Record<string, unknown> = { ...(def as Record<string, unknown>) };
    for (const [k, v] of Object.entries(val as Record<string, unknown>)) if (v !== '' && v != null) o[k] = v;
    return o;
  }
  return val;
}

/** Isi halaman: data dari dashboard admin (Supabase) menimpa bawaan di site.ts. Tidak pernah melempar error. */
export async function getContent(): Promise<SiteContent> {
  const out = { ...CONTENT_DEFAULTS } as unknown as Record<string, unknown>;
  try {
    const { data } = await createServiceClient().from('site_content').select('key,value');
    for (const r of data || []) {
      if ((CONTENT_KEYS as string[]).includes(r.key)) out[r.key] = merge(out[r.key], r.value);
    }
  } catch {
    // Supabase tidak terjangkau: pakai bawaan
  }
  return out as unknown as SiteContent;
}

export const INFO_KEYS = ['kontak', 'media'] as const;

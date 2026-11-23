'use client';

import { useEffect, useState } from 'react';
import { CONTENT_DEFAULTS } from '@/lib/content-defaults';

export interface SiteInfo { kontak: Record<string, string>; media: Record<string, string> }

export function useSiteInfo(): SiteInfo {
  const [info, setInfo] = useState<SiteInfo>({ kontak: CONTENT_DEFAULTS.kontak, media: CONTENT_DEFAULTS.media });
  useEffect(() => {
    fetch('/api/site').then((r) => (r.ok ? r.json() : null)).then((j) => { if (j) setInfo(j); }).catch(() => {});
  }, []);
  return info;
}

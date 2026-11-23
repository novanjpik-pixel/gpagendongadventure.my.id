import { createServiceClient } from '@/lib/adminAuth';
import type { Riset } from '@/lib/riset-shared';
export { RISET_JENIS, driveId } from '@/lib/riset-shared';
export type { Riset } from '@/lib/riset-shared';



// Dipakai bila tabel belum dibuat / Supabase tidak terjangkau.
export const RISET_DEFAULT: Riset[] = [{
  id: 'default-1', jenis: 'Dokumen Kajian Analisis', judul: 'Menilik Narasi Bengkulu Provinsi Konservasi',
  ringkasan: 'Analisis kondisi kawasan hutan, kerusakan ekosistem hutan dan pesisir Bengkulu, serta pemenuhan perwujudan provinsi konservasi: 712,81 ha daratan terkikis (2002–2024), 190,24 km garis pantai terabrasi, 9.167,4 ha deforestasi (2025), dan 1.885 unit terancam rusak/roboh. Disusun oleh GPA Gendong Adventure dan DPC GMNI Bengkulu.',
  tanggal: '2026-08-09', sampul_url: '/riset/sampul-kajian-bengkulu-provinsi-konservasi.jpg', file_url: '/riset/kajian-bengkulu-provinsi-konservasi.pdf', aktif: true, sort_order: 1,
}];

export async function getRiset(includeHidden = false): Promise<Riset[]> {
  try {
    let q = createServiceClient().from('riset_publications').select('*').order('tanggal', { ascending: false }).order('sort_order');
    if (!includeHidden) q = q.eq('aktif', true);
    const { data, error } = await q;
    if (error) return includeHidden ? [] : RISET_DEFAULT;
    return (data as Riset[]) ?? [];
  } catch {
    return includeHidden ? [] : RISET_DEFAULT;
  }
}


export function cleanRiset(b: Record<string, unknown>) {
  const o: Record<string, unknown> = {};
  if (typeof b.jenis === 'string' && b.jenis.trim()) o.jenis = b.jenis.trim().slice(0, 40);
  if (typeof b.judul === 'string' && b.judul.trim()) o.judul = b.judul.trim().slice(0, 200);
  if (typeof b.ringkasan === 'string') o.ringkasan = b.ringkasan.trim().slice(0, 600);
  if (typeof b.tanggal === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(b.tanggal)) o.tanggal = b.tanggal;
  if (typeof b.sampul_url === 'string') o.sampul_url = b.sampul_url.trim().slice(0, 500);
  if (typeof b.file_url === 'string' && b.file_url.trim()) o.file_url = b.file_url.trim().slice(0, 600);
  if (typeof b.aktif === 'boolean') o.aktif = b.aktif;
  return o;
}

export interface Riset {
  id: string; jenis: string; judul: string; ringkasan: string; tanggal: string; sampul_url: string; file_url: string; aktif: boolean; sort_order: number;
}

export const RISET_JENIS = ['Laporan Riset', 'Kajian Kebijakan', 'Kajian Hukum', 'Kajian Sosial', 'Policy Brief', 'Eco-Fiksi'];

/** Id berkas Google Drive dari tautan .../file/d/ID/view atau ?id=ID. */
export function driveId(url: string): string | null {
  const m = url.match(/drive\.google\.com\/file\/d\/([\w-]+)/) || url.match(/drive\.google\.com\/(?:open|uc)\?[^#]*id=([\w-]+)/);
  return m ? m[1] : null;
}

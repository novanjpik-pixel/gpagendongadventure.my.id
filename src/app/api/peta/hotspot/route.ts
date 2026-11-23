// Hotspot NASA FIRMS dinonaktifkan (butuh kunci API). Peta tidak menampilkan lapisan ini.
export async function GET() {
  return Response.json({ error: 'Hotspot tidak diaktifkan.' }, { status: 404 });
}

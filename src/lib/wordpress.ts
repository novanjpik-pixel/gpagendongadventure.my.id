import { Post } from '@/lib/data';

const WP_URL = (process.env.WORDPRESS_URL || '').replace(/\/+$/, '');

export function isWordPressEnabled(): boolean {
  return WP_URL.length > 0;
}

interface WPEmbeddedMedia {
  source_url?: string;
}

interface WPEmbeddedTerm {
  name?: string;
}

interface WPPost {
  id: number;
  slug: string;
  date: string;
  sticky?: boolean;
  title?: { rendered?: string };
  excerpt?: { rendered?: string };
  content?: { rendered?: string };
  _embedded?: {
    'wp:featuredmedia'?: WPEmbeddedMedia[];
    'wp:term'?: WPEmbeddedTerm[][];
  };
}

function stripHtml(html: string): string {
  return html
    .replace(/<\/p>\s*<p[^>]*>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#8217;/g, "'")
    .replace(/&#8216;/g, "'")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&#8211;/g, '-')
    .replace(/&#8230;/g, '...')
    .replace(/&#038;/g, '&')
    .trim();
}

function extractImages(wp: WPPost): string[] {
  const images: string[] = [];
  const featured = wp?._embedded?.['wp:featuredmedia']?.[0]?.source_url;
  if (featured) images.push(featured);

  const html = wp?.content?.rendered || '';
  const regex = /<img[^>]+src=["']([^"']+)["']/gi;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(html)) !== null) {
    if (match[1] && !images.includes(match[1])) images.push(match[1]);
  }
  return images;
}

export function mapWPToPost(wp: WPPost): Post {
  const category = wp?._embedded?.['wp:term']?.[0]?.[0]?.name || 'Umum';
  const content = stripHtml(wp?.content?.rendered || '');
  const description = stripHtml(wp?.excerpt?.rendered || '') || content.slice(0, 160);

  return {
    id: wp.slug,
    title: stripHtml(wp?.title?.rendered || ''),
    slug: wp.slug,
    category: stripHtml(category),
    date: wp.date,
    images: extractImages(wp),
    description,
    content,
    featured: Boolean(wp?.sticky),
  };
}

async function wpFetch(path: string): Promise<Response | null> {
  if (!isWordPressEnabled()) return null;
  try {
    const res = await fetch(`${WP_URL}/wp-json/wp/v2/${path}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return res;
  } catch {
    return null;
  }
}

export async function getWordPressPosts(limit = 20): Promise<Post[] | null> {
  const res = await wpFetch(`posts?_embed=1&per_page=${limit}&orderby=date&order=desc`);
  if (!res) return null;
  try {
    const data = (await res.json()) as WPPost[];
    return (data || []).map(mapWPToPost);
  } catch {
    return null;
  }
}

export async function getWordPressPostBySlug(slug: string): Promise<Post | null> {
  const res = await wpFetch(`posts?_embed=1&slug=${encodeURIComponent(slug)}`);
  if (!res) return null;
  try {
    const data = (await res.json()) as WPPost[];
    return data?.[0] ? mapWPToPost(data[0]) : null;
  } catch {
    return null;
  }
}

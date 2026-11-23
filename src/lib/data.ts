// Supabase-powered data layer
// All data is now stored in Supabase instead of JSON files

export interface Post {
  id: string;
  title: string;
  slug: string;
  category: string;
  date: string;
  images: string[];
  description: string;
  content: string;
  featured: boolean;
}

export interface TeamMember {
  name: string;
  role: string;
  image: string;
  bio: string;
}

export interface BankAccount {
  bank: string;
  accountNumber: string;
  accountName: string;
  logo: string;
}

export interface EWallet {
  name: string;
  number: string;
  logo: string;
}

export interface DonationInfo {
  title: string;
  description: string;
  bankAccounts: BankAccount[];
  eWallets: EWallet[];
}

export interface SiteStats {
  members: string;
  expeditions: string;
  yearsActive: string;
  treesPlanted: string;
}

export interface Settings {
  siteName: string;
  tagline: string;
  description: string;
  logo: string;
  email: string;
  phone: string;
  address: string;
  instagram: string;
  youtube: string;
  whatsapp: string;
  facebook: string;
  aboutText: string;
  visionText: string;
  missionText: string;
  missions?: string[];
  established?: string;
  location?: string;
  stats: SiteStats;
  donationInfo: DonationInfo;
  team: TeamMember[];
}

export interface User {
  id: string;
  username: string;
  password: string;
  name: string;
  role: string;
}

// Helper to map DB row (snake_case) to Post (camelCase)
export function mapRowToPost(row: Record<string, unknown>): Post {
  return {
    id: row.id as string,
    title: row.title as string,
    slug: row.slug as string,
    category: row.category as string,
    date: row.date as string,
    images: (row.images as string[]) || [],
    description: (row.description as string) || '',
    content: row.content as string,
    featured: (row.featured as boolean) || false,
  };
}

// Helper to map DB row to Settings
export function mapRowToSettings(row: Record<string, unknown>): Settings {
  const stats = (row.stats as SiteStats) || { members: '100+', expeditions: '50+', yearsActive: '9+', treesPlanted: '1000+' };
  const donationInfo = (row.donation_info as DonationInfo) || { title: '', description: '', bankAccounts: [], eWallets: [] };
  const team = (row.team as TeamMember[]) || [];

  return {
    siteName: (row.site_name as string) || '',
    tagline: (row.tagline as string) || '',
    description: (row.description as string) || '',
    logo: (row.logo as string) || '/assets/images/LAMBANG_GENDONG_ADVENTURE_3_.jpg-removebg-preview-1775145865116.png',
    email: (row.email as string) || '',
    phone: (row.phone as string) || '',
    address: (row.address as string) || '',
    instagram: (row.instagram as string) || '',
    youtube: (row.youtube as string) || '',
    whatsapp: (row.whatsapp as string) || '',
    facebook: (row.facebook as string) || '',
    aboutText: (row.about_text as string) || '',
    visionText: (row.vision_text as string) || '',
    missionText: (row.mission_text as string) || '',
    missions: (row.missions as string[]) || [],
    established: (row.established as string) || '',
    location: (row.location as string) || '',
    stats,
    donationInfo,
    team,
  };
}

function getSettings(...args: any[]): any {
  // eslint-disable-next-line no-console
  console.warn('Placeholder: getSettings is not implemented yet.', args);
  return null;
}

export { getSettings };
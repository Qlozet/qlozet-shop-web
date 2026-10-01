import type { ApiSocialLinks } from './api-types';

/**
 * Vendor social profiles, ready to render.
 *
 * The API stores HANDLES, not URLs, so the link is built here. That keeps a
 * vendor's storefront from carrying an arbitrary outbound URL, and means a
 * handle can be shown as "@kemicouture" while still linking correctly.
 *
 * Order is deliberate: Instagram first because in this market it is the
 * shopfront, and a vendor's feed of finished garments is the strongest trust
 * signal they have.
 */
const PLATFORMS = [
  { key: 'instagram', label: 'Instagram', base: 'https://instagram.com/' },
  { key: 'tiktok', label: 'TikTok', base: 'https://tiktok.com/@' },
  { key: 'youtube', label: 'YouTube', base: 'https://youtube.com/@' },
  { key: 'twitter', label: 'Twitter', base: 'https://x.com/' },
  { key: 'pinterest', label: 'Pinterest', base: 'https://pinterest.com/' },
] as const;

export type SocialPlatformKey = (typeof PLATFORMS)[number]['key'];

export interface SocialProfile {
  key: SocialPlatformKey;
  label: string;
  /** Bare handle, no leading @ — the backend strips it. */
  handle: string;
  url: string;
}

/** Only the platforms this vendor actually filled in. */
export function socialProfiles(
  links: ApiSocialLinks | undefined | null,
): SocialProfile[] {
  if (!links) return [];

  return PLATFORMS.flatMap(({ key, label, base }) => {
    const handle = links[key]?.trim().replace(/^@+/, '');
    if (!handle) return [];
    return [{ key, label, handle, url: `${base}${handle}` }];
  });
}

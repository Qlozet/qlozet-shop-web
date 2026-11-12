import { ImageResponse } from 'next/og';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import sharp from 'sharp';
import { fetchStoreForMeta } from './share-meta';

/**
 * The picture shown when a store link is shared: the store's cover with its
 * logo, name and "on Qlozet" on top, so every shared store looks like a
 * Qlozet store even with a weak cover or none at all.
 *
 * Served from opengraph-image / twitter-image next to the store pages, as a
 * JPEG: the PNG the renderer makes is about 1 MB for a photo, and WhatsApp
 * drops preview pictures much over 300 KB.
 */

export const STORE_IMAGE_SIZE = { width: 1200, height: 630 };
export const STORE_IMAGE_TYPE = 'image/jpeg';

const BROWN = '#462814';
const BROWN_DARK = '#2C1810';
const GOLD = '#D4AF37';

/** Ask Cloudinary for a JPEG already cut to size: smaller, and a format the renderer reads. */
function sizedForPreview(url: string, width: number, height: number): string {
  if (!url.includes('res.cloudinary.com') || !url.includes('/upload/')) return url;
  return url.replace('/upload/', `/upload/f_jpg,q_80,c_fill,g_auto,w_${width},h_${height}/`);
}

/**
 * Loads a picture as a data URL. The renderer only reads PNG and JPEG, and a
 * broken picture would break the whole image, so anything else is skipped.
 */
async function loadPicture(url: string | undefined, width: number, height: number): Promise<string | null> {
  if (!url || !/^https?:\/\//.test(url)) return null;
  try {
    const res = await fetch(sizedForPreview(url, width, height), {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;
    const type = (res.headers.get('content-type') ?? '').split(';')[0].trim();
    if (type !== 'image/jpeg' && type !== 'image/png') return null;
    const bytes = Buffer.from(await res.arrayBuffer());
    if (bytes.length > 4_000_000) return null;
    return `data:${type};base64,${bytes.toString('base64')}`;
  } catch {
    return null;
  }
}

let fontsPromise: Promise<{ regular: Buffer; bold: Buffer }> | null = null;
function loadFonts() {
  fontsPromise ??= Promise.all([
    readFile(join(process.cwd(), 'src/assets/fonts/Outfit-Regular.ttf')),
    readFile(join(process.cwd(), 'src/assets/fonts/Outfit-Bold.ttf')),
  ]).then(([regular, bold]) => ({ regular, bold }));
  return fontsPromise;
}

function initialsOf(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  return ((words[0]?.[0] ?? 'Q') + (words[1]?.[0] ?? '')).toUpperCase();
}

export async function storeShareImage(key: string): Promise<Response> {
  const { width, height } = STORE_IMAGE_SIZE;
  const [store, fonts] = await Promise.all([fetchStoreForMeta(key), loadFonts()]);

  const name = store?.business_name?.trim() || 'Qlozet';
  const [cover, logo] = await Promise.all([
    loadPicture(store?.cover_image_url, width, height),
    loadPicture(store?.business_logo_url, 280, 280),
  ]);

  const where = [store?.city, store?.state].map((part) => part?.trim()).filter(Boolean).join(', ');
  const count = Number(store?.total_products) || 0;
  const details = [where, count ? `${count} item${count === 1 ? '' : 's'}` : ''].filter(Boolean).join(' · ');
  const nameSize = name.length > 28 ? 52 : name.length > 18 ? 64 : 76;

  const png = new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          position: 'relative',
          fontFamily: 'Outfit',
          color: '#FFFFFF',
          background: `linear-gradient(135deg, ${BROWN} 0%, ${BROWN_DARK} 100%)`,
        }}
      >
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cover}
            width={width}
            height={height}
            alt=""
            style={{ position: 'absolute', top: 0, left: 0, width, height, objectFit: 'cover' }}
          />
        ) : null}

        {/* Fade so the name always reads, whatever the cover looks like. */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width,
            height,
            display: 'flex',
            background: cover
              ? 'linear-gradient(180deg, rgba(20,10,5,0.15) 0%, rgba(20,10,5,0.25) 40%, rgba(20,10,5,0.88) 100%)'
              : 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.25) 100%)',
          }}
        />

        {/* Qlozet mark, top right. */}
        <div
          style={{
            position: 'absolute',
            top: 44,
            right: 56,
            display: 'flex',
            alignItems: 'center',
            padding: '10px 22px',
            borderRadius: 999,
            background: 'rgba(20,10,5,0.55)',
            fontSize: 28,
            fontWeight: 700,
            letterSpacing: 6,
          }}
        >
          QLOZET
        </div>

        <div
          style={{
            position: 'absolute',
            left: 64,
            right: 64,
            bottom: 56,
            display: 'flex',
            alignItems: 'center',
            gap: 36,
          }}
        >
          <div
            style={{
              width: 148,
              height: 148,
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 999,
              border: '6px solid #FFFFFF',
              background: logo ? '#FFFFFF' : GOLD,
              overflow: 'hidden',
            }}
          >
            {logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logo}
                width={136}
                height={136}
                alt=""
                style={{ width: 136, height: 136, borderRadius: 999, objectFit: 'cover' }}
              />
            ) : (
              <div style={{ display: 'flex', fontSize: 60, fontWeight: 700, color: BROWN_DARK }}>
                {initialsOf(name)}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, minWidth: 0, flex: 1 }}>
            <div
              style={{
                display: 'flex',
                fontSize: nameSize,
                fontWeight: 700,
                lineHeight: 1.05,
                letterSpacing: -1,
              }}
            >
              {name}
            </div>
            <div style={{ display: 'flex', fontSize: 30, fontWeight: 400, color: 'rgba(255,255,255,0.88)' }}>
              {details ? `Shop on Qlozet · ${details}` : 'Shop on Qlozet'}
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...STORE_IMAGE_SIZE,
      fonts: [
        { name: 'Outfit', data: fonts.regular, weight: 400, style: 'normal' },
        { name: 'Outfit', data: fonts.bold, weight: 700, style: 'normal' },
      ],
    },
  );

  const pngBytes = Buffer.from(await png.arrayBuffer());
  const headers = { 'Cache-Control': 'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400' };
  try {
    const jpeg = await sharp(pngBytes).jpeg({ quality: 80, mozjpeg: true }).toBuffer();
    return new Response(new Uint8Array(jpeg), { headers: { ...headers, 'Content-Type': STORE_IMAGE_TYPE } });
  } catch {
    return new Response(new Uint8Array(pngBytes), { headers: { ...headers, 'Content-Type': 'image/png' } });
  }
}

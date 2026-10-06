/**
 * Public runtime configuration.
 *
 * Everything here is NEXT_PUBLIC_ and therefore compiled into the browser
 * bundle — that is the point, not an oversight. These are values the client
 * cannot work without: an API origin it has to call, and OAuth client ids
 * that identify the app to Google from the browser. None of them are
 * credentials. A Google *client id* is public by design and travels in plain
 * sight in every OAuth request; the client *secret* is the one that must stay
 * on the server, and it is not here and must never be.
 *
 * Nothing secret belongs in this file. If a value must not reach the browser,
 * it belongs in the backend's environment, read server-side.
 *
 * Next.js inlines `process.env.NEXT_PUBLIC_*` only where it appears as a
 * literal, so each one is written out in full below rather than looked up
 * dynamically — `process.env[name]` would come back undefined in the client.
 */

export const config = {
  /** Backend origin, including the /api prefix the server mounts globally. */
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'https://qlozet-backend.fly.dev/api',

  /** Marketing site, linked from the footer. */
  landingUrl: process.env.NEXT_PUBLIC_LANDING_URL || 'https://www.qlozet.app',

  google: {
    /**
     * OAuth Web client id, used by Google Identity Services to render the
     * sign-in button. Empty when unconfigured, and the button then renders
     * nothing rather than showing a control that cannot work.
     */
    clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',

    /** Places API key, for address autocomplete. */
    placesApiKey: process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY || '',
  },
} as const;

export default config;

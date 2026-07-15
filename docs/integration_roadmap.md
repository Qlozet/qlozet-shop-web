# Qlozet – Backend Integration Roadmap

This document outlines a phased strategy to replace the frontend mock states (currently bound to `localStorage` in `AppContext.tsx`) with live NestJS backend endpoints.

---

## Phase 1: Authentication & User Profiles
Connect user registration, login, and profiles to secure backend endpoints.

### 1.1 Action Items
1.  **Axios/Fetch Client Setup**: Create `src/lib/api.ts` configured with base URL `https://qlozet-backend.fly.dev/api` and automated interceptors to inject the `access-token` Bearer header and handle token refresh cycles via `/api/auth/refresh`.
2.  **State Migration**: Refactor `login()`, `logout()`, and `demoLogin()` in [AppContext.tsx](file:///c:/Users/Gaming/OneDrive/Desktop/qlozet-shop/src/context/AppContext.tsx) to query:
    *   `POST /api/auth/login/customer` (JWT storage in cookie or localStorage).
    *   `POST /api/auth/register/customer`.
3.  **Profile Synchronization**: Fetch user details `/api/users/me` on initial load and patch updates via `/api/users/me/profile` inside [PersonalInfo.tsx](file:///c:/Users/Gaming/OneDrive/Desktop/qlozet-shop/src/app/profile/sections/PersonalInfo.tsx).
4.  **Address Book**: Connect the address book component to the multi-address REST API:
    *   `GET /api/users/customer/addresses` (list all)
    *   `GET /api/users/customer/addresses/default` (get default)
    *   `POST /api/users/customer/addresses` (add new)
    *   `PATCH /api/users/customer/addresses/:id` (update)
    *   `DELETE /api/users/customer/addresses/:id` (delete)
    *   `PATCH /api/users/customer/addresses/:id/default` (set default)
5.  **Onboarding Preferences**: Wire up onboarding steps in [onboarding/page.tsx](file:///c:/Users/Gaming/OneDrive/Desktop/qlozet-shop/src/app/auth/onboarding/page.tsx) to persist user preferences:
    *   `PATCH /api/users/me/profile` with `gender` (Step 2) and `aesthetic_preferences` (Step 3).
    *   `POST /api/recommendations/events` with type `preferred_aesthetic` to seed the recommendation engine.

### 1.2 Verification
*   User can login, register, and modify profiles, retaining sessions across page updates.
*   TypeScript build compiles cleanly.

---

## Phase 2: Catalog, Category Feed, Search & Event Tracking
Migrate local catalogs and mock listings to real database queries. Wire up behavioral event tracking to power the AI recommendation engine.

### 2.1 Action Items
1.  **Catalog Fetching**: Replace hardcoded `productCatalog` queries in [page.tsx (Discover)](file:///c:/Users/Gaming/OneDrive/Desktop/qlozet-shop/src/app/discover/page.tsx) and `/discover/[...slug]` with dynamic calls to:
    *   `GET /api/products` (mapping filters such as `kind`, `search`, `page`, `size`, and category).
2.  **Home Feed**: Replace static categories in the homepage feed [page.tsx (Home)](file:///c:/Users/Gaming/OneDrive/Desktop/qlozet-shop/src/app/page.tsx) with the backend-driven customer feeds:
    *   `GET /api/users/feed`
3.  **Wishlist Syncing**: Connect the client wishlist toggle in [AppContext.tsx](file:///c:/Users/Gaming/OneDrive/Desktop/qlozet-shop/src/context/AppContext.tsx) to backend database states:
    *   `POST /api/products/{id}/wishlist`
4.  **Recommendation Feeds**: Replace static home/discover listings with smart, personalized endpoints:
    *   `GET /api/recommends/feed` — personalized product feed (requires `userId`, `sessionId`, `limit`, `budgetMax`, `deadlineDays`).
    *   `GET /api/recommends/trending` — "Worth the Hype" section (requires `limit`).
    *   `GET /api/recommends/new` — "New In" slider (requires `limit`, `days`).
    *   `GET /api/recommends/vendors` — recommended vendor row (requires `userId`, `limit`, `productsPerVendor`).
    *   `GET /api/recommends/bought-together` — product page "Bought Together" (requires `itemId`, `limit`).
    *   `GET /api/recommends/complete-look` — product page "Complete Look" (requires `itemIds`, `userId`, `limit`).
5.  **Event Tracking System**: Create a reusable `useTrackEvent` hook that fires `POST /api/recommendations/events` to feed the recommendation engine. Events to track:
    *   `view_item` — when a product detail page opens.
    *   `click_item` — when a product card is tapped.
    *   `save_item` / `wishlist_add` / `wishlist_remove` — wishlist interactions.
    *   `add_to_cart` / `remove_from_cart` — cart modifications.
    *   `search` — when a search query is submitted.
    *   `feed_impression_batch` — when products are displayed on screen.
    *   `not_interested` — when a user dismisses a suggestion.
    *   `hide_business` — when a user hides a vendor.

### 2.2 Verification
*   Home page category lists, Search results page, and Discover drilldowns load live database products.
*   Favorites synced on desktop reflect on mobile views.
*   Recommendation feeds return personalized results based on the user's saved `aesthetic_preferences`.
*   Events are being logged — verify via `GET /api/recommendations/events?userId=...`.

---

## Phase 3: Cart, Logistics, & Orders Checkout
Connect checkout flows to shipping providers, cart databases, and Paystack.

### 3.1 Action Items
1.  **Cart Database Integration**: Replace client-side array modifications with REST calls:
    *   `GET /api/cart`
    *   `POST /api/cart/add`
    *   `DELETE /api/cart/remove/{productId}`
2.  **Shipping rate calculator**: Hook up the address input and shipping methods selector inside [checkout/page.tsx](file:///c:/Users/Gaming/OneDrive/Desktop/qlozet-shop/src/app/checkout/page.tsx) to:
    *   `POST /api/logistics/rates/{serviceCodes}` (fetching rates via couriers like Shipbubble).
3.  **Order Generation**: Connect checkout submission to:
    *   `POST /api/orders` (creating order, returning Paystack payment details).

### 3.2 Verification
*   Items added to the cart persist across devices.
*   Shipping rates recalculate on checkout when addresses are updated.
*   Clicking 'Place Order' redirects to Paystack checkout.

---

## Phase 4: Fabric Reservations & Event Claims
Replace mock lockers with locked inventory database tables.

### 4.1 Action Items
1.  **Organizer Bookings**: Hook up the "Reserve Fabric" form to:
    *   `POST /api/reservations` (creates locked inventory yardage and computes booking deposit).
2.  **Reserved Fabrics tab**: Connect [ReservedFabric.tsx](file:///c:/Users/Gaming/OneDrive/Desktop/qlozet-shop/src/app/profile/sections/ReservedFabric.tsx) dashboard to:
    *   `GET /api/reservations/my`
    *   `GET /api/reservations/{id}/claims`
3.  **Guest Checkout claims**: Hook up the claim page [reserve/[id]/page.tsx](file:///c:/Users/Gaming/OneDrive/Desktop/qlozet-shop/src/app/reserve/%5Bid%5D/page.tsx) to:
    *   `GET /api/reservations/{id}` (public guest link details).
    *   `POST /api/reservations/{id}/claim` (claiming yards, generating checkout).

### 4.2 Verification
*   Organizers can lock fabrics and get shareable codes.
*   Guests opening the event link can checkout and claim a subset of the locked yards.

---

## Phase 5: Custom Sizing & Bespoke AI Studio
Connect 3D modeling, try-ons, and tailor quote sheets.

### 5.1 Action Items
1.  **Sizing Profile**: Hook up the front/side photo upload flows in the studio to:
    *   `POST /api/measurements/run-prediction` (AI body analysis).
2.  **Outfit Renderer**: Connect the Bespoke Studio "Generate" button in [studio/page.tsx](file:///c:/Users/Gaming/OneDrive/Desktop/qlozet-shop/src/app/bespoke/studio/page.tsx) to:
    *   `POST /api/measurements/generate-outfit`
    *   `GET /api/measurements/job/{job_id}` (poll status until rendering completes).
3.  **Quote Negotiations**: Connect the bespoke design catalog and vendor quotes list to:
    *   `POST /api/bespoke/designs`
    *   `GET /api/bespoke/quotes/{id}`
    *   `POST /api/bespoke/quotes/{id}/accept`

### 5.2 Verification
*   AI generation tasks display progress loaders and render high-fidelity custom outfits.
*   Design records show quote statuses (Pending, Ready, Accepted) mapped to backend quotes.

---

## Phase 6: AI Personalization, Recommendations & Assistant
Integrate the AI-powered search assistant and personalized catalog suggestions.

### 6.1 Action Items
1.  **AI Fashion Assistant**: Connect the AI search toggle and prompt input inside [search/page.tsx](file:///c:/Users/Gaming/OneDrive/Desktop/qlozet-shop/src/app/search/page.tsx) to:
    *   `POST /api/recommendations/ask` (accepts user queries like "Best African fabrics for dinner wear" and returns structured recommendations sections, replacing the hardcoded `LLM_RESPONSE` state).
2.  **Product Page Recommendations**: Replace client-side vendor-filtering in [products/[id]/page.tsx](file:///c:/Users/Gaming/OneDrive/Desktop/qlozet-shop/src/app/products/%5Bid%5D/page.tsx) with:
    *   `GET /api/recommends/bought-together` (query `itemId`, returns items frequently bought with the current item).
    *   `GET /api/recommends/complete-look` (query `itemIds`, `userId`, returns bundle styling matching the item).
3.  **Personalized Home & Discover Feeds**: Replace static listings with:
    *   `GET /api/recommends/feed` (loads tailored items based on onboarding preferences and click behaviors).
    *   `GET /api/recommends/trending` (drives the "Worth the Hype" scrollable lists on discover).
    *   `GET /api/recommends/vendors` (populates the recommended vendor row on search and discover).
    *   `GET /api/recommends/new` (drives the home page "New In" slider).

### 6.2 Verification
*   Entering an assistant query on search displays dynamic, AI-categorized recommendations matching search intents.
*   Product pages display unique "Bought Together" sections driven by analytics.
*   Home and Discover lists render dynamic personalized feeds instead of static developer seeds.

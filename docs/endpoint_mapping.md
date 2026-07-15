# Qlozet – REST API Endpoint Mapping Directory

This document provides a detailed mapping of the NestJS Swagger endpoints to the corresponding React pages, hooks, and request/response models.

## Admin Module Integration
*   **Corresponding Frontend Pages**: Various UI pages

| Method | Endpoint Route | Summary / Operation | Params | Request DTO | Response DTO |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/admin/businesses` | Get all registered businesses | `page` (query, opt `number`), `size` (query, opt `number`) | `None` | `Success` |
| `GET` | `/api/admin/businesses/{id}` | Get a single business by ID | `id` (path, req `string`) | `None` | `Success` |
| `POST` | `/api/admin/{id}/approve` | Approve a business | `id` (path, req `string`) | `None` | `Success` |
| `POST` | `/api/admin/{id}/verify` | Verify a business (final verification step) | `id` (path, req `string`) | `None` | `Success` |
| `POST` | `/api/admin/{id}/reject` | Reject a business | `id` (path, req `string`) | `None` | `Success` |
| `POST` | `/api/admin/{id}/in-review` | Set a business to in-review | `id` (path, req `string`) | `None` | `Success` |
| `GET` | `/api/admin/dashboard` | Get admin dashboard metrics | None | `None` | `Success` |
| `GET` | `/api/admin/vendor/dashboard` | Get vendor/business dashboard metrics | `businessId` (query, req `string`) | `None` | `Success` |
| `GET` | `/api/admin/vendor/orders` | No description | `status` (query, opt `string`) | `None` | `Success` |
| `GET` | `/api/admin/customer` | Fetch customers with filters | `page` (query, opt `number`), `size` (query, opt `number`), `search` (query, opt `string`), `state` (query, opt `string`), `city` (query, opt `string`), `gender` (query, opt `string`), `status` (query, opt `string`), `startDate` (query, opt `string`), `endDate` (query, opt `string`) | `None` | `Success` |
| `GET` | `/api/admin/tickets` | Get paginated tickets with filters | `search` (query, opt `string`), `status` (query, opt `string`), `assigned_to` (query, opt `string`), `start_date` (query, opt `string`), `end_date` (query, opt `string`), `page` (query, opt `number`), `size` (query, opt `number`) | `None` | `Success` |
| `GET` | `/api/admin/assigned/{team_id}` | Get all tickets assigned to a support team | `team_id` (path, req `string`) | `None` | `Success` |
| `PATCH` | `/api/admin/{id}/assign` | Assign ticket to a support team | `id` (path, req `string`) | `AssignTicketDto` | `Success` |
| `POST` | `/api/admin/{ticket_id}/reply` | Reply to a ticket (vendor/admin/support) | `ticket_id` (path, req `string`) | `CreateTicketReplyDto` | `TicketReplyResponseDto` |
| `PATCH` | `/api/admin/settings` | Update platform settings | None | `UpdatePlatformSettingsDto` | `Success` |
| `GET` | `/api/admin/settings` | Get current platform settings | None | `None` | `Success` |
| `POST` | `/api/admin/refresh-token-price` | Update platform token price | None | `None` | `Success` |

---

## App Module Integration
*   **Corresponding Frontend Pages**: Various UI pages

| Method | Endpoint Route | Summary / Operation | Params | Request DTO | Response DTO |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api` | No description | None | `None` | `Success` |

---

## Auth Module Integration
*   **Corresponding Frontend Pages**: `/auth/login`, `/auth/register`, `/auth/onboarding`

| Method | Endpoint Route | Summary / Operation | Params | Request DTO | Response DTO |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register/vendor` | Register a new vendor | None | `VendorRegisterDto` | `RegisterResponseDto` |
| `POST` | `/api/auth/register/customer` | Register a new customer | None | `CustomerRegistrationDto` | `RegisterResponseDto` |
| `POST` | `/api/auth/login/vendor` | No description | None | `Object DTO` | `LoginVendorResponseWrapperDto` |
| `POST` | `/api/auth/login/customer` | Customer login | None | `Object DTO` | `LoginCustomerResponseWrapperDto` |
| `POST` | `/api/auth/verify-email` | Verify user email | None | `VerifyEmailDto` | `Success` |
| `POST` | `/api/auth/resend-verification` | Resend verification email | None | `ResendVerificationDto` | `Success` |
| `POST` | `/api/auth/forgot-password` | Request password reset | None | `PasswordResetRequestDto` | `Success` |
| `POST` | `/api/auth/reset-password` | Reset password using token | None | `PasswordResetDto` | `Success` |
| `POST` | `/api/auth/change-password` | Change current password | None | `ChangePasswordDto` | `Success` |
| `POST` | `/api/auth/refresh` | No description | None | `RefreshTokenDto` | `Success` |

---

## Bespoke Module Integration
*   **Corresponding Frontend Pages**: Various UI pages

| Method | Endpoint Route | Summary / Operation | Params | Request DTO | Response DTO |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/bespoke/designs` | Save a bespoke design from the studio | None | `CreateDesignDto` | `Success` |
| `GET` | `/api/bespoke/designs` | List my bespoke designs | `page` (query, opt `number`), `size` (query, opt `number`), `status` (query, opt `string`) | `None` | `Success` |
| `GET` | `/api/bespoke/designs/{id}` | Get a design with all its quotes | `id` (path, req `string`) | `None` | `Success` |
| `POST` | `/api/bespoke/designs/{id}/request-quotes` | Send design to vendors for quoting (max 5) | `id` (path, req `string`) | `RequestQuotesDto` | `Success` |
| `PATCH` | `/api/bespoke/designs/{id}/cancel` | Cancel a bespoke design | `id` (path, req `string`) | `None` | `Success` |
| `GET` | `/api/bespoke/quotes/vendor` | List quote requests for this vendor | `page` (query, opt `number`), `size` (query, opt `number`), `status` (query, opt `string`) | `None` | `Success` |
| `GET` | `/api/bespoke/quotes/{id}` | Get quote detail (customer or vendor) | `id` (path, req `string`) | `None` | `Success` |
| `PATCH` | `/api/bespoke/quotes/{id}/draft` | Save quote as draft | `id` (path, req `string`) | `SaveDraftDto` | `Success` |
| `POST` | `/api/bespoke/quotes/{id}/submit` | Submit a completed quote | `id` (path, req `string`) | `SubmitQuoteDto` | `Success` |
| `POST` | `/api/bespoke/quotes/{id}/accept` | Accept a quote → creates order + payment | `id` (path, req `string`) | `None` | `Success` |
| `POST` | `/api/bespoke/quotes/{id}/revision` | Request revision on a quote | `id` (path, req `string`) | `RevisionRequestDto` | `Success` |

---

## Business Module Integration
*   **Corresponding Frontend Pages**: `/profile` (Vendor profile setup)

| Method | Endpoint Route | Summary / Operation | Params | Request DTO | Response DTO |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/business/warehouse` | Create a new warehouse | None | `CreateWarehouseDto` | `Success` |
| `GET` | `/api/business/warehouse` | Get all warehouses | None | `None` | `Success` |
| `POST` | `/api/business/warehouse/{id}/activate` | Activate a warehouse (only one active at a time) | `id` (path, req `string`) | `None` | `Success` |
| `GET` | `/api/business/{id}/warehouse` | Get a warehouse by ID | `id` (path, req `string`) | `None` | `Success` |
| `PUT` | `/api/business/{id}/warehouse` | Update warehouse details | `id` (path, req `string`) | `CreateWarehouseDto` | `Success` |
| `DELETE` | `/api/business/{id}/warehouse` | Delete a warehouse | `id` (path, req `string`) | `None` | `Success` |
| `PATCH` | `/api/business/address` | Add or update business address | None | `CreateBusinessAddressDto` | `ValidatedAddressResponseDto` |
| `GET` | `/api/business/earnings/upcoming` | No description | None | `None` | `Success` |
| `GET` | `/api/business` | No description | None | `None` | `Success` |
| `GET` | `/api/business/earnings-chart` | No description | None | `None` | `Success` |

---

## Cart Module Integration
*   **Corresponding Frontend Pages**: `/cart`, `/products/[id]` (Add to cart)

| Method | Endpoint Route | Summary / Operation | Params | Request DTO | Response DTO |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/cart` | Get current user cart | None | `None` | `Success` |
| `POST` | `/api/cart/add` | Add item to cart | `businessId` (path, req `string`) | `None` | `Success` |
| `DELETE` | `/api/cart/remove/{productId}` | Remove item from cart | `productId` (path, req `string`) | `None` | `Success` |
| `DELETE` | `/api/cart/clear` | Clear cart | None | `None` | `Success` |

---

## Catalog Module Integration
*   **Corresponding Frontend Pages**: Various UI pages

| Method | Endpoint Route | Summary / Operation | Params | Request DTO | Response DTO |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/recommendations/catalog` | Add item to catalog | None | `None` | `Success` |
| `GET` | `/api/recommendations/catalog` | List catalog items | None | `None` | `Success` |
| `GET` | `/api/recommendations/catalog/{id}` | No description | `id` (path, req `string`) | `None` | `Success` |

---

## Collections Module Integration
*   **Corresponding Frontend Pages**: `/discover` (Collections filters)

| Method | Endpoint Route | Summary / Operation | Params | Request DTO | Response DTO |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/collections` | Create a new product collection | None | `CreateCollectionDto` | `Collection` |
| `GET` | `/api/collections` | Get all collections | None | `None` | `Success` |
| `GET` | `/api/collections/vendor` | Get collections by vendor | None | `None` | `Success` |
| `GET` | `/api/collections/{collectionId}/products` | Get products under a collection | `collectionId` (path, req `string`) | `None` | `Success` |
| `GET` | `/api/collections/{collectionId}` | Get collection by ID | `collectionId` (path, req `string`) | `None` | `Success` |
| `GET` | `/api/collections/vendor/with-products` | Get all vendor collections with their products | `condition_match` (query, opt `string`), `is_active` (query, opt `boolean`), `search` (query, opt `string`) | `None` | `Success` |

---

## Discounts Module Integration
*   **Corresponding Frontend Pages**: `/discover` (Discounts slider), `/products/[id]`

| Method | Endpoint Route | Summary / Operation | Params | Request DTO | Response DTO |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/discounts` | Create a new discount | None | `CreateDiscountDto` | `Discount` |
| `GET` | `/api/discounts` | Get all discounts | None | `None` | `Array<Discount>` |
| `GET` | `/api/discounts/active` | Get all active discounts | None | `None` | `Array<Discount>` |
| `GET` | `/api/discounts/apply/{id}` | Manually apply discount to matching products | `id` (path, req `string`) | `None` | `Array<Product>` |
| `GET` | `/api/discounts/vendor/products` | Get discounted products for a specific vendor | None | `None` | `Array<Product>` |
| `GET` | `/api/discounts/discounted-products` | Get all discounted products | None | `None` | `Array<Product>` |

---

## Events Module Integration
*   **Corresponding Frontend Pages**: Various UI pages

| Method | Endpoint Route | Summary / Operation | Params | Request DTO | Response DTO |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/recommendations/events` | Track an event | None | `CreateEventDto` | `Success` |
| `GET` | `/api/recommendations/events` | List recent events for a user | `userId` (query, req `string`), `limit` (query, opt `number`), `since` (query, opt `string`) | `None` | `Success` |

---

## Fabric Reservations Module Integration
*   **Corresponding Frontend Pages**: Various UI pages

| Method | Endpoint Route | Summary / Operation | Params | Request DTO | Response DTO |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/reservations` | Create a fabric reservation (organizer) | None | `CreateReservationDto` | `Success` |
| `GET` | `/api/reservations/my` | List my reservations (organizer) | `page` (query, opt `number`), `size` (query, opt `number`) | `None` | `Success` |
| `GET` | `/api/reservations/{id}/claims` | Get claims for a reservation (organizer) | `id` (path, req `string`), `page` (query, opt `number`), `size` (query, opt `number`) | `None` | `Success` |
| `PATCH` | `/api/reservations/{id}/cancel` | Cancel a reservation (organizer) | `id` (path, req `string`) | `None` | `Success` |
| `GET` | `/api/reservations/{id}` | Get reservation details (public — guest link) | `id` (path, req `string`) | `None` | `Success` |
| `POST` | `/api/reservations/{id}/claim` | Claim yards from a reservation (guest) | `id` (path, req `string`) | `ClaimReservationDto` | `Success` |

---

## Logistics Module Integration
*   **Corresponding Frontend Pages**: `/checkout` (Shipping rates & options)

| Method | Endpoint Route | Summary / Operation | Params | Request DTO | Response DTO |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/logistics/rates/{serviceCodes}` | Fetch shipping rates for selected couriers | `serviceCodes` (path, req `string`) | `FetchRatePayload` | `FetchRateResponse` |
| `POST` | `/api/logistics/shipment` | Create a shipment | None | `ShipmentPayload` | `ShipmentResponse` |
| `POST` | `/api/logistics/shipment/cancel/{orderId}` | Cancel a shipment | `orderId` (path, req `string`) | `None` | `Success` |
| `GET` | `/api/logistics/couriers` | Get all couriers | None | `None` | `Success` |
| `POST` | `/api/logistics/address` | Validate and format address details | None | `AddressDetails` | `Success` |

---

## Measurements Module Integration
*   **Corresponding Frontend Pages**: `/bespoke/studio` (AI Sizing & Rendering)

| Method | Endpoint Route | Summary / Operation | Params | Request DTO | Response DTO |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/measurements/run-prediction` | Run body analysis from images | None | `RunPredictBodyDto` | `Success` |
| `POST` | `/api/measurements/auto-mask-prediction` | Automatically mask body image | None | `AutoMaskSwaggerDto` | `Success` |
| `POST` | `/api/measurements/video-pipeline` | Process video for measurements | None | `VideoPipelineSwaggerDto` | `Success` |
| `POST` | `/api/measurements/avatar` | Generate virtual avatar model | None | `None` | `Success` |
| `POST` | `/api/measurements/generate-outfit` | Generate bespoke outfit rendering | None | `Object DTO` | `Success` |
| `POST` | `/api/measurements/edit-garment-image` | Edit target garment graphic | None | `EditGarmentDto` | `Success` |
| `POST` | `/api/measurements/users` | Add a new measurement set for a user | None | `AddMeasurementSetDto` | `ActiveMeasurementSetDto` |
| `GET` | `/api/measurements/users/active` | Get active measurement set for a user | None | `None` | `ActiveMeasurementSetDto` |
| `GET` | `/api/measurements/users/sets` | Get all saved measurement sets for a user | None | `None` | `Success` |
| `GET` | `/api/measurements/users/sets/{name}` | Get a specific measurement set by name | `name` (path, req `string`) | `None` | `ActiveMeasurementSetDto` |
| `DELETE` | `/api/measurements/users/sets/{name}` | Delete a measurement set by name | `name` (path, req `string`) | `None` | `Success` |
| `PATCH` | `/api/measurements/users/sets/{name}/activate` | Set a measurement set as the active one | `name` (path, req `string`) | `None` | `Success` |
| `GET` | `/api/measurements/job/{job_id}` | Poll background prediction/rendering task | `job_id` (path, req `string`) | `None` | `Success` |

---

## Orders Module Integration
*   **Corresponding Frontend Pages**: `/cart`, `/checkout`, `/profile` (Orders tab)

| Method | Endpoint Route | Summary / Operation | Params | Request DTO | Response DTO |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/orders` | Create a new order (direct or from cart) | None | `CreateOrderDto` | `Success` |
| `GET` | `/api/orders/customer` | Get customer orders list | `status` (query, opt `string`) | `None` | `Success` |
| `GET` | `/api/orders/vendor` | Get vendor orders list | `status` (query, opt `string`) | `None` | `Success` |
| `PATCH` | `/api/orders/cancel/{reference}` | Cancel an order and refund customer | `reference` (path, req `string`) | `None` | `Success` |
| `GET` | `/api/orders/chart` | Get chart data | None | `None` | `Success` |

---

## Products Module Integration
*   **Corresponding Frontend Pages**: `/discover`, `/products`, `/products/[id]`, `/wishlist`

| Method | Endpoint Route | Summary / Operation | Params | Request DTO | Response DTO |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/products/clothing` | Create a new clothing product | None | `CreateClothingDto` | `Success` |
| `POST` | `/api/products/fabric` | Create a new fabric product | None | `CreateFabricDto` | `Success` |
| `POST` | `/api/products/accessory` | Create a new accessory product | None | `CreateAccessoryDto` | `Success` |
| `PATCH` | `/api/products/{product_id}/accessories/{accessoryId}/variants` | Update accessory variant stock | `product_id` (path, req `string`), `accessory_id` (path, req `string`) | `UpdateAccessoryVariantStockDto` | `Success` |
| `PATCH` | `/api/products/{product_id}/fabrics/{fabric_id}/stock` | Update fabric yard length stock | `product_id` (path, req `string`), `fabric_id` (path, req `string`) | `UpdateFabricStockDto` | `Success` |
| `GET` | `/api/products` | Get all products with pagination and optional filters/search | `business_id` (query, opt `string`), `page` (query, opt `number`), `size` (query, opt `number`), `kind` (query, opt `string`), `search` (query, opt `string`), `status` (query, opt `string`), `sortBy` (query, opt `string`), `order` (query, opt `string`) | `None` | `ProductListResponseDto` |
| `GET` | `/api/products/by-vendor` | Get all products by vendor with optional kind filter and pagination | `kind` (query, opt `string`), `size` (query, opt `number`), `page` (query, opt `number`) | `None` | `object` |
| `GET` | `/api/products/{id}` | Get product by ID | `id` (path, req `string`) | `None` | `Success` |
| `DELETE` | `/api/products/{id}` | Delete a product by ID | `id` (path, req `string`) | `None` | `Success` |
| `POST` | `/api/products/{id}/rate` | Rate a product (1–5 stars) | `id` (path, req `string`) | `RateProductDto` | `Success` |
| `GET` | `/api/products/{id}/ratings` | Get product rating summary and reviews | `id` (path, req `string`) | `None` | `Success` |
| `POST` | `/api/products/{id}/wishlist` | Add or remove product in wishlist | `id` (path, req `string`) | `None` | `Success` |
| `GET` | `/api/products/wishlist/customizable` | Get customizable clothing items from wishlist (for Use Fabric modal) | None | `None` | `Success` |
| `GET` | `/api/products/trending/week` | Get weekly trending products | None | `None` | `Success` |
| `PATCH` | `/api/products/{product_id}/status` | Update product publication status | `product_id` (path, req `string`) | `UpdateStatusDto` | `Success` |
| `PATCH` | `/api/products/{product_id}/schedule-activation` | Schedule product activation date | `product_id` (path, req `string`) | `ScheduleActivationDto` | `Success` |

---

## Recommendations Module Integration
*   **Corresponding Frontend Pages**: Various UI pages

| Method | Endpoint Route | Summary / Operation | Params | Request DTO | Response DTO |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/recommends/feed` | Custom recommendations feed | `userId` (query, req `string`), `sessionId` (query, req `string`), `limit` (query, req `number`), `budgetMax` (query, req `number`), `deadlineDays` (query, req `number`) | `None` | `Success` |
| `GET` | `/api/recommends/vendors` | Recommended vendors list | `userId` (query, req `string`), `limit` (query, req `number`), `productsPerVendor` (query, req `number`) | `None` | `Success` |
| `GET` | `/api/recommends/trending` | Trending items recommendation | `limit` (query, req `number`) | `None` | `Success` |
| `GET` | `/api/recommends/new` | New arrivals recommendations | `limit` (query, req `number`), `days` (query, req `number`) | `None` | `Success` |
| `GET` | `/api/recommends/bought-together` | Frequently bought together | `itemId` (query, req `string`), `limit` (query, req `number`) | `None` | `Success` |
| `GET` | `/api/recommends/complete-look` | Complete the look bundle items | `itemIds` (query, req `string`), `userId` (query, req `string`), `limit` (query, req `number`) | `None` | `Success` |
| `POST` | `/api/recommendations/recommend` | Get recommendations for a user | None | `None` | `Success` |
| `POST` | `/api/recommendations/ask` | Ask the AI fashion assistant | None | `AskRequestDto` | `Success` |

---

## Tickets Module Integration
*   **Corresponding Frontend Pages**: Various UI pages

| Method | Endpoint Route | Summary / Operation | Params | Request DTO | Response DTO |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/tickets` | Vendor creates a ticket | None | `CreateTicketDto` | `Success` |
| `GET` | `/api/tickets` | Get paginated tickets with filters | `search` (query, opt `string`), `status` (query, opt `string`), `assigned_to` (query, opt `string`), `start_date` (query, opt `string`), `end_date` (query, opt `string`), `page` (query, opt `number`), `size` (query, opt `number`) | `None` | `Success` |
| `GET` | `/api/tickets/{id}` | Get a single ticket | `id` (path, req `string`) | `None` | `Success` |
| `PATCH` | `/api/tickets/{id}` | Update ticket | `id` (path, req `string`) | `UpdateTicketDto` | `Success` |

---

## Tokens Module Integration
*   **Corresponding Frontend Pages**: `/profile` (Token purchase dashboard)

| Method | Endpoint Route | Summary / Operation | Params | Request DTO | Response DTO |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/token/balance` | Get active token balance | None | `None` | `Success` |
| `POST` | `/api/token/customer/purchase` | Purchase tokens for customer | None | `PurchaseDto` | `Success` |
| `POST` | `/api/token/vendor/purchase` | Purchase tokens for vendor business | None | `PurchaseDto` | `Success` |

---

## Transactions Module Integration
*   **Corresponding Frontend Pages**: `/profile` (Wallet tab)

| Method | Endpoint Route | Summary / Operation | Params | Request DTO | Response DTO |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/transactions/vendor` | Get paginated transactions by business ID | `status` (query, req `string`), `size` (query, opt `number`), `page` (query, opt `number`) | `None` | `Success` |
| `GET` | `/api/transactions/customer` | Get paginated transactions by customer | `status` (query, req `string`), `size` (query, opt `number`), `page` (query, opt `number`) | `None` | `Success` |
| `GET` | `/api/transactions/reference/{reference}` | Get transaction by reference | `reference` (path, req `string`) | `None` | `Success` |

---

## Uploads Module Integration
*   **Corresponding Frontend Pages**: `/profile` (Avatar upload), `/bespoke` (Outfit Reference upload)

| Method | Endpoint Route | Summary / Operation | Params | Request DTO | Response DTO |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/uploads/profile` | Upload profile picture file | None | `Multipart File Upload` | `Success` |
| `POST` | `/api/uploads/product` | Upload product image file | None | `Multipart File Upload` | `Success` |
| `POST` | `/api/uploads/outfits` | Upload custom outfit model reference | None | `Multipart File Upload` | `object` |

---

## Users Module Integration
*   **Corresponding Frontend Pages**: `/profile`, `/vendor/[id]` (Follow triggers)

| Method | Endpoint Route | Summary / Operation | Params | Request DTO | Response DTO |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/users/team/invite-member` | Invite a new team member | None | `InviteTeamMemberDto` | `Success` |
| `GET` | `/api/users/team/members` | Get all team members | None | `None` | `Success` |
| `GET` | `/api/users/roles/vendor` | Get all vendor roles | None | `None` | `Success` |
| `GET` | `/api/users/roles` | Get all roles (platform + vendor) | None | `None` | `Success` |
| `POST` | `/api/users/roles` | Create a new role | None | `CreateRoleDto` | `Success` |
| `GET` | `/api/users/roles/{id}` | Get role by ID | `id` (path, req `string`) | `None` | `Success` |
| `PATCH` | `/api/users/roles/{id}` | Update an existing role | `id` (path, req `string`) | `UpdateRoleDto` | `Success` |
| `DELETE` | `/api/users/roles/{id}` | Delete a role by ID | `id` (path, req `string`) | `None` | `Success` |
| `POST` | `/api/users/roles/{id}/assign-permissions` | Assign permissions to a role | `id` (path, req `string`) | `AssignPermissionsDto` | `Success` |
| `POST` | `/api/users/roles/{id}/remove-permissions` | Remove permissions from a role | `id` (path, req `string`) | `AssignPermissionsDto` | `Success` |
| `POST` | `/api/users/customer/shipping-address/upsert` | Create or update customer shipping address | None | `AddressDto` | `Success` |
| `GET` | `/api/users/customer/shipping-address` | Get shipping address details | None | `None` | `Success` |
| `GET` | `/api/users/me` | Fetch active user profile from JWT session | None | `None` | `Success` |
| `PATCH` | `/api/users/me/profile` | Update active user details | None | `UpdateUserDto` | `Success` |
| `GET` | `/api/users/platform-settings` | Get current payout settings | None | `None` | `Success` |
| `PUT` | `/api/users/platform-settings` | Update payout settings | None | `UpdatePlatformSettingsDto` | `Success` |
| `GET` | `/api/users/me/following-businesses` | List businesses user is following | None | `None` | `Success` |
| `POST` | `/api/users/{business_id}/follow` | Follow a specific vendor business | `business_id` (path, req `string`) | `None` | `Success` |
| `DELETE` | `/api/users/{business_id}/unfollow` | Unfollow a specific vendor business | `business_id` (path, req `string`) | `None` | `Success` |
| `GET` | `/api/users/feed` | Fetch the main social catalog feed | `page` (query, opt `string`), `size` (query, opt `string`), `business_limit` (query, opt `string`) | `None` | `Success` |
| `GET` | `/api/users/vendors/top-week` | Get top-performing weekly vendors | None | `None` | `Success` |
| `GET` | `/api/users/vendors/new-week` | Get newly listed weekly vendors | None | `None` | `Success` |
| `GET` | `/api/users/vendors` | List all verified business vendors | None | `None` | `Success` |
| `GET` | `/api/users/vendors/{business_id}` | Get vendor profile by ID | `business_id` (path, req `string`) | `None` | `Success` |
| `DELETE` | `/api/users/delete` | Permanently delete active user account | None | `None` | `Success` |

---

## Waitlist Module Integration
*   **Corresponding Frontend Pages**: Various UI pages

| Method | Endpoint Route | Summary / Operation | Params | Request DTO | Response DTO |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/waitlist/customer` | Join the customer waitlist | None | `CustomerWaitlistDto` | `Success` |
| `POST` | `/api/waitlist/vendor` | Join the vendor waitlist | None | `VendorWaitlistDto` | `Success` |

---

## Wallets Module Integration
*   **Corresponding Frontend Pages**: `/profile` (Wallet funding flow)

| Method | Endpoint Route | Summary / Operation | Params | Request DTO | Response DTO |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/wallets/fund` | Fund wallet via Paystack | None | `FundWalletDto` | `Success` |
| `GET` | `/api/wallets/balance` | Get wallet balance | None | `None` | `Success` |
| `GET` | `/api/wallets/price` | Calculate currency price of tokens | `tokens` (query, req `number`), `currency` (query, req `string`) | `None` | `Success` |

---

## Webhook Module Integration
*   **Corresponding Frontend Pages**: Automatic backend operations

| Method | Endpoint Route | Summary / Operation | Params | Request DTO | Response DTO |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/webhook/paystack` | Handle Paystack webhook | None | `None` | `Success` |

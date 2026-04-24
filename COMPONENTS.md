# Components

| Name                | ID                      | Description                                                                                                   |
| ------------------- | ----------------------- | ------------------------------------------------------------------------------------------------------------- |
| AppSidebar          | `app-sidebar`           | Left sidebar with logo, nav groups (Retail, B2B, Settings), footer version and logout alert-dialog            |
| AppSidebar Logo     | `app-nav-bar-logo`      | Inlined SVG logo displayed in the sidebar header                                                              |
| AppSidebar Title    | `app-nav-bar-title`     | Bold app name displayed next to the logo in the sidebar header                                                |
| AppShell            | `app-shell`             | SidebarProvider wrapper with breadcrumb header and main content area                                          |
| WelcomeScreen       | `screen-welcome`        | Full-height centered screen shown on the home page                                                            |
| WelcomeText         | `welcome-text`          | h1 heading displaying "Welcome to [app name]"                                                                 |
| NotFoundScreen      | `not-found-screen`      | 404 screen with warning message in tertiary color and a back-to-home button                                   |
| LoginScreen         | `screen-login`          | Full-page login form — `app/[locale]/login/_components/LoginScreen.tsx`                                       |
| AuthGuard           | —                       | Client component that checks current path and wraps authenticated routes in AppShell                          |
| UserMenu            | `user-menu-trigger`     | Dropdown in the navbar top-right — user icon trigger, calls Auth.js signOut on logout                         |
| UserDetailsCard     | `user-details-card`     | Card on the home page showing the logged-in user's email, member since date, groups and scopes as badges      |
| ProductsScreen      | `screen-products`       | Full-page products list fetched from Shopify — table with image, variants, total inventory and in-stock badge |
| ProductsTable       | —                       | Client component inside ProductsScreen — handles SKU and collection text filtering                            |
| ProductDetailScreen | `screen-product-detail` | Product detail page — shows collections, variants with inventory levels per location                          |
| SS27Screen          | `screen-ss27`           | Work-in-progress placeholder for B2B New collection SS27 — `/b2b/ss27`                                        |
| ProfileScreen       | `screen-profile`        | Work-in-progress placeholder for Settings Profile — `/settings/profile`                                       |
| CreateOrderScreen   | `screen-create-order`   | Empty placeholder page for B2B order creation — `/b2b/create-order` — requires `users:write` scope            |
| OrderHistoryScreen  | `screen-order-history`  | Order history page showing all orders in a table — `/b2b/order-history` — no scope required                   |
| OrderHistoryTable   | `order-history-table`   | Client table component displaying order details: ID, customer email, quantity, amount, status, paid, dates    |
| OrderDetailScreen   | `screen-order-detail`   | Order detail page showing full order info and all items — `/b2b/orders/[id]` — requires `users:write` scope   |

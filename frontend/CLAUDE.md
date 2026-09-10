# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development server (port 8080)
ng serve

# Production build
ng build --prod

# Run unit tests
ng test

# Run a single test file
ng test --include='**/path/to/file.spec.ts'

# Lint
ng lint

# E2E tests
ng e2e
```

## Architecture

**Angular 8 ERP dashboard** for HARU — a business management application with German/Spanish localization. The backend API is at `https://www.manzasm.com/api`.

### Module Structure

- `app.module.ts` — Root module. Uses `HashLocationStrategy` for routing.
- `src/app/manza/` — Main business feature module (orders, products, budgets, honeycomb display). Lazy-loaded at `/manza`.
- `src/app/leroymerlin/` — LeroyMerlin integration module. Lazy-loaded at `/leroy`.
- `src/app/routes/` — Authenticated main routes, loaded after login.
- `src/app/pages/` — Public/static pages.
- `src/app/shared/` — Shared components, directives, pipes, utilities used across modules.
- `src/app/layouts/` — Three layouts: `FullLayout` (sidebar+header), `TopBarLayout`, `SimpleLayout`.

### Key Services

- `HaruService` (`src/app/services/haru.service.ts`) — Primary API service (~29KB). All backend data fetching goes through here.
- `AuthService` / `AuthInterceptor` — JWT-based auth. The interceptor automatically injects tokens into HTTP requests.
- `AuthGuard` / `AdminGuard` — Route guards protecting `/routes` and `/manza`.
- `ImageCacheService` — Caches images locally.
- `ExcelService` / `UploadService` — File I/O utilities.
- `TranslationService` — i18n support (translation files in `src/assets/i18n/`).

### Data Models

Located in `src/app/models/`. Key types: `KundeType` (customer), `BestellungType` / `BestellungLineType` (orders), `ruckgabeType` (returns), `SearchModel`, `GenType`.

### Environment Configuration

No `.env` files — configuration is in `src/environments/`:
- `environment.ts` — dev (`firmaID: '004'`, `host_ip: 'https://www.manzasm.com'`)
- `environment.prod.ts` — production (same host, adds `assetsBase: '/customers'`)

Commented-out blocks in these files show alternate configs for beta/local testing.

### Styling

- Main SCSS entry: `src/scss/style.scss`
- Bootstrap 4 with custom variable overrides in `src/scss/_bootstrap-variables.scss` and `src/scss/_custom-variables.scss`
- Compiled CSS (`style.css`, 413KB) is committed — edit SCSS sources, not the compiled output.

### Notable Third-Party Integrations

- **jqWidgets** — Heavy use of `jqxgrid`, `jqxtabs`, `jqxbuttons`, etc. Scripts are loaded globally via `angular.json`. TypeScript types come from `jqwidgets-framework`.
- **WebDataRocks / PivotTable** — Reporting/pivot tables.
- **FullCalendar** — Calendar views.
- **ngx-socket-io** — WebSocket support.
- **ng-dynamic-forms** — Dynamic form generation.
- **jsPDF + jspdf-autotable** — PDF export.
- **xlsx** — Excel read/write.

### Localization

The `src/app/shared/` directory contains a large localization file (~16K lines). Translation pipe is `TranslatePipe`. Supported languages include German and Spanish.

### Bundle Size

Production bundle budget is set to 10MB warning / 20MB error (angular.json). The app is intentionally large due to jqWidgets and other enterprise libraries.

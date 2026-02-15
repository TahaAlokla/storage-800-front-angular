# Storage 800 Front Angular Task

## 1. Project Summary

This is an Angular 21 standalone application for user browsing and user profile viewing using the ReqRes API.  
It includes:

- User list with pagination
- User details page
- Header instant search behavior
- In-memory API response caching
- Global dark/light theme toggle
- Arabic and English internationalization
- Loading bar and skeleton states
- Custom 404 and 500 pages

The app uses Signals for local and shared UI state, plus RxJS for async HTTP workflows.

## 2. Tech Stack

- Angular `21.1.x` (standalone components)
- Angular Router (lazy routes + `withComponentInputBinding`)
- Angular Material (progress bar, paginator i18n base class)
- Tailwind CSS v4
- Transloco for i18n
- RxJS
- TypeScript (strict mode enabled)

## 3. Run and Build

Install dependencies:

```bash
npm install
```

Run development server:

```bash
npm run start
```

Build production bundle:

```bash
npm run build
```

Run unit tests:

```bash
npm run test
```

## 4. Environment and API

Environment files:

- `src/environments/environment.ts`
- `src/environments/environment.development.ts`

Current API base URL:

- `https://reqres.in/api`

API endpoints constants:

- `src/app/constants/app.endpoints.constants.ts`
  - `user_list: /users`
  - `user_details: /users/:id`

Auth/API-key header key constant:

- `src/app/constants/keys.constants.ts`
  - key name: `x-api-key`

## 5. High-Level Architecture

```text
src/
  app/
    core/
      interceptors/
      services/
      transloco-loader.ts
    features/
      users/
        components/
        pages/
        user.service.ts
        user.types.ts
        users.routes.ts
    shared/
      components/
      pages/
    constants/
    app.config.ts
    app.routes.ts
    app.ts
  environments/
  styles.css
public/
  i18n/
    en.json
    ar.json
```

Architecture style:

- `core`: cross-cutting infrastructure (loading, theme, splash, interceptors, i18n loader)
- `features/users`: domain-specific logic and UI for users
- `shared`: reusable UI components and generic pages

## 6. Routing Design

Main routes are configured in `src/app/app.routes.ts`:

- `/` redirects to `/users`
- `/users` lazy-loads user feature routes
- `/500` lazy-loads server error page
- `**` lazy-loads not-found page

User feature routes in `src/app/features/users/users.routes.ts`:

- `/users` -> users list page
- `/users/:id` -> user details page

Router configuration in `src/app/app.config.ts` includes:

- `withViewTransitions()`
- `withComponentInputBinding()` for route param to `input()` binding

## 7. Service Catalog (Detailed)

### 7.1 `UserService`

File: `src/app/features/users/user.service.ts`

Responsibilities:

- Fetch users list (`getUsers`)
- Fetch single user (`getUserById`)
- Keep shared UI state for list page and header search
- Cache API responses to avoid duplicate requests

State signals:

- `listPage`
- `listPerPage`
- `listSearchQuery`

State methods:

- `setListPage(page)`
- `setListPerPage(perPage)`
- `setListSearchQuery(query)`
- `clearListSearchQuery()`

Caching strategy:

- List cache key = `${page}:${perPage}`
- Details cache key = normalized `id`
- Uses `shareReplay({ bufferSize: 1, refCount: false })`
- List errors clear list cache entry
- Details errors clear cache entry except `404` (404 remains cached)

### 7.2 `LoadingService`

File: `src/app/core/services/loading.service.ts`

Responsibilities:

- Manages loading-bar state for HTTP lifecycle
- Tracks active URLs in an internal map
- Exposes BehaviorSubject-based streams:
  - `auto$`
  - `mode$`
  - `progress$`
  - `show$`

Used by:

- `LoadingInterceptor`
- `loading-bar` component

### 7.3 `ThemeService`

File: `src/app/core/services/theme.service.ts`

Responsibilities:

- Stores current dark mode state in a signal
- Applies/removes `dark` class on `<html>`
- Sets `color-scheme`
- Persists user preference in `localStorage`
- Falls back to system preference if no stored setting

### 7.4 `SplashScreenService`

File: `src/app/core/services/splash-screen.ts`

Responsibilities:

- Controls splash screen visibility by toggling body class
- Automatically hides splash after first `NavigationEnd`

### 7.5 `TranslocoPaginatorIntlService`

File: `src/app/core/services/transloco-paginator.ts`

Responsibilities:

- Extends `MatPaginatorIntl`
- Live-translates paginator labels from Transloco
- Updates labels when language changes
- Provides translated range label format

### 7.6 `TranslocoHttpLoader`

File: `src/app/core/transloco-loader.ts`

Responsibilities:

- Loads translation JSON from `/i18n/{lang}.json`

## 8. Interceptors

### 8.1 `LoadingInterceptor`

File: `src/app/core/interceptors/loading.interceptor.ts`

- Reads auto mode from `LoadingService`
- Marks request URL as active before request
- Clears URL from active map in `finalize`
- Drives global loading bar visibility

### 8.2 `authInterceptor`

File: `src/app/core/interceptors/auth.interceptor.ts`

- Adds `x-api-key` header to outgoing requests
- Reads key from environment config
- Logs client/server errors and rethrows

Both interceptors are registered in `app.config.ts`:

```ts
provideHttpClient(withInterceptors([LoadingInterceptor, authInterceptor]))
```

## 9. Users Feature Details

### 9.1 Users List Page

File: `src/app/features/users/pages/user-list/user-list.ts`

- Loads paginated users based on `UserService.listPage` and `listPerPage`
- Displays skeleton while loading
- Handles API failure state
- Uses computed pagination helpers (`totalPages`, `startItem`, `endItem`)
- Applies in-page filter by ID from `listSearchQuery`
- Keeps pagination state when navigating away and back

### 9.2 Users Details Page

File: `src/app/features/users/pages/user-details/user-details.ts`

- Receives route `id` via `input()` (enabled by `withComponentInputBinding`)
- Fetches user detail reactively in an `effect`
- Shows skeleton and error states
- Includes back navigation via `Location.back()`

### 9.3 Header Search Behavior

Files:

- `src/app/shared/components/header/header.ts`
- `src/app/shared/components/header/header.html`

Behavior:

- On `/users` page: search field updates `UserService.listSearchQuery` to filter list cards
- On non-list pages: search performs instant API lookup by ID with debounce
- Supports loading, invalid, not found, and error states
- Allows direct navigation to details page from search result

## 10. Shared UI Components

Reusable components include:

- `loading-bar` (global network progress)
- `loading-skeleton` (enum-based skeleton types)
- `pagination` (reusable page controls)
- `theme-toggle`
- `lang-toggle`
- `header`
- `footer` (currently imported in `App` but not rendered in `app.html`)

Error pages:

- `page-404`
- `page-500`

## 11. Internationalization

Translation files:

- `public/i18n/en.json`
- `public/i18n/ar.json`

Language behavior:

- Default language is English
- Runtime language switch between English and Arabic
- Language persisted in `localStorage`
- `dir` and `lang` attributes updated on `<html>`

## 12. Styling and Theming

Global style file:

- `src/styles.css`

Highlights:

- Tailwind v4 import and dark variant setup
- Global page shell theme:
  - `.app-page-shell` (light background/text)
  - `.dark .app-page-shell` (dark background/text)
- CSS vars for primary and secondary brand colors:
  - primary: `#E56333`
  - secondary: `#122247`

## 13. State Management Strategy

The project uses a hybrid model:

- Angular Signals for component state and shared feature state
- RxJS streams for HTTP and async orchestration
- Simple shared state currently centralized in `UserService` for:
  - current list page
  - current per-page value
  - current list search query

## 14. Data Contracts

User-related interfaces are defined in:

- `src/app/features/users/user.types.ts`

Main contracts:

- `ReqResUser`
- `UsersListResponse`
- `UserDetailsResponse`

## 15. Notes for Maintenance

- If you change API endpoints, update:
  - `app.endpoints.constants.ts`
  - feature service calls as needed
- If you change translation keys, update both language files
- If you re-enable footer rendering, uncomment it in `src/app/app.html`
- Current build may warn about `Footer` import in `src/app/app.ts` because the template does not render it

## 16. Git Notes

### Recommended branch workflow

- Create a feature branch from `main`:

```bash
git checkout main
git pull
git checkout -b feat/<short-topic>
```

- Keep commits small and focused (one logical change per commit).
- Rebase or merge `main` frequently to avoid large conflicts.

### Commit message convention (recommended)

Use a simple Conventional Commits style:

- `feat: ...` for new features
- `fix: ...` for bug fixes
- `refactor: ...` for non-functional internal changes
- `docs: ...` for README/documentation updates
- `style: ...` for formatting-only changes
- `test: ...` for tests

Examples:

```text
feat: add instant header user search with cache-first lookup
fix: preserve users list pagination state when returning from details
docs: add architecture and services report to README
```

### Typical local flow

```bash
git status
git add .
git commit -m "feat: your message"
git push -u origin <branch-name>
```

### Pull request checklist

- Build passes locally (`npm run build`)
- No unrelated files included in the PR
- Translation keys updated in both `en.json` and `ar.json` when needed
- README updated if architecture or behavior changed

### Repository hygiene

- Do not commit `node_modules/` or build artifacts in `dist/`
- Keep secrets out of commits (API keys/tokens should be managed securely)
- Avoid force-push to shared branches unless explicitly agreed

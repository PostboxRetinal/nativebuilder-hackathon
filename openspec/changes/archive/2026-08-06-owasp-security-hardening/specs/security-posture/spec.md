## ADDED Requirements

### Requirement: Content Security Policy enforced

The production build SHALL emit a Content Security Policy restricting sources to self by default, with SRI hashing applied to build assets.

#### Scenario: CSP present in production
- **WHEN** the production bundle is built and served
- **THEN** a self-only Content Security Policy is applied and build assets are SRI-hashed

#### Scenario: Tailwind styles allowed in dev
- **WHEN** the dev server runs
- **THEN** the CSP runs in dev mode with Tailwind outlier support so generated styles are not blocked

### Requirement: Production build hardened

The production build SHALL use esbuild minification with CSS minification and hidden source maps.

#### Scenario: Minified production bundle
- **WHEN** the production build runs
- **THEN** JavaScript and CSS are minified and source maps are emitted but hidden from the browser

### Requirement: Lint-level injection detection

The ESLint configuration SHALL enable security rules that flag eval-style execution and injection-prone patterns as errors.

#### Scenario: Eval usage flagged
- **WHEN** code uses dynamic eval-with-expression
- **THEN** ESLint reports an error

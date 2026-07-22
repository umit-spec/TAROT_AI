# Technical Constitution — Architecture & Code Standards

## Stack (Final)

- **Frontend:** Next.js 16, React 19, TypeScript, Tailwind CSS
- **Backend:** Route Handlers + Server Actions (no separate API)
- **Database:** PostgreSQL 14+, Drizzle ORM
- **Auth:** Auth.js (NextAuth v5)
- **Validation:** Zod
- **Testing:** Vitest, React Testing Library, Playwright
- **Deployment:** Vercel, Railway (DB)
- **Observability:** Sentry, Posthog
- **Email:** Resend

**Constraint:** No custom auth, no separate Express, no monorepo complexity. Single Next.js app, modular code organization.

---

## Architecture Principles

1. **Single Source of Truth:** Business logic in Insight Engine, not scattered
2. **Type Safety:** TypeScript strict mode, Zod validation at boundaries
3. **Server-First:** Heavy lifting on server, client lightweight
4. **Modularity:** Cards, Reading, Persona modules can be replaced/extended
5. **Testability:** Units mockable, integration testable, E2E verifiable
6. **Performance:** <3s page load, 60fps animations, zero CLS
7. **Privacy-First:** Minimal data, GDPR-compliant, encrypted at rest

---

## Code Organization

```
src/
├── app/
│   ├── layout.tsx (root layout)
│   ├── page.tsx (landing)
│   ├── reading/
│   │   └── page.tsx (reading flow)
│   └── api/
│       ├── reading.ts (POST reading generation)
│       ├── persona-detect.ts (POST persona detection)
│       └── [...nextauth]/route.ts
│
├── components/
│   ├── TopicSelector.tsx
│   ├── QuestionFlow.tsx
│   ├── CardSelector.tsx
│   ├── ReadingDisplay.tsx
│   └── [...others]
│
├── server/
│   ├── reading-engine/
│   │   ├── deterministic.ts (Layer 1)
│   │   ├── synthesis.ts (Layer 2)
│   │   └── validate.ts (output validation)
│   ├── intake/
│   │   ├── persona-detection.ts
│   │   └── flow.ts
│   └── db.ts (Drizzle client)
│
├── lib/
│   ├── auth.ts (Auth.js config)
│   ├── claude.ts (API wrapper)
│   └── types.ts (shared types)
│
├── db/
│   ├── schema.ts (Drizzle schema)
│   ├── seed.ts (initial data)
│   └── migrations/
│
├── __tests__/
│   ├── unit/ (Layer 1-3 tests)
│   ├── integration/ (full flow)
│   └── e2e/ (Playwright)
│
└── styles/
    ├── globals.css
    ├── animations.css
    └── tailwind.config.ts
```

---

## Module Boundaries

```
Persona Module
├── Detection algorithm
├── Persona types (5)
└── Tone rules (frase lists)

Card Module
├── Card database (22 Big Arcana)
├── Meanings (base, position, context)
└── Asset library metadata

Reading Module
├── Layer 1: Deterministic lookup
├── Layer 2: Synthesis
├── Layer 3: AI Language
└── Validation (Zod schema)

Intake Module
├── Topic selection
├── Dynamic questions
├── Context answers
└── Recommendation algorithm

Auth Module
├── Magic link (Resend)
├── Google OAuth
├── Session management
└── Guest sessions

Analytics Module
├── Event logging
├── Dashboard queries
└── Metrics calculation
```

Each module:
- Has clear inputs/outputs
- Can be tested independently
- Can be replaced (e.g., Claude → GPT)
- Has NO circular dependencies

---

## Code Standards

### TypeScript

```
- Strict mode: true
- No any (only when truly necessary)
- Every function has explicit return type
- Every parameter typed
- Enums for constants (topic, persona_type, etc.)
```

### Error Handling

```
- Try-catch at API boundaries only
- Errors logged to Sentry (include context)
- User sees friendly message, logs see full stack
- Never leak sensitive info in error messages
```

### Naming Conventions

```
- Components: PascalCase (TopicSelector)
- Functions: camelCase (detectPersona)
- Constants: UPPER_SNAKE_CASE (MAX_CARDS_PER_READING)
- Types: PascalCase (PersonaType, ReadingResult)
- Database tables: snake_case (reading_reflections)
```

### Comments

```
- No comments explaining WHAT (code speaks for itself)
- Only comments explaining WHY (unusual decision, constraint)
- Example:
  ❌ // Loop through cards
     for (const card of cards)
  ✅ // We use map over reduce here because it's more readable
     // (tried reduce, made persona-detection logic harder to follow)
     cards.map(...)
```

---

## Testing Standards

### Unit Tests

Every function in `server/` and `lib/` has unit test:

```typescript
// Examples:
describe('deterministic-layer', () => {
  it('returns correct meaning for 00-fool in past', async () => {
    const result = await getDeterministicMeaning('00', 'past', 'relationship')
    expect(result.base_meaning).toContain('başlangıç')
  })
  
  it('never returns kesin kehanet phrases', async () => {
    const result = await getDeterministicMeaning('any', 'any', 'any')
    expect(result.base_meaning).not.toMatch(/kesinlikle|mutlaka|garantili/)
  })
})
```

### Integration Tests

Core flows tested end-to-end:

```
✓ Intake flow: topic → questions → persona detected
✓ Reading flow: cards → deterministic → synthesis → AI → validated
✓ Auth flow: magic link → session → save reading
✓ Fallback: Claude down → deterministic-only delivered
```

### E2E Tests (Playwright)

Critical user paths:

```
✓ First-time user: land → topic → questions → reading → save
✓ Premium interest: reading → premium modal → click
✓ Persona switching: user changes preference → tone changes
```

---

## Performance Budgets

- **First Contentful Paint (FCP):** <1.5s
- **Largest Contentful Paint (LCP):** <2.5s
- **Cumulative Layout Shift (CLS):** <0.1
- **Lighthouse Score:** >90 (all categories)
- **Mobile Lighthouse:** >85

Monitored via Sentry + Vercel Analytics.

---

## Security Checklist

- [ ] No SQL injection (Drizzle parameterized queries)
- [ ] No XSS (React auto-escapes, CSP headers)
- [ ] No CSRF (Auth.js CSRF tokens)
- [ ] No prompt injection (Claude inputs parameterized, never concatenated)
- [ ] Secrets in env vars (never committed)
- [ ] Rate limiting (1 reading/hour free, cooldowns)
- [ ] Session timeout (30 min inactivity)
- [ ] GDPR compliance (delete account, data export)

---

## Dependency Rules

**Allowed:**
- React + Next.js core
- TypeScript, Zod (validation)
- Drizzle (DB)
- Auth.js (sessions)
- Tailwind (styling)
- Vitest, Playwright (testing)

**Forbidden:**
- Custom auth framework
- UI library (Material-UI, Chakra) → Radix headless components
- State management (Redux, Zustand) → React hooks + server state
- GraphQL → REST/tRPC-lite (Route Handlers)
- ORM (Sequelize, TypeORM) → Drizzle

**Future (post-MVP):**
- tRPC (if API growth warrants)
- Backend separation (if >1000 RPS)
- Caching layer (Redis)

---

## Deployment Strategy

```
Development:
  → Next.js local (npm run dev)
  → SQLite (dev database)
  → Environment: .env.local

Staging:
  → Vercel Preview (on PR)
  → PostgreSQL (staging DB)
  → Monitored by Sentry

Production:
  → Vercel (main branch)
  → PostgreSQL (Railway)
  → Secrets in Vercel env
  → Analytics (Posthog + Sentry)
  → Auto-deploy on merge
```

---

## Monitoring & Observability

**Sentry:**
- Every error logged with context (userId, sessionId, action)
- Performance profiling on reading generation
- Error rate alert >5% (auto-page)

**Posthog:**
- 14 events tracked (see Analytics Constitution)
- Dashboard: completion rate, helpfulness, premium interest

**Vercel Analytics:**
- Page performance (CLS, LCP, FCP)
- Real-user monitoring (RUM)
- Error tracking (uncaught exceptions)

---

## Next Steps

Analytics Constitution. Metrics and events.

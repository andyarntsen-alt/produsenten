# Produsenten - Optimaliseringsplan

## KRITISK (Fiks først)

### Sikkerhet
- [ ] **Roter API-nøkler** - Gemini og Resend nøkler er eksponert
- [ ] **Flytt API-kall til backend** - API-nøkler synlige i nettleser (`ai.ts:58`, `ExportTab.tsx:56`)
- [ ] **Forbedre input-validering** - URL-validering og HTML-sanitering (`App.tsx:75-111`)

### SEO
- [ ] **Legg til meta-tags i index.html** - description, Open Graph, Twitter Cards
- [ ] **Legg til JSON-LD strukturert data** - for bedre søkeresultater
- [ ] **Fiks tittel og canonical URL**

---

## HØY PRIORITET

### Ytelse
- [ ] **Optimaliser bilder** - Konverter til WebP, komprimer (2.5MB totalt nå)
  - `hero-bg.png` (805KB), `brudeferden.jpg` (310KB), feature-bilder
- [ ] **Implementer lazy loading** - Bilder og tunge komponenter
- [ ] **Code-split modals** - Bruk React.lazy() for HookLabModal, BioGeneratorModal, etc.
- [ ] **Legg til loading="lazy"** på alle bilder

### Kode-kvalitet
- [ ] **Refaktorer App.tsx** (582 linjer) - Ekstraher til custom hooks
  - `useBrandCreation`, `useBrandGeneration`, `useLocalStorageBrands`
- [ ] **Valider localStorage data** - Legg til try-catch og schema-validering
- [ ] **Forbedre rate limiting** - Persistent tracking, ikke bare in-memory

---

## MEDIUM PRIORITET

### Tilgjengelighet (A11y)
- [ ] **Legg til ARIA-labels** - Spesielt på icon-buttons
- [ ] **Keyboard navigation** - Tab-rekkefølge, focus states
- [ ] **Alt-tekst på bilder** - Mangler på flere steder
- [ ] **Skip-to-content link** - For skjermlesere
- [ ] **Sjekk fargekontrast** - WCAG AA compliance

### UX Forbedringer
- [ ] **Loading states** - Mangler på email-sending, noen API-kall
- [ ] **Bedre error handling** - Vis feilmeldinger til bruker, ikke bare console
- [ ] **Empty states** - Bedre onboarding når ingen data
- [ ] **Mobil-responsivitet** - Sidebar kollapser ikke på mobil

### Feilhåndtering
- [ ] **Error boundaries** - Fang React-feil gracefully
- [ ] **Konsistent toast-bruk** - Alle feil vises til bruker
- [ ] **Offline-håndtering** - Vis melding når ingen nettilgang

---

## LAV PRIORITET

### Kode-organisering
- [ ] **Opprett `/src/utils/`** - Flytt parseTweets, HTML-utilities
- [ ] **Opprett `/src/hooks/`** - Custom hooks
- [ ] **Opprett `/src/types/`** - TypeScript interfaces
- [ ] **Kategoriser komponenter** - `/components/modals/`, `/components/tabs/`

### Testing
- [ ] **Sett opp Vitest** - Testing framework
- [ ] **Legg til React Testing Library**
- [ ] **Skriv tester for kritiske flows** - Brand creation, AI-kall

### Performance (Avansert)
- [ ] **Bundle analyse** - Legg til rollup-plugin-visualizer
- [ ] **Service worker** - Offline support, caching
- [ ] **Memoize tunge beregninger** - Dashboard streak, etc.

### Dokumentasjon
- [ ] **README.md** - Setup-instruksjoner, arkitektur
- [ ] **JSDoc comments** - På viktige funksjoner
- [ ] **Komponent-dokumentasjon**

### Uferdige features
- [ ] **Implementer ekte autentisering** - LoginPage er mock
- [ ] **Fjern "kommer snart" features** - Eller implementer dem
- [ ] **Backend for CORS** - Website-scraping fungerer ikke

---

## Quick Wins (Kan gjøres raskt)

1. Meta-tags i index.html (5 min)
2. Alt-tekst på bilder (10 min)
3. Loading="lazy" på bilder (5 min)
4. Error boundary wrapper (15 min)
5. Bedre empty states (30 min)

---

## Anbefalt Rekkefølge

1. **Uke 1**: Sikkerhet + SEO
2. **Uke 2**: Ytelse (bilder, lazy loading)
3. **Uke 3**: Tilgjengelighet + Mobil
4. **Uke 4**: Testing + Dokumentasjon

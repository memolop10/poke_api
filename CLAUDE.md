# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev`: Vite dev server with HMR
- `npm run build`: type-checks with `tsc -b` (project references: `tsconfig.app.json` for `src/`, `tsconfig.node.json` for `vite.config.ts`), then runs `vite build`
- `npm run lint`: Oxlint (config in `.oxlintrc.json`; `react/rules-of-hooks` is an error)
- `npm run preview`: serves the production build

There is no test runner configured. `npm run build` is the type check; `noUnusedLocals`/`noUnusedParameters` are on, so unused imports and parameters fail the build.

## Architecture

A React 19 + TypeScript + Vite single-page Pokédex built on the public PokeAPI (`https://pokeapi.co/api/v2`). State lives in Redux Toolkit, routing uses react-router-dom v7, and the stats chart uses Recharts.

**Routes** (`src/App.tsx`): `/` → `Home` (logo linking to the Pokédex), `/pokedex` → `Pokedex` (paginated grid with search), `/pokedex/:name` → `PokemonDetail`.

**State** (`src/store/pokemonSlice.ts`): one `pokemon` slice holds all data fetching as `createAsyncThunk`s that call the native `fetch` (`axios` is installed but unused). Components use the typed `useAppDispatch`/`useAppSelector` from `src/store/hooks.ts`, not the raw react-redux hooks. List and detail state are separate (`listStatus`/`listError` vs `detailStatus`/`detailError`).

**How the Pokédex list and search work together:**
- `fetchPokemonIndex` loads every Pokémon name (`?limit=100000`) into `state.index`. Its `condition` makes it run once per session (tracked by `indexStatus`). Search runs on the client against this index.
- With no search term, `fetchPokemonPage` fetches one page by offset, then fetches each entry's detail URL in parallel to get its sprite and types (N+1 requests per page, `PAGE_SIZE = 25`).
- With a search term (debounced 300 ms in `Pokedex.tsx`), the matching names are filtered and sliced to the current page, and `fetchPokemonPageByNames` fetches only those details.
- Both thunks write to `state.list`. To keep a slow, outdated response from overwriting a newer one, page effects return `() => request.abort()`, the thunks pass `signal` to `fetch`, and `rejected` reducers ignore `action.meta.aborted`. Follow this pattern for new fetches.
- `matchingNames` returns the module-level `NO_MATCHES` constant when there is no search. A fresh `[]` would re-trigger the fetch effect.
- `PokemonDetail` dispatches `resetPokemonDetail` on cleanup, so opening another Pokémon never briefly shows the previous one.

**Pagination and search survive navigation through router `location.state`, not the URL.** `PokemonCard` passes `{ from, page, search }` as link state to the detail page, and the detail page's back link passes `{ page, search }` back to `/pokedex`, which initializes its local state from it. Keep that state flowing when you change these links.

**Types**: API and state shapes are in `src/types/pokemon.ts`. Component prop interfaces are in `src/types/ui.ts` (except `StatsChart`, which defines its props inline).

## Conventions

- User-facing UI text is in Spanish ("Volver", "Buscar Pokémon", "Anterior/Siguiente"). Match it.
- Code comments are in Spanish. Every exported function, thunk, selector, reducer and component has a short JSDoc saying what it does. Keep that up for new code.
- PokeAPI returns `height` in decimeters and `weight` in hectograms. Divide by 10 before displaying.
- Styling is plain CSS: global theme tokens (`--text`, `--accent`, `--border`, …) are in `src/index.css`, with a `prefers-color-scheme: dark` override. Component and page styles are in `src/App.css`. Use the CSS variables (including inside Recharts props) rather than hard-coded colors.
- `verbatimModuleSyntax` is enabled, so type-only imports must use `import type`.

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from './index'
import type { PokemonDetail, PokemonState, PokemonListEntry, PokemonListItem } from '../types/pokemon'

const initialState: PokemonState = {
  list: [],
  totalCount: null,
  index: [],
  indexStatus: 'idle',
  detail: null,
  listStatus: 'idle',
  detailStatus: 'idle',
  listError: null,
  detailError: null,
}

/**
 * Descarga la lista completa de nombres de Pokémon (~1300 entradas) para que la
 * búsqueda se haga en el cliente. Solo se ejecuta una vez por sesión: `condition`
 * cancela el thunk si el índice ya se cargó o se está cargando.
 */
export const fetchPokemonIndex = createAsyncThunk<PokemonListEntry[], void, { state: RootState }>(
  'pokemon/fetchIndex',
  async (_, { signal }) => {
    const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=100000', { signal })
    if (!response.ok) throw new Error('Failed to fetch pokemon index')
    const data = await response.json()
    return data.results as PokemonListEntry[]
  },
  {
    condition: (_, { getState }) => {
      const { indexStatus } = getState().pokemon
      return indexStatus === 'idle' || indexStatus === 'failed'
    },
  },
)

/**
 * Trae una página del listado general (sin búsqueda) y, para cada Pokémon, pide su
 * detalle en paralelo para obtener el sprite y los tipos que muestra la tarjeta.
 * Devuelve también el total de Pokémon para calcular la paginación.
 * Si el thunk se aborta (cambio de página o desmontaje), se cancelan todos los requests.
 */
export const fetchPokemonPage = createAsyncThunk<
  { items: PokemonListItem[]; totalCount: number },
  { page: number; pageSize: number }
>('pokemon/fetchPage', async ({ page, pageSize }, { signal }) => {
  const offset = (page - 1) * pageSize
  const response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${pageSize}&offset=${offset}`, { signal })
  if (!response.ok) throw new Error('Failed to fetch pokemon page')

  const pageData = await response.json()
  const pokemonEntries = pageData.results as { name: string; url: string }[]

  const details = await Promise.all(
    pokemonEntries.map(async (entry) => {
      const detailResponse = await fetch(entry.url, { signal })
      if (!detailResponse.ok) throw new Error(`Failed to fetch pokemon ${entry.name}`)
      const pokemonData = await detailResponse.json()
      return {
        name: entry.name,
        image: pokemonData.sprites?.front_default ?? null,
        types: pokemonData.types.map((typeEntry: any) => typeEntry.type.name),
      } as PokemonListItem
    }),
  )

  return { items: details, totalCount: pageData.count as number }
})

/**
 * Trae los datos de tarjeta (sprite y tipos) de una lista concreta de nombres.
 * Se usa con la búsqueda: el filtrado se hace contra el índice local y acá solo se
 * piden los Pokémon de la página actual de resultados.
 */
export const fetchPokemonPageByNames = createAsyncThunk<PokemonListItem[], { names: string[] }>(
  'pokemon/fetchPageByNames',
  async ({ names }, { signal }) => {
    if (names.length === 0) return []
    const details = await Promise.all(
      names.map(async (name) => {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`, { signal })
        if (!response.ok) throw new Error(`Failed to fetch pokemon ${name}`)
        const data = await response.json()
        return {
          name,
          image: data.sprites?.front_default ?? null,
          types: data.types.map((typeEntry: any) => typeEntry.type.name),
        } as PokemonListItem
      }),
    )
    return details
  },
)

/** Trae el detalle completo de un Pokémon (stats, habilidades, medidas) para la página de detalle. */
export const fetchPokemonByName = createAsyncThunk<PokemonDetail, string>(
  'pokemon/fetchByName',
  async (pokemonName, { signal }) => {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`, { signal })
    if (!response.ok) throw new Error('Pokemon not found')
    const data = await response.json()
    return data as PokemonDetail
  },
)

const slice = createSlice({
  name: 'pokemon',
  initialState,
  reducers: {
    /** Vuelve el listado y el detalle a su estado inicial. Conserva el índice de nombres. */
    resetPokemonState(state) {
      state.list = []
      state.totalCount = null
      state.listStatus = 'idle'
      state.listError = null
      state.detail = null
      state.detailStatus = 'idle'
      state.detailError = null
    },
    /**
     * Limpia el detalle al salir de la página de detalle, para que al abrir otro
     * Pokémon no se vea por un instante el anterior (o su error).
     */
    resetPokemonDetail(state) {
      state.detail = null
      state.detailStatus = 'idle'
      state.detailError = null
    },
  },
  extraReducers(builder) {
    // Los thunks abortados (por un request más nuevo o por desmontar el componente)
    // se ignoran en los casos `rejected`: no son errores reales y no deben pisar el estado.
    builder
      .addCase(fetchPokemonPage.pending, (state) => {
        state.listStatus = 'loading'
        state.listError = null
      })
      .addCase(
        fetchPokemonPage.fulfilled,
        (state, action: PayloadAction<{ items: PokemonListItem[]; totalCount: number }>) => {
          state.listStatus = 'succeeded'
          state.list = action.payload.items
          state.totalCount = action.payload.totalCount
        },
      )
      .addCase(fetchPokemonPage.rejected, (state, action) => {
        if (action.meta.aborted) return
        state.listStatus = 'failed'
        state.listError = action.error.message ?? 'Error'
      })
      .addCase(fetchPokemonPageByNames.pending, (state) => {
        state.listStatus = 'loading'
        state.listError = null
      })
      .addCase(fetchPokemonPageByNames.fulfilled, (state, action: PayloadAction<PokemonListItem[]>) => {
        state.listStatus = 'succeeded'
        state.list = action.payload
      })
      .addCase(fetchPokemonPageByNames.rejected, (state, action) => {
        if (action.meta.aborted) return
        state.listStatus = 'failed'
        state.listError = action.error.message ?? 'Error'
      })
      .addCase(fetchPokemonIndex.pending, (state) => {
        state.indexStatus = 'loading'
      })
      .addCase(fetchPokemonIndex.fulfilled, (state, action: PayloadAction<PokemonListEntry[]>) => {
        state.indexStatus = 'succeeded'
        state.index = action.payload
      })
      .addCase(fetchPokemonIndex.rejected, (state) => {
        // Si falla (o se aborta) se puede reintentar: `condition` acepta 'failed'.
        state.indexStatus = 'failed'
      })
      .addCase(fetchPokemonByName.pending, (state) => {
        state.detailStatus = 'loading'
        state.detailError = null
      })
      .addCase(fetchPokemonByName.fulfilled, (state, action: PayloadAction<PokemonDetail>) => {
        state.detailStatus = 'succeeded'
        state.detail = action.payload
      })
      .addCase(fetchPokemonByName.rejected, (state, action) => {
        if (action.meta.aborted) return
        state.detailStatus = 'failed'
        state.detailError = action.error.message ?? 'Error'
      })
  },
})

export const { resetPokemonState, resetPokemonDetail } = slice.actions

/** Pokémon de la página actual (del listado general o de la búsqueda). */
export const selectAllPokemon = (state: RootState) => state.pokemon.list
/** Índice completo de nombres, usado para filtrar la búsqueda en el cliente. */
export const selectPokemonIndex = (state: RootState) => state.pokemon.index
/** Estado de carga del índice de nombres. */
export const selectPokemonIndexStatus = (state: RootState) => state.pokemon.indexStatus
/** Total de Pokémon en la API (0 mientras no se cargó la primera página). */
export const selectPokemonTotalCount = (state: RootState) => state.pokemon.totalCount ?? 0
/** Detalle del Pokémon abierto en la página de detalle. */
export const selectPokemonDetail = (state: RootState) => state.pokemon.detail
/** Estado de carga del detalle. */
export const selectPokemonDetailStatus = (state: RootState) => state.pokemon.detailStatus
/** Mensaje de error del detalle, si falló. */
export const selectPokemonDetailError = (state: RootState) => state.pokemon.detailError
/** Convierte las stats del detalle al formato `{ name, value }` que espera el gráfico. */
export const selectPokemonStatsChartData = (state: RootState) =>
  state.pokemon.detail?.stats.map((stat) => ({
    name: stat.stat.name,
    value: stat.base_stat,
  })) ?? []

export default slice.reducer

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from './index'
import type { PokemonDetail, PokemonState, PokemonListEntry, PokemonListItem } from '../types/pokemon'

const initialState: PokemonState = {
  list: [],
  totalCount: null,
  index: [],
  detail: null,
  listStatus: 'idle',
  detailStatus: 'idle',
  listError: null,
  detailError: null,
}

export const fetchPokemonIndex = createAsyncThunk<PokemonListEntry[]>('pokemon/fetchIndex', async () => {
  const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=100000')
  if (!response.ok) throw new Error('Failed to fetch pokemon index')
  const data = await response.json()
  return data.results as PokemonListEntry[]
})

export const fetchPokemonPage = createAsyncThunk<
  { items: PokemonListItem[]; totalCount: number },
  { page: number; pageSize: number }
>('pokemon/fetchPage', async ({ page, pageSize }) => {
  const offset = (page - 1) * pageSize
  const response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${pageSize}&offset=${offset}`)
  if (!response.ok) throw new Error('Failed to fetch pokemon page')

  const pageData = await response.json()
  const pokemonEntries = pageData.results as { name: string; url: string }[]

  const details = await Promise.all(
    pokemonEntries.map(async (entry) => {
      const detailResponse = await fetch(entry.url)
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

export const fetchPokemonPageByNames = createAsyncThunk<PokemonListItem[], { names: string[] }>(
  'pokemon/fetchPageByNames',
  async ({ names }) => {
    if (names.length === 0) return []
    const details = await Promise.all(
      names.map(async (name) => {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`)
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

export const fetchPokemonByName = createAsyncThunk<PokemonDetail, string>('pokemon/fetchByName', async (pokemonName) => {
  const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`)
  if (!response.ok) throw new Error('Pokemon not found')
  const data = await response.json()
  return data as PokemonDetail
})

const slice = createSlice({
  name: 'pokemon',
  initialState,
  reducers: {
    resetPokemonState(state) {
      state.list = []
      state.totalCount = null
      state.listStatus = 'idle'
      state.listError = null
      state.detail = null
      state.detailStatus = 'idle'
      state.detailError = null
    },
  },
  extraReducers(builder) {
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
        state.listStatus = 'failed'
        state.listError = action.error.message ?? 'Error'
      })
      .addCase(fetchPokemonIndex.fulfilled, (state, action: PayloadAction<PokemonListEntry[]>) => {
        state.index = action.payload
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
        state.detailStatus = 'failed'
        state.detailError = action.error.message ?? 'Error'
      })
  },
})

export const { resetPokemonState } = slice.actions
export const selectAllPokemon = (state: RootState) => state.pokemon.list
export const selectPokemonIndex = (state: RootState) => state.pokemon.index
export const selectPokemonTotalCount = (state: RootState) => state.pokemon.totalCount ?? 0
export const selectPokemonDetail = (state: RootState) => state.pokemon.detail
export const selectPokemonDetailStatus = (state: RootState) => state.pokemon.detailStatus
export const selectPokemonDetailError = (state: RootState) => state.pokemon.detailError
export const selectPokemonStatsChartData = (state: RootState) =>
  state.pokemon.detail?.stats.map((stat) => ({
    name: stat.stat.name,
    value: stat.base_stat,
  })) ?? []

export default slice.reducer

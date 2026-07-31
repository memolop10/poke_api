export interface PokemonListEntry {
  name: string
  url: string
}

export interface PokemonListItem {
  name: string
  image: string | null
  types: string[]
}

export interface PokemonStat {
  base_stat: number
  effort: number
  stat: {
    name: string
    url: string
  }
}

export interface PokemonStatChartPoint {
  name: string
  value: number
}

export interface PokemonDetail {
  name: string
  sprites: { front_default: string | null }
  types: { type: { name: string } }[]
  height: number
  weight: number
  abilities: { ability: { name: string } }[]
  stats: PokemonStat[]
}

export interface PokemonState {
  list: PokemonListItem[]
  totalCount: number | null
  index: PokemonListEntry[]
  detail: PokemonDetail | null
  listStatus: 'idle' | 'loading' | 'succeeded' | 'failed'
  detailStatus: 'idle' | 'loading' | 'succeeded' | 'failed'
  listError: string | null
  detailError: string | null
}

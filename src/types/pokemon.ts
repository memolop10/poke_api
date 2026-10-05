/** Entrada del listado de la API: solo nombre y URL del detalle. */
export interface PokemonListEntry {
  name: string
  url: string
}

/** Datos mínimos que necesita una tarjeta de la grilla. */
export interface PokemonListItem {
  name: string
  image: string | null
  types: string[]
}

/** Una stat base tal como la devuelve la API (hp, attack, defense, ...). */
export interface PokemonStat {
  base_stat: number
  effort: number
  stat: {
    name: string
    url: string
  }
}

/** Punto del gráfico de stats. */
export interface PokemonStatChartPoint {
  name: string
  value: number
}

/**
 * Subconjunto de la respuesta de `/pokemon/{name}` que usa la app.
 * Ojo con las unidades de la API: `height` está en decímetros y `weight` en hectogramos.
 */
export interface PokemonDetail {
  name: string
  sprites: { front_default: string | null }
  types: { type: { name: string } }[]
  height: number
  weight: number
  abilities: { ability: { name: string } }[]
  stats: PokemonStat[]
}

export type RequestStatus = 'idle' | 'loading' | 'succeeded' | 'failed'

/** Estado del slice `pokemon`. El listado, el índice y el detalle tienen estados de carga independientes. */
export interface PokemonState {
  list: PokemonListItem[]
  totalCount: number | null
  index: PokemonListEntry[]
  indexStatus: RequestStatus
  detail: PokemonDetail | null
  listStatus: RequestStatus
  detailStatus: RequestStatus
  listError: string | null
  detailError: string | null
}

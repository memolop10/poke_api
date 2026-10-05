import { useEffect } from 'react'
import { useParams, useLocation, Link } from 'react-router-dom'
import Loading from '../components/Loading'
import StatsChart from '../components/StatsChart'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import {
  fetchPokemonByName,
  resetPokemonDetail,
  selectPokemonDetail,
  selectPokemonDetailStatus,
  selectPokemonDetailError,
  selectPokemonStatsChartData,
} from '../store/pokemonSlice'

/**
 * Formatea un valor de la API (que viene en décimas: decímetros u hectogramos)
 * a la unidad principal con un decimal y formato español, p. ej. 4 → "0,4".
 */
const formatTenths = (value: number) =>
  (value / 10).toLocaleString('es-ES', { maximumFractionDigits: 1 })

/**
 * Página de detalle de un Pokémon (`/pokedex/:name`): datos básicos y gráfico de stats.
 * El link "Volver" reenvía la página y la búsqueda recibidas en `location.state`
 * para que la Pokédex restaure donde estaba el usuario.
 */
export default function PokemonDetail() {
  const dispatch = useAppDispatch()
  const { name } = useParams<{ name: string }>()
  const location = useLocation()
  const state = location.state as { from?: string; page?: number; search?: string } | null
  const pokemon = useAppSelector(selectPokemonDetail)
  const status = useAppSelector(selectPokemonDetailStatus)
  const error = useAppSelector(selectPokemonDetailError)
  const statsData = useAppSelector(selectPokemonStatsChartData)

  // Pide el detalle al entrar o al cambiar de nombre. El cleanup aborta el request
  // pendiente y limpia el detalle, así el próximo Pokémon no muestra datos del anterior.
  useEffect(() => {
    if (!name) return
    const request = dispatch(fetchPokemonByName(name))
    return () => {
      request.abort()
      dispatch(resetPokemonDetail())
    }
  }, [dispatch, name])

  // 'idle' cubre el primer render, antes de que el efecto despache la carga.
  if (status === 'idle' || status === 'loading') return (
    <main className="pokemon-detail">
      <Loading />
    </main>
  )
  if (status === 'failed') return <main className="pokemon-detail"><h1>Error: {error}</h1></main>
  if (!pokemon) return null

  const backPage = state?.page ?? 1

  return (
    <main className="pokemon-detail">
      <Link to="/pokedex" state={{ page: backPage, search: state?.search }}>
        ← Volver
      </Link>
      <h1>{pokemon.name}</h1>
      <img src={pokemon.sprites.front_default ?? ''} alt={pokemon.name} />
      <p><strong>Tipos:</strong> {pokemon.types.map((typeEntry) => typeEntry.type.name).join(', ')}</p>
      <p><strong>Altura:</strong> {formatTenths(pokemon.height)} m</p>
      <p><strong>Peso:</strong> {formatTenths(pokemon.weight)} kg</p>
      <p><strong>Habilidades:</strong> {pokemon.abilities.map((abilityEntry) => abilityEntry.ability.name).join(', ')}</p>
      <StatsChart data={statsData} />
    </main>
  )
}

import { useEffect } from 'react'
import { useParams, useLocation, Link } from 'react-router-dom'
import Loading from '../components/Loading'
import StatsChart from '../components/StatsChart'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import {
  fetchPokemonByName,
  selectPokemonDetail,
  selectPokemonDetailStatus,
  selectPokemonDetailError,
  selectPokemonStatsChartData,
} from '../store/pokemonSlice'
export default function PokemonDetail() {
  const dispatch = useAppDispatch()
  const { name } = useParams<{ name: string }>()
  const location = useLocation()
  const state = location.state as { from?: string; page?: number; search?: string } | null
  const pokemon = useAppSelector(selectPokemonDetail)
  const status = useAppSelector(selectPokemonDetailStatus)
  const error = useAppSelector(selectPokemonDetailError)
  const statsData = useAppSelector(selectPokemonStatsChartData)

  useEffect(() => {
    if (!name) return
    dispatch(fetchPokemonByName(name))
  }, [dispatch, name])

  if (status === 'loading') return (
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
      <p><strong>Altura:</strong> {pokemon.height}</p>
      <p><strong>Peso:</strong> {pokemon.weight}</p>
      <p><strong>Habilidades:</strong> {pokemon.abilities.map((abilityEntry) => abilityEntry.ability.name).join(', ')}</p>
      <StatsChart data={statsData} />
    </main>
  )
}

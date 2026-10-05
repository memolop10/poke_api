import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import PokemonCard from '../components/PokemonCard'
import Pagination from '../components/Pagination'
import Loading from '../components/Loading'
import Search from '../components/Search'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import {
  fetchPokemonIndex,
  fetchPokemonPage,
  fetchPokemonPageByNames,
  selectAllPokemon,
  selectPokemonIndex,
  selectPokemonIndexStatus,
  selectPokemonTotalCount,
} from '../store/pokemonSlice'

const PAGE_SIZE = 25

// Referencia fija para "sin resultados de búsqueda". Si se creara un `[]` nuevo en cada
// cálculo, el efecto de carga se volvería a disparar y pediría la misma página dos veces.
const NO_MATCHES: string[] = []

/**
 * Página de la Pokédex: grilla paginada con buscador.
 *
 * - Sin búsqueda, pide la página actual a la API (`fetchPokemonPage`).
 * - Con búsqueda, filtra el índice local de nombres y pide solo los de la página
 *   actual de resultados (`fetchPokemonPageByNames`).
 *
 * La página y el texto de búsqueda iniciales vienen de `location.state`, que el
 * detalle envía al volver para restaurar donde estaba el usuario.
 */
export default function Pokedex() {
  const dispatch = useAppDispatch()
  const pokemons = useAppSelector(selectAllPokemon)
  const pokemonIndex = useAppSelector(selectPokemonIndex)
  const indexStatus = useAppSelector(selectPokemonIndexStatus)
  const totalCount = useAppSelector(selectPokemonTotalCount)
  const status = useAppSelector((state) => state.pokemon.listStatus)
  const error = useAppSelector((state) => state.pokemon.listError)
  const location = useLocation()
  const locationState = location.state as { page?: number; search?: string } | null
  const [currentPage, setCurrentPage] = useState(locationState?.page ?? 1)
  const [search, setSearch] = useState(locationState?.search ?? '')
  const [debouncedSearch, setDebouncedSearch] = useState(search)

  // Carga el índice de nombres. El thunk no hace nada si ya está cargado.
  useEffect(() => {
    dispatch(fetchPokemonIndex())
  }, [dispatch])

  // Debounce: espera 300 ms sin cambios en el input antes de aplicar la búsqueda.
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search)
    }, 300)

    return () => {
      clearTimeout(handler)
    }
  }, [search])

  const normalizedSearch = debouncedSearch.trim().toLowerCase()
  const isIndexReady = indexStatus === 'succeeded'

  // Nombres del índice que contienen el texto buscado.
  const matchingNames = useMemo(
    () =>
      normalizedSearch
        ? pokemonIndex
            .filter((entry) => entry.name.toLowerCase().includes(normalizedSearch))
            .map((entry) => entry.name)
        : NO_MATCHES,
    [normalizedSearch, pokemonIndex],
  )

  // Pide los Pokémon de la página actual. Al cambiar de página o de búsqueda, el
  // cleanup aborta el request anterior para que una respuesta lenta no pise a la nueva.
  useEffect(() => {
    if (normalizedSearch) {
      // Sin índice no se puede filtrar; el efecto se vuelve a ejecutar cuando llegue.
      if (!isIndexReady) return
      const pageNames = matchingNames.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
      const request = dispatch(fetchPokemonPageByNames({ names: pageNames }))
      return () => request.abort()
    }
    const request = dispatch(fetchPokemonPage({ page: currentPage, pageSize: PAGE_SIZE }))
    return () => request.abort()
  }, [dispatch, currentPage, normalizedSearch, matchingNames, isIndexReady])

  /** Actualiza el texto de búsqueda y vuelve a la primera página de resultados. */
  const handleSearchChange = (value: string) => {
    setSearch(value)
    setCurrentPage(1)
  }

  const isInitialLoading = status === 'loading' && pokemons.length === 0 && !normalizedSearch
  const isSearchLoading = Boolean(normalizedSearch) && (status === 'loading' || !isIndexReady)

  if (isInitialLoading) return (
    <main className="pokedex">
      <Loading />
    </main>
  )
  if (status === 'failed') return <main className="pokedex"><h1>Error: {error}</h1></main>

  return (
    <main className="pokedex">
      <div className="pokedex-header">
        <Link to="/" className="button button-back-home">
          ← Home
        </Link>
        <h1>Pokedex</h1>
      </div>
      <Search value={search} onChange={handleSearchChange} />
      <section className="grid">
        {pokemons.map((pokemon) => (
          <PokemonCard
            key={pokemon.name}
            name={pokemon.name}
            image={pokemon.image}
            types={pokemon.types}
            linkState={{ from: '/pokedex', page: currentPage, search }}
          />
        ))}
      </section>
      {isSearchLoading && (
        <Loading />
      )}
      {normalizedSearch && !isSearchLoading && matchingNames.length === 0 && (
        <p className="search-empty">No se encontraron Pokémon que coincidan con “{search}”.</p>
      )}
      <Pagination
        currentPage={currentPage}
        totalItems={normalizedSearch ? matchingNames.length : totalCount}
        pageSize={PAGE_SIZE}
        onPageChange={setCurrentPage}
      />
    </main>
  )
}

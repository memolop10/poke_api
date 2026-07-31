
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
  selectPokemonTotalCount,
} from '../store/pokemonSlice'

const PAGE_SIZE = 25

export default function Pokedex() {
  const dispatch = useAppDispatch()
  const pokemons = useAppSelector(selectAllPokemon)
  const pokemonIndex = useAppSelector(selectPokemonIndex)
  const totalCount = useAppSelector(selectPokemonTotalCount)
  const status = useAppSelector((state) => state.pokemon.listStatus)
  const error = useAppSelector((state) => state.pokemon.listError)
  const location = useLocation()
  const locationState = location.state as { page?: number; search?: string } | null
  const [currentPage, setCurrentPage] = useState(locationState?.page ?? 1)
  const [search, setSearch] = useState(locationState?.search ?? '')
  const [debouncedSearch, setDebouncedSearch] = useState(search)

  useEffect(() => {
    dispatch(fetchPokemonIndex())
  }, [dispatch])

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search)
    }, 300)

    return () => {
      clearTimeout(handler)
    }
  }, [search])

  const normalizedSearch = debouncedSearch.trim().toLowerCase()
  const matchingNames = useMemo(
    () =>
      normalizedSearch
        ? pokemonIndex
            .filter((entry) => entry.name.toLowerCase().includes(normalizedSearch))
            .map((entry) => entry.name)
        : [],
    [normalizedSearch, pokemonIndex],
  )

  useEffect(() => {
    if (normalizedSearch) {
      const pageNames = matchingNames.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
      dispatch(fetchPokemonPageByNames({ names: pageNames }))
    } else {
      dispatch(fetchPokemonPage({ page: currentPage, pageSize: PAGE_SIZE }))
    }
  }, [dispatch, currentPage, normalizedSearch, matchingNames])

  const pagePokemons = pokemons

  const handleSearchChange = (value: string) => {
    setSearch(value)
    setCurrentPage(1)
  }

  const isInitialLoading = status === 'loading' && pokemons.length === 0 && !normalizedSearch
  const isSearchLoading = status === 'loading' && normalizedSearch

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
        {pagePokemons.map((pokemon) => (
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

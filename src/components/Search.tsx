import type { SearchProps } from '../types/ui'

/** Input de búsqueda controlado. El debounce lo hace la página que lo usa, no este componente. */
export default function Search({ value, onChange }: SearchProps) {
  return (
    <div className="search">
      <label htmlFor="pokemon-search">Buscar Pokémon</label>
      <input
        id="pokemon-search"
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Ej. pikachu"
        autoComplete="off"
      />
    </div>
  )
}

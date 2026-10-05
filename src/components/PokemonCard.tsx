import { Link } from 'react-router-dom'
import type { PokemonCardProps } from '../types/ui'

/**
 * Tarjeta de la grilla que enlaza al detalle. `linkState` viaja en el estado de la
 * navegación para que el detalle sepa a qué página y búsqueda volver.
 */
export default function PokemonCard({ name, image, types, linkState }: PokemonCardProps) {
  return (
    <Link to={`/pokedex/${name}`} state={linkState} className="pokemon-card">
      <div className="card-image">
        {image ? <img src={image} alt={name} /> : <div className="no-image">No image</div>}
      </div>
      <div className="card-body">
        <h3>{name}</h3>
        <p className="types">{types.join(', ')}</p>
      </div>
    </Link>
  )
}

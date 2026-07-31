import { Link } from 'react-router-dom'
import type { PokemonCardProps } from '../types/ui'

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

import { Link } from 'react-router-dom'
import logo30 from '../assets/pokemon_30th_anniversary-logo-brandlogos.net-l3h4s.png'

/** Portada: el logo de Pokémon funciona como entrada a la Pokédex. */
export default function Home() {
  return (
    <main className="home-center">
      <Link to="/pokedex" className="logo-link" aria-label="Entrar a la Pokedex">
        <div className="pokemon-logo" role="img" aria-hidden="true">
          <img src={logo30} alt="Pokemon logo" />
        </div>
      </Link>
    </main>
  )
}

import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Pokedex from './pages/Pokedex.tsx'
import PokemonDetail from './pages/PokemonDetail'
import './App.css'

/** Define las rutas de la app: portada, Pokédex y detalle de cada Pokémon. */
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/pokedex" element={<Pokedex />} />
        <Route path="/pokedex/:name" element={<PokemonDetail />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App

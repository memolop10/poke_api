import loadingSvg from '../assets/Pokeball Loading.svg'

/** Indicador de carga con la Pokébola animada. */
export default function Loading() {
  return (
    <div className="loading-container">
      <img src={loadingSvg} alt="Loading" className="loading-spinner" />
    </div>
  )
}

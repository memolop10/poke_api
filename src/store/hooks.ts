import { useDispatch, useSelector } from 'react-redux'
import type { TypedUseSelectorHook } from 'react-redux'
import type { RootState, AppDispatch } from './index'

// Usar estos hooks en lugar de `useDispatch`/`useSelector`: ya vienen tipados con el store.

/** `useDispatch` tipado: acepta thunks y devuelve su promesa (con `.abort()`). */
export const useAppDispatch = () => useDispatch<AppDispatch>()
/** `useSelector` tipado con el `RootState` de la app. */
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector

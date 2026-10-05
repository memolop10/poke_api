import { configureStore } from '@reduxjs/toolkit'
import pokemonReducer from './pokemonSlice.js'

/** Store global de Redux. Por ahora tiene un solo slice: `pokemon`. */
export const store = configureStore({
  reducer: {
    pokemon: pokemonReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

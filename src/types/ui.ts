export interface PokemonCardProps {
  name: string
  image: string | null
  types: string[]
  linkState?: {
    from: string
    page?: number
    search?: string
  }
}

export interface SearchProps {
  value: string
  onChange: (value: string) => void
}

export interface PaginationProps {
  currentPage: number
  totalItems: number
  pageSize: number
  onPageChange: (page: number) => void
}

import type { PaginationProps } from '../types/ui'

const buildPageItems = (currentPage: number, totalPages: number) => {
  const pageItems: (number | 'ellipsis')[] = []
  const siblingCount = 1
  const showCount = 5

  if (totalPages <= showCount + 2) {
    return Array.from({ length: totalPages }, (_, index) => index + 1)
  }

  const leftBound = Math.max(2, currentPage - siblingCount)
  const rightBound = Math.min(totalPages - 1, currentPage + siblingCount)

  pageItems.push(1)

  if (leftBound > 2) {
    pageItems.push('ellipsis')
  }

  for (let page = leftBound; page <= rightBound; page += 1) {
    pageItems.push(page)
  }

  if (rightBound < totalPages - 1) {
    pageItems.push('ellipsis')
  }

  pageItems.push(totalPages)

  return pageItems
}

export default function Pagination({ currentPage, totalItems, pageSize, onPageChange }: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
  const pageItems = buildPageItems(currentPage, totalPages)

  if (totalPages === 1) return null

  return (
    <nav className="pagination" aria-label="Paginación de pokemons">
      <button
        type="button"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        Anterior
      </button>
      {pageItems.map((item, index) =>
        item === 'ellipsis' ? (
          <span key={`ellipsis-${index}`} className="pagination-ellipsis">
            …
          </span>
        ) : (
          <button
            key={item}
            type="button"
            className={item === currentPage ? 'active' : ''}
            onClick={() => onPageChange(item)}
          >
            {item}
          </button>
        ),
      )}
      <button
        type="button"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        Siguiente
      </button>
    </nav>
  )
}

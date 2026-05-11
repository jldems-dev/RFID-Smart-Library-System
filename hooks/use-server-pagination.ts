'use client'

import { useState, useCallback } from 'react'

interface ServerPaginationOptions {
  pageSize?: number
}

export function useServerPagination(options: ServerPaginationOptions = {}) {
  const { pageSize = 10 } = options
  const [currentPage, setCurrentPage] = useState(1)

  const goToPage = useCallback((page: number) => {
    setCurrentPage(Math.max(1, page))
  }, [])

  const reset = useCallback(() => {
    setCurrentPage(1)
  }, [])

  return {
    currentPage,
    pageSize,
    goToPage,
    reset,
  }
}

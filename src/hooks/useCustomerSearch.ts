import { useCallback, useRef, useState } from 'react'
import { supabase } from '@/services/supabaseClient'
import type { Customer } from '@/types'

export function useCustomerSearch() {
  const [results, setResults] = useState<Customer[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const search = useCallback((query: string) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    if (!query || query.length < 2) {
      setResults([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    debounceRef.current = setTimeout(async () => {
      try {
        const { data, error: queryError } = await supabase
          .from('customers')
          .select('*')
          .or(`phone_normalized.ilike.%${query}%,name.ilike.%${query}%`)
          .order('name')
          .limit(10)

        if (queryError) throw queryError
        setResults(data || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Search failed')
        setResults([])
      } finally {
        setLoading(false)
      }
    }, 300)
  }, [])

  const clearResults = useCallback(() => {
    setResults([])
    setError(null)
  }, [])

  return { results, loading, error, search, clearResults }
}

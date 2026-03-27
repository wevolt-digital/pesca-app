'use client'

import { useEffect, useState } from 'react'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'

export default function TestPage() {
  const [data, setData] = useState<any[]>([])

  useEffect(() => {
    const supabase = getSupabaseBrowserClient()

    supabase
      .from('fish_species')
      .select('*')
      .then(({ data, error }) => {
        console.log(data, error)
        setData(data || [])
      })
  }, [])

  return (
    <div style={{ padding: 20 }}>
      <h1>Supabase Test</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  )
}
import { useState, useEffect } from 'react'
import type { TimelineEvent, Summaries, Meta, BrentPrice } from '../types'

interface TimelineData {
  events: TimelineEvent[]
  summaries: Summaries
  meta: Meta
  brent: BrentPrice[]
  loading: boolean
  error: string | null
}

export function useTimelineData(): TimelineData {
  const [events, setEvents] = useState<TimelineEvent[]>([])
  const [summaries, setSummaries] = useState<Summaries>({ daily: {}, weekly: {} })
  const [meta, setMeta] = useState<Meta>({ lastUpdated: '' })
  const [brent, setBrent] = useState<BrentPrice[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([
      fetch(`${import.meta.env.BASE_URL}data/events.json`).then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      }),
      fetch(`${import.meta.env.BASE_URL}data/meta.json`).then(r => r.ok ? r.json() : {}),
      fetch(`${import.meta.env.BASE_URL}data/summaries.json`).then(r => r.ok ? r.json() : {}).catch(() => ({})),
      fetch(`${import.meta.env.BASE_URL}data/brent.json`).then(r => r.ok ? r.json() : []).catch(() => []),
    ]).then(([eventsData, metaData, summariesData, brentData]) => {
      const sorted = (eventsData as TimelineEvent[]).sort((a, b) => b.date.localeCompare(a.date))
      setEvents(sorted)
      setMeta(metaData as Meta)
      setSummaries({
        daily: (summariesData as Record<string, unknown>).daily as Record<string, string> ?? summariesData as Record<string, string>,
        weekly: (summariesData as Record<string, unknown>).weekly as Record<string, string> ?? {},
      })
      setBrent(brentData as BrentPrice[])
      setLoading(false)
    }).catch(err => {
      setError((err as Error).message)
      setLoading(false)
    })
  }, [])

  return { events, summaries, meta, brent, loading, error }
}

import { useState, useMemo, useCallback } from 'react'
import type { TimelineEvent, DayData } from '../types'

function getWeekStart(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number)
  const dt = new Date(y!, m! - 1, d)
  const day = dt.getDay() // 0=Sun
  const mon = new Date(dt)
  mon.setDate(dt.getDate() - (day === 0 ? 6 : day - 1))
  return `${mon.getFullYear()}-${String(mon.getMonth() + 1).padStart(2, '0')}-${String(mon.getDate()).padStart(2, '0')}`
}

function addDays(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split('-').map(Number)
  const dt = new Date(y!, m! - 1, d)
  dt.setDate(dt.getDate() + days)
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`
}

export function useWeekNavigation(events: TimelineEvent[]) {
  // All unique week starts in descending order
  const allWeekStarts = useMemo(() => {
    const set = new Set<string>()
    events.forEach(e => set.add(getWeekStart(e.date)))
    return [...set].sort((a, b) => b.localeCompare(a))
  }, [events])

  const [weekIndex, setWeekIndex] = useState(0)

  const currentWeekStart = allWeekStarts[weekIndex] ?? ''
  const currentWeekEnd = currentWeekStart ? addDays(currentWeekStart, 6) : ''

  const weekEvents = useMemo(() => {
    if (!currentWeekStart) return []
    return events.filter(e => e.date >= currentWeekStart && e.date <= currentWeekEnd)
  }, [events, currentWeekStart, currentWeekEnd])

  const weekDays: DayData[] = useMemo(() => {
    const byDate: Record<string, TimelineEvent[]> = {}
    weekEvents.forEach(e => {
      if (!byDate[e.date]) byDate[e.date] = []
      byDate[e.date]!.push(e)
    })

    // Generate all 7 days of the week
    const days: DayData[] = []
    for (let i = 0; i < 7; i++) {
      const date = addDays(currentWeekStart, i)
      const dayEvents = byDate[date] ?? []
      days.push({
        date,
        escalating: dayEvents.filter(e => e.direction === 'Escalating').length,
        deescalating: dayEvents.filter(e => e.direction === 'De-escalating').length,
        neutral: dayEvents.filter(e => e.direction === 'Neutral').length,
        total: dayEvents.length,
        events: dayEvents,
      })
    }
    return days
  }, [weekEvents, currentWeekStart])

  const prev = useCallback(() => {
    setWeekIndex(i => Math.min(i + 1, allWeekStarts.length - 1))
  }, [allWeekStarts.length])

  const next = useCallback(() => {
    setWeekIndex(i => Math.max(i - 1, 0))
  }, [])

  return {
    currentWeekStart,
    currentWeekEnd,
    weekEvents,
    weekDays,
    hasPrev: weekIndex < allWeekStarts.length - 1,
    hasNext: weekIndex > 0,
    prev,
    next,
  }
}

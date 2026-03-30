import { useState, useCallback, useMemo } from 'react'
import { useTimelineData } from './hooks/useTimelineData'
import { useWeekNavigation } from './hooks/useWeekNavigation'
import { Header } from './components/Header/Header'
import { WeekNav } from './components/WeekNav/WeekNav'
import { EscalationChart } from './components/Chart/EscalationChart'
import { EventList } from './components/EventList/EventList'
import { WeekBriefing } from './components/WeekBriefing/WeekBriefing'

export function App() {
  const { events, summaries, meta, brent, loading, error } = useTimelineData()
  const {
    currentWeekStart,
    currentWeekEnd,
    weekEvents,
    weekDays,
    hasPrev,
    hasNext,
    prev,
    next,
  } = useWeekNavigation(events)

  const [selectedEventId, setSelectedEventId] = useState<number | null>(null)
  const [hoveredDate, setHoveredDate] = useState<string | null>(null)

  const handleEventClick = useCallback((index: number) => {
    setSelectedEventId(prev => prev === index ? null : index)
  }, [])

  const handleDotClick = useCallback((index: number) => {
    setSelectedEventId(prev => prev === index ? null : index)
  }, [])

  const handleDateHover = useCallback((date: string | null) => {
    setHoveredDate(date)
  }, [])

  // Sort week events chronologically for the list
  const sortedWeekEvents = useMemo(() =>
    [...weekEvents].sort((a, b) => a.date.localeCompare(b.date)),
    [weekEvents]
  )

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--dim)' }}>Loading events...</div>
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--esc)' }}>
        Could not load events: {error}
      </div>
    )
  }

  const latestDate = events[0]?.date ?? ''

  return (
    <div className="app-layout">
      <div className="app-fixed">
        <Header latestDate={latestDate} lastUpdated={meta.lastUpdated} />
        <WeekNav
          weekStart={currentWeekStart}
          weekEnd={currentWeekEnd}
          hasPrev={hasPrev}
          hasNext={hasNext}
          onPrev={prev}
          onNext={next}
        />
        {summaries.weekly[currentWeekStart] && (
          <WeekBriefing text={summaries.weekly[currentWeekStart]!} />
        )}
        <EscalationChart
          weekDays={weekDays}
          weekStart={currentWeekStart}
          brent={brent}
          selectedEventId={selectedEventId}
          onDotClick={handleDotClick}
          onDateHover={handleDateHover}
        />
      </div>
      <div className="app-scroll">
        <EventList
          events={sortedWeekEvents}
          selectedEventId={selectedEventId}
          hoveredDate={hoveredDate}
          onEventClick={handleEventClick}
        />
      </div>
    </div>
  )
}

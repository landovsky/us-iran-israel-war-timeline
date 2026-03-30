import { useRef, useEffect } from 'react'
import type { TimelineEvent } from '../../types'
import { EventCard } from './EventCard'
import styles from './EventList.module.css'

interface EventListProps {
  events: TimelineEvent[]
  selectedEventId: number | null
  hoveredDate: string | null
  onEventClick: (index: number) => void
}

export function EventList({ events, selectedEventId, hoveredDate, onEventClick }: EventListProps) {
  const listRef = useRef<HTMLDivElement>(null)
  const cardRefs = useRef<Map<number, HTMLDivElement>>(new Map())

  // Auto-scroll expanded event into view
  useEffect(() => {
    if (selectedEventId === null) return
    const el = cardRefs.current.get(selectedEventId)
    if (el) {
      // Small delay to let the card expand before scrolling
      requestAnimationFrame(() => {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      })
    }
  }, [selectedEventId])

  return (
    <div className={styles.list} ref={listRef}>
      <h2 className={styles.heading}>Events</h2>
      {events.map((event, i) => (
        <div key={i} ref={el => { if (el) cardRefs.current.set(i, el) }}>
          <EventCard
            event={event}
            isExpanded={selectedEventId === i}
            isHighlighted={hoveredDate === event.date}
            onClick={() => onEventClick(i)}
          />
        </div>
      ))}
      {events.length === 0 && (
        <p className={styles.empty}>No events this week.</p>
      )}
    </div>
  )
}

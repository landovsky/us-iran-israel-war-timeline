import { FLAG_CDN, ACTOR_CODE } from '../../constants'
import type { TimelineEvent } from '../../types'
import styles from './EventList.module.css'

interface EventCardProps {
  event: TimelineEvent
  isExpanded: boolean
  isHighlighted: boolean
  onClick: () => void
}

function dirClass(direction: string): string {
  return direction === 'Escalating' ? styles.esc!
    : direction === 'De-escalating' ? styles.desc!
    : styles.neu!
}

export function EventCard({ event, isExpanded, isHighlighted, onClick }: EventCardProps) {
  const actors = event.actor.split('|').map(a => a.trim()).slice(0, 3)

  return (
    <div
      className={`${styles.card} ${isExpanded ? styles.cardExpanded : ''} ${isHighlighted ? styles.cardHighlighted : ''}`}
      onClick={onClick}
    >
      <div className={styles.cardHeader}>
        <div className={`${styles.indicator} ${dirClass(event.direction)}`} />
        <div className={styles.flagGroup}>
          {actors.map((actor, i) => (
            <span key={i} className={styles.flag}>
              <img
                src={`${FLAG_CDN}${ACTOR_CODE[actor] ?? 'other/un'}.svg`}
                alt={actor}
                loading="lazy"
              />
            </span>
          ))}
        </div>
        <span className={styles.cardTitle}>{event.title}</span>
      </div>

      {isExpanded && (
        <div className={styles.detail}>
          <p className={styles.detailDesc}>{event.description}</p>
          <div className={styles.detailMeta}>
            <span className={styles.actorBadge}>{event.actor}</span>
            <a
              className={styles.sourceLink}
              href={event.source}
              target="_blank"
              rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
            >
              source
            </a>
          </div>
        </div>
      )}
    </div>
  )
}

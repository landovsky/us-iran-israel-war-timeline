import styles from './WeekNav.module.css'

interface WeekNavProps {
  weekStart: string
  weekEnd: string
  hasPrev: boolean
  hasNext: boolean
  onPrev: () => void
  onNext: () => void
}

function fmtWeekRange(start: string, end: string): string {
  const M = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const [, sm, sd] = start.split('-').map(Number)
  const [, em, ed] = end.split('-').map(Number)
  if (sm === em) return `${M[sm! - 1]} ${sd}–${ed}`
  return `${M[sm! - 1]} ${sd} – ${M[em! - 1]} ${ed}`
}

export function WeekNav({ weekStart, weekEnd, hasPrev, hasNext, onPrev, onNext }: WeekNavProps) {
  return (
    <nav className={styles.nav}>
      <button
        className={styles.btn}
        onClick={onPrev}
        disabled={!hasPrev}
      >
        Previous
      </button>
      <span className={styles.range}>{fmtWeekRange(weekStart, weekEnd)}</span>
      <button
        className={styles.btn}
        onClick={onNext}
        disabled={!hasNext}
      >
        Next
      </button>
    </nav>
  )
}

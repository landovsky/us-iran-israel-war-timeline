import { useState } from 'react'
import styles from './WeekBriefing.module.css'

interface WeekBriefingProps {
  text: string
}

export function WeekBriefing({ text }: WeekBriefingProps) {
  const [open, setOpen] = useState(false)

  return (
    <div
      className={`${styles.briefing} ${open ? styles.open : ''}`}
      onClick={() => setOpen(o => !o)}
    >
      <div className={styles.header}>
        <span className={styles.label}>Weekly briefing</span>
        <span className={styles.toggle}>
          {open ? 'Collapse' : 'Read analysis'}{' '}
          <span className={styles.arrow}>▾</span>
        </span>
      </div>
      <div className={styles.text}>{text}</div>
    </div>
  )
}

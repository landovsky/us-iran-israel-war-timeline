import { WAR_START } from '../../constants'
import styles from './Header.module.css'

interface HeaderProps {
  latestDate: string
  lastUpdated: string
}

function fmtTimestamp(iso: string): string {
  const d = new Date(iso)
  const M = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const hhmm = d.getHours().toString().padStart(2, '0') + ':' + d.getMinutes().toString().padStart(2, '0')
  return `${M[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()} · ${hhmm}`
}

export function Header({ latestDate, lastUpdated }: HeaderProps) {
  const latest = new Date(latestDate + 'T00:00:00')
  const dayNum = Math.floor((latest.getTime() - WAR_START.getTime()) / 86400000) + 1

  return (
    <header className={styles.hero}>
      <div className={styles.heroInner}>
        <div className={styles.eyebrow}>Ongoing · Est. 28 Feb 2026</div>
        <div className={styles.titleRow}>
          <h1 className={styles.title}>US–Israel–Iran</h1>
          <span className={styles.dayCounter}>Day <span className={styles.dayNum}>{dayNum}</span></span>
        </div>
        <div className={styles.subtitle}>The Wartime Story</div>
        <span className={styles.updated}>
          {lastUpdated ? `Updated ${fmtTimestamp(lastUpdated)}` : ''}
        </span>
        <p className={styles.description}>
          Each dot is a real event.{' '}
          <span className={styles.red}>Red</span> means the war is deepening — more strikes,
          more threats, wider spread.{' '}
          <span className={styles.blue}>Blue</span> means someone is pulling back — a pause,
          a proposal, a diplomatic move.
          Watch which colour dominates each day, and who is driving it.
        </p>
      </div>
    </header>
  )
}

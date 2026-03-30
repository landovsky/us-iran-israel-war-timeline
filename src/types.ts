export interface TimelineEvent {
  date: string
  title: string
  direction: 'Escalating' | 'De-escalating' | 'Neutral'
  description: string
  source: string
  actor: string
  intensity?: number // 1-5 scale
}

export interface Summaries {
  daily: Record<string, string>
  weekly: Record<string, string>
}

export interface Meta {
  lastUpdated: string
}

export interface BrentPrice {
  date: string
  price: number
}

export interface DayData {
  date: string
  escalating: number
  deescalating: number
  neutral: number
  total: number
  events: TimelineEvent[]
}

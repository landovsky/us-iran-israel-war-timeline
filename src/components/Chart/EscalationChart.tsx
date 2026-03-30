import { useMemo, useRef, useCallback, useState } from 'react'
import { scaleLinear, scaleTime } from 'd3-scale'
import { area, line, curveMonotoneX } from 'd3-shape'
import { extent } from 'd3-array'
import type { DayData, TimelineEvent, BrentPrice } from '../../types'
import styles from './Chart.module.css'

interface EscalationChartProps {
  weekDays: DayData[]
  weekStart: string
  brent: BrentPrice[]
  selectedEventId: number | null
  onDotClick: (eventIndex: number) => void
  onDateHover: (date: string | null) => void
}

const CHART_HEIGHT = 200
const CHART_PADDING = { top: 20, right: 50, bottom: 30, left: 20 }

interface DotInfo {
  cx: number
  cy: number
  r: number
  color: string
  event: TimelineEvent
  globalIndex: number
}

export function EscalationChart({ weekDays, weekStart, brent, selectedEventId, onDotClick, onDateHover }: EscalationChartProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [cursorX, setCursorX] = useState<number | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  const width = 680
  const innerWidth = width - CHART_PADDING.left - CHART_PADDING.right
  const innerHeight = CHART_HEIGHT - CHART_PADDING.top - CHART_PADDING.bottom

  const [sy, sm, sd] = weekStart.split('-').map(Number)
  const startDate = new Date(sy!, sm! - 1, sd!)
  const endDate = new Date(sy!, sm! - 1, sd! + 6)

  const xScale = useMemo(() =>
    scaleTime()
      .domain([startDate, endDate])
      .range([0, innerWidth]),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [weekStart, innerWidth]
  )

  const maxVal = useMemo(() => {
    let m = 1
    weekDays.forEach(d => {
      m = Math.max(m, d.escalating, d.deescalating)
    })
    return m
  }, [weekDays])

  const yScale = useMemo(() =>
    scaleLinear()
      .domain([0, maxVal + 1])
      .range([innerHeight / 2, 0]),
    [maxVal, innerHeight]
  )

  const yScaleDown = useMemo(() =>
    scaleLinear()
      .domain([0, maxVal + 1])
      .range([innerHeight / 2, innerHeight]),
    [maxVal, innerHeight]
  )

  // Brent price data for the week
  const weekBrent = useMemo(() =>
    brent.filter(b => b.date >= weekStart && b.date <= `${sy!}-${String(sm!).padStart(2, '0')}-${String(sd! + 6).padStart(2, '0')}`),
    [brent, weekStart, sy, sm, sd]
  )

  const brentYScale = useMemo(() => {
    if (weekBrent.length === 0) return null
    const [minP, maxP] = extent(weekBrent, d => d.price)
    if (minP === undefined || maxP === undefined) return null
    const pad = (maxP - minP) * 0.2 || 5
    return scaleLinear()
      .domain([minP - pad, maxP + pad])
      .range([innerHeight, 0])
  }, [weekBrent, innerHeight])

  const brentLinePath = useMemo(() => {
    if (!brentYScale || weekBrent.length === 0) return ''
    const gen = line<BrentPrice>()
      .x(d => {
        const [, m, dd] = d.date.split('-').map(Number)
        return xScale(new Date(sy!, m! - 1, dd!))
      })
      .y(d => brentYScale(d.price))
      .curve(curveMonotoneX)
    return gen(weekBrent) ?? ''
  }, [weekBrent, xScale, brentYScale, sy])

  // Brent Y axis ticks
  const brentTicks = useMemo(() => {
    if (!brentYScale) return []
    return brentYScale.ticks(4).map(tick => ({
      y: brentYScale(tick),
      label: `$${tick.toFixed(0)}`,
    }))
  }, [brentYScale])

  // Escalation area (top half)
  const escAreaPath = useMemo(() => {
    const gen = area<DayData>()
      .x(d => {
        const [, m, dd] = d.date.split('-').map(Number)
        return xScale(new Date(sy!, m! - 1, dd!))
      })
      .y0(innerHeight / 2)
      .y1(d => yScale(d.escalating))
      .curve(curveMonotoneX)
    return gen(weekDays) ?? ''
  }, [weekDays, xScale, yScale, innerHeight, sy])

  // De-escalation area (bottom half)
  const descAreaPath = useMemo(() => {
    const gen = area<DayData>()
      .x(d => {
        const [, m, dd] = d.date.split('-').map(Number)
        return xScale(new Date(sy!, m! - 1, dd!))
      })
      .y0(innerHeight / 2)
      .y1(d => yScaleDown(d.deescalating))
      .curve(curveMonotoneX)
    return gen(weekDays) ?? ''
  }, [weekDays, xScale, yScaleDown, innerHeight, sy])

  // Compute dots for all events
  const dots = useMemo(() => {
    const result: DotInfo[] = []
    let globalIdx = 0
    weekDays.forEach(day => {
      const [, m, dd] = day.date.split('-').map(Number)
      const cx = xScale(new Date(sy!, m! - 1, dd!))
      day.events.forEach(ev => {
        const isEsc = ev.direction === 'Escalating'
        const isDesc = ev.direction === 'De-escalating'
        const cy = isEsc ? yScale(day.escalating) - 5
          : isDesc ? yScaleDown(day.deescalating) + 5
          : innerHeight / 2
        const color = isEsc ? 'var(--esc)' : isDesc ? 'var(--desc)' : 'var(--neu)'
        const r = ev.intensity ? 2 + ev.intensity * 1.2 : 4
        result.push({ cx, cy, r, color, event: ev, globalIndex: globalIdx })
        globalIdx++
      })
    })
    return result
  }, [weekDays, xScale, yScale, yScaleDown, innerHeight, sy])

  // Day labels
  const dayLabels = useMemo(() => {
    const M = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    return weekDays.map(d => {
      const [, m, dd] = d.date.split('-').map(Number)
      const dt = new Date(sy!, m! - 1, dd!)
      const cx = xScale(dt)
      const dayIdx = dt.getDay()
      const label = M[dayIdx === 0 ? 6 : dayIdx - 1]!
      return { cx, label, date: d.date }
    })
  }, [weekDays, xScale, sy])

  // Brent price at cursor
  const cursorBrentPrice = useMemo((): BrentPrice | null => {
    if (cursorX === null || weekBrent.length === 0) return null
    const cursorDate = xScale.invert(cursorX)
    let nearest: BrentPrice | null = null
    let minDist = Infinity
    weekBrent.forEach(b => {
      const [, m, dd] = b.date.split('-').map(Number)
      const dt = new Date(sy!, m! - 1, dd!)
      const dist = Math.abs(dt.getTime() - cursorDate.getTime())
      if (dist < minDist) { minDist = dist; nearest = b }
    })
    return nearest
  }, [cursorX, weekBrent, xScale, sy])

  const handlePointerMove = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    const svg = svgRef.current
    if (!svg) return
    const rect = svg.getBoundingClientRect()
    const x = (e.clientX - rect.left) * (width / rect.width) - CHART_PADDING.left
    if (x >= 0 && x <= innerWidth) {
      setCursorX(x)
      const date = xScale.invert(x)
      let nearest = weekDays[0]?.date ?? null
      let minDist = Infinity
      weekDays.forEach(d => {
        const [, m, dd] = d.date.split('-').map(Number)
        const dt = new Date(sy!, m! - 1, dd!)
        const dist = Math.abs(dt.getTime() - date.getTime())
        if (dist < minDist) { minDist = dist; nearest = d.date }
      })
      onDateHover(nearest)
    }
  }, [innerWidth, xScale, weekDays, onDateHover, sy, width])

  const handlePointerDown = useCallback(() => setIsDragging(true), [])
  const handlePointerUp = useCallback(() => setIsDragging(false), [])
  const handlePointerLeave = useCallback(() => {
    if (!isDragging) {
      setCursorX(null)
      onDateHover(null)
    }
  }, [isDragging, onDateHover])

  return (
    <div className={styles.chartContainer}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${width} ${CHART_HEIGHT}`}
        className={styles.chart}
        onPointerMove={handlePointerMove}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerLeave}
      >
        <defs>
          <linearGradient id="escGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--esc)" stopOpacity="0.6" />
            <stop offset="100%" stopColor="var(--esc)" stopOpacity="0.05" />
          </linearGradient>
          <linearGradient id="descGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--desc)" stopOpacity="0.05" />
            <stop offset="100%" stopColor="var(--desc)" stopOpacity="0.6" />
          </linearGradient>
        </defs>

        <g transform={`translate(${CHART_PADDING.left}, ${CHART_PADDING.top})`}>
          {/* Baseline */}
          <line
            x1={0} y1={innerHeight / 2}
            x2={innerWidth} y2={innerHeight / 2}
            stroke="var(--border)" strokeWidth={1}
          />

          {/* Escalation area */}
          <path d={escAreaPath} fill="url(#escGrad)" />

          {/* De-escalation area */}
          <path d={descAreaPath} fill="url(#descGrad)" />

          {/* Brent price line */}
          {brentLinePath && (
            <path
              d={brentLinePath}
              fill="none"
              stroke="#f59e0b"
              strokeWidth={1.5}
              strokeDasharray="4,2"
              opacity={0.7}
            />
          )}

          {/* Brent Y axis (right side) */}
          {brentTicks.map((tick, i) => (
            <g key={i}>
              <line
                x1={innerWidth} y1={tick.y}
                x2={innerWidth + 4} y2={tick.y}
                stroke="#f59e0b" strokeWidth={0.5} opacity={0.5}
              />
              <text
                x={innerWidth + 8}
                y={tick.y + 3}
                className={styles.brentLabel}
              >
                {tick.label}
              </text>
            </g>
          ))}

          {/* Brent label */}
          {weekBrent.length > 0 && (
            <text
              x={innerWidth + 8}
              y={-6}
              className={styles.brentAxisTitle}
            >
              Brent
            </text>
          )}

          {/* Dots */}
          {dots.map((dot, i) => (
            <circle
              key={i}
              cx={dot.cx}
              cy={dot.cy}
              r={selectedEventId === dot.globalIndex ? 8 : dot.r}
              fill={dot.color}
              opacity={selectedEventId === dot.globalIndex ? 1 : 0.7}
              className={styles.dot}
              onClick={() => onDotClick(dot.globalIndex)}
            />
          ))}

          {/* Cursor line */}
          {cursorX !== null && (
            <>
              <line
                x1={cursorX} y1={0}
                x2={cursorX} y2={innerHeight}
                stroke="var(--muted)" strokeWidth={1} strokeDasharray="3,3"
                style={{ pointerEvents: 'none' }}
              />
              {/* Brent price tooltip at cursor */}
              {cursorBrentPrice !== null && brentYScale !== null && (() => {
                const bp = cursorBrentPrice
                const yPos = brentYScale(bp.price)
                return (
                  <g style={{ pointerEvents: 'none' }}>
                    <circle cx={cursorX} cy={yPos} r={3} fill="#f59e0b" />
                    <text
                      x={cursorX! + 8}
                      y={yPos - 6}
                      className={styles.brentTooltip}
                    >
                      ${bp.price.toFixed(2)}
                    </text>
                  </g>
                )
              })()}
            </>
          )}

          {/* Day labels */}
          {dayLabels.map((dl, i) => (
            <text
              key={i}
              x={dl.cx}
              y={innerHeight + 18}
              textAnchor="middle"
              className={styles.dayLabel}
            >
              {dl.label}
            </text>
          ))}
        </g>
      </svg>
    </div>
  )
}

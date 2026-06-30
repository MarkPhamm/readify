import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { dailySeries } from '../lib/stats'

const RANGES = [
  { label: '30D', days: 30 },
  { label: '90D', days: 90 },
]

const HEIGHT = 300
const PADDING = { top: 46, right: 20, bottom: 48, left: 48 }

function useElementWidth() {
  const ref = useRef(null)
  const [width, setWidth] = useState(0)

  useEffect(() => {
    const element = ref.current
    if (!element) return undefined

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setWidth(entry.contentRect.width)
      }
    })

    observer.observe(element)
    setWidth(element.clientWidth)

    return () => observer.disconnect()
  }, [])

  return [ref, width]
}

function dayNumber(dateStr) {
  return String(Number(dateStr.split('-')[2]))
}

function makeTicks(max) {
  const step = max <= 6 ? 1 : Math.ceil(max / 5)
  const ticks = []
  for (let value = 0; value <= max; value += step) ticks.push(value)
  if (ticks[ticks.length - 1] !== max) ticks.push(max)
  return ticks
}

// Monotone cubic interpolation (curveMonotoneX) — smooth like GitHub's
// activity graph and guaranteed not to overshoot below 0 or above peaks.
function buildSmoothPath(points) {
  const n = points.length
  if (n === 0) return ''
  if (n === 1) return `M ${points[0].x} ${points[0].y}`

  const xs = points.map((point) => point.x)
  const ys = points.map((point) => point.y)
  const dx = []
  const slope = []

  for (let i = 0; i < n - 1; i += 1) {
    dx[i] = xs[i + 1] - xs[i]
    slope[i] = (ys[i + 1] - ys[i]) / (dx[i] || 1)
  }

  const tangent = new Array(n)
  tangent[0] = slope[0]
  tangent[n - 1] = slope[n - 2]

  for (let i = 1; i < n - 1; i += 1) {
    if (slope[i - 1] * slope[i] <= 0) {
      tangent[i] = 0
    } else {
      const w1 = 2 * dx[i] + dx[i - 1]
      const w2 = dx[i] + 2 * dx[i - 1]
      tangent[i] = (w1 + w2) / (w1 / slope[i - 1] + w2 / slope[i])
    }
  }

  let path = `M ${xs[0]} ${ys[0]}`
  for (let i = 0; i < n - 1; i += 1) {
    const h = dx[i]
    const cp1x = xs[i] + h / 3
    const cp1y = ys[i] + (tangent[i] * h) / 3
    const cp2x = xs[i + 1] - h / 3
    const cp2y = ys[i + 1] - (tangent[i + 1] * h) / 3
    path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${xs[i + 1]} ${ys[i + 1]}`
  }

  return path
}

export default function ReadingTrend({ readings }) {
  const [days, setDays] = useState(30)
  const [hover, setHover] = useState(null)
  const [wrapRef, width] = useElementWidth()

  const series = useMemo(() => dailySeries(readings, days), [readings, days])
  const total = useMemo(() => series.reduce((sum, point) => sum + point.count, 0), [series])

  const chart = useMemo(() => {
    if (width <= 0) return null

    const innerW = width - PADDING.left - PADDING.right
    const innerH = HEIGHT - PADDING.top - PADDING.bottom
    const maxCount = Math.max(1, ...series.map((point) => point.count))
    const stepX = series.length > 1 ? innerW / (series.length - 1) : 0
    const baseline = PADDING.top + innerH

    const points = series.map((point, index) => ({
      ...point,
      x: PADDING.left + index * stepX,
      y: PADDING.top + innerH - (point.count / maxCount) * innerH,
    }))

    const linePath = buildSmoothPath(points)
    const areaPath = `${linePath} L ${points[points.length - 1].x} ${baseline} L ${points[0].x} ${baseline} Z`
    const ticks = makeTicks(maxCount)
    const labelEvery = series.length <= 31 ? Math.ceil(series.length / 15) : Math.ceil(series.length / 9)

    return { points, linePath, areaPath, innerW, innerH, maxCount, baseline, ticks, labelEvery }
  }, [series, width])

  const hovered = hover !== null && chart ? chart.points[hover] : null

  function handleMove(event) {
    if (!chart) return
    const rect = event.currentTarget.getBoundingClientRect()
    const relativeX = event.clientX - rect.left
    const innerW = width - PADDING.left - PADDING.right
    const ratio = (relativeX - PADDING.left) / (innerW || 1)
    const index = Math.round(ratio * (series.length - 1))
    const clamped = Math.min(series.length - 1, Math.max(0, index))
    setHover(clamped)
  }

  return (
    <motion.section
      className="panel graph-panel"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.25 }}
    >
      <div className="trend-head">
        <div className="range-toggle">
          {RANGES.map((range) => (
            <button
              key={range.days}
              type="button"
              className={`range-btn ${days === range.days ? 'active' : ''}`}
              onClick={() => setDays(range.days)}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      <div className="trend-wrap" ref={wrapRef}>
        {chart ? (
          <svg
            className="trend-svg"
            width={width}
            height={HEIGHT}
            onMouseMove={handleMove}
            onMouseLeave={() => setHover(null)}
          >
            <defs>
              <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#7fb5e6" stopOpacity="0.28" />
                <stop offset="100%" stopColor="#7fb5e6" stopOpacity="0" />
              </linearGradient>
            </defs>

            <text x={width / 2} y={24} className="trend-title" textAnchor="middle">
              Reading Graph
            </text>

            <text
              className="trend-axis-label"
              textAnchor="middle"
              transform={`rotate(-90 16 ${PADDING.top + chart.innerH / 2})`}
              x={16}
              y={PADDING.top + chart.innerH / 2}
            >
              Reads
            </text>

            <text
              x={PADDING.left + chart.innerW / 2}
              y={HEIGHT - 8}
              className="trend-axis-label"
              textAnchor="middle"
            >
              Days
            </text>

            {chart.ticks.map((tick) => {
              const y = PADDING.top + chart.innerH - (tick / chart.maxCount) * chart.innerH
              return (
                <g key={`h-${tick}`}>
                  <line
                    x1={PADDING.left}
                    y1={y}
                    x2={width - PADDING.right}
                    y2={y}
                    className="trend-grid"
                  />
                  <text x={PADDING.left - 10} y={y + 3} className="trend-axis" textAnchor="end">
                    {tick}
                  </text>
                </g>
              )
            })}

            {chart.points.map((point, index) =>
              index % chart.labelEvery === 0 ? (
                <line
                  key={`v-${point.date}`}
                  x1={point.x}
                  y1={PADDING.top}
                  x2={point.x}
                  y2={chart.baseline}
                  className="trend-grid"
                />
              ) : null,
            )}

            <motion.path
              d={chart.areaPath}
              fill="url(#trendFill)"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            />

            <motion.path
              className="trend-line"
              d={chart.linePath}
              fill="none"
              strokeWidth="2.5"
              strokeLinejoin="round"
              strokeLinecap="round"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.15 }}
            />

            {hovered ? (
              <line
                x1={hovered.x}
                y1={PADDING.top}
                x2={hovered.x}
                y2={chart.baseline}
                className="trend-guide"
              />
            ) : null}

            {chart.points.map((point, index) => (
              <circle
                key={`dot-${point.date}`}
                className="trend-dot"
                cx={point.x}
                cy={point.y}
                r={hover === index ? 4.5 : 3}
              />
            ))}

            {chart.points.map((point, index) =>
              index % chart.labelEvery === 0 ? (
                <text
                  key={`x-${point.date}`}
                  x={point.x}
                  y={chart.baseline + 18}
                  className="trend-axis"
                  textAnchor="middle"
                >
                  {dayNumber(point.date)}
                </text>
              ) : null,
            )}
          </svg>
        ) : null}

        {hovered ? (
          <div
            className="trend-tooltip"
            style={{
              left: `${hovered.x}px`,
              top: `${hovered.y}px`,
            }}
          >
            <span className="trend-tooltip-date">{hovered.date}</span>
            <span className="trend-tooltip-count">
              {hovered.count} {hovered.count === 1 ? 'read' : 'reads'}
            </span>
          </div>
        ) : null}
      </div>

      <p className="trend-footer">
        {total} {total === 1 ? 'read' : 'reads'} in the last {days} days
      </p>
    </motion.section>
  )
}

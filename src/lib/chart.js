// Pure geometry helpers for the reading trend chart.

export function dayNumber(dateStr) {
  return String(Number(dateStr.split('-')[2]))
}

export function makeTicks(max) {
  const step = max <= 6 ? 1 : Math.ceil(max / 5)
  const ticks = []
  for (let value = 0; value <= max; value += step) ticks.push(value)
  if (ticks[ticks.length - 1] !== max) ticks.push(max)
  return ticks
}

// Monotone cubic interpolation (curveMonotoneX) — smooth like GitHub's
// activity graph and guaranteed not to overshoot below 0 or above peaks.
export function buildSmoothPath(points) {
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

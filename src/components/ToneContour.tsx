interface ToneContourProps {
  value?: string
  compact?: boolean
}

export function ToneContour({ value, compact = false }: ToneContourProps) {
  const levels = value?.split('').map(Number).filter((level) => level >= 1 && level <= 5) ?? []
  if (levels.length === 0) return <span className="tone-contour-empty">调值待补</span>

  const width = compact ? 44 : 116
  const height = compact ? 26 : 70
  const insetX = compact ? 4 : 12
  const insetY = compact ? 3 : 10
  const usableWidth = width - insetX * 2
  const usableHeight = height - insetY * 2
  const points = levels.map((level, index) => {
    const x = levels.length === 1 ? width / 2 : insetX + (index / (levels.length - 1)) * usableWidth
    const y = insetY + ((5 - level) / 4) * usableHeight
    return `${x},${y}`
  }).join(' ')

  return (
    <svg
      className={compact ? 'tone-contour is-compact' : 'tone-contour'}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={`五度调值 ${value}`}
    >
      {!compact && [1, 2, 3, 4, 5].map((level) => {
        const y = insetY + ((5 - level) / 4) * usableHeight
        return (
          <g key={level}>
            <line x1={insetX} x2={width - insetX} y1={y} y2={y} className="tone-guide" />
            <text x={2} y={y + 3} className="tone-level">{level}</text>
          </g>
        )
      })}
      <polyline points={points} className="tone-line" />
      {points.split(' ').map((point) => {
        const [cx, cy] = point.split(',')
        return <circle key={point} cx={cx} cy={cy} r={compact ? 2 : 3} className="tone-point" />
      })}
    </svg>
  )
}

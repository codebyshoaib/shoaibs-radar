import { useCallback } from 'react'

const NODE_W = 140
const NODE_H = 36
const COL_GAP = 80
const ROW_GAP = 48

function truncate(str, n) {
  return str && str.length > n ? str.slice(0, n - 1) + '…' : (str ?? '')
}

export function DependencyGraph({ issue, onSelectIssue }) {
  const deps = issue.dependencies ?? []
  const dependents = issue.dependents ?? []

  const leftCount = deps.length
  const rightCount = dependents.length
  const centerCount = 1

  const totalRows = Math.max(leftCount, centerCount, rightCount, 1)
  const svgH = Math.max(totalRows * (NODE_H + ROW_GAP) - ROW_GAP + 20, NODE_H + 20)
  const svgW = NODE_W * 3 + COL_GAP * 2 + 20

  const col0X = 10
  const col1X = 10 + NODE_W + COL_GAP
  const col2X = 10 + (NODE_W + COL_GAP) * 2

  function nodeY(index, total) {
    const totalH = total * (NODE_H + ROW_GAP) - ROW_GAP
    const startY = (svgH - totalH) / 2
    return startY + index * (NODE_H + ROW_GAP)
  }

  const centerY = nodeY(0, 1)

  const arrowHead = useCallback((x, y, dir) => {
    const size = 6
    if (dir === 'right') return `${x},${y} ${x - size},${y - size / 2} ${x - size},${y + size / 2}`
    return `${x},${y} ${x + size},${y - size / 2} ${x + size},${y + size / 2}`
  }, [])

  return (
    <svg
      width={svgW}
      height={svgH}
      className="w-full overflow-visible"
      style={{ maxWidth: svgW }}
    >
      {/* Dep nodes (left) — point into current issue */}
      {deps.map((dep, i) => {
        const y = nodeY(i, leftCount)
        const fromX = col0X + NODE_W
        const fromY = y + NODE_H / 2
        const toX = col1X
        const toY = centerY + NODE_H / 2
        return (
          <g key={dep.id}>
            <line x1={fromX} y1={fromY} x2={toX + 8} y2={toY} stroke="#4b5563" strokeWidth={1.5} />
            <polygon points={arrowHead(toX, toY, 'right')} fill="#4b5563" />
            <rect
              x={col0X} y={y} width={NODE_W} height={NODE_H} rx={6}
              fill="#1e293b" stroke="#334155" strokeWidth={1}
              className="cursor-pointer hover:stroke-blue-400"
              onClick={() => onSelectIssue?.(dep.id)}
            />
            <text x={col0X + 6} y={y + 13} fill="#94a3b8" fontSize={9} fontFamily="monospace">{dep.id}</text>
            <text x={col0X + 6} y={y + 26} fill="#cbd5e1" fontSize={10}>{truncate(dep.title, 16)}</text>
          </g>
        )
      })}

      {/* Current issue (center) */}
      <rect
        x={col1X} y={centerY} width={NODE_W} height={NODE_H} rx={6}
        fill="#1e3a5f" stroke="#3b82f6" strokeWidth={1.5}
      />
      <text x={col1X + 6} y={centerY + 13} fill="#93c5fd" fontSize={9} fontFamily="monospace">{issue.id}</text>
      <text x={col1X + 6} y={centerY + 26} fill="#fff" fontSize={10} fontWeight="600">{truncate(issue.title, 16)}</text>

      {/* Dependent nodes (right) — current issue points into them */}
      {dependents.map((dep, i) => {
        const y = nodeY(i, rightCount)
        const fromX = col1X + NODE_W
        const fromY = centerY + NODE_H / 2
        const toX = col2X
        const toY = y + NODE_H / 2
        return (
          <g key={dep.id}>
            <line x1={fromX} y1={fromY} x2={toX + 8} y2={toY} stroke="#4b5563" strokeWidth={1.5} />
            <polygon points={arrowHead(toX, toY, 'right')} fill="#4b5563" />
            <rect
              x={col2X} y={y} width={NODE_W} height={NODE_H} rx={6}
              fill="#1e293b" stroke="#334155" strokeWidth={1}
              className="cursor-pointer hover:stroke-purple-400"
              onClick={() => onSelectIssue?.(dep.id)}
            />
            <text x={col2X + 6} y={y + 13} fill="#94a3b8" fontSize={9} fontFamily="monospace">{dep.id}</text>
            <text x={col2X + 6} y={y + 26} fill="#cbd5e1" fontSize={10}>{truncate(dep.title, 16)}</text>
          </g>
        )
      })}

      {/* Empty state */}
      {deps.length === 0 && dependents.length === 0 && (
        <text x={col1X + NODE_W / 2} y={svgH / 2 + 4} textAnchor="middle" fill="#4b5563" fontSize={11}>
          no dependencies
        </text>
      )}
    </svg>
  )
}

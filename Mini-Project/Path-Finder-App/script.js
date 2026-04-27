const rows = 20
const cols = 40

const gridElement = document.getElementById("grid")
const algorithmSelect = document.getElementById("algorithm")
const speedSelect = document.getElementById("speed")
const visualizeBtn = document.getElementById("visualizeBtn")
const clearPathBtn = document.getElementById("clearPathBtn")
const clearWallsBtn = document.getElementById("clearWallsBtn")
const resetBtn = document.getElementById("resetBtn")

let startNode = { row: 8, col: 6 }
let endNode = { row: 8, col: 32 }

let mouseDown = false
let running = false

let grid = []

function createEmptyGrid() {
  return Array.from({ length: rows }, (_, row) =>
    Array.from({ length: cols }, (_, col) => ({
      row,
      col,
      wall: false,
      weight: 1
    }))
  )
}

function saveState() {
  localStorage.setItem(
    "pathVisualizerState",
    JSON.stringify({
      grid,
      startNode,
      endNode
    })
  )
}

function loadState() {
  const saved = localStorage.getItem("pathVisualizerState")

  if (!saved) {
    grid = createEmptyGrid()
    return
  }

  const data = JSON.parse(saved)

  grid = data.grid || createEmptyGrid()
  startNode = data.startNode || startNode
  endNode = data.endNode || endNode
}

function renderGrid() {
  gridElement.innerHTML = ""

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const cell = document.createElement("div")

      cell.className = "cell"
      cell.dataset.row = row
      cell.dataset.col = col

      if (row === startNode.row && col === startNode.col) {
        cell.classList.add("start")
      } else if (row === endNode.row && col === endNode.col) {
        cell.classList.add("end")
      } else if (grid[row][col].wall) {
        cell.classList.add("wall")
      }

      cell.addEventListener("mousedown", handleMouseDown)
      cell.addEventListener("mouseenter", handleMouseEnter)

      gridElement.appendChild(cell)
    }
  }
}

function handleMouseDown(e) {
  if (running) return

  mouseDown = true

  const row = Number(e.target.dataset.row)
  const col = Number(e.target.dataset.col)

  toggleWall(row, col)
}

function handleMouseEnter(e) {
  if (!mouseDown || running) return

  const row = Number(e.target.dataset.row)
  const col = Number(e.target.dataset.col)

  toggleWall(row, col)
}

document.addEventListener("mouseup", () => {
  mouseDown = false
})

function toggleWall(row, col) {
  if (
    (row === startNode.row && col === startNode.col) ||
    (row === endNode.row && col === endNode.col)
  ) {
    return
  }

  grid[row][col].wall = !grid[row][col].wall
  saveState()
  renderGrid()
}

function getCell(row, col) {
  return document.querySelector(
    `.cell[data-row="${row}"][data-col="${col}"]`
  )
}

function clearVisuals() {
  document.querySelectorAll(".cell").forEach(cell => {
    cell.classList.remove("visited")
    cell.classList.remove("path")
  })
}

function clearWalls() {
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      grid[row][col].wall = false
    }
  }

  saveState()
  renderGrid()
}

function resetGrid() {
  grid = createEmptyGrid()
  startNode = { row: 8, col: 6 }
  endNode = { row: 8, col: 32 }
  saveState()
  renderGrid()
}

function key(node) {
  return `${node.row}-${node.col}`
}

function heuristic(a, b) {
  return Math.abs(a.row - b.row) + Math.abs(a.col - b.col)
}

function neighbors(node) {
  const dirs = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1]
  ]

  const list = []

  for (const [dr, dc] of dirs) {
    const nr = node.row + dr
    const nc = node.col + dc

    if (
      nr >= 0 &&
      nr < rows &&
      nc >= 0 &&
      nc < cols &&
      !grid[nr][nc].wall
    ) {
      list.push({ row: nr, col: nc })
    }
  }

  return list
}

function buildPath(parent, endKey) {
  const path = []
  let current = endKey

  while (parent[current]) {
    const [row, col] = current.split("-").map(Number)
    path.push({ row, col })
    current = parent[current]
  }

  path.reverse()
  return path
}

function bfs() {
  const queue = [startNode]
  const seen = new Set([key(startNode)])
  const parent = {}
  const visited = []

  while (queue.length) {
    const node = queue.shift()
    visited.push(node)

    if (key(node) === key(endNode)) {
      return { visited, path: buildPath(parent, key(endNode)) }
    }

    for (const next of neighbors(node)) {
      const k = key(next)

      if (!seen.has(k)) {
        seen.add(k)
        parent[k] = key(node)
        queue.push(next)
      }
    }
  }

  return { visited, path: [] }
}

function dfs() {
  const stack = [startNode]
  const seen = new Set()
  const parent = {}
  const visited = []

  while (stack.length) {
    const node = stack.pop()
    const k = key(node)

    if (seen.has(k)) continue

    seen.add(k)
    visited.push(node)

    if (k === key(endNode)) {
      return { visited, path: buildPath(parent, key(endNode)) }
    }

    const nextNodes = neighbors(node).reverse()

    for (const next of nextNodes) {
      const nk = key(next)

      if (!seen.has(nk)) {
        parent[nk] = k
        stack.push(next)
      }
    }
  }

  return { visited, path: [] }
}

function dijkstra() {
  const open = [{ ...startNode, cost: 0 }]
  const dist = {}
  const parent = {}
  const visited = []

  dist[key(startNode)] = 0

  while (open.length) {
    open.sort((a, b) => a.cost - b.cost)

    const node = open.shift()
    const k = key(node)

    visited.push(node)

    if (k === key(endNode)) {
      return { visited, path: buildPath(parent, k) }
    }

    for (const next of neighbors(node)) {
      const nk = key(next)
      const newCost = dist[k] + grid[next.row][next.col].weight

      if (dist[nk] === undefined || newCost < dist[nk]) {
        dist[nk] = newCost
        parent[nk] = k
        open.push({ ...next, cost: newCost })
      }
    }
  }

  return { visited, path: [] }
}

function astar() {
  const open = [{ ...startNode, g: 0, f: heuristic(startNode, endNode) }]
  const gScore = {}
  const parent = {}
  const visited = []

  gScore[key(startNode)] = 0

  while (open.length) {
    open.sort((a, b) => a.f - b.f)

    const node = open.shift()
    const k = key(node)

    visited.push(node)

    if (k === key(endNode)) {
      return { visited, path: buildPath(parent, k) }
    }

    for (const next of neighbors(node)) {
      const nk = key(next)
      const tentative = gScore[k] + 1

      if (gScore[nk] === undefined || tentative < gScore[nk]) {
        gScore[nk] = tentative
        parent[nk] = k

        open.push({
          ...next,
          g: tentative,
          f: tentative + heuristic(next, endNode)
        })
      }
    }
  }

  return { visited, path: [] }
}

function greedy() {
  const open = [startNode]
  const seen = new Set()
  const parent = {}
  const visited = []

  while (open.length) {
    open.sort((a, b) => heuristic(a, endNode) - heuristic(b, endNode))

    const node = open.shift()
    const k = key(node)

    if (seen.has(k)) continue

    seen.add(k)
    visited.push(node)

    if (k === key(endNode)) {
      return { visited, path: buildPath(parent, k) }
    }

    for (const next of neighbors(node)) {
      const nk = key(next)

      if (!seen.has(nk)) {
        parent[nk] = k
        open.push(next)
      }
    }
  }

  return { visited, path: [] }
}

function bidirectional() {
  const q1 = [startNode]
  const q2 = [endNode]

  const seen1 = new Set([key(startNode)])
  const seen2 = new Set([key(endNode)])

  const p1 = {}
  const p2 = {}

  const visited = []

  while (q1.length && q2.length) {
    const n1 = q1.shift()
    visited.push(n1)

    for (const next of neighbors(n1)) {
      const nk = key(next)

      if (!seen1.has(nk)) {
        seen1.add(nk)
        p1[nk] = key(n1)
        q1.push(next)

        if (seen2.has(nk)) {
          const left = buildPath(p1, nk)
          let current = nk
          const right = []

          while (p2[current]) {
            current = p2[current]
            const [r, c] = current.split("-").map(Number)
            right.push({ row: r, col: c })
          }

          return { visited, path: [...left, ...right] }
        }
      }
    }

    const n2 = q2.shift()
    visited.push(n2)

    for (const next of neighbors(n2)) {
      const nk = key(next)

      if (!seen2.has(nk)) {
        seen2.add(nk)
        p2[nk] = key(n2)
        q2.push(next)
      }
    }
  }

  return { visited, path: [] }
}

function uniformCostSearch() {
  return dijkstra()
}

function solve() {
  const type = algorithmSelect.value

  if (type === "bfs") return bfs()
  if (type === "dfs") return dfs()
  if (type === "dijkstra") return dijkstra()
  if (type === "astar") return astar()
  if (type === "greedy") return greedy()
  if (type === "bidirectional") return bidirectional()
  if (type === "ucs") return uniformCostSearch()

  return bfs()
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function animate(result) {
  const speed = Number(speedSelect.value)

  for (const node of result.visited) {
    if (
      key(node) !== key(startNode) &&
      key(node) !== key(endNode)
    ) {
      getCell(node.row, node.col).classList.add("visited")
      await sleep(speed)
    }
  }

  for (const node of result.path) {
    if (
      key(node) !== key(startNode) &&
      key(node) !== key(endNode)
    ) {
      getCell(node.row, node.col).classList.remove("visited")
      getCell(node.row, node.col).classList.add("path")
      await sleep(speed + 10)
    }
  }
}

async function run() {
  if (running) return

  running = true
  clearVisuals()

  const result = solve()

  await animate(result)

  running = false
}

visualizeBtn.addEventListener("click", run)
clearPathBtn.addEventListener("click", clearVisuals)
clearWallsBtn.addEventListener("click", clearWalls)
resetBtn.addEventListener("click", resetGrid)

loadState()
renderGrid()
function calculatePolygonPositions(sides, radius = 1) {
  let positions = []

  for (let i = 0; i < sides; i++) {
    let theta0 = 2.0 * Math.PI * i / sides
    positions.push(radius * Math.sin(theta0), radius * Math.cos(theta0), 0)
  }

  const firstX = positions[0]
  const firstY = positions[1]

  positions.push(firstX, firstY, 0)

  return positions
}
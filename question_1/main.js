function main() {
  const canvas = document.querySelector("#glCanvas")

  const gl = canvas.getContext("webgl")
  if (!gl) return

  const button = document.querySelector("#generate-button")

  button.addEventListener('click', function () {
    generatePolygon(gl)
  }, false)
}

function generatePolygon(gl) {
  const input = document.querySelector("#side-count-input")
  if (!input.value) return

  if (input.value < 3 || input.value > 10) {
    alert('Só é permitido no mínimo 3 e no máximo 10 lados')
    return
  }

  const vertexData = calculatePolygonPositions(input.value);

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexData), gl.STATIC_DRAW);

  const vertexShader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vertexShader, `
  attribute vec3 position;
  void main() {
      gl_Position = vec4(position, 1);
  }
  `);
  gl.compileShader(vertexShader);

  const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fragmentShader, `
  void main() {
      gl_FragColor = vec4(1, 0, 0, 1);
  }
  `);
  gl.compileShader(fragmentShader);

  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  const positionLocation = gl.getAttribLocation(program, `position`);
  gl.enableVertexAttribArray(positionLocation);
  gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);

  gl.useProgram(program);
  gl.drawArrays(gl.TRIANGLE_FAN, 0, vertexData.length / 3);
}

function calculatePolygonPositions(sides) {
  let positions = []

  for (let i = 0; i < sides; i++) {
    let theta0 = 2.0 * Math.PI * i / sides
    positions.push(Math.sin(theta0), Math.cos(theta0), 0)
  }

  const firstX = positions[0]
  const firstY = positions[1]

  positions.push(firstX, firstY, 0)

  return positions
}

main()
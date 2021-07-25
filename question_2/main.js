'use strict'

const webglUtils = new WebGLUtils()

const currentMatrix = webglUtils.create()
const translateMatrix = webglUtils.create()
const scaleMatrix = webglUtils.create()
const rotateMatrix = webglUtils.create()

webglUtils.setIdentity(translateMatrix)
webglUtils.setIdentity(scaleMatrix)
webglUtils.setIdentity(rotateMatrix)

function main() {
  const polygonPositions = calculatePolygonPositions(5, .2)
  let lastPositionX = 0, lastPositionY = 0;
  let start = 0;
  let isChangingRotate = false;

  const canvas = document.querySelector("#glCanvas")
  const gl = canvas.getContext("webgl")
  if (!gl) return

  const program = createProgram(gl)

  const positionLocation = gl.getAttribLocation(program, "position")
  const matrixLocation = gl.getUniformLocation(program, "matrix")

  const positionBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(polygonPositions), gl.STATIC_DRAW)

  const colorBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer)

  canvas.width = window.innerHeight * .8
  canvas.height = canvas.width
  webglUtils.resizeCanvasToDisplaySize(gl.canvas)
  gl.useProgram(program)

  gl.enableVertexAttribArray(positionLocation)
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
  gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0)
  drawScene()

  const rotationZSlider = document.getElementById('rotation-z')
  rotationZSlider.oninput = function () {
    isChangingRotate = true
    webglUtils.rotate(rotateMatrix, -this.value, 0, 0, 1)
    drawScene()
  }

  rotationZSlider.addEventListener('mouseup', function () {
    isChangingRotate = false
    requestAnimationFrame(animate)
  }, false)

  const scaleSlider = document.getElementById('scale')
  scaleSlider.oninput = function () {
    webglUtils.scale(scaleMatrix, this.value, this.value, this.value)
    drawScene()
  }

  const translationX = document.getElementById('translation-x')
  translationX.oninput = function () {
    lastPositionX = this.value
    webglUtils.translate(translateMatrix, lastPositionX, lastPositionY, 0)
    drawScene()
  }

  const translationY = document.getElementById('translation-y')
  translationY.oninput = function () {
    lastPositionY = this.value
    webglUtils.translate(translateMatrix, lastPositionX, lastPositionY, 0)
    drawScene()
  }



  function drawScene() {
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    webglUtils.multiplySeries(currentMatrix, translateMatrix, rotateMatrix, scaleMatrix)
    gl.uniformMatrix4fv(matrixLocation, false, currentMatrix)
    gl.drawArrays(gl.TRIANGLE_FAN, 0, polygonPositions.length / 3)
  }


  function animate(time) {
    if (!start) start = time
    let progress = time - start;
    webglUtils.rotate(rotateMatrix, -progress * 0.1 * Math.PI / 2, 0, 0, 1)
    drawScene()

    if (!isChangingRotate)
      requestAnimationFrame(animate)
  }

  requestAnimationFrame(animate)
}

function createVertexShader(gl) {
  const vertexShader = gl.createShader(gl.VERTEX_SHADER)
  gl.shaderSource(vertexShader, `
    precision mediump float;
    
    attribute vec3 position;
    attribute vec3 color;
    varying vec3 vColor;
    
    uniform mat4 matrix;
    
    void main() {
        vColor = color;
        gl_Position = matrix * vec4(position, 1);
    }
    `)
  gl.compileShader(vertexShader)
  return vertexShader

}

function createFragmentShader(gl) {
  const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)
  gl.shaderSource(fragmentShader, `
    precision mediump float;
    varying vec3 vColor;
    
    void main() {
        gl_FragColor = vec4(vColor, 1);
    }
    `)
  gl.compileShader(fragmentShader)
  return fragmentShader
}

function createProgram(gl) {
  const vertexShader = createVertexShader(gl)
  const fragmentShader = createFragmentShader(gl)
  const program = gl.createProgram()
  gl.attachShader(program, vertexShader)
  gl.attachShader(program, fragmentShader)

  gl.linkProgram(program)
  return program
}
'use client'

import { useEffect, useRef } from 'react'

const vertexShader = `
  attribute vec2 position;
  void main() {
    gl_Position = vec4(position, 0.0, 1.0);
  }
`

const fragmentShader = `
  precision highp float;
  uniform vec2 resolution;
  uniform float time;
  uniform vec2 mouse;
  
  // Noise functions
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }
  
  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy) );
    vec2 x0 = v -   i + dot(i, C.xx);
    vec2 i1;
    i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 )) + i.x + vec3(0.0, i1.x, 1.0 ));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
    m = m*m ;
    m = m*m ;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
    vec3 g;
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }
  
  float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 3.0;
    for (int i = 0; i < 4; i++) {
      value += amplitude * abs(snoise(p * frequency));
      frequency *= 2.0;
      amplitude *= 0.3;
    }
    return value;
  }
  
  // Bayer matrix for dithering
  float bayer8x8(vec2 p) {
    int x = int(mod(p.x, 8.0));
    int y = int(mod(p.y, 8.0));
    int index = y * 8 + x;
    
    // Using if-else chain instead of array for WebGL 1.0 compatibility
    if (index == 0) return 0.0/64.0;
    else if (index == 1) return 48.0/64.0;
    else if (index == 2) return 12.0/64.0;
    else if (index == 3) return 60.0/64.0;
    else if (index == 4) return 3.0/64.0;
    else if (index == 5) return 51.0/64.0;
    else if (index == 6) return 15.0/64.0;
    else if (index == 7) return 63.0/64.0;
    else if (index == 8) return 32.0/64.0;
    else if (index == 9) return 16.0/64.0;
    else if (index == 10) return 44.0/64.0;
    else if (index == 11) return 28.0/64.0;
    else if (index == 12) return 35.0/64.0;
    else if (index == 13) return 19.0/64.0;
    else if (index == 14) return 47.0/64.0;
    else if (index == 15) return 31.0/64.0;
    else if (index == 16) return 8.0/64.0;
    else if (index == 17) return 56.0/64.0;
    else if (index == 18) return 4.0/64.0;
    else if (index == 19) return 52.0/64.0;
    else if (index == 20) return 11.0/64.0;
    else if (index == 21) return 59.0/64.0;
    else if (index == 22) return 7.0/64.0;
    else if (index == 23) return 55.0/64.0;
    else if (index == 24) return 40.0/64.0;
    else if (index == 25) return 24.0/64.0;
    else if (index == 26) return 36.0/64.0;
    else if (index == 27) return 20.0/64.0;
    else if (index == 28) return 43.0/64.0;
    else if (index == 29) return 27.0/64.0;
    else if (index == 30) return 39.0/64.0;
    else if (index == 31) return 23.0/64.0;
    else if (index == 32) return 2.0/64.0;
    else if (index == 33) return 50.0/64.0;
    else if (index == 34) return 14.0/64.0;
    else if (index == 35) return 62.0/64.0;
    else if (index == 36) return 1.0/64.0;
    else if (index == 37) return 49.0/64.0;
    else if (index == 38) return 13.0/64.0;
    else if (index == 39) return 61.0/64.0;
    else if (index == 40) return 34.0/64.0;
    else if (index == 41) return 18.0/64.0;
    else if (index == 42) return 46.0/64.0;
    else if (index == 43) return 30.0/64.0;
    else if (index == 44) return 33.0/64.0;
    else if (index == 45) return 17.0/64.0;
    else if (index == 46) return 45.0/64.0;
    else if (index == 47) return 29.0/64.0;
    else if (index == 48) return 10.0/64.0;
    else if (index == 49) return 58.0/64.0;
    else if (index == 50) return 6.0/64.0;
    else if (index == 51) return 54.0/64.0;
    else if (index == 52) return 9.0/64.0;
    else if (index == 53) return 57.0/64.0;
    else if (index == 54) return 5.0/64.0;
    else if (index == 55) return 53.0/64.0;
    else if (index == 56) return 42.0/64.0;
    else if (index == 57) return 26.0/64.0;
    else if (index == 58) return 38.0/64.0;
    else if (index == 59) return 22.0/64.0;
    else if (index == 60) return 41.0/64.0;
    else if (index == 61) return 25.0/64.0;
    else if (index == 62) return 37.0/64.0;
    else if (index == 63) return 21.0/64.0;
    return 0.0;
  }
  
  void main() {
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    uv = uv * 2.0 - 1.0;
    uv.x *= resolution.x / resolution.y;
    
    // Create animated wave pattern
    vec2 p = uv + time * 0.05;
    float n = fbm(p);
    
    // Mouse interaction - dialed to 40% of max
    vec2 mouseNorm = (mouse / resolution - 0.5) * 2.0;
    mouseNorm.x *= resolution.x / resolution.y;
    float dist = length(uv - mouseNorm);
    float mouseEffect = 1.0 - smoothstep(0.0, 0.52, dist);  // 40% between 0.3 and 1.0
    n -= mouseEffect * 1.1;  // 40% between 0.5 and 2.0
    
    // Map to color
    vec3 color = vec3(0.1, 0.1, 0.3) * n;
    
    // Apply dithering
    vec2 pixelCoord = floor(gl_FragCoord.xy / 3.0) * 3.0;
    float threshold = bayer8x8(pixelCoord) - 0.25;
    float colorNum = 4.0;
    color += threshold / (colorNum - 1.0);
    color = floor(color * (colorNum - 1.0) + 0.5) / (colorNum - 1.0);
    
    gl_FragColor = vec4(color, 1.0);
  }
`

export default function DitherSimple() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationFrameRef = useRef<number>()
  const mouseRef = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
    if (!gl) {
      console.error('WebGL not supported')
      return
    }

    // Compile shaders
    const createShader = (type: number, source: string) => {
      const shader = gl.createShader(type)
      if (!shader) return null
      gl.shaderSource(shader, source)
      gl.compileShader(shader)
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Shader compile error:', gl.getShaderInfoLog(shader))
        gl.deleteShader(shader)
        return null
      }
      return shader
    }

    const vShader = createShader(gl.VERTEX_SHADER, vertexShader)
    const fShader = createShader(gl.FRAGMENT_SHADER, fragmentShader)
    if (!vShader || !fShader) return

    // Create program
    const program = gl.createProgram()
    if (!program) return
    gl.attachShader(program, vShader)
    gl.attachShader(program, fShader)
    gl.linkProgram(program)

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program link error:', gl.getProgramInfoLog(program))
      return
    }

    gl.useProgram(program)

    // Set up geometry (full screen quad)
    const vertices = new Float32Array([
      -1, -1,
       1, -1,
      -1,  1,
       1,  1,
    ])

    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW)

    const positionLocation = gl.getAttribLocation(program, 'position')
    gl.enableVertexAttribArray(positionLocation)
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0)

    // Get uniform locations
    const resolutionLocation = gl.getUniformLocation(program, 'resolution')
    const timeLocation = gl.getUniformLocation(program, 'time')
    const mouseLocation = gl.getUniformLocation(program, 'mouse')

    // Handle resize
    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width * window.devicePixelRatio
      canvas.height = rect.height * window.devicePixelRatio
      gl.viewport(0, 0, canvas.width, canvas.height)
    }
    resize()
    window.addEventListener('resize', resize)

    // Handle mouse - track at document level for continuous tracking
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      mouseRef.current = {
        x: (e.clientX - rect.left) * window.devicePixelRatio,
        y: (rect.height - (e.clientY - rect.top)) * window.devicePixelRatio
      }
    }
    document.addEventListener('mousemove', handleMouseMove)

    // Animation loop
    const startTime = Date.now()
    const animate = () => {
      const time = (Date.now() - startTime) / 1000

      gl.uniform2f(resolutionLocation, canvas.width, canvas.height)
      gl.uniform1f(timeLocation, time)
      gl.uniform2f(mouseLocation, mouseRef.current.x, mouseRef.current.y)

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
      animationFrameRef.current = requestAnimationFrame(animate)
    }
    animate()

    // Cleanup
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      window.removeEventListener('resize', resize)
      document.removeEventListener('mousemove', handleMouseMove)
      gl.deleteProgram(program)
      gl.deleteShader(vShader)
      gl.deleteShader(fShader)
      gl.deleteBuffer(buffer)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'auto',
      }}
    />
  )
}
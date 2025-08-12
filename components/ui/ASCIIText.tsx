"use client"

import { useRef, useEffect } from "react";
import * as THREE from "three";

const vertexShader = `
varying vec2 vUv;
uniform float uTime;
uniform float mouse;
uniform float uEnableWaves;

void main() {
    vUv = uv;
    float time = uTime * 5.;

    float waveFactor = uEnableWaves;

    vec3 transformed = position;

    transformed.x += sin(time + position.y) * 0.5 * waveFactor;
    transformed.y += cos(time + position.z) * 0.15 * waveFactor;
    transformed.z += sin(time + position.x) * waveFactor;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);
}
`;

const fragmentShader = `
varying vec2 vUv;
uniform float mouse;
uniform float uTime;
uniform sampler2D uTexture;

void main() {
    float time = uTime;
    vec2 pos = vUv;
    
    float move = sin(time + mouse) * 0.01;
    float r = texture2D(uTexture, pos + cos(time * 2. - time + pos.x) * .01).r;
    float g = texture2D(uTexture, pos + tan(time * .5 + pos.x - time) * .01).g;
    float b = texture2D(uTexture, pos - cos(time * 2. + time + pos.y) * .01).b;
    float a = texture2D(uTexture, pos).a;
    gl_FragColor = vec4(r, g, b, a);
}
`;

function map(
  n: number,
  start: number,
  stop: number,
  start2: number,
  stop2: number
) {
  return ((n - start) / (stop - start)) * (stop2 - start2) + start2;
}

const PX_RATIO = typeof window !== "undefined" ? window.devicePixelRatio : 1;

interface AsciiFilterOptions {
  fontSize?: number;
  fontFamily?: string;
  charset?: string;
  invert?: boolean;
}

class AsciiFilter {
  renderer!: THREE.WebGLRenderer;
  domElement: HTMLDivElement;
  pre: HTMLPreElement;
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D | null;
  deg: number;
  invert: boolean;
  fontSize: number;
  fontFamily: string;
  charset: string;
  width: number = 0;
  height: number = 0;
  center: { x: number; y: number } = { x: 0, y: 0 };
  mouse: { x: number; y: number } = { x: 0, y: 0 };
  cols: number = 0;
  rows: number = 0;

  constructor(
    renderer: THREE.WebGLRenderer,
    { fontSize, fontFamily, charset, invert }: AsciiFilterOptions = {}
  ) {
    this.renderer = renderer;
    this.domElement = document.createElement("div");
    this.domElement.style.position = "absolute";
    this.domElement.style.top = "0";
    this.domElement.style.left = "0";
    this.domElement.style.width = "100%";
    this.domElement.style.height = "100%";

    this.pre = document.createElement("pre");
    this.domElement.appendChild(this.pre);

    this.canvas = document.createElement("canvas");
    this.context = this.canvas.getContext("2d");
    this.domElement.appendChild(this.canvas);

    this.deg = 0;
    this.invert = invert ?? true;
    this.fontSize = fontSize ?? 12;
    this.fontFamily = fontFamily ?? "'Courier New', monospace";
    this.charset =
      charset ??
      " .'`^\",:;Il!i~+_-?][}{1)(|/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$";

    if (this.context) {
      this.context.imageSmoothingEnabled = false;
    }

    this.onMouseMove = this.onMouseMove.bind(this);
    document.addEventListener("mousemove", this.onMouseMove);
  }

  setSize(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.renderer.setSize(width, height);
    this.reset();

    this.center = { x: width / 2, y: height / 2 };
    this.mouse = { x: this.center.x, y: this.center.y };
  }

  reset() {
    if (this.context) {
      this.context.font = `${this.fontSize}px ${this.fontFamily}`;
      const charWidth = this.context.measureText("A").width;

      this.cols = Math.floor(
        this.width / (this.fontSize * (charWidth / this.fontSize))
      );
      this.rows = Math.floor(this.height / this.fontSize);

      this.canvas.width = this.cols;
      this.canvas.height = this.rows;
      this.pre.style.fontFamily = this.fontFamily;
      this.pre.style.fontSize = `${this.fontSize}px`;
      this.pre.style.margin = "0";
      this.pre.style.padding = "0";
      this.pre.style.lineHeight = "1em";
      this.pre.style.position = "absolute";
      this.pre.style.left = "50%";
      this.pre.style.top = "50%";
      this.pre.style.transform = "translate(-50%, -50%)";
      this.pre.style.zIndex = "9";
      this.pre.style.backgroundAttachment = "fixed";
      this.pre.style.mixBlendMode = "difference";
    }
  }

  render(scene: THREE.Scene, camera: THREE.Camera) {
    this.renderer.render(scene, camera);

    const w = this.canvas.width;
    const h = this.canvas.height;
    if (this.context) {
      this.context.clearRect(0, 0, w, h);
      this.context.drawImage(this.renderer.domElement, 0, 0, w, h);
      this.asciify(this.context, w, h);
      this.hue();
    }
  }

  onMouseMove(e: MouseEvent) {
    this.mouse = { x: e.clientX * PX_RATIO, y: e.clientY * PX_RATIO };
  }

  get dx() {
    return this.mouse.x - this.center.x;
  }

  get dy() {
    return this.mouse.y - this.center.y;
  }

  hue() {
    const deg = (Math.atan2(this.dy, this.dx) * 180) / Math.PI;
    this.deg += (deg - this.deg) * 0.075;
    this.domElement.style.filter = `hue-rotate(${this.deg.toFixed(1)}deg)`;
  }

  asciify(ctx: CanvasRenderingContext2D, w: number, h: number) {
    const imgData = ctx.getImageData(0, 0, w, h).data;
    let str = "";
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = x * 4 + y * 4 * w;
        const [r, g, b, a] = [
          imgData[i],
          imgData[i + 1],
          imgData[i + 2],
          imgData[i + 3],
        ];

        if (a === 0) {
          str += " ";
          continue;
        }

        let gray = (0.3 * r + 0.6 * g + 0.1 * b) / 255;
        let idx = Math.floor((1 - gray) * (this.charset.length - 1));
        if (this.invert) idx = this.charset.length - idx - 1;
        str += this.charset[idx];
      }
      str += "\n";
    }
    this.pre.innerHTML = str;
  }

  dispose() {
    document.removeEventListener("mousemove", this.onMouseMove);
  }
}

interface CanvasTxtOptions {
  fontSize?: number;
  fontFamily?: string;
  color?: string;
}

class CanvasTxt {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D | null;
  txt: string;
  fontSize: number;
  fontFamily: string;
  color: string;
  font: string;

  constructor(
    txt: string,
    {
      fontSize = 200,
      fontFamily = "Arial",
      color = "#fdf9f3",
    }: CanvasTxtOptions = {}
  ) {
    this.canvas = document.createElement("canvas");
    this.context = this.canvas.getContext("2d");
    this.txt = txt;
    this.fontSize = fontSize;
    this.fontFamily = fontFamily;
    this.color = color;

    this.font = `600 ${this.fontSize}px ${this.fontFamily}`;
  }

  resize() {
    if (this.context) {
      this.context.font = this.font;
      const metrics = this.context.measureText(this.txt);

      const textWidth = Math.ceil(metrics.width) + 20;
      const textHeight =
        Math.ceil(
          metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent
        ) + 20;

      this.canvas.width = textWidth;
      this.canvas.height = textHeight;
    }
  }

  render() {
    if (this.context) {
      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.context.fillStyle = this.color;
      this.context.font = this.font;

      const metrics = this.context.measureText(this.txt);
      const yPos = 10 + metrics.actualBoundingBoxAscent;

      this.context.fillText(this.txt, 10, yPos);
    }
  }

  get width() {
    return this.canvas.width;
  }

  get height() {
    return this.canvas.height;
  }

  get texture() {
    return this.canvas;
  }
}

interface CanvAsciiOptions {
  text: string;
  asciiFontSize: number;
  textFontSize: number;
  textColor: string;
  planeBaseHeight: number;
  enableWaves: boolean;
  enableTilt: boolean;
}

class CanvAscii {
  textString: string;
  asciiFontSize: number;
  textFontSize: number;
  textColor: string;
  planeBaseHeight: number;
  container: HTMLElement;
  width: number;
  height: number;
  enableWaves: boolean;
  enableTilt: boolean;
  camera: THREE.PerspectiveCamera;
  scene: THREE.Scene;
  mouse: { x: number; y: number };
  textCanvas!: CanvasTxt;
  texture!: THREE.CanvasTexture;
  geometry: THREE.PlaneGeometry | undefined;
  material: THREE.ShaderMaterial | undefined;
  mesh!: THREE.Mesh;
  renderer!: THREE.WebGLRenderer;
  filter!: AsciiFilter;
  center: { x: number; y: number } = { x: 0, y: 0 };
  animationFrameId: number = 0;
  isAnimating: boolean = false;
  animationStartTime: number = 0;
  isMobile: boolean = false;
  tiltX: number = 0;
  tiltY: number = 0;
  hasOrientationPermission: boolean = false;

  constructor(
    {
      text,
      asciiFontSize,
      textFontSize,
      textColor,
      planeBaseHeight,
      enableWaves,
      enableTilt,
    }: CanvAsciiOptions,
    containerElem: HTMLElement,
    width: number,
    height: number
  ) {
    this.textString = text;
    this.asciiFontSize = asciiFontSize;
    this.textFontSize = textFontSize;
    this.textColor = textColor;
    this.planeBaseHeight = planeBaseHeight;
    this.container = containerElem;
    this.width = width;
    this.height = height;
    this.enableWaves = enableWaves;
    this.enableTilt = enableTilt;

    this.camera = new THREE.PerspectiveCamera(
      45,
      this.width / this.height,
      1,
      1000
    );
    this.camera.position.z = 30;

    this.scene = new THREE.Scene();
    this.mouse = { x: 0, y: 0 };

    this.onMouseMove = this.onMouseMove.bind(this);
    this.onClick = this.onClick.bind(this);
    this.onDeviceOrientation = this.onDeviceOrientation.bind(this);

    // Check if mobile
    this.isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

    this.setMesh();
    this.setRenderer();
    this.setupDeviceOrientation();
  }

  setMesh() {
    this.textCanvas = new CanvasTxt(this.textString, {
      fontSize: this.textFontSize,
      fontFamily: "IBM Plex Mono",
      color: this.textColor,
    });
    this.textCanvas.resize();
    this.textCanvas.render();

    this.texture = new THREE.CanvasTexture(this.textCanvas.texture);
    this.texture.minFilter = THREE.NearestFilter;

    const textAspect = this.textCanvas.width / this.textCanvas.height;
    const baseH = this.planeBaseHeight;
    const planeW = baseH * textAspect;
    const planeH = baseH;

    this.geometry = new THREE.PlaneGeometry(planeW, planeH, 36, 36);
    this.material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      transparent: true,
      uniforms: {
        uTime: { value: 0 },
        mouse: { value: 1.0 },
        uTexture: { value: this.texture },
        uEnableWaves: { value: this.enableWaves ? 1.0 : 0.0 },
      },
    });

    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.scene.add(this.mesh);
  }

  setRenderer() {
    this.renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });
    this.renderer.setPixelRatio(1);
    this.renderer.setClearColor(0x000000, 0);

    this.filter = new AsciiFilter(this.renderer, {
      fontFamily: "IBM Plex Mono",
      fontSize: this.asciiFontSize,
      invert: true,
    });

    this.container.appendChild(this.filter.domElement);
    this.setSize(this.width, this.height);

    this.container.addEventListener("mousemove", this.onMouseMove);
    this.container.addEventListener("touchmove", this.onMouseMove);
    this.container.addEventListener("click", this.onClick);
    this.container.addEventListener("touchstart", this.onClick);
  }

  setSize(w: number, h: number) {
    this.width = w;
    this.height = h;

    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();

    this.filter.setSize(w, h);

    this.center = { x: w / 2, y: h / 2 };
  }

  load() {
    this.animate();
  }

  onMouseMove(evt: MouseEvent | TouchEvent) {
    if (this.isAnimating || this.isMobile || !this.enableTilt) return; // Don't update mouse during animation, on mobile, or when tilt is disabled
    const e = (evt as TouchEvent).touches
      ? (evt as TouchEvent).touches[0]
      : (evt as MouseEvent);
    const bounds = this.container.getBoundingClientRect();
    const x = e.clientX - bounds.left;
    const y = e.clientY - bounds.top;
    this.mouse = { x, y };
  }

  onClick(evt: MouseEvent | TouchEvent) {
    evt.preventDefault();
    if (this.isAnimating) return;
    
    this.isAnimating = true;
    this.animationStartTime = Date.now();
    
    // Play sound effect with mobile volume reduction
    try {
      const audio = new Audio('/digital-glitch cut.mp3');
      const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
      audio.volume = isMobile ? 0.18 : 0.3; // 40% reduction on mobile (0.3 * 0.6 = 0.18)
      audio.play().catch(() => {});
    } catch (e) {}
  }

  onDeviceOrientation(evt: DeviceOrientationEvent) {
    if (!this.isMobile || this.isAnimating) return;
    
    // Get device orientation values
    const beta = evt.beta || 0; // X axis rotation (-180 to 180)
    const gamma = evt.gamma || 0; // Y axis rotation (-90 to 90)
    
    // Normalize values to -1 to 1 range
    // Beta: phone tilted forward/backward
    // Gamma: phone tilted left/right
    this.tiltX = Math.max(-1, Math.min(1, beta / 45)); // Limit to ±45 degrees
    this.tiltY = Math.max(-1, Math.min(1, gamma / 45)); // Limit to ±45 degrees
  }

  setupDeviceOrientation() {
    if (!this.isMobile) return;
    
    // Check if DeviceOrientationEvent is available
    if (typeof DeviceOrientationEvent !== 'undefined') {
      // iOS 13+ requires permission
      if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
        // We'll request permission on first touch
        const requestPermission = () => {
          (DeviceOrientationEvent as any).requestPermission()
            .then((response: string) => {
              if (response === 'granted') {
                this.hasOrientationPermission = true;
                window.addEventListener('deviceorientation', this.onDeviceOrientation);
              }
            })
            .catch((error: any) => console.log('DeviceOrientation permission error:', error));
          
          // Remove the listener after first request
          this.container.removeEventListener('touchstart', requestPermission);
        };
        
        this.container.addEventListener('touchstart', requestPermission, { once: true });
      } else {
        // Non-iOS devices don't need permission
        this.hasOrientationPermission = true;
        window.addEventListener('deviceorientation', this.onDeviceOrientation);
      }
    }
  }

  animate() {
    const animateFrame = () => {
      this.animationFrameId = requestAnimationFrame(animateFrame);
      this.render();
    };
    animateFrame();
  }

  render() {
    const time = new Date().getTime() * 0.001;

    this.textCanvas.render();
    this.texture.needsUpdate = true;

    (this.mesh.material as THREE.ShaderMaterial).uniforms.uTime.value =
      Math.sin(time);

    this.updateRotation();
    this.filter.render(this.scene, this.camera);
  }

  updateRotation() {
    if (this.isAnimating) {
      // Animation sequence: left -> right -> center
      const elapsed = Date.now() - this.animationStartTime;
      const duration = 1200; // Total animation duration
      
      if (elapsed < duration) {
        const progress = elapsed / duration;
        let targetRotationY = 0;
        let targetRotationX = 0;
        
        if (progress < 0.33) {
          // Rotate left
          const phase = progress / 0.33;
          targetRotationY = -0.8 * Math.sin(phase * Math.PI / 2);
        } else if (progress < 0.66) {
          // Rotate right
          const phase = (progress - 0.33) / 0.33;
          targetRotationY = 0.8 * Math.sin(phase * Math.PI / 2);
        } else {
          // Return to center
          const phase = (progress - 0.66) / 0.34;
          targetRotationY = 0.8 * (1 - phase);
        }
        
        this.mesh.rotation.y += (targetRotationY - this.mesh.rotation.y) * 0.15;
        this.mesh.rotation.x += (targetRotationX - this.mesh.rotation.x) * 0.15;
      } else {
        // Animation complete
        this.isAnimating = false;
        // Return to normal tracking
      }
    } else if (this.enableTilt) {
      // Only apply tilt if enabled
      if (this.isMobile) {
        // Use device tilt for mobile
        // Map tilt values to rotation
        const targetRotationX = this.tiltX * 0.3; // Forward/backward tilt
        const targetRotationY = this.tiltY * 0.4; // Left/right tilt

        // Smooth rotation
        this.mesh.rotation.x += (targetRotationX - this.mesh.rotation.x) * 0.1;
        this.mesh.rotation.y += (targetRotationY - this.mesh.rotation.y) * 0.1;
      } else {
        // Desktop: use mouse tracking
        // Limit rotation range to prevent flipping
        const x = map(this.mouse.y, 0, this.height, 0.3, -0.3);
        const y = map(this.mouse.x, 0, this.width, -0.4, 0.4);

        // Clamp rotation values to prevent full flip
        const targetRotationX = Math.max(-0.3, Math.min(0.3, x));
        const targetRotationY = Math.max(-0.4, Math.min(0.4, y));

        this.mesh.rotation.x += (targetRotationX - this.mesh.rotation.x) * 0.05;
        this.mesh.rotation.y += (targetRotationY - this.mesh.rotation.y) * 0.05;
      }
    } else {
      // No tilt - keep flat
      this.mesh.rotation.x = 0;
      this.mesh.rotation.y = 0;
    }
  }

  clear() {
    this.scene.traverse((object) => {
      const obj = object as unknown as THREE.Mesh;
      if (!obj.isMesh) return;
      [obj.material].flat().forEach((material) => {
        material.dispose();
        Object.keys(material).forEach((key) => {
          const matProp = material[key as keyof typeof material];
          if (
            matProp &&
            typeof matProp === "object" &&
            "dispose" in matProp &&
            typeof matProp.dispose === "function"
          ) {
            matProp.dispose();
          }
        });
      });
      obj.geometry.dispose();
    });
    this.scene.clear();
  }

  dispose() {
    cancelAnimationFrame(this.animationFrameId);
    this.filter.dispose();
    this.container.removeChild(this.filter.domElement);
    this.container.removeEventListener("mousemove", this.onMouseMove);
    this.container.removeEventListener("touchmove", this.onMouseMove);
    this.container.removeEventListener("click", this.onClick);
    this.container.removeEventListener("touchstart", this.onClick);
    
    // Remove device orientation listener if it was added
    if (this.hasOrientationPermission) {
      window.removeEventListener('deviceorientation', this.onDeviceOrientation);
    }
    
    this.clear();
    this.renderer.dispose();
  }
}

interface ASCIITextProps {
  text?: string;
  asciiFontSize?: number;
  textFontSize?: number;
  textColor?: string;
  planeBaseHeight?: number;
  enableWaves?: boolean;
  enableTilt?: boolean;
}

export default function ASCIIText({
  text = "FOXBUILT",
  asciiFontSize = 7,
  textFontSize = 200,
  textColor = "#fdf9f3",
  planeBaseHeight = 8,
  enableWaves = false,
  enableTilt = true,
}: ASCIITextProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const asciiRef = useRef<CanvAscii | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const { width, height } = containerRef.current.getBoundingClientRect();

    if (width === 0 || height === 0) {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (
            entry.isIntersecting &&
            entry.boundingClientRect.width > 0 &&
            entry.boundingClientRect.height > 0
          ) {
            const { width: w, height: h } = entry.boundingClientRect;

            asciiRef.current = new CanvAscii(
              {
                text,
                asciiFontSize,
                textFontSize,
                textColor,
                planeBaseHeight,
                enableWaves,
                enableTilt,
              },
              containerRef.current!,
              w,
              h
            );
            asciiRef.current.load();

            observer.disconnect();
          }
        },
        { threshold: 0.1 }
      );

      observer.observe(containerRef.current);

      return () => {
        observer.disconnect();
        if (asciiRef.current) {
          asciiRef.current.dispose();
        }
      };
    }

    asciiRef.current = new CanvAscii(
      {
        text,
        asciiFontSize,
        textFontSize,
        textColor,
        planeBaseHeight,
        enableWaves,
        enableTilt,
      },
      containerRef.current,
      width,
      height
    );
    asciiRef.current.load();

    const ro = new ResizeObserver((entries) => {
      if (!entries[0] || !asciiRef.current) return;
      const { width: w, height: h } = entries[0].contentRect;
      if (w > 0 && h > 0) {
        asciiRef.current.setSize(w, h);
      }
    });
    ro.observe(containerRef.current);

    return () => {
      ro.disconnect();
      asciiRef.current?.dispose();
    };
  }, [
    text,
    asciiFontSize,
    textFontSize,
    textColor,
    planeBaseHeight,
    enableWaves,
  ]);

  return (
    <div
      ref={containerRef}
      className="ascii-text-container"
      style={{
        position: "absolute",
        width: "100%",
        height: "100%",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@500&display=swap');

        .ascii-text-container canvas {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          height: 100%;
          image-rendering: optimizeSpeed;
          image-rendering: -moz-crisp-edges;
          image-rendering: -o-crisp-edges;
          image-rendering: -webkit-optimize-contrast;
          image-rendering: optimize-contrast;
          image-rendering: crisp-edges;
          image-rendering: pixelated;
        }

        .ascii-text-container pre {
          margin: 0;
          user-select: none;
          padding: 0;
          line-height: 1em;
          text-align: left;
          position: absolute;
          left: 0;
          top: 0;
          background-image: radial-gradient(circle, #ff6188 0%, #fc9867 50%, #ffd866 100%);
          background-attachment: fixed;
          -webkit-text-fill-color: transparent;
          -webkit-background-clip: text;
          background-clip: text;
          z-index: 9;
          mix-blend-mode: difference;
        }
      `}</style>
    </div>
  );
}
import { useEffect, useRef, useCallback } from "react";

const VERTEX_SHADER = `
  attribute vec2 a_position;
  void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

const FRAGMENT_SHADER = `
  precision highp float;

  uniform vec2 u_resolution;
  uniform vec2 u_mouse;
  uniform float u_time;
  uniform float u_glow_intensity;
  uniform float u_fade_offset;

  vec3 getLight(vec2 p, vec2 mouse) {
    vec2 dir = p - mouse;
    
    // SUBLIMINAL FLOAT ANIMATION
    // Light jab fade hogi toh ekdum naturally aur dheere se upar drift karegi.
    // Is offset ko directly 'dir.y' me minus kiya hai taaki movement strictly vertically UP ho.
    dir.y -= u_fade_offset;
    
    float rad = 28.0 * 3.14159 / 180.0;
    float s = sin(rad); 
    float c = cos(rad);
    
    vec2 tubeDir = vec2(
        dir.x * c + dir.y * s,     
       -dir.x * s + dir.y * c      
    );
    
    float stretch = 1.0;
    if (tubeDir.y < 0.0) {
        stretch = 3.5; 
    } else {
        stretch = 0.7; 
    }
    
    vec2 rocketDir = vec2(tubeDir.x * 2.5, tubeDir.y / stretch);
    float dist = length(rocketDir);
    
    // IMAGE-ACCURATE PREMIUM COLORS
    vec3 color = vec3(0.0, 0.12, 0.85); // Rich Royal Blue Base
    
    // Subtle Mint Green sirf extreme left par
    float mintFactor = smoothstep(0.3, -1.2, dir.x);
    color = mix(color, vec3(0.0, 0.85, 0.65), mintFactor);
    
    // Deep Violet/Purple right side par
    float purpleFactor = smoothstep(-0.3, 1.2, dir.x);
    color = mix(color, vec3(0.4, 0.0, 0.95), purpleFactor);
    
    // Luminous Sky Blue core ekdum center me
    color = mix(color, vec3(0.0, 0.6, 1.0), exp(-dist * 2.5));

    float flow = sin(tubeDir.y * 3.0 - u_time * 1.5) * 0.5 + 0.5;
    float tailMask = smoothstep(0.0, -1.0, tubeDir.y); 
    float pulse = mix(1.0, 0.7 + flow * 0.5, tailMask);

    float falloff = mix(6.0, 1.2, min(u_glow_intensity, 1.0)); 
    float intensity = mix(0.5, 2.5, min(u_glow_intensity, 1.0)) * u_glow_intensity;
    
    float glow = exp(-dist * falloff) * intensity * pulse;
    
    // DEEP NAVY AMBIENT: Background ko pure dark-grey ki jagah ek expensive dark blue/indigo tint diya hai
    vec3 ambient = vec3(0.03, 0.04, 0.08); 
    
    return ambient + color * glow;
  }

  void main() {
    float d = u_resolution.x / u_resolution.y;

    float speed = 0.05; 
    float angle = 28.0 * 3.14159 / 180.0;
    float frequency = 8.0;
    float softness = 1.0;
    float refraction = 4.0;
    float aberration = 0.61;
    float lightAngle = -90.0 * 3.14159 / 180.0;
    
    float highlightSoftness = 0.55; 
    float highlight = 0.45; 

    float c = -u_time * speed;
    float t = cos(angle);
    float r = sin(angle);
    float h = sin(lightAngle);
    float p_light = cos(lightAngle);

    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    vec2 f = uv - 0.5;
    vec2 g = vec2(f.x * d, f.y);

    float y = g.x * t + g.y * r;
    float phase = y * frequency + c;
    float x = fract(phase) * 2.0 - 1.0;

    float T = abs(x);
    float e_pow = mix(16.0, 4.0, softness);
    float i = sign(x) * pow(T, e_pow);

    float S = 0.5 / max(frequency, 0.001);
    float M = -i * refraction * S;
    float w = M * t / d;
    float E = M * r;
    vec2 C = vec2(uv.x + w, uv.y + E);

    float R = M * aberration * 0.5;
    float N = R * t / d;
    float P = R * r;
    
    vec2 C_R = vec2(C.x + N, C.y + P);
    vec2 C_B = vec2(C.x - N, C.y - P);

    vec2 worldR = (C_R * 2.0 - 1.0); worldR.x *= d;
    vec2 worldG = (C * 2.0 - 1.0);   worldG.x *= d;
    vec2 worldB = (C_B * 2.0 - 1.0); worldB.x *= d;
    
    vec2 mouse = (u_mouse.xy * 2.0 - u_resolution.xy) / u_resolution.y;

    vec3 colR = getLight(worldR, mouse);
    vec3 colG = getLight(worldG, mouse);
    vec3 colB = getLight(worldB, mouse);
    
    vec3 refractedColor = vec3(colR.r, colG.g, colB.b);

    float U = min(i * i, 1.0);
    float B = sqrt(1.0 - U);
    float O = max(i * h + B * p_light, 0.0);
    
    float glassVolume = mix(0.2, 1.0, B); 
    
    vec2 noiseCoord = gl_FragCoord.xy * 0.6; 
    float noise = fract(sin(dot(noiseCoord, vec2(12.9898, 78.233))) * 43758.5453);
    
    vec3 finalColor = refractedColor * glassVolume + (noise - 0.5) * 0.04;

    float k = exp2(8.0 - highlightSoftness * 7.0);
    float V = pow(1.0 - B, 5.0);
    float z = 0.04 + 0.96 * V;
    float G = pow(O, k) * z * highlight;

    float mouseDist = length(worldG - mouse);
    float localLight = exp(-mouseDist * 1.5) * u_glow_intensity;
    float dynamicBoost = 1.0 + localLight * 0.8; 

    vec3 highlightColor = vec3(0.55, 0.6, 0.65) * dynamicBoost;
    finalColor += highlightColor * G;

    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

export default function ShaderBackground() {
  const canvasRef = useRef(null);
  const glRef = useRef(null);
  const programRef = useRef(null);
  const animFrameRef = useRef(null);
  
  const mouseRef = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const smoothMouseRef = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const startTimeRef = useRef(Date.now());
  
  const currentGlowRef = useRef(0.0);
  const lastMousePosRef = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const fadeOffsetRef = useRef(0.0); // Track offset for floating up

  const createShader = useCallback((gl, type, source) => {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return null;
    return shader;
  }, []);

  const initGL = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", {
      antialias: false,
      alpha: false,
      powerPreference: "high-performance",
    });
    
    if (!gl) return;
    glRef.current = gl;

    const vertShader = createShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
    const fragShader = createShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
    if (!vertShader || !fragShader) return;

    const program = gl.createProgram();
    gl.attachShader(program, vertShader);
    gl.attachShader(program, fragShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;

    programRef.current = program;
    gl.useProgram(program);

    const posBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW
    );
    
    const posAttr = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(posAttr);
    gl.vertexAttribPointer(posAttr, 2, gl.FLOAT, false, 0, 0);
  }, [createShader]);

  useEffect(() => {
    initGL();

    const resize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const dpr = Math.min(window.devicePixelRatio, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      if (glRef.current) glRef.current.viewport(0, 0, canvas.width, canvas.height);
    };
    
    resize();
    window.addEventListener("resize", resize);

    const handleMouseMove = (e) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("mousemove", handleMouseMove);

    const render = () => {
      const gl = glRef.current;
      const program = programRef.current;
      const canvas = canvasRef.current;
      
      if (!gl || !program || !canvas) {
        animFrameRef.current = requestAnimationFrame(render);
        return;
      }

      smoothMouseRef.current.x += (mouseRef.current.x - smoothMouseRef.current.x) * 0.08;
      smoothMouseRef.current.y += (mouseRef.current.y - smoothMouseRef.current.y) * 0.08;
      
      const dx = smoothMouseRef.current.x - lastMousePosRef.current.x;
      const dy = smoothMouseRef.current.y - lastMousePosRef.current.y;
      const speed = Math.sqrt(dx * dx + dy * dy);
      
      let targetIntensity = 0.0;
      if (speed > 0.1) {
          targetIntensity = Math.min(0.15 + speed * 0.05, 1.5);
      }
      
      const fadeSpeed = targetIntensity > currentGlowRef.current ? 0.2 : 0.015;
      currentGlowRef.current += (targetIntensity - currentGlowRef.current) * fadeSpeed;
      
      // EXTREMELY SUBTLE, ORGANIC FLOAT ANIMATION
      // Jab mouse rukta hai, toh light bohot organically (0.003 factor) upar drift karti hai.
      // Ye itna smooth aur slow hai ki subliminal level par feel hoga, par directly aakhon me nahi chubhega.
      if (speed <= 0.1 && currentGlowRef.current > 0.001) {
          fadeOffsetRef.current += (0.5 - fadeOffsetRef.current) * 0.003; 
      } else if (speed > 0.1) {
          // Wapas grab karne par organically snap back hota hai
          fadeOffsetRef.current += (0.0 - fadeOffsetRef.current) * 0.15;
      }
      
      lastMousePosRef.current.x = smoothMouseRef.current.x;
      lastMousePosRef.current.y = smoothMouseRef.current.y;

      const time = (Date.now() - startTimeRef.current) / 1000;
      const dpr = Math.min(window.devicePixelRatio, 2);

      gl.uniform2f(gl.getUniformLocation(program, "u_resolution"), canvas.width, canvas.height);
      gl.uniform2f(
        gl.getUniformLocation(program, "u_mouse"),
        smoothMouseRef.current.x * dpr,
        (window.innerHeight - smoothMouseRef.current.y) * dpr 
      );
      gl.uniform1f(gl.getUniformLocation(program, "u_time"), time);
      gl.uniform1f(gl.getUniformLocation(program, "u_glow_intensity"), currentGlowRef.current);
      gl.uniform1f(gl.getUniformLocation(program, "u_fade_offset"), fadeOffsetRef.current);
      
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      animFrameRef.current = requestAnimationFrame(render);
    };
    
    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [initGL]);

  return (
    <div className="absolute inset-0 z-0 pointer-events-none" aria-hidden="true">
      <canvas ref={canvasRef} className="block w-full h-full" />
    </div>
  );
}
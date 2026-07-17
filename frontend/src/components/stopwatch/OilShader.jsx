import React, { useRef, useEffect } from 'react';

const OilShader = ({ className }) => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const gl = canvas.getContext('webgl');
        if (!gl) return;

        // Vertex Shader
        const vsSource = `
            attribute vec2 position;
            void main() {
                gl_Position = vec4(position, 0.0, 1.0);
            }
        `;

        // Fragment Shader (The Glossy Oil Effect)
        const fsSource = `
            precision highp float;
            uniform vec2 u_resolution;
            uniform float u_time;

            // Simple 2D Noise
            float random(vec2 st) {
                return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
            }

            float noise(vec2 st) {
                vec2 i = floor(st);
                vec2 f = fract(st);
                float a = random(i);
                float b = random(i + vec2(1.0, 0.0));
                float c = random(i + vec2(0.0, 1.0));
                float d = random(i + vec2(1.0, 1.0));
                vec2 u = f * f * (3.0 - 2.0 * f);
                return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
            }

            void main() {
                vec2 uv = gl_FragCoord.xy / u_resolution.xy;
                
                // Slow fluid movement
                vec2 p = uv * 2.0;
                float t = u_time * 0.2;
                
                float n1 = noise(p + vec2(t, t));
                float n2 = noise(p * 2.0 + vec2(-t, n1));
                
                // Base predominantly deep black
                vec3 color = vec3(0.03, 0.03, 0.04);
                
                // Glossy silver reflections
                float gloss = smoothstep(0.4, 0.8, n2);
                vec3 silver = vec3(0.3, 0.3, 0.35);
                
                // Very subtle oil iridescence (purple/cyan)
                vec3 iridescence = vec3(0.1, 0.05, 0.15) * sin(n1 * 10.0) + vec3(0.0, 0.1, 0.1) * cos(n2 * 8.0);
                
                color += (silver * gloss * 0.4) + (iridescence * 0.15);
                
                gl_FragColor = vec4(color, 1.0);
            }
        `;

        // Compile shaders
        const compileShader = (source, type) => {
            const shader = gl.createShader(type);
            gl.shaderSource(shader, source);
            gl.compileShader(shader);
            return shader;
        };

        const vertexShader = compileShader(vsSource, gl.VERTEX_SHADER);
        const fragmentShader = compileShader(fsSource, gl.FRAGMENT_SHADER);

        const program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        gl.useProgram(program);

        // Quad positions
        const positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
            -1, -1, 1, -1, -1, 1,
            -1, 1, 1, -1, 1, 1,
        ]), gl.STATIC_DRAW);

        const positionLocation = gl.getAttribLocation(program, "position");
        gl.enableVertexAttribArray(positionLocation);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

        const resolutionLocation = gl.getUniformLocation(program, "u_resolution");
        const timeLocation = gl.getUniformLocation(program, "u_time");

        let animationId;
        const startTime = Date.now();

        const resize = () => {
            canvas.width = canvas.offsetWidth * window.devicePixelRatio;
            canvas.height = canvas.offsetHeight * window.devicePixelRatio;
            gl.viewport(0, 0, canvas.width, canvas.height);
            gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
        };
        
        window.addEventListener('resize', resize);
        resize();

        const render = () => {
            const currentTime = (Date.now() - startTime) / 1000;
            gl.uniform1f(timeLocation, currentTime);
            gl.drawArrays(gl.TRIANGLES, 0, 6);
            animationId = requestAnimationFrame(render);
        };
        render();

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationId);
            gl.deleteProgram(program);
        };
    }, []);

    return (
        <canvas 
            ref={canvasRef} 
            className={`absolute top-0 left-0 w-full h-full pointer-events-none object-cover ${className || ''}`}
        />
    );
};

export default OilShader;
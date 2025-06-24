/* --- EFECTO DE FONDO PARTICLES.JS --- */
particlesJS("particles-js", {
    "particles": { "number": { "value": 100, "density": { "enable": true, "value_area": 800 }}, "color": { "value": "#00f6ff" }, "shape": { "type": "circle" }, "opacity": { "value": 0.5, "random": true }, "size": { "value": 3, "random": true }, "line_linked": { "enable": true, "distance": 150, "color": "#ff00ff", "opacity": 0.4, "width": 1 }, "move": { "enable": true, "speed": 2, "direction": "none", "random": true, "straight": false, "out_mode": "out" }},
    "interactivity": { "detect_on": "canvas", "events": { "onhover": { "enable": true, "mode": "repulse" }, "onclick": { "enable": true, "mode": "push" }}},
    "retina_detect": true
});

/* --- EFECTO DE MÁQUINA DE ESCRIBIR (TYPEWRITER) --- */
const typewriterElement = document.getElementById('typewriter');
const words = ["ONLINE", "DECRYPTED", "COMPLETE"];
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const typewriter = async () => {
    let wordIndex = 0;
    while (true) {
        const currentWord = words[wordIndex];
        for (let i = 0; i < currentWord.length; i++) {
            typewriterElement.textContent = currentWord.substring(0, i + 1);
            await sleep(150);
        }
        await sleep(2000);
        for (let i = currentWord.length; i > 0; i--) {
            typewriterElement.textContent = currentWord.substring(0, i - 1);
            await sleep(100);
        }
        await sleep(500);
        wordIndex = (wordIndex + 1) % words.length;
    }
};
typewriter();


document.addEventListener('DOMContentLoaded', () => {

    // --- MOTOR DE RENDERIZADO DE GRÁFICOS (CANVAS) ---
    // (Esta clase es una versión simplificada para este caso de uso)
    class CanvasGraph {
        constructor(canvasId, config) {
            this.canvas = document.getElementById(canvasId);
            if (!this.canvas) return;
            this.ctx = this.canvas.getContext('2d');
            this.config = { xRange: [-10, 10], yRange: [-10, 10], ...config };
            this.resize();
        }

        resize() {
            this.canvas.width = this.canvas.clientWidth;
            this.canvas.height = this.canvas.clientHeight;
        }

        transform(x, y) {
            const { width, height } = this.canvas;
            const [xMin, xMax] = this.config.xRange;
            const [yMin, yMax] = this.config.yRange;
            const px = ((x - xMin) / (xMax - xMin)) * width;
            const py = height - ((y - yMin) / (yMax - yMin)) * height;
            return [px, py];
        }

        drawAxes() {
            const { ctx } = this;
            const [px, py] = this.transform(0, 0);
            ctx.strokeStyle = 'rgba(224, 224, 224, 0.3)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(0, py); ctx.lineTo(this.canvas.width, py);
            ctx.moveTo(px, 0); ctx.lineTo(px, this.canvas.height);
            ctx.stroke();
        }

        plot(func, color, domain) {
            const { ctx } = this;
            const [xMin, xMax] = domain || this.config.xRange;
            const step = (xMax - xMin) / this.canvas.width;
            ctx.strokeStyle = color;
            ctx.lineWidth = 2;
            ctx.beginPath();
            let first = true;
            for (let x = xMin; x <= xMax; x += step) {
                const y = func(x);
                if (isFinite(y)) {
                    const [px, py] = this.transform(x, y);
                    if (first) { ctx.moveTo(px, py); first = false; } 
                    else { ctx.lineTo(px, py); }
                }
            }
            ctx.stroke();
        }

        drawPoint(x, y, color, style = 'closed') {
            const [px, py] = this.transform(x, y);
            this.ctx.fillStyle = color;
            this.ctx.strokeStyle = color;
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.arc(px, py, 5, 0, 2 * Math.PI);
            if (style === 'open') {
                this.ctx.save();
                this.ctx.fillStyle = '#0a0a1a'; this.ctx.fill();
                this.ctx.restore(); this.ctx.stroke();
            } else { this.ctx.fill(); }
        }
        
        render(plots) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.drawAxes();
            plots.forEach(p => {
                if (p.type === 'function') this.plot(p.func, p.color, p.domain);
                else if (p.type === 'point') this.drawPoint(p.x, p.y, p.color, p.style);
            });
        }
    }

    // --- LÓGICA DE RENDERIZADO SVG ---
    function renderSVGGraph(svgId, config) {
        const svg = document.getElementById(svgId);
        if (!svg) return;
        const { xRange, yRange, func, color } = config;
        const [xMin, xMax] = xRange;
        const [yMin, yMax] = yRange;
        svg.innerHTML = ''; // Limpiar SVG anterior
        const width = svg.clientWidth;
        const height = svg.clientHeight;
        const transform = (x, y) => ({
            x: ((x - xMin) / (xMax - xMin)) * width,
            y: height - ((y - yMin) / (yMax - yMin)) * height
        });

        const origin = transform(0, 0);
        svg.innerHTML = `<line x1="0" y1="${origin.y}" x2="${width}" y2="${origin.y}" stroke="rgba(224, 224, 224, 0.3)" /><line x1="${origin.x}" y1="0" x2="${origin.x}" y2="${height}" stroke="rgba(224, 224, 224, 0.3)" />`;
        
        let pathData = '';
        for (let x = xMin; x <= xMax; x += (xMax - xMin) / (width * 2)) {
            const y = func(x);
            if (isFinite(y) && y > yMin && y < yMax) {
                const p = transform(x, y);
                pathData += (pathData === '' || pathData.endsWith(' ')) ? 'M' : 'L';
                pathData += `${p.x} ${p.y} `;
            } else { pathData += ' '; }
        }
        
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute("d", pathData.trim());
        path.setAttribute("stroke", color);
        path.setAttribute("stroke-width", "2");
        path.setAttribute("fill", "none");
        svg.appendChild(path);
    }

    // --- EVENT LISTENERS PARA LOS BOTONES (LÓGICA CORREGIDA) ---
    document.querySelectorAll('.solution-toggle').forEach(button => {
        const solutionContent = button.nextElementSibling;
        const problemId = button.parentElement.id;

        button.addEventListener('click', () => {
            solutionContent.classList.toggle('visible');
            button.textContent = solutionContent.classList.contains('visible') ? 'Ocultar Visualización' : 'Renderizar Visualización';

            // *** LA LÓGICA CLAVE: RENDERIZAR SOLO CUANDO SEA VISIBLE ***
            if (solutionContent.classList.contains('visible') && !solutionContent.dataset.rendered) {
                switch (problemId) {
                    case 'problem-1':
                        new CanvasGraph('graph-continuity', { xRange: [-4, 4], yRange: [-2, 10] }).render([
                            { type: 'function', func: x => 2 * x - 1, color: '#ff00ff', domain: [-4, 2] },
                            { type: 'function', func: x => x * x - 1, color: '#00f6ff', domain: [2, 4] },
                            { type: 'point', x: 2, y: 3, color: 'yellow', style: 'closed' }
                        ]);
                        break;
                    case 'problem-2':
                        new CanvasGraph('graph-limit', { xRange: [-5, 5], yRange: [-5, 5] }).render([
                            { type: 'function', func: x => (x - 1) / (x + 2), color: '#00f6ff' },
                            { type: 'point', x: -1, y: -2, color: 'yellow', style: 'open' }
                        ]);
                        break;
                    case 'problem-3':
                         new CanvasGraph('graph-derivative', { xRange: [-3, 3], yRange: [-5, 10] }).render([
                            { type: 'function', func: x => 2 * x * x, color: '#00f6ff' },
                            { type: 'function', func: x => 4 * x, color: '#ff00ff' }
                         ]);
                        break;
                    case 'problem-4':
                         renderSVGGraph('graph-complex-a', {
                            xRange: [-6, 6], yRange: [-5, 5],
                            func: x => -1 / (6 * (1 - 3 * Math.cos(x))**2),
                            color: '#00f6ff'
                         });
                         const a = 4, b = 1; // Valores de ejemplo para b)
                         const domainEnd = Math.sqrt(a/b);
                         new CanvasGraph('graph-complex-b', { xRange: [-2.5, 2.5], yRange: [-2, 2] }).render([
                            { type: 'function', func: x => (1/Math.sqrt(b)) * Math.asin(x * Math.sqrt(b/a)), color: '#ff00ff', domain: [-domainEnd, domainEnd] }
                         ]);
                        break;
                }
                // Marcar como renderizado para no volver a dibujar
                solutionContent.dataset.rendered = 'true';
            }
        });
    });
});
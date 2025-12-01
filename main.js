const { app, core } = require('photoshop');

const PRESETS = {
    default: [{ x: 0, y: 1 }, { x: 1, y: 0 }],
    full: [{ x: 0, y: 1 }, { x: 1, y: 1 }],
    comet: [{ x: 0, y: 1 }, { x: 0.1, y: 0.7 }, { x: 1, y: 0 }],
    fade_in: [{ x: 0, y: 0 }, { x: 1, y: 1 }], 
    bell: [{ x: 0, y: 0 }, { x: 0.5, y: 1 }, { x: 1, y: 0 }]
};

class CurveEditor {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');

        // Set default curve
        this.currentPreset = 'default';
        this.loadPreset('default');

        // Set canvas size
        this.resizeCanvas();

        // Unset indicator for the point that is being dragged
        this.dragIndex = -1;

        this.initEvents();
        this.draw();
    }

    initEvents() {
        // Simple drag-and-drop logic
        this.canvas.addEventListener('pointerdown', (e) => this.onPointerDown(e));
        this.canvas.addEventListener('pointermove', (e) => this.onPointerMove(e));
        this.canvas.addEventListener('pointerup', () => this.onPointerUp());
        this.canvas.addEventListener('dblclick', (e) => this.onDbClick(e));
        this.canvas.addEventListener('pointerleave', () => this.onPointerLeave());
        window.addEventListener('resize', () => this.resizeCanvas());
    }

    loadPreset(presetName) {
        console.log(`Loading preset: ${presetName}`);
        if (PRESETS[presetName]) {
            this.points = JSON.parse(JSON.stringify(PRESETS[presetName])); 
            this.draw();
            this.currentPreset = presetName;
        }
    }

    // Get opacity value at specified x coordinate
    getValueAt(xPos) {
        // 1. Find the segment this xPos falls into
        let i = 0;
        while (i < this.points.length && this.points[i].x < xPos) {
            i++;
        }

        // Handle edge cases
        if (i === 0) return this.points[0].y; // Before first point
        if (i >= this.points.length) return this.points[this.points.length - 1].y; // After last point

        // 2. Linear Interpolation between point[i-1] and point[i]
        const p1 = this.points[i - 1];
        const p2 = this.points[i];

        // Calculate ratio (0.0 to 1.0) between these two points
        const range = p2.x - p1.x;
        if (range === 0) return p1.y;
        const t = (xPos - p1.x) / range;

        // Lerp Formula
        return p1.y + t * (p2.y - p1.y);
    }

    // Convert mouse coordinates to normalized (0-1) math coordinates
    getMousePos(e) {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: (e.clientX - rect.left) / rect.width,
            y: 1 - ((e.clientY - rect.top) / rect.height)
        };
    }

    // Update canvas size according to parent dimensions
    resizeCanvas() {
        const parent = this.canvas.parentElement;
        if (parent) {
            // Update dimensions
            this.width = parent.clientWidth;
            this.height = parent.clientHeight;

            // Set canvas dimensions
            this.canvas.width = this.width;
            this.canvas.height = this.height;
            console.log(`Canvas size: ${this.width}x${this.height}`);

            // Redraw
            this.draw();
        }
    }

    onPointerDown(e) {
        const m = this.getMousePos(e);

        // 1. Check if clicking an existing point
        const hitDist = 0.05; // Hit box size
        const foundIndex = this.points.findIndex(p => Math.abs(p.x - m.x) < hitDist && Math.abs(p.y - m.y) < hitDist);
        
        if (foundIndex !== -1) {
            // Update drag index
            this.dragIndex = foundIndex;
        } else {
            // 2. Create new point
            this.points.push({ x: m.x, y: m.y });
            this.points.sort((a, b) => a.x - b.x); // Sort points to draw a proper line
            this.draw();
            
            this.dragIndex = this.points.findIndex(p => p.x === m.x && p.y === m.y); // Set drag index to new point
        }
    }

    onPointerMove(e) {
        if (this.dragIndex !== -1) {
            const m = this.getMousePos(e);

            // Get the X-coordinate of the left neighbor (or 0 if it's the first point)
            const minX = this.dragIndex === 0 
                        ? 0 
                        : this.points[this.dragIndex - 1].x;

            // Get the X-coordinate of the right neighbor (or 1 if it's the last point)
            const maxX = this.dragIndex === this.points.length - 1 
                        ? 1 
                        : this.points[this.dragIndex + 1].x;

            // 2. Clamp the new X and Y coordinates
            let newX = Math.max(minX, Math.min(maxX, m.x));
            let newY = Math.max(0, Math.min(1, m.y));

            // Lock X-coordinate for first and last points
            if (this.dragIndex === 0 || this.dragIndex === this.points.length - 1) {
                newX = this.points[this.dragIndex].x; 
            }

            // Update point position and redraw
            this.points[this.dragIndex] = { x: newX, y: newY };
            this.draw();
        }
    }

    onPointerUp() {
        this.dragIndex = -1; // Reset drag index point
    }

    onDbClick(e) {
        const m = this.getMousePos(e);

        // Check if clicking an existing point
        const hitDist = 0.05; // Hit box size
        const foundIndex = this.points.findIndex(p => Math.abs(p.x - m.x) < hitDist && Math.abs(p.y - m.y) < hitDist);
        
        if (foundIndex !== -1 && foundIndex > 0 && foundIndex < this.points.length - 1) {
            // Remove point
            this.points.splice(foundIndex, 1);
            this.draw();
        }
    }

    onPointerLeave() {
        if (this.dragIndex !== -1) {
            this.dragIndex = -1; // Reset drag index point
        }
    }

    draw() {
        // Get dimensions and clear points
        const w = this.width;
        const h = this.height;
        this.ctx.clearRect(0, 0, w, h);

        // Fill background
        this.ctx.fillStyle = '#333';
        this.ctx.fillRect(0, 0, w, h);

        // Draw Grid
        this.ctx.strokeStyle = '#444';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.moveTo(0, h/2); this.ctx.lineTo(w, h/2); // Center line
        this.ctx.stroke();

        // Draw Curve (Connecting lines)
        this.ctx.strokeStyle = '#00AAFF';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        
        this.points.forEach((p, index) => {
            const px = p.x * w;
            const py = (1 - p.y) * h; // Flip Y back for canvas
            if (index === 0) this.ctx.moveTo(px, py);
            else this.ctx.lineTo(px, py);
        });
        this.ctx.stroke();

        // Draw Control Points
        this.ctx.fillStyle = '#FFF';
        this.points.forEach(p => {
            const px = p.x * w;
            const py = (1 - p.y) * h;
            this.ctx.beginPath();
            this.ctx.arc(px, py, 5, 0, 2 * Math.PI);
            this.ctx.fill();
        });
    }

    reset() {
        // Reset spline to default prest values
        this.loadPreset(this.currentPreset);
    }
}

async function runPlugin(editor) {
    console.log("Running plugin...");

    await core.executeAsModal(async () => {
        const doc = app.activeDocument;
        if (!doc) {
            console.log("No active document found.");
            return;
        }

        // Get layers
        const layers = doc.layers;
        const totalLayers = layers.length;
        console.log(`Total layers: ${totalLayers}`);

        // Set opacity levels
        for (let i = 0; i < totalLayers; i++) {
            let layer = layers[i];
            let normalizedX = i / (totalLayers - 1);            // Normalize current layer index to 0.0 - 1.0 range
            let opacityValue = editor.getValueAt(normalizedX);  // Get opacity level from curve
            let finalOpacity = opacityValue * 100;              // Convert to Percentage

            console.log(`Layer ${i}: Setting opacity to ${finalOpacity.toFixed(2)}%`);

            // Apply
            layer.blendMode = "lighten";
            layer.opacity = finalOpacity;
        }
    }, {"commandName": "Apply Curve Trail"});
}

// Initialize Curve Editor
console.log("getting canvas element");
const canvasElement = document.getElementById('curveCanvas');
const presetSelect = document.getElementById('presetSelect');


function waitForLayout(canvasElement, retries = 0) {
    const MAX_RETRIES = 20;
    const parent = canvasElement.parentElement;

    if (parent && parent.clientWidth > 0 && parent.clientHeight > 0) {
        console.log(`Layout ready after ${retries} checks. Initializing CurveEditor.`);

        // Create new curve editor
        const editor = new CurveEditor(canvasElement);



        // Create listener for preset menu
        presetSelect.addEventListener('change', (e) => {
            console.log(`Preset selected: ${e.target.value}`);
            editor.loadPreset(e.target.value);
        });

        // Create button listeners
        document.getElementById('btnReset').addEventListener('click', () => editor.reset());
        document.getElementById('btnRun').addEventListener('click', () => runPlugin(editor));
        return;
    }

    if (retries >= MAX_RETRIES) {
        console.error("Failed to get non-zero dimensions after max retries. Plugin may not size correctly.");
        
        // Fallback is to initialize anyways
        // TODO change this behavior later
        const editor = new CurveEditor(canvasElement);
        document.getElementById('btnReset').addEventListener('click', () => editor.reset());
        document.getElementById('btnRun').addEventListener('click', () => runPlugin(editor));
        return;
    }

    retries++;
    setTimeout(() => waitForLayout(canvasElement, retries), 10); // Wait 10ms before calling next retry
}

if (canvasElement && presetSelect) {
    console.log('Starting layout check loop...');
    waitForLayout(canvasElement);
} else {
    console.error('Missing required elements (canvas or presetSelect)!');
}
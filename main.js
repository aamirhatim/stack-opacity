const { app, core, constants } = require('photoshop');

const PRESETS = {
    default: [{ x: 0, y: 1 }, { x: 1, y: 0 }],
    full: [{ x: 0, y: 1 }, { x: 1, y: 1 }],
    comet: [{ x: 0, y: 0 }, { x: 0.8, y: 0.25 }, { x: 0.9, y: 0.75 }, { x: 1, y: 1 }],
    bell: [{ x: 0, y: 0 }, { x: 0.5, y: 1 }, { x: 1, y: 0 }]
};

class CurveEditor {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');

        // Set initial theme
        this.theme = {};

        // Set default curve
        this.currentPreset = 'default';
        this.points = PRESETS['default'];

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

    getTheme() {
        const primaryTheme = document.getElementById('primary-theme');
        const primaryStyles = window.getComputedStyle(primaryTheme);
        const linkTheme = primaryTheme.querySelector('a');
        const linkStyles = window.getComputedStyle(linkTheme);
        const secondaryTheme = document.getElementById('secondary-theme');
        const secondaryStyles = window.getComputedStyle(secondaryTheme);

        this.theme = {
            backgroundColor: primaryStyles.getPropertyValue('background-color').trim(),
            borderColor: primaryStyles.getPropertyValue('border-color').trim(),
            textColor: primaryStyles.getPropertyValue('color').trim(),
            linkColor: linkStyles.getPropertyValue('color').trim(),
            secondary: {
                backgroundColor: secondaryStyles.getPropertyValue('background-color').trim(),
                textColor: secondaryStyles.getPropertyValue('color').trim()
            }
        };
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
        // Get current theme
        this.getTheme();

        // Get dimensions and clear points
        const w = this.width;
        const h = this.height;
        this.ctx.clearRect(0, 0, w, h);

        // Fill background
        this.ctx.fillStyle = this.theme.backgroundColor;
        this.ctx.fillRect(0, 0, w, h);

        // Draw Grid
        this.ctx.strokeStyle = this.theme.borderColor;
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        const steps = [0.25, 0.5, 0.75];

        // Draw Horizontal Lines
        for (let step of steps) {
            const y = h * step;
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(w, y);
        }

        // Draw Vertical Lines
        for (let step of steps) {
            const x = w * step;
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, h);
        }

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
        this.ctx.strokeStyle = this.theme.textColor;
        this.ctx.lineWidth = 2.5;
        this.points.forEach(p => {
            const px = p.x * w;
            const py = (1 - p.y) * h;
            this.ctx.beginPath();
            this.ctx.arc(px, py, 5, 0, 2 * Math.PI);
            this.ctx.stroke();
        });
    }

    invert() {
        // Apply the X-axis mirror transformation
        this.points = this.points.map(p => {
            return {
                x: 1.0 - p.x,
                y: p.y
            };
        });

        // Re-sort the array
        this.points.sort((a, b) => a.x - b.x);
        this.draw();
    }

    reset() {
        // Reset spline to default prest values
        this.loadPreset(this.currentPreset);

        // Reset blend mode dropdown to Lighten
        const blendModeSelect = document.getElementById('blendModeSelect');
        if (blendModeSelect) {
            blendModeSelect.selectedIndex = 7; // 8th item in dropdown menu (see index.html)
        }
    }
}

function getBlendMode(modeString) {
    if (!modeString) return constants.BlendMode.NORMAL;

    switch (modeString) {
        case 'normal': return constants.BlendMode.NORMAL;
        case 'dissolve': return constants.BlendMode.DISSOLVE;

        case 'darken': return constants.BlendMode.DARKEN;
        case 'multiply': return constants.BlendMode.MULTIPLY;
        case 'colorBurn': return constants.BlendMode.COLORBURN;
        case 'linearBurn': return constants.BlendMode.LINEARBURN;
        case 'darkerColor': return constants.BlendMode.DARKERCOLOR;

        case 'lighten': return constants.BlendMode.LIGHTEN;
        case 'screen': return constants.BlendMode.SCREEN;
        case 'colorDodge': return constants.BlendMode.COLORDODGE;
        case 'linearDodge': return constants.BlendMode.LINEARDODGE;
        case 'lighterColor': return constants.BlendMode.LIGHTERCOLOR;

        case 'overlay': return constants.BlendMode.OVERLAY;
        case 'softLight': return constants.BlendMode.SOFTLIGHT;
        case 'hardLight': return constants.BlendMode.HARDLIGHT;
        case 'vividLight': return constants.BlendMode.VIVIDLIGHT;
        case 'linearLight': return constants.BlendMode.LINEARLIGHT;
        case 'pinLight': return constants.BlendMode.PINLIGHT;
        case 'hardMix': return constants.BlendMode.HARDMIX;

        case 'difference': return constants.BlendMode.DIFFERENCE;
        case 'exclusion': return constants.BlendMode.EXCLUSION;
        case 'subtract': return constants.BlendMode.SUBTRACT;
        case 'divide': return constants.BlendMode.DIVIDE;

        case 'hue': return constants.BlendMode.HUE;
        case 'saturation': return constants.BlendMode.SATURATION;
        case 'color': return constants.BlendMode.COLOR;
        case 'luminosity': return constants.BlendMode.LUMINOSITY;

        default: return constants.BlendMode.NORMAL;
    }
}

async function runPlugin(editor) {
    console.log("Running plugin...");

    const blendModeSelect = document.getElementById('blendModeSelect');
    const selectedBlendMode = getBlendMode(blendModeSelect ? blendModeSelect.value : null);

    console.log(`Selected blend mode: ${selectedBlendMode}`);

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
            layer.blendMode = selectedBlendMode;
            layer.opacity = finalOpacity;
        }
    }, { "commandName": "Apply Curve Trail" });
}

// Initialize Curve Editor
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
        document.getElementById('btnInvert').addEventListener('click', () => editor.invert());
        document.getElementById('btnRun').addEventListener('click', () => runPlugin(editor));
        return;
    }

    if (retries >= MAX_RETRIES) {
        console.error("Failed to get non-zero dimensions after max retries. Plugin may not size correctly.");

        // Fallback is to initialize anyways
        // TODO change this behavior later
        const editor = new CurveEditor(canvasElement);
        document.getElementById('btnReset').addEventListener('click', () => editor.reset());
        document.getElementById('btnInvert').addEventListener('click', () => editor.invert());
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
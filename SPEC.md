1. Overview

Pixel Painter is a browser-based pixel art coloring application.

Users can:

Paint on a blank pixel grid

Upload an image and convert it into a pixelated grid

Recolor pixels manually

Undo strokes

Export the final artwork as a PNG

The goal is a clean, performant MVP with no external drawing libraries.

2. Tech Stack

Framework: Next.js (App Router)

Language: TypeScript

Rendering: HTML Canvas (2D context)

State: React state + refs

Styling: Minimal CSS (no frameworks)

No external canvas or drawing libraries

3. Core Architecture
3.1 Data Model

Grid State:

type GridState = {
  gridW: number
  gridH: number
  colors: Uint32Array
}


colors.length === gridW * gridH

Colors stored as ARGB Uint32: 0xAARRGGBB

Index formula:

const idx = y * gridW + x

3.2 Color Helpers
packColor(r: number, g: number, b: number, a = 255): number
unpackColor(argb: number): { r: number; g: number; b: number; a: number }

3.3 Undo System
type StrokeDiff = {
  idx: number
  before: number
  after: number
}

type Stroke = {
  diffs: StrokeDiff[]
}


One stroke per pointerdown session

Undo pops last stroke and restores previous values

Support Cmd+Z / Ctrl+Z

4. Functional Requirements
4.1 Grid Rendering

Use a single <canvas>

Each cell is a square

Cell size determined by zoom level

Optional grid lines toggle

Efficient redraw on state change

Prevent rendering outside bounds

4.2 Painting Interaction

Use Pointer Events:

pointerdown → begin stroke

pointermove (if active pointer) → paint cell

pointerup / pointercancel → end stroke

Rules:

Only paint if within bounds

Do not repaint cell if color is unchanged

Track activePointerId

Works for mouse + touch

4.3 Grid Controls

Resolution slider:

16 → 128

Step 8

Zoom slider:

controls cellSize

Toggle grid lines

4.4 Image Upload & Pixelation

Function:

pixelateImageToGrid(file: File, gridW: number)


Behavior:

Load image safely

Preserve aspect ratio

Compute gridH

Clamp grid sizes (min 8, max 256)

Draw image to offscreen canvas at gridW x gridH

Read ImageData

Convert RGBA → ARGB Uint32

Return { gridW, gridH, colors }

Add:

Upload button

Re-pixelate button

Resolution slider

4.5 Export PNG

Function:

exportGridAsPNG({
  gridW,
  gridH,
  colors,
  scale
})


Behavior:

Create new offscreen canvas

Render each pixel as scale x scale

No grid lines

Return PNG Blob

Trigger download

Export scale options:

8

12

16

24

32

5. UI Layout

Three-column layout:

Left:

Color swatch palette

Selected color preview

Center:

Canvas

Zoom slider

Grid toggle

Right:

Upload image

Resolution slider

Re-pixelate

Export PNG

Export scale dropdown

6. Performance Constraints

Grid max size: 256 x 256

Clamp image size before reading pixel data

Avoid unnecessary full re-renders

Avoid memory leaks

Use useRef for canvas

Avoid expensive React re-renders on every pointer move

7. Non-Goals (MVP)

Do NOT implement:

Layers

Multi-canvas compositing

Cloud storage

Collaboration

AI auto-coloring

Dithering algorithms

Advanced filters

8. Milestones
Milestone 1

Blank grid

Paint by drag

Undo

Milestone 2

Image upload

Pixelation pipeline

Milestone 3

Export PNG

UI polish

9. Edge Cases

Large image uploads

Very small aspect ratios

Rapid pointer movement

Undo with no strokes

Re-upload after painting

Changing resolution mid-session

10. Definition of Done

MVP is complete when:

User can upload image

Image becomes pixel grid

User can repaint any cell

Undo works reliably

Export generates correct PNG

No runtime errors

No console warnings
🎨 Pixel Painter

A calm little pixel studio built with Next.js, TypeScript, and Canvas.

Turn any image into pixel art. Repaint it. Slow down. Export your creation.

✨ What You Can Do

Paint on a customizable pixel grid

Upload an image and convert it to pixel art

Recolor pixels manually with click + drag

Undo strokes (Cmd/Ctrl + Z)

Export high-resolution PNGs

🛠 Built With

Next.js (App Router)

TypeScript

HTML Canvas (2D API)

Native browser APIs only

No drawing libraries. No heavy abstractions. Just pixels.

🚀 Run Locally
npm install
npm run dev


Visit:

http://localhost:3000

🧠 Under the Hood

Grid stored as Uint32Array (ARGB format)

Image pixelation via offscreen canvas + getImageData()

Pointer Events power painting interactions

Diff-based stroke history for efficient undo

📦 Scope

MVP includes painting, pixelation, undo, and export.

Future ideas: bucket fill, palette extraction, symmetry mode.

📄 License

MIT
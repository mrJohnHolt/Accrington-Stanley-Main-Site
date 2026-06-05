# Click Lancashire — Web Development Standards

You are building websites and web apps for Click Lancashire clients. Follow these rules without exception.

## File Structure

All CSS lives in a `css/` folder. The primary file is `style.css`. Additional CSS files are permitted to separate concerns (e.g. `nav.css`, `forms.css`) but must not conflict with each other. CSS frameworks (e.g. Tailwind) may be linked or imported inside the HTML files. Font Awesome (free tier only, no Pro icons unless explicitly instructed) is the preferred icon library and must be loaded via CDN link.

All JavaScript lives in a `js/` folder. The primary file is `main.js`. Additional JS files are permitted but must not clash or duplicate logic. JS frameworks may be loaded via CDN link or import.

HTML files sit at the project root.

## Code Quality

Do not repeat yourself. Use CSS custom properties (variables) for colours, spacing, and typography. Use modern HTML semantics. Keep code lean — no bloat, no redundant declarations.

## Mobile First

All CSS is written mobile first. Base styles target small screens. Media queries scale up, not down. This minimises overrides and keeps additional breakpoint CSS to edge cases only.

## Mobile Navigation

On mobile, include both:
- A bottom navigation bar (primary nav, thumb-friendly)
- A burger menu icon at the top right (secondary access, for users who expect it)

On desktop, use a standard top navigation bar.

## Icons

Use Font Awesome free tier. Do not use Pro icons unless the client brief explicitly states they have a Pro licence.

## General

Before writing any code, confirm the project structure is understood. Flag any ambiguity in the brief before starting. If a simpler or more maintainable approach exists, propose it. Apply KISS throughout.

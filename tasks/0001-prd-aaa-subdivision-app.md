# AAA Subdivision Modeling Web App PRD

## 1. Introduction / Overview
The AAA Subdivision Modeling Web App is a high-performance, browser-based 3D modeling environment that delivers professional-grade subdivision surface workflows in a single HTML file. It targets both professional 3D artists and hobbyists, enabling rapid iteration on high-quality meshes with granular crease controls, premium lighting, and glTF export. The goal is to provide a sleek, modern interface that accelerates modeling tasks while producing studio-ready results directly in the browser.

## 2. Goals
- Reduce the time required to complete a standard subdivision modeling task (e.g., creating a hero prop) by at least 25% compared to the current baseline tools used by beta testers.
- Achieve a beta user satisfaction score of 4.5/5 or higher for usability, visual quality, and performance.
- Support smooth interaction and viewport updates on scenes up to 100k+ polygons.
- Enable seamless export of models with embedded materials via glTF.

## 3. User Stories
- As a professional 3D artist, I want real-time subdivision previews so I can judge the final surface quality without leaving the app.
- As a hobbyist, I want a straightforward way to start from primitives and tweak crease values so I can learn subdivision modeling quickly.
- As a professional artist, I need to import existing meshes and continue refining them with subdivision and crease controls to fit client pipelines.
- As any user, I want customizable keyboard shortcuts so I can align the workflow with my personal preferences and work faster.
- As any user, I want high-end lighting presets and materials so my models look presentable without extensive manual setup.
- As any user, I want glTF export with embedded materials so I can transfer assets into other tools and engines without manual relinking.

## 4. Functional Requirements
1. The system must load in a single HTML file and initialize a WebGL-based 3D viewport (e.g., leveraging Three.js or Babylon.js).
2. The system must allow users to create primitives (cube, sphere, cylinder, plane) and display them with adjustable subdivision levels.
3. The system must enable importing external mesh files (OBJ, glTF) with subdivision support applied post-import.
4. The system must provide real-time subdivision preview toggles with adjustable iteration depth per object.
5. The system must allow setting crease values for individual edges, faces, and vertices with numeric input and interactive gizmos.
6. The system must offer transform tools (move, rotate, scale) with keyboard shortcuts and responsive gizmos.
7. The system must support customizable keyboard shortcuts with import/export of shortcut presets.
8. The system must provide preset lighting setups and material libraries, including HDR environment maps and physically based materials.
9. The system must offer an autosave/versioning mechanism to prevent data loss and allow recovery of recent states.
10. The system must export the active scene to glTF format with embedded materials, textures, and subdivision modifiers baked or preserved as appropriate.
11. The system must include a performance HUD (FPS, poly count) to help users monitor scene complexity.
12. The system must support undo/redo with at least 50 levels of history for modeling operations.
13. The interface must be a single-page layout with dockable panels (viewport, properties, outliner, material editor) and customizable panel arrangements.
14. The system must support dark theme styling with metallic accents and consistent typography for a professional aesthetic.
15. The system must provide contextual tooltips and a quickstart guide within the UI for onboarding new users.

## 5. Non-Goals (Out of Scope)
- Sculpting tools (e.g., dynamic topology sculpting) are not included in this release.
- Animation or rigging workflows are out of scope.
- Real-time collaboration or multi-user editing is not part of this version.
- Support for native desktop app packaging (e.g., Electron) is not included.
- Export formats other than glTF are not supported in this release.

## 6. Design Considerations
- Adopt a dark, high-contrast theme with metallic accents inspired by AAA DCC tools (e.g., Substance 3D, Cinema 4D).
- Ensure dockable panels can snap to the viewport edges, with minimal chrome and subtle drop shadows.
- Provide responsive layout behavior for large desktop displays (1440p and 4K), with graceful scaling down to 1080p.
- Use consistent iconography for tools, ideally vector-based for crisp rendering.
- Integrate high-quality HDRI environments for lighting presets to highlight surface detail.

## 7. Technical Considerations
- Utilize WebGL via Three.js or Babylon.js for rendering; ensure fallback handling for unsupported browsers.
- Implement a subdivision surface algorithm that supports crease values (e.g., Catmull-Clark with crease weighting).
- Optimize for GPU acceleration and reduce CPU-bound operations (consider worker threads for heavy mesh processing).
- Implement autosave using IndexedDB or local storage with version caps to manage disk usage.
- Ensure glTF export embeds textures/materials and handles subdivision data (baking to geometry or storing extension metadata).
- Provide keyboard shortcut customization through a JSON configuration stored locally, with import/export capabilities.
- Include robust error handling for file import failures or unsupported mesh data, with user-friendly messaging.

## 8. Success Metrics
- 25% reduction in median time for beta testers to create a reference asset compared to baseline workflows (tracked through usability testing).
- 90th percentile viewport FPS above 45 FPS for 100k polygon scenes on target hardware (modern discrete GPUs, mid-tier laptops).
- Beta user satisfaction survey averages ≥4.5/5 for performance, usability, and visual quality.
- At least 80% of beta testers successfully export glTF files with embedded materials without requiring support intervention.

## 9. Open Questions
- What is the exact baseline workflow/time measurement for comparison in the success metric? (Need definition and test plan.)
- Which specific HDR environments and material presets should ship by default, and are there licensing constraints?
- Should imported mesh formats beyond OBJ/glTF be prioritized for the next iteration (e.g., FBX)?
- Are there accessibility requirements (e.g., colorblind-safe themes, screen reader support) that need to be considered?
- How will autosave/versioning interact with the single HTML file distribution model (e.g., hosted vs. local file usage)?


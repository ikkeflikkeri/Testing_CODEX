# AAA Subdivision Modeling Web App PRD

## 1. Introduction / Overview
The AAA Subdivision Modeling Web App is a flagship, single-file (one HTML document) WebGL experience that delivers studio-grade subdivision surface modeling in the browser. Targeted at both professional 3D artists and aspirational hobbyists, the app combines rapid creation tools, precise crease editing, cinematic lighting, and effortless glTF export. The objective is to match the polish and responsiveness of high-end desktop DCCs while remaining instantly deployable and easy to share via a solitary HTML artifact.

### Problem Statement
Existing browser-based modeling tools are often compromised—either too lightweight for professional use or too complex for newcomers. Users need a fast, modern, visually stunning environment that supports high-poly subdivision workflows without installation friction.

### Vision
Deliver a frictionless, AAA-quality modeling studio that runs anywhere modern WebGL is supported, empowering artists to ideate, iterate, and export production-ready assets in minutes.

## 2. Goals
1. **Workflow Acceleration:** Reduce the median time required to block out, refine, and export a hero prop by ≥25% versus baseline workflows recorded from target beta testers.
2. **Experience Satisfaction:** Achieve a post-beta SUS (System Usability Scale) score of ≥85 and qualitative praise for visual fidelity, lighting, and layout.
3. **Performance Headroom:** Maintain ≥45 FPS at the 90th percentile for 100k–150k polygon scenes on target hardware (RTX 2060 / RX 5600M class GPUs).
4. **Export Reliability:** Ensure ≥80% of recorded export attempts succeed on the first try, with embedded PBR materials validated in downstream tools (e.g., Blender, Unreal Engine).
5. **Onboarding Efficiency:** Deliver an in-app onboarding flow that enables new users to complete a guided modeling task within 10 minutes.

## 3. User Stories
| Persona | Story | Acceptance Criteria |
| --- | --- | --- |
| Pro 3D Artist | As a professional 3D artist, I want real-time subdivision previews with crease weight visualization so I can judge surface continuity without bouncing to another tool. | - Subdivision toggle applies instantly (<150ms latency).<br>- Crease weights display via color overlay when requested.<br>- Final render preview matches glTF export within 5% deviation in shading.
| Hobbyist Creator | As a hobbyist, I want curated primitive starting points and contextual help so I can learn professional techniques quickly. | - Library offers ≥8 starter meshes with descriptive thumbnails.<br>- Hover tooltips explain crease and subdivision concepts.<br>- Tutorial overlay can be completed in <8 minutes.
| Pipeline TD | As a pipeline technical director, I need to import client meshes, adjust crease edges, and export to glTF with materials intact for downstream approval. | - Import supports OBJ and glTF, preserving smoothing groups.<br>- Crease adjustments persist through export/import round-trip.<br>- Export includes embedded textures and PBR parameters validated via automated test script.
| Power User | As any user, I want to customize shortcuts, layout, and render presets so I can align the app with my muscle memory and project style. | - Shortcut editor supports search, conflict resolution, and preset import/export.<br>- Layout profiles can be saved/loaded locally.<br>- Lighting presets (minimum 6) can be duplicated and edited.
| QA / Support | As support staff, I want telemetry and logging hooks so I can diagnose performance or export issues remotely. | - Anonymous usage metrics toggle is present.<br>- Error logs can be exported as JSON.<br>- Performance HUD can be recorded for support tickets.

## 4. Functional Requirements
1. **Single-File Delivery:** Ship as one minified HTML file (<10 MB target) bundling scripts, styles, and assets via data URIs or lazy-loaded CDN references; load time <5 seconds on 50 Mbps.
2. **Viewport Initialization:** Initialize a WebGL 2.0 renderer (Three.js or Babylon.js) with HDR environment support, tone mapping, and ACES color grading.
3. **Scene Management:** Provide an outliner panel for object hierarchy, visibility toggles, and grouping/parenting operations.
4. **Primitive Creation:** Offer primitives (cube, sphere, cylinder, plane, torus, quad sphere) with subdivision level sliders (0–6) and live preview.
5. **Mesh Import:** Support drag-and-drop and file picker import for OBJ and glTF (embedded or external textures) with automatic unit scaling and orientation normalization.
6. **Subdivision Controls:** Allow per-object subdivision modifier stacks with preview/bake toggles and adaptive tessellation for viewport vs. export.
7. **Crease Editing:** Enable crease weights (0–1) for edges/faces/vertices via numeric inputs, hotkeys (e.g., Shift+Middle drag), and property panel sliders with snapping increments.
8. **Transform Toolkit:** Provide gizmos for translate/rotate/scale, screen-space alignment, precision input fields, and quick duplicate (Shift+D) plus array modifier support.
9. **Viewport Navigation:** Implement orbit/pan/dolly controls with inertia, focus-on-selection (F key), and camera bookmarking.
10. **Material Authoring:** Include a PBR material editor with base color, metalness, roughness, normal, emissive controls, and texture slots; support drag-and-drop texture assignment.
11. **Lighting Presets:** Ship ≥6 lighting rigs (studio softbox, rim light, HDRI skylight, cinematic warm/cool, etc.) with exposure controls and post-process effects (bloom, vignette, SSAO toggle).
12. **Performance HUD:** Display FPS, frame time, draw calls, and poly/vertex counts; offer automated performance capture for support logs.
13. **Undo/Redo Stack:** Provide 100 levels of undo/redo covering geometry edits, transforms, crease adjustments, and material changes.
14. **Customization Layer:** Allow saving/loading of workspace layouts, themes (variations of dark metallic palette), and shortcut profiles to IndexedDB with optional JSON export.
15. **Autosave & Versioning:** Autosave every 60 seconds and on critical actions with configurable interval; maintain last 10 versions per project, accessible via recovery dialog.
16. **Guided Onboarding:** Present a first-launch guided tour highlighting key panels, plus a learn tab with embedded quickstart video or animated GIFs.
17. **Help & Support:** Integrate inline documentation search, link to FAQ, and provide “Report Issue” flow that packages logs and scene snapshot.
18. **glTF Export:** Export current scene to glTF 2.0 with embedded textures, optional Draco compression, and metadata to indicate subdivision levels. Provide preview of export size and estimated bake time.
19. **Quality Assurance Hooks:** Include developer console commands for running automated scene validation (e.g., checking non-manifold geometry before export) and toggling debug overlays.
20. **Security & Privacy:** Operate fully client-side with explicit consent dialogs for telemetry; gracefully degrade if telemetry is disabled.

## 5. Non-Goals (Out of Scope)
- Sculpting (dynamic topology, brushes) and procedural modeling systems.
- Character rigging, animation timelines, or physics simulation.
- Multi-user real-time collaboration or cloud project storage.
- Native desktop packaging (Electron, progressive web app install) for initial release.
- Export to formats beyond glTF 2.0 (FBX, USDZ, etc.).
- Mobile or tablet optimization beyond basic responsive layout.

## 6. Design Considerations
- **Visual Language:** Dark graphite base with subtle metallic gradients, neon accent highlights (#4FD1FF) for active states, and typography using Inter or Roboto Mono for code-like precision.
- **Panel System:** Dockable, collapsible panels with magnetic snapping, resize handles, and customizable opacity; viewport maximization via single key (Tab).
- **Iconography:** SVG icon set aligned with material design sharpness; states include hover, active, disabled with consistent contrast ratios.
- **Feedback & Microinteractions:** Smooth 150ms transitions for panel animations, haptic-like audio cues (muted by default), and real-time highlighting of selected components.
- **Lighting Showcases:** Include a “Gallery Mode” that renders turntable animations using preset lighting to showcase assets, emphasizing AAA polish.
- **Accessibility:** Support colorblind-safe overlays for selection highlights, adjustable font size (90%–130%), and keyboard-only navigation for core workflows.
- **Branding:** Splash screen with animated logo and shimmering shader background reinforcing high-end positioning.

## 7. Technical Considerations
- **Rendering Stack:** Prefer Three.js r155+ with WebGL2 context, PMREM support for HDR, and GPU-based subdivision shaders where available; detect WebGPU for future uplift.
- **Performance Optimization:** Utilize instanced rendering for gizmos, frustum culling for out-of-view objects, and adaptive LOD during navigation to sustain frame rate.
- **Worker Architecture:** Offload heavy mesh computations (subdivision, crease solving) to Web Workers using transferable objects to prevent UI hitching.
- **Asset Management:** Store default HDRIs and materials as compressed basis/ktx2 textures; lazy-load only when selected to keep initial payload minimal.
- **Data Persistence:** Use IndexedDB with project metadata (name, thumbnail, timestamp) and handle quota management with user prompts when storage nears limits.
- **Telemetry:** Implement optional analytics capturing task timings, hardware info (GPU, RAM), and error stacks to inform optimization priorities while respecting privacy.
- **Testing Strategy:** Define automated regression scenes to validate subdivision accuracy, crease weight consistency, and export fidelity using headless WebGL rendering in CI.
- **Browser Compatibility:** Support latest Chrome, Edge, Firefox, and Safari (Technology Preview if needed); provide compatibility warnings for unsupported features.
- **Localization:** Architect UI strings for future localization (English for MVP), using ICU message format.
- **Security:** Sanitize imported file metadata, enforce Content Security Policy (no external script eval), and validate user-provided textures before use to prevent malicious payloads.

## 8. Success Metrics
- **Productivity:** ≥25% reduction in task completion time during structured usability tests compared to baseline (tracked via built-in session recorder).
- **Performance:** 90th percentile viewport FPS ≥45 and median frame time ≤20ms on reference hardware under defined stress scenes (50k, 100k, 150k polygons).
- **Quality:** ≥90% positive qualitative feedback on visual design in beta surveys; Net Promoter Score ≥40.
- **Adoption:** ≥60% of beta participants use the app at least 3 times per week during test period; ≥70% enable autosave/versioning.
- **Reliability:** Crash-free sessions ≥99% across beta telemetry; export success rate ≥95% after addressing validation warnings.

## 9. Open Questions
- **Baseline Definition:** Which existing tools (e.g., Blender, Maya) form the baseline for time comparison, and what tasks compose the benchmark suite?
- **Licensing & Assets:** Are premium HDRIs/materials budgeted for licensing, or must they be procedurally generated / CC0 assets?
- **Telemetry Policy:** What privacy/legal requirements govern analytics storage, retention, and user consent prompts?
- **Enterprise Requirements:** Do we need SSO or offline packaging for enterprise clients in roadmap planning?
- **Hardware Targets:** Should we certify performance on integrated GPUs (e.g., Apple M1, Intel Xe) or focus solely on discrete GPUs for AAA fidelity?
- **Extensibility:** Is a plug-in architecture desired post-MVP, influencing early architecture decisions?
- **Brand Alignment:** Are there existing brand guidelines (logo, colors, tone) that must inform the UI theme?
- **Compliance:** Are there regional accessibility or data regulations (e.g., WCAG 2.1 AA, GDPR) that must be met for launch?


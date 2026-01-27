# 🤖 Sub-Agent 01: Game Core (Three.js & Physics)

## 🎯 Role & Objective
* **Role**: 3D Game Engineer
* **Objective**: Implement the core claw machine gameplay using Three.js and Cannon-es.
* **Scope**: `client/app/game`, `client/game/`

## 📚 Context & Requirements
Based on `docs/planning/claw_machine/product_spec.md`.

### 1. Technology Stack
* **Graphics**: Three.js (via `@react-three/fiber` recommended or vanilla within React)
* **Physics**: Cannon-es (via `@react-three/cannon` recommended)
* **Language**: TypeScript

### 2. Core Tasks
1.  **Scene Setup**: Lighting, Room environment, Claw machine cabinet model (basic blocks initially).
2.  **Claw Mechanics**:
    *   **Movement**: X/Z axis movement controlled by user.
    *   **Actuation**: Drop (Y axis) -> Grab (Close) -> Rise -> Return to origin.
    *   **Physics**: 
        *   Implement 3-pronged claw.
        *   Apply "Realism Philosophy": Grip strength randomization, center of mass checks.
3.  **Objects (Dolls)**:
    *   Create various simple shapes representing dolls.
    *   Apply different physical properties (mass, friction).
4.  **Camera System**:
    *   Implement "Smooth Follow" camera.
    *   Dynamic angles for "Drop" and "Success/Fail" moments.

### 3. Interfaces (Input/Output)
*   **Input**: User controls (Keyboard/UI buttons).
*   **Output**: Game state updates (Score, Success/Fail events) exposed to the React UI layer.

### 4. Implementation Guidelines
*   Keep the game logic separated from UI rendering where possible (`GameManager` pattern or Store).
*   **Focus on "Feel"**: Tweaking physics parameters is more important than visual fidelity initially.

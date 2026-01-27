# 🎼 Agent Orchestration: Master Plan

This document outlines how the sub-agents collaborate to achieve the "Claw Addict" project goals.

## 🔄 Workflow

1.  **Phase 1: Foundation (Parallel)**
    *   **Agent 01 (Game)**: Sets up an empty Three.js canvas with basic physics world.
    *   **Agent 02 (Web)**: Sets up the Next.js layouts and routing.
    *   **Agent 03 (Server)**: Sets up the Express server listening on port 3000.

2.  **Phase 2: Integration I (Game Embedding)**
    *   Agent 02 creates the `/game` page structure.
    *   Agent 01 mounts the Three.js Canvas into Agent 02's page.
    *   *Result*: A web page where you can see the 3D scene.

3.  **Phase 3: Logic & Data (Parallel)**
    *   **Agent 01 (Game)**: Implements the claw movement and grab logic.
    *   **Agent 03 (Server)**: Implements the Ranking API and Database.

4.  **Phase 4: Integration II (Full Loop)**
    *   Game ends -> Score generated (Agent 01).
    *   UI displays score -> Calls API (Agent 02).
    *   Server saves score -> Returns new Rank (Agent 03).

## 📡 Communication Protocol
*   **Game <-> Web Client**: Custom Events or React State access (e.g., `onGameEnd(score)` callback).
*   **Web Client <-> Backend**: REST API over HTTP.

## ⚠️ Common Pitfalls to Avoid
*   **Agent 01**: Don't build UI buttons inside the Canvas (unless necessitated by 3D UI). Let Agent 02 handle HTML overlays.
*   **Agent 02**: Don't implement Game Logic. Trust the Event callbacks from Agent 01.
*   **Agent 03**: Don't over-engineer auth. Keep it minimal for MVP.

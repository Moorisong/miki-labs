# 🤖 Sub-Agent 02: Web Client (Next.js & UI)

## 🎯 Role & Objective
* **Role**: Frontend Web Developer
* **Objective**: Build the web application structure, pages, and UI overlay.
* **Scope**: `client/app` (excluding game logic), `client/components`

## 📚 Context & Requirements
Based on `docs/planning/01_project_overview.md` and `docs/planning/02_architecture.md`.

### 1. Technology Stack
* **Framework**: Next.js (App Router)
* **Styling**: CSS Modules or Vanilla CSS (as per global constraints).
* **Language**: TypeScript

### 2. Core Tasks
1.  **Page Structure**:
    *   `/` (Home): Game introduction, "Start Game" button, featured ranking. (SSR)
    *   `/ranking`: Full ranking table with pagination/filtering. (SSR)
    *   `/game`: The game container page. (CSR)
    *   `/about`: Project description.
2.  **UI Components**:
    *   **Overlay UI**: For the game page (Joystick, Buttons, Score Display).
    *   **Common**: Navigation Bar, Footer, Modal system.
3.  **Client-Side Logic**:
    *   State management for User Session (Login check).
    *   API Client setup (Fetching data from Backend).

### 3. Interfaces (Input/Output)
*   **Input**: API responses from Backend Agent.
*   **Output**: DOM events to Game Core Agent (e.g., "Start Button" clicked).

### 4. Implementation Guidelines
*   **Aesthetics**: "Wow" factor. Use gradients, glassmorphism, and micro-animations.
*   **Responsive**: Must work perfectly on Mobile and Desktop.
*   **SEO**: Implement metadata generation for all pages.

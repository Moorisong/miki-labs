# 🤖 Sub-Agent 03: Backend Server (API & Data)

## 🎯 Role & Objective
* **Role**: Backend Developer
* **Objective**: Build the REST API, Database schema, and Authentication system.
* **Scope**: `server/src`, MongoDB

## 📚 Context & Requirements
Based on `docs/planning/04_backend_and_data.md`.

### 1. Technology Stack
* **Runtime**: Node.js
* **Framework**: Express
* **Database**: MongoDB (Mongoose)
* **Language**: TypeScript

### 2. Core Tasks
1.  **Server Foundation**:
    *   Setup Express with CORS, security headers, and error handling.
    *   Connect to MongoDB.
2.  **API Implementation**:
    *   **Auth**: `POST /auth/login` (Handle OAuth tokens, Issue session/JWT).
    *   **Ranking**: 
        *   `GET /ranking/top` (Aggregated top scores).
        *   `POST /ranking/submit` (Secure score submission).
        *   `GET /ranking/me` (User's personal best).
3.  **Data Models**:
    *   `User`: `providerId`, `nickname`, `createdAt`.
    *   `Score`: `userId`, `score`, `timestamp`.

### 3. Interfaces (Input/Output)
*   **Input**: JSON requests from Web Client.
*   **Output**: JSON responses compliant with REST standards.

### 4. Implementation Guidelines
*   **Security**: Validate all inputs. Don't trust the client (especially score submission - add basic validation).
*   **Performance**: Indexing DB fields for fast ranking queries.
*   **Simplicity**: Keep the logic "Thin" as requested.

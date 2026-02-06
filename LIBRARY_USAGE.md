# 📚 Library Usage & Technical Reference

This document provides a detailed overview of the key libraries and technologies used in the **MKPDesigns** project. Each entry explains *why* the library was chosen and *how* it is implemented in our specific context, with references to the codebase.

## 🖥️ Client-Side (Frontend)

### Core Framework
-   **React 19** (`react`, `react-dom`): The latest version of the React library for building user interfaces.
    -   *Usage*: Used for all component logic (`client/src/components/*`, `client/src/pages/*`). We leverage features like Hooks (`useState`, `useEffect`, `useContext`) extensively.
-   **Vite** (`vite`): A lightning-fast build tool and development server.
    -   *Usage*: Handles hot module replacement (HMR) and optimized building. Configuration can be found in `client/vite.config.js`.

### Styling & UI
-   **Tailwind CSS 4** (`tailwindcss`, `@tailwindcss/vite`): A utility-first CSS framework for rapid UI development.
    -   *Usage*: Applied globally via classes in JSX (e.g., `className="bg-primary text-white"`). Configuration is in the CSS files and vite config.
-   **Lucide React** (`lucide-react`): A clean, consistent icon library.
    -   *Usage*: Imported in components to provide visual context (e.g., `Trash2` for delete actions in `Designs.jsx`, `Mail`/`Lock` in `Login.jsx`).
-   **Framer Motion** (`framer-motion`): A production-ready motion library for React.
    -   *Usage*: Powers animations like page transitions and mounting effects (referenced in `Login.jsx` styles).

### State Management & Routing
-   **React Router 7** (`react-router-dom`): Handles client-side navigation.
    -   *Usage*: Configured in `client/src/App.jsx` to manage routes like `/login`, `/dashboard`, and protected routes via `ProtectedRoute.jsx`.
-   **Context API**: Built-in React state management.
    -   *Usage*: `AuthContext.jsx` manages user session state (`user`, `token`, `login`, `logout`) globally.

### Forms & Validation
-   **React Hook Form** (`react-hook-form`): Performant, flexible, and extensible forms.
    -   *Usage*: Manages complex form state and validation logic, notably in `AdminProjectUpload.jsx`.
-   **Yup** (`yup`): Schema builder for value parsing and validation.
    -   *Usage*: Used alongside React Hook Form (via `@hookform/resolvers`) to enforce rules (e.g., "Email is required") before submission.

### Authentication
-   **React OAuth Google** (`@react-oauth/google`): Google Identity Services wrapper for React.
    -   *Usage*: Implements the "Sign in with Google" button in `Login.jsx` and `Signup.jsx`.
-   **JWT Decode** (`jwt-decode`): Decodes JSON Web Tokens.
    -   *Usage*: Used in `Login.jsx` to extract user profile information from the Google credential response before sending it to the backend.

### 3D Graphics
-   **React Three Fiber** (`@react-three/fiber`): React renderer for Three.js.
-   **React Three Drei** (`@react-three/drei`): Useful helpers for R3F.
    -   *Usage*: Enables the 3D model visualization features in the dashboard.

---

## ⚙️ Server-Side (Backend)

### Core Runtime
-   **Node.js & Express** (`express`): Fast, unopinionated, minimalist web framework for Node.js.
    -   *Usage*: The backbone of our API. Defined in `server/server.js`, handling middleware and routing (`server/routes/*`).

### Database
-   **MongoDB** (Database) & **Mongoose** (`mongoose`): Elegant MongoDB object modeling for Node.js.
    -   *Usage*: Defines schemas for data structure in `server/models/*`:
        -   `User`: Stores credentials, profile, and role.
        -   `Project` & `Design`: Store content data.
        -   `OTP`: Stores temporary codes for verification with automatic expiry (TTL).

### Security
-   **Helmet** (`helmet`): Helps secure Express apps by setting various HTTP headers.
    -   *Usage*: Applied globally in `server.js` to protect against common web vulnerabilities (XSS, sniffing, clickjacking).
-   **Express Rate Limit** (`express-rate-limit`): Basic rate-limiting middleware.
    -   *Usage*: Limits repeated requests to public APIs (e.g., login) to prevent brute-force attacks.
-   **Joi** (`joi`): Data validation library.
    -   *Usage*: Used in `server/middleware/validate.js` to enforce strict schemas on all incoming request bodies (email format, password complexity).
-   **XSS Clean** (`xss-clean`): Sanitizes user input.
    -   *Usage*: Middleware that cleans `req.body`, `req.query`, and `req.params` from malicious HTML to prevent Cross-Site Scripting.
-   **HPP** (`hpp`): HTTP Parameter Pollution protection.
    -   *Usage*: Prevents attacks that exploit HTTP parameter pollution (e.g., sending multiple `name` parameters).

### Authentication & Security
-   **JsonWebToken** (`jsonwebtoken`): Standard for securing API requests.
    -   *Usage*: Generates tokens in `server/controllers/authController.js` upon login. Verified in `server/middleware/auth.js` to protect private routes.
-   **Bcrypt.js** (`bcryptjs`): Library to hash passwords.
    -   *Usage*: Hashes passwords in the `User` model `pre-save` hook to ensure security.
-   **Cors** (`cors`): Middleware to enable Cross-Origin Resource Sharing.
    -   *Usage*: Configured in `server/server.js` to allow the frontend (running on different port) to communicate with the backend.

### File Handling
-   **Multer** (`multer`): Middleware for handling `multipart/form-data`.
    -   *Usage*: Processes file uploads (images, documents) in routes like `server/routes/designs.js`.
-   **Cloudinary** (`cloudinary`, `multer-storage-cloudinary`): Cloud image and video management.
    -   *Usage*: Files uploaded via Multer are streamlined directly to Cloudinary storage. We use the SDK in `server/controllers/designController.js` to upload and also **delete** assets when records are removed.

### Communication
-   **Nodemailer** (`nodemailer`): Module for sending emails.
    -   *Usage*: Powers the OTP system.
        -    Used in `server/controllers/otpController.js` for Signup verification.
        -   Used in `server/controllers/passwordController.js` for **Forgot Password** emails.
    -   *Logic*: Configured with Gmail SMTP to send HTML-formatted emails containing verification codes and reset links.

### Utilities
-   **Joi** (`joi`): JavaScript object schema description language and validator for data.
    -   *Usage*: Used for backend request body validation to ensure data integrity before database insertion.

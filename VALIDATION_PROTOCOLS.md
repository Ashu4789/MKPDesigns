# 🛡️ Security & Validation Protocols

This document outlines the security measures and validation checks implemented in the MKPDesigns application to ensure data integrity and system robustness.

## 🔒 Security Protocols

We follow industry-standard practices to protect user data and server infrastructure.

### 1. HTTP Headers (Helmet)
We use `helmet` to set secure HTTP headers automatically.
-   **Protection**: Mitigates Cross-Site Scripting (XSS), Clickjacking, and Sniffing attacks.
-   **Implementation**: Global middleware in `server.js`.

### 2. Rate Limiting
To prevent brute-force attacks and Denial of Service (DoS), we limit the number of requests a single IP can make.
-   **Policy**: 100 requests per 15 minutes per IP.
-   **Response**: `429 Too Many Requests`.
-   **Implementation**: `express-rate-limit` in `server.js`.

### 3. Input Sanitization
-   **XSS Protection**: `xss-clean` sanitizes user input (req.body, req.query, req.params) to prevent injection of malicious scripts.
-   **Parameter Pollution**: `hpp` prevents HTTP Parameter Pollution attacks (e.g., sending the same parameter key twice to confuse the server).

---

## ✅ Validation Checkpoints

We use **Joi** for strict server-side validation. All requests are validated *before* reaching the controller logic.

### Error Handling Strategy
When a validation error occurs, the server responds with a **400 Bad Request**.
-   **Format**: JSON object with a `message` field.
-   **Content**: The `message` contains a comma-separated list of all validation failures (e.g., "Email is required, Password must be at least 6 characters").

### Checkpoints & Debugging Guide

#### Authentication (`/api/auth`)

| Endpoint | Payload Required | Validations Enforced | Common Errors |
| :--- | :--- | :--- | :--- |
| **Signup** (`/signup`) | `name`, `email`, `password`, `phone`, `organization` | • Name: 2-50 chars<br>• Email: Valid format<br>• Password: Min 6 chars<br>• Phone: 10-15 digits only | `"Phone number must contain only digits"`<br>`"Password must be at least 6 characters"` |
| **Login** (`/login`) | `email`, `password` | • Email: Valid format<br>• Password: Required | `"Email is required"` |
| **Verify OTP** (`/verify-otp`) | `email`, `otp` | • OTP: Required | `"All fields are required"` |

#### Password Management

| Endpoint | Payload Required | Validations Enforced | Common Errors |
| :--- | :--- | :--- | :--- |
| **Forgot Password** | `email` | • Email: Valid format | `"Email is required"` |
| **Verify Reset OTP** | `email`, `otp` | • Email: Valid format<br>• OTP: Required | `"Invalid OTP"` |
| **Reset Password** | `email`, `otp`, `password` | • Password: Min 6 chars<br>• OTP: 6 chars exactly | `"OTP must be 6 characters long"` |

### How to Debug Validation Errors
1.  **Check the Network Tab**: Look at the response body of the failed 400 request.
2.  **Read the Message**: The message is generated directly from the Joi schema and tells you exactly which field failed.
3.  **Verify Payload**: Ensure your JSON payload matches the "Payload Required" column above.

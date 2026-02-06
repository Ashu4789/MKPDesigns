# Project Pathways & User Flows

This document details every possible user interaction pathway within the MKPDesigns application, covering Authentication, General User actions, and Administrative functions.

## 1. Authentication Pathways

### A. Standard Sign Up
**Goal**: Create a new account using email and password.
1.  **Entry**: User clicks "Sign Up" on the Landing Page or Login Page.
2.  **Step 1: Email Input**: User enters email address.
3.  **Step 2: OTP Verification**:
    -   System sends a 6-digit OTP to the email.
    -   User enters the OTP to verify email ownership.
4.  **Step 3: Profile Details**:
    -   User fills in Name, Phone, Organization, Password, and Confirm Password.
5.  **Completion**: System creates account, logs user in, and redirects to **Dashboard**.

### B. Google Sign Up (OAuth)
**Goal**: Create an account using an existing Google account.
1.  **Entry**: User clicks "Continue with Google" on Sign Up/Login Page.
2.  **Google Auth**: User selects their Google account in the pop-up window.
3.  **Profile Check**:
    -   **Scenario 1 (New User)**: System creates a partial account. User is redirected to **Complete Profile** page to add Phone and Organization.
    -   **Scenario 2 (Existing User)**: System logs user in directly.
4.  **Completion**: User submits additional details (if needed) and is redirected to **Dashboard**.

### C. Login
**Goal**: Access an existing account.
1.  **Entry**: User navigates to `/login`.
2.  **Action**: User enters Email/Password OR clicks "Continue with Google".
3.  **Success**: System validates credentials and redirects to **Dashboard**.
4.  **Failure**: System shows error message (Invalid credentials).

### D. Forgot Password
**Goal**: Reset a lost password via email verification.
1.  **Entry**: User clicks "Forgot Password?" on the Login page.
2.  **Request**: User enters their registered email address.
3.  **Verification**:
    -   System sends an email with a 6-digit OTP and a **direct reset link**.
4.  **Reset**:
    -   **Option A (Link)**: User clicks the link -> System **automatically verifies** the code -> User sees "Set New Password" form.
    -   **Option B (Manual)**: User enters email and OTP -> Clicks "Verify" -> User sees "Set New Password" form.
5.  **Completion**: User enters new password. System updates credentials and redirects to Login.

---

## 2. General User Pathways (Dashboard)

Upon logging in, regular users have access to the following flows:

### A. Dashboard Overview
-   **Path**: `/dashboard`
-   **View**: See a summary of recent designs, projects, and personal account stats.
-   **Actions**: Quick links to view more designs or projects.

### B. Browsing Designs
-   **Path**: `/designs`
-   **View**: Gallery grid of architectural designs.
-   **Interactions**:
    -   Click on a design to view full-size image/details.
    -   Filter designs by category (Interior, Exterior, Landscape, etc.).

### C. Browsing Projects
-   **Path**: `/projects`
-   **View**: List of detailed architectural projects.
-   **Interactions**:
    -   Click "View Details" on a project card to go to `/projects/:id`.
    -   **Project Detail View**: See full description, status, timeline, and image gallery for that specific project.

### D. Settings & Profile
-   **Path**: `/settings`
-   **View**: Form displaying current user information (Name, Email, Phone, Organization).
-   **Actions**:
    -   **Update Profile**: Edit editable fields and save changes.
    -   **Preferences**: Toggle Dark/Light mode or other UI settings.
    -   **Logout**: Securely end the session and return to Login page.

### E. Contact Support
-   **Path**: `/contact`
-   **Action**: Fill out a specialized inquiry form to reach the admin/support team.

---

## 3. Administrative Pathways

Users with the `role: 'admin'` have exclusive access to management features.

### A. Uploading Designs
-   **Path**: `/admin/upload-design` (Accessible via Dashboard Sidebar for Admins)
-   **Flow**:
    1.  Enter Design Title and Description.
    2.  Select Category (e.g., Residential, Commercial).
    3.  Upload detailed images.
    4.  **Submit**: Design is saved to database and immediately appears in the public `/designs` gallery.

### B. Managing Projects
-   **Path**: `/admin/upload-project`
-   **Flow**:
    1.  Enter Project Name, Client Name, and detailed Description.
    2.  Set Status (Ongoing/Completed) and Timeline.
    3.  Upload Project Thumbnail and Gallery Images.
    4.  **Submit**: Project is published to the `/projects` list.

### C. Deleting Content
**Goal**: Remove outdated or incorrect items (Admin Only).
1.  **Entry**: Navigate to `/projects` or `/designs`.
2.  **Action**: Click the **Trash Icon** on a specific item card.
3.  **Confirmation**: A browser prompt asks for final confirmation ("Are you sure...?").
4.  **Process**:
    -   System deletes the database record.
    -   System automatically removes associated images/assets from Cloudinary.
5.  **Result**: Item is permanently removed from the application.

---

## 4. Error & Edge Case Pathways

### A. Unauthenticated Access
-   **Action**: User tries to visit `/dashboard` or protected routes without logging in.
-   **Result**: Automatically redirected to `/login` or `/signup`.

### B. 404 / Not Found
-   **Action**: User navigates to a non-existent URL.
-   **Result**: Shows a friendly 404 error page with a link back to Home/Dashboard.

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Signup from './pages/Signup';
import CompleteProfile from './pages/CompleteProfile';
import Overview from './pages/Overview';
import Settings from './pages/Settings';
import ContactUs from './pages/ContactUs';
import Designs from './pages/Designs';
import DesignUpload from './pages/DesignUpload';
import Projects from './pages/Projects';
import ProjectDetails from './pages/ProjectDetails';
import AdminProjectUpload from './pages/AdminProjectUpload';
import PurchaseHistory from './pages/PurchaseHistory';
import SalesHistory from './pages/SalesHistory';
import SetAppointment from './pages/SetAppointment';
import AppointmentRequests from './pages/AppointmentRequests';

import { GoogleOAuthProvider } from '@react-oauth/google';

function App() {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <Router>
        <ThemeProvider>
          <AuthProvider>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
              <Navbar />
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/contact" element={<ContactUs />} />
                <Route
                  path="/complete-profile"
                  element={
                    <ProtectedRoute>
                      <CompleteProfile />
                    </ProtectedRoute>
                  }
                />

                {/*  Protected Projects Routes */}
                <Route path="/projects" element={<ProtectedRoute><Projects /></ProtectedRoute>} />
                <Route path="/projects/:id" element={<ProjectDetails />} />

                {/* Protected Dashboard Routes */}
                <Route path="/designs" element={<ProtectedRoute><Designs /></ProtectedRoute>} />

                {/* Protected Dashboard Routes */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Overview />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/dashboard/settings"
                  element={
                    <ProtectedRoute>
                      <Settings />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/design-upload"
                  element={
                    <ProtectedRoute>
                      <DesignUpload />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/upload-project"
                  element={
                    <ProtectedRoute>
                      <AdminProjectUpload />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/purchase-history"
                  element={
                    <ProtectedRoute>
                      <PurchaseHistory />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/sales-history"
                  element={
                    <ProtectedRoute>
                      <SalesHistory />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/book-appointment"
                  element={
                    <ProtectedRoute>
                      <SetAppointment />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/appointment-requests"
                  element={
                    <ProtectedRoute>
                      <AppointmentRequests />
                    </ProtectedRoute>
                  }
                />

                {/* Catch all - redirect to home */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
          </AuthProvider>
        </ThemeProvider>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;
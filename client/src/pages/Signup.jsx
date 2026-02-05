import { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { User, Mail, Lock, AlertCircle, Phone, Building, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { sendOTP, verifyOTP, resendOTP, googleSignIn } from '../services/api';
import { AuthContext } from '../context/AuthContext';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const SignupContent = () => {
  const navigate = useNavigate();
  const { signup, googleLogin } = useContext(AuthContext);
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: Details
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    organization: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Step 1: Send OTP
  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await sendOTP(email);
      setSuccess('OTP sent successfully! Please check your email.');
      setStep(2);
      startResendTimer();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await verifyOTP(email, otp);
      setSuccess('Email verified successfully!');
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Complete Registration
  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      const result = await signup({
        name: formData.name,
        email,
        phone: formData.phone,
        organization: formData.organization,
        password: formData.password
      });

      if (!result.success) {
        throw new Error(result.message);
      }

      // Navigate is handled in context
    } catch (err) {
      setError(err.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    if (resendTimer > 0) return;

    setLoading(true);
    setError('');

    try {
      await resendOTP(email);
      setSuccess('New OTP sent successfully!');
      startResendTimer();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  // Start resend timer
  const startResendTimer = () => {
    setResendTimer(60);
    const interval = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Google Sign In Success
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const decoded = jwtDecode(credentialResponse.credential);

      const response = await googleSignIn({
        email: decoded.email,
        name: decoded.name,
        googleId: decoded.sub,
        picture: decoded.picture
      });

      googleLogin(response.data, response.data.token);

      if (response.data.isComplete) {
        navigate('/dashboard');
      } else {
        // Need to complete profile
        navigate('/complete-profile');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Google sign-in failed');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };


  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="max-w-2xl w-full bg-card/60 backdrop-blur-md border border-border/50 rounded-xl shadow-2xl p-8">

        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">
            Create Account
          </h2>
          <p className="text-muted-foreground">
            {step === 1 && 'Enter your email to get started'}
            {step === 2 && 'Verify your email with OTP'}
            {step === 3 && 'Complete your profile'}
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold transition-all
            ${step >= 1 ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' : 'bg-muted text-muted-foreground'}`}>
              1
            </div>
            <div className={`w-16 h-1 transition-all ${step >= 2 ? 'bg-primary' : 'bg-muted'}`}></div>

            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold transition-all
            ${step >= 2 ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' : 'bg-muted text-muted-foreground'}`}>
              2
            </div>
            <div className={`w-16 h-1 transition-all ${step >= 3 ? 'bg-primary' : 'bg-muted'}`}></div>

            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold transition-all
            ${step >= 3 ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' : 'bg-muted text-muted-foreground'}`}>
              3
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Success Alert */}
        {success && (
          <div className="mb-6 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-4 py-3 rounded-lg flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 flex-shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* STEP 1 - EMAIL */}
        {step === 1 && (
          <form onSubmit={handleSendOTP} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-input rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary bg-background/50 text-foreground placeholder:text-muted-foreground/50 transition-all"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 rounded-full transition shadow-lg shadow-primary/20 font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02]"
            >
              {loading ? 'Sending OTP...' : 'Send OTP'}
            </button>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-card text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>

            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError('Google Sign-In failed')}
              size="large"
              width="100%"
              text="signup_with"
              theme="filled_black"
              shape="circle"
            />
          </form>
        )}

        {/* STEP 2 - OTP */}
        {step === 2 && (
          <form onSubmit={handleVerifyOTP} className="space-y-6">
            <label className="block text-sm font-medium text-foreground">
              Enter 6-Digit OTP *
            </label>

            <p className="text-sm text-muted-foreground mb-3">
              We've sent a verification code to <strong className="text-foreground">{email}</strong>
            </p>

            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              maxLength="6"
              required
              className="w-full px-4 py-3 border border-input rounded-lg 
            focus:ring-2 focus:ring-primary/50 focus:border-primary text-center 
            text-2xl tracking-widest font-bold bg-background/50 text-foreground placeholder:text-muted-foreground/20 transition-all"
              placeholder="000000"
            />

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 rounded-full transition shadow-lg shadow-primary/20 font-semibold disabled:opacity-50 hover:scale-[1.02]"
            >
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={resendTimer > 0 || loading}
                className="text-primary hover:text-primary/80 font-medium disabled:text-muted-foreground transition-colors"
              >
                {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : 'Resend OTP'}
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                setStep(1);
                setOtp('');
                setError('');
                setSuccess('');
              }}
              className="w-full text-muted-foreground hover:text-foreground transition-colors text-sm"
            >
              ← Change Email
            </button>
          </form>
        )}

        {/* STEP 3 - FINAL DETAILS */}
        {step === 3 && (
          <form onSubmit={handleSignup} className="space-y-5">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Full Name *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-input rounded-lg focus:ring-2 focus:ring-primary/50 bg-background/50 text-foreground"
                  placeholder="John Doe"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Phone Number *
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-input rounded-lg focus:ring-2 focus:ring-primary/50 bg-background/50 text-foreground"
                  placeholder="+91 1234567890"
                />
              </div>
            </div>

            {/* Organization */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Organization *
              </label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  type="text"
                  name="organization"
                  value={formData.organization}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-input rounded-lg focus:ring-2 focus:ring-primary/50 bg-background/50 text-foreground"
                  placeholder="Your Company"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength="6"
                  className="w-full pl-10 pr-12 py-3 border border-input rounded-lg focus:ring-2 focus:ring-primary/50 bg-background/50 text-foreground"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Minimum 6 characters
              </p>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Confirm Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  minLength="6"
                  className="w-full pl-10 pr-12 py-3 border border-input rounded-lg focus:ring-2 focus:ring-primary/50 bg-background/50 text-foreground"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 rounded-full transition shadow-lg shadow-primary/20 font-semibold disabled:opacity-50 hover:scale-[1.02]"
            >
              {loading ? 'Creating Account...' : 'Complete Registration'}
            </button>
          </form>
        )}

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link to="/login" className="text-primary hover:text-primary/80 font-semibold transition-colors">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

const Signup = () => {
  if (!GOOGLE_CLIENT_ID) {
    console.warn('Google Client ID not configured');
    return <SignupContent />;
  }

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <SignupContent />
    </GoogleOAuthProvider>
  );
};
export default Signup;
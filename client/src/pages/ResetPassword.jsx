import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { resetPassword, verifyResetOTP } from "../services/api";
import { Lock, ArrowLeft, Key, CheckCircle, Sparkles, AlertCircle, Eye, EyeOff, Loader2 } from "lucide-react";

const ResetPassword = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Steps: 1 = Verify OTP, 2 = Set New Password
    const [step, setStep] = useState(1);

    const [formData, setFormData] = useState({
        email: "",
        otp: "",
        password: "",
        confirmPassword: ""
    });
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [verifying, setVerifying] = useState(false); // Initial load verification
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const query = new URLSearchParams(location.search);
    const emailFromUrl = query.get("email");
    const otpFromUrl = query.get("otp");

    // Handle initial load / link click
    useEffect(() => {
        const init = async () => {
            if (location.state?.email) {
                // Coming from ForgotPassword page manually
                setFormData(prev => ({ ...prev, email: location.state.email }));
            }

            if (emailFromUrl && otpFromUrl) {
                // Coming from Email Link
                setFormData(prev => ({ ...prev, email: emailFromUrl, otp: otpFromUrl }));
                await autoVerify(emailFromUrl, otpFromUrl);
            } else if (emailFromUrl) {
                // Link with just email? Rare but handle it
                setFormData(prev => ({ ...prev, email: emailFromUrl }));
            }
        };
        init();
    }, []);

    const autoVerify = async (email, otp) => {
        setVerifying(true);
        setError("");
        try {
            await verifyResetOTP(email, otp);
            setStep(2); // Auto-advance to password step
            setMessage("Code verified. Please set your new password.");
        } catch (err) {
            setError(err.response?.data?.message || "Invalid or expired link. Please enter code manually.");
        } finally {
            setVerifying(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError("");
        setMessage("");
    };

    // Step 1: Manual Verify
    const handleVerifySubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            await verifyResetOTP(formData.email, formData.otp);
            setStep(2);
            setMessage("Code verified.");
        } catch (err) {
            setError(err.response?.data?.message || "Invalid code");
        } finally {
            setLoading(false);
        }
    };

    // Step 2: Reset Password
    const handleResetSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setMessage("");

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match");
            setLoading(false);
            return;
        }

        try {
            // We verify via the actual reset call again for security
            await resetPassword({
                email: formData.email,
                otp: formData.otp,
                password: formData.password
            });
            setMessage("Password reset successfully! Redirecting...");
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            // If it failed here, maybe OTP expired in the meantime
            setError(err.response?.data?.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    if (verifying) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="flex flex-col items-center space-y-4">
                    <Loader2 className="h-10 w-10 text-primary animate-spin" />
                    <p className="text-muted-foreground font-medium">Verifying link...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12 relative overflow-hidden">
            {/* Subtle Animated Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-pulse delay-700" />
            </div>

            <div className="relative max-w-md w-full">
                <div className="relative bg-card/70 backdrop-blur-2xl border border-border/50 rounded-3xl shadow-2xl p-8 hover:border-border transition-all duration-500">

                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center space-x-2 bg-primary rounded-full px-4 py-2 mb-4 shadow-lg shadow-primary/20">
                            <Sparkles className="h-4 w-4 text-primary-foreground animate-pulse" />
                            <span className="text-sm font-medium text-primary-foreground">
                                Secure Account
                            </span>
                        </div>

                        <h2 className="text-3xl font-bold mb-2 text-primary">
                            {step === 1 ? "Enter Security Code" : "Set New Password"}
                        </h2>
                        <p className="text-muted-foreground font-medium">
                            {step === 1
                                ? "Check your email for the verification code"
                                : "Create a strong password for your account"}
                        </p>
                    </div>

                    {message && (
                        <div className="mb-6 bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 px-4 py-3 rounded-xl flex items-center space-x-2 animate-fade-in-up">
                            <CheckCircle className="h-5 w-5 flex-shrink-0" />
                            <span className="text-sm">{message}</span>
                        </div>
                    )}

                    {error && (
                        <div className="mb-6 bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-xl flex items-center space-x-2 animate-fade-in-up">
                            <AlertCircle className="h-5 w-5 flex-shrink-0" />
                            <span className="text-sm">{error}</span>
                        </div>
                    )}

                    {step === 1 && (
                        <form onSubmit={handleVerifySubmit} className="space-y-6 animate-fade-in-up">
                            {/* EMAIL (Readonly usually) */}
                            <div className="group">
                                <label className="block text-sm font-medium text-muted-foreground mb-2">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    readOnly={formData.email ? true : false} // Allow edit if empty (rare case)
                                    className={`w-full px-4 py-3 bg-muted/50 border border-input rounded-xl text-muted-foreground ${formData.email ? 'cursor-not-allowed' : ''}`}
                                    placeholder="your@email.com"
                                />
                            </div>

                            {/* OTP */}
                            <div className="group">
                                <label className="block text-sm font-medium text-muted-foreground mb-2 group-focus-within:text-primary transition-colors">
                                    OTP Code
                                </label>
                                <div className="relative">
                                    <Key className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                    <input
                                        type="text"
                                        name="otp"
                                        value={formData.otp}
                                        onChange={handleChange}
                                        required
                                        autoFocus
                                        className="w-full pl-12 pr-4 py-3 bg-background/50 border border-input rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent text-foreground placeholder-muted-foreground/50 transition-all font-mono tracking-widest text-lg"
                                        placeholder="XXXXXX"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 rounded-xl font-semibold transition-all hover:scale-[1.02] disabled:opacity-50 shadow-lg shadow-primary/20"
                            >
                                {loading ? "Verifying..." : "Verify Code"}
                            </button>
                        </form>
                    )}

                    {step === 2 && (
                        <form onSubmit={handleResetSubmit} className="space-y-6 animate-fade-in-up">
                            {/* PASSWORD */}
                            <div className="group">
                                <label className="block text-sm font-medium text-muted-foreground mb-2 group-focus-within:text-primary transition-colors">
                                    New Password
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                        minLength="6"
                                        autoFocus
                                        className="w-full pl-12 pr-12 py-3 bg-background/50 border border-input rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent text-foreground placeholder-muted-foreground/50 transition-all"
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors focus:outline-none"
                                    >
                                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>
                            </div>

                            {/* CONFIRM PASSWORD */}
                            <div className="group">
                                <label className="block text-sm font-medium text-muted-foreground mb-2 group-focus-within:text-primary transition-colors">
                                    Confirm Password
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        required
                                        minLength="6"
                                        className="w-full pl-12 pr-12 py-3 bg-background/50 border border-input rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent text-foreground placeholder-muted-foreground/50 transition-all"
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors focus:outline-none"
                                    >
                                        {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 rounded-xl font-semibold transition-all hover:scale-[1.02] disabled:opacity-50 shadow-lg shadow-primary/20"
                            >
                                {loading ? "Resetting..." : "Reset Password"}
                            </button>
                        </form>
                    )}

                    <div className="mt-8 text-center">
                        <button
                            onClick={() => navigate("/login")}
                            className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors font-medium group"
                        >
                            <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                            Back to Login
                        </button>
                    </div>
                </div>
            </div>

            <style jsx="true">{`
                @keyframes fade-in-up {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-up { animation: fade-in-up 0.5s ease-out; }
            `}</style>
        </div>
    );
};

export default ResetPassword;

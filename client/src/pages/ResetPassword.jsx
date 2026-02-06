import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { resetPassword } from "../services/api";
import { Lock, ArrowLeft, Key, CheckCircle, Sparkles, AlertCircle, Eye, EyeOff } from "lucide-react";

const ResetPassword = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [formData, setFormData] = useState({
        email: "",
        otp: "",
        password: "",
        confirmPassword: ""
    });
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const query = new URLSearchParams(location.search);
    const emailFromUrl = query.get("email");
    const otpFromUrl = query.get("otp");

    useEffect(() => {
        if (location.state?.email) {
            setFormData(prev => ({ ...prev, email: location.state.email }));
        } else if (emailFromUrl) {
            // If coming from email link
            setFormData(prev => ({
                ...prev,
                email: emailFromUrl,
                otp: otpFromUrl || ""
            }));
        }
    }, [location.state, emailFromUrl, otpFromUrl]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError("");
    };

    const handleSubmit = async (e) => {
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
            await resetPassword({
                email: formData.email,
                otp: formData.otp,
                password: formData.password
            });
            setMessage("Password reset successfully! Redirecting...");
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            setError(err.response?.data?.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

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
                            Reset Password
                        </h2>
                        <p className="text-muted-foreground font-medium">
                            Enter your OTP and new password
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

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* READ ONLY EMAIL */}
                        <div className="group">
                            <label className="block text-sm font-medium text-muted-foreground mb-2">
                                Email Address
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                readOnly
                                className="w-full px-4 py-3 bg-muted/50 border border-input rounded-xl text-muted-foreground cursor-not-allowed"
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
                                    className="w-full pl-12 pr-4 py-3 bg-background/50 border border-input rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent text-foreground placeholder-muted-foreground/50 transition-all font-mono tracking-widest text-lg"
                                    placeholder="XXXXXX"
                                />
                            </div>
                        </div>

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
                .animate-fade-in-up { animation: fade-in-up 0.3s ease-out; }
            `}</style>
        </div>
    );
};

export default ResetPassword;

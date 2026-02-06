import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { forgotPassword } from "../services/api";
import { Mail, ArrowLeft, Sparkles, AlertCircle, ArrowRight } from "lucide-react";

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setMessage("");

        try {
            await forgotPassword(email);
            // Navigate to reset password page with email in state
            navigate('/reset-password', { state: { email } });
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
                                Account Recovery
                            </span>
                        </div>

                        <h2 className="text-3xl font-bold mb-2 text-primary">
                            Forgot Password?
                        </h2>
                        <p className="text-muted-foreground font-medium">
                            Enter your email to receive a reset code
                        </p>
                    </div>

                    {/* Messages */}
                    {message && (
                        <div className="mb-6 bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 px-4 py-3 rounded-xl flex items-center space-x-2 animate-fade-in-up">
                            <Sparkles className="h-5 w-5 flex-shrink-0" />
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
                        <div className="group">
                            <label className="block text-sm font-medium text-muted-foreground mb-2 group-focus-within:text-primary transition-colors">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full pl-12 pr-4 py-3 bg-background/50 border border-input rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent text-foreground placeholder-muted-foreground/50 transition-all"
                                    placeholder="you@example.com"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 rounded-xl font-semibold transition-all hover:scale-[1.02] disabled:opacity-50 shadow-lg shadow-primary/20 flex items-center justify-center space-x-2"
                        >
                            <span>{loading ? "Sending..." : "Send Reset Link"}</span>
                            {!loading && <ArrowRight className="h-5 w-5" />}
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

export default ForgotPassword;
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, Building, AlertCircle } from 'lucide-react';
import { completeGoogleProfile } from '../services/api';

const CompleteProfile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    phone: '',
    organization: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const googleUser = sessionStorage.getItem('googleUser');

    if (googleUser) {
      const parsedUser = JSON.parse(googleUser);
      setUser(parsedUser);

      if (parsedUser.phone && parsedUser.organization) {
        navigate('/dashboard');
      }
    } else {
      navigate('/signup');
    }
  }, [navigate]);

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!formData.phone || !formData.organization) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    try {
      const response = await completeGoogleProfile(formData);

      sessionStorage.removeItem('googleUser');
      await new Promise(resolve => setTimeout(resolve, 200));
      window.location.href = '/dashboard';
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to complete profile');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-card/70 border border-border/50 backdrop-blur-xl rounded-xl shadow-2xl p-8 hover:border-border transition-all">

        <div className="text-center mb-8">
          {user.profilePicture && (
            <img
              src={user.profilePicture}
              alt={user.name}
              className="w-20 h-20 rounded-full mx-auto mb-4 border-2 border-primary shadow-lg shadow-primary/20"
            />
          )}

          <h2 className="text-3xl font-bold text-foreground mb-2">
            Welcome, {user.name}!
          </h2>

          <p className="text-muted-foreground">
            Complete your profile to access the site
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Phone */}
          <div className="group">
            <label className="block text-sm font-medium text-muted-foreground mb-2 group-focus-within:text-primary transition-colors">
              Phone Number *
            </label>

            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-4 py-3 bg-background border border-input text-foreground rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent placeholder:text-muted-foreground/50 transition-all"
                placeholder="+91 1234567890"
              />
            </div>
          </div>

          {/* Organization */}
          <div className="group">
            <label className="block text-sm font-medium text-muted-foreground mb-2 group-focus-within:text-primary transition-colors">
              Organization *
            </label>

            <div className="relative">
              <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input
                type="text"
                name="organization"
                value={formData.organization}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-4 py-3 bg-background border border-input text-foreground rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent placeholder:text-muted-foreground/50 transition-all"
                placeholder="Your Company"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20 hover:scale-[1.02]"
          >
            {loading ? 'Completing Profile...' : 'Complete Profile'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>Your email <strong className="text-foreground">{user.email}</strong> is already verified ✓</p>
        </div>
      </div>
    </div>
  );
};

export default CompleteProfile;

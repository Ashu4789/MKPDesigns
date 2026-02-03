import { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import { TrendingUp, Loader } from 'lucide-react';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [recentUpdates, setRecentUpdates] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const config = { headers: { Authorization: `Bearer ${token}` } };

        const [statsRes, updatesRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL}/dashboard/stats`, config),
          axios.get(`${import.meta.env.VITE_API_URL}/dashboard/updates`, config)
        ]);

        setStats(statsRes.data);
        setRecentUpdates(updatesRes.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Polling for updates every 60 seconds
    const pollInterval = setInterval(async () => {
      try {
        const token = localStorage.getItem('token');
        const config = { headers: { Authorization: `Bearer ${token}` } };

        const updatesRes = await axios.get(`${import.meta.env.VITE_API_URL}/dashboard/updates`, config);
        const newUpdates = updatesRes.data;

      } catch (error) {
        console.error('Error polling updates:', error);
      }
    }, 60000);

    return () => clearInterval(pollInterval);
  }, [user]);




  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <Loader className="h-10 w-10 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  // Fallback if stats fail to load (optional, or show error)
  const currentStats = stats || {};

  return (
    <DashboardLayout>
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground tracking-tight">
          Welcome back, {user?.name}!
        </h1>
        <p className="text-muted-foreground mt-2">
          Here's an overview of projects and updates undergone by MKP Designs
        </p>
      </div>

      
      

      <div className="mt-6 bg-card border border-border rounded-xl p-6">
        <h3 className="text-sm font-semibold text-foreground mb-2">Data Sources</h3>
        <p className="text-xs text-muted-foreground">
          MKP Designs, Sambalpur, Odisha, India
        </p>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;

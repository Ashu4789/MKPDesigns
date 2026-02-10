import { useContext, useEffect, useState } from 'react';
import { getDashboardStats, getDashboardUpdates, getDesigns } from '../services/api'; // Added getDesigns
import { AuthContext } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import ProjectsOverview from '../components/ProjectsOverview';
import { Loader, ArrowRight, IndianRupee } from 'lucide-react'; // Added icons
import { Link } from 'react-router-dom'; // Added Link

const Overview = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [recentUpdates, setRecentUpdates] = useState([]);
  const [patentedDesigns, setPatentedDesigns] = useState([]); // New state
  const [loading, setLoading] = useState(true);

  // Fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const results = await Promise.allSettled([
          getDashboardStats(),
          getDashboardUpdates(),
          getDesigns({ limit: 6 })
        ]);

        const statsRes = results[0].status === 'fulfilled' ? results[0].value : { data: null };
        const updatesRes = results[1].status === 'fulfilled' ? results[1].value : { data: [] };
        const designsRes = results[2].status === 'fulfilled' ? results[2].value : { data: { designs: [] } };

        if (results[0].status === 'rejected') console.error('Stats failed:', results[0].reason);
        if (results[1].status === 'rejected') console.error('Updates failed:', results[1].reason);
        if (results[2].status === 'rejected') console.error('Designs failed:', results[2].reason);

        setStats(statsRes.data);
        setRecentUpdates(updatesRes.data);
        setPatentedDesigns(designsRes.data.designs || []);
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
        const updatesRes = await getDashboardUpdates();
        const newUpdates = updatesRes.data;
        setRecentUpdates(newUpdates);
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

      <ProjectsOverview />

      {/* Patented Designs Section */}
      <div className="mt-12 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-foreground">Patented Designs</h2>
          <Link
            to="/designs"
            className="group flex items-center text-sm font-medium text-primary hover:text-primary/80 transition-colors"
          >
            View All Designs
            <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {patentedDesigns.length > 0 ? (
            patentedDesigns.map((design) => (
              <div
                key={design._id}
                className="group bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 block"
              >
                <div className="aspect-[4/3] overflow-hidden bg-muted relative">
                  <img
                    src={design.imageUrl}
                    alt={design.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                    <Link to={`/designs`} className="text-white text-sm font-medium hover:underline">
                      View Details
                    </Link>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-foreground truncate pr-2" title={design.title}>
                      {design.title}
                    </h3>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-secondary/20 text-secondary-foreground font-medium">
                      {design.category}
                    </span>
                  </div>
                  <div className="flex items-center text-primary font-bold">
                    <IndianRupee className="h-4 w-4 mr-0.5" />
                    {design.price}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12 text-muted-foreground bg-card/50 rounded-xl border border-dashed border-border">
              No designs available yet.
            </div>
          )}
        </div>
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

export default Overview;

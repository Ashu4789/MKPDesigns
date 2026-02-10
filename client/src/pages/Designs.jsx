import { useState, useEffect, useContext } from 'react';
import { getDesigns, deleteDesign, getDesignDownloadUrl, getAuthenticatedDesignUrl, getDesignStats, checkPurchaseStatus } from '../services/api';
import { Search, Filter, SlidersHorizontal, ArrowRight, IndianRupee, Cloud, Download, ShoppingBag, X, Loader2, Trash2, Users, TrendingUp, Lock, Unlock, CheckCircle } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { useRazorpay } from 'react-razorpay';
import { createOrder, verifyPayment } from '../services/api';

const Designs = () => {
    const { user } = useContext(AuthContext);
    const [designs, setDesigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDesign, setSelectedDesign] = useState(null);
    const [designStats, setDesignStats] = useState(null);
    const [statsLoading, setStatsLoading] = useState(false);
    const [isPurchased, setIsPurchased] = useState(false);
    const [purchaseCheckLoading, setPurchaseCheckLoading] = useState(false);

    // Pagination
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalDesigns, setTotalDesigns] = useState(0);

    // Filters
    const [search, setSearch] = useState('');
    const [filters, setFilters] = useState({
        category: 'All',
        material: '',
        minPrice: '',
        maxPrice: ''
    });
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        fetchDesigns();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters, search, page]); // Fetch on filter or page change

    useEffect(() => {
        if (selectedDesign) {
            if (user?.role === 'admin') {
                fetchDesignStats(selectedDesign._id);
                setIsPurchased(true); // Admin has access
            } else if (user) {
                // Check if user purchased
                verifyPurchase(selectedDesign._id);
            } else {
                setDesignStats(null);
                setIsPurchased(false);
            }
        } else {
            setDesignStats(null);
            setIsPurchased(false);
        }
    }, [selectedDesign, user]);

    const verifyPurchase = async (designId) => {
        try {
            setPurchaseCheckLoading(true);
            const response = await checkPurchaseStatus(designId);
            setIsPurchased(response.data.isPurchased);
        } catch (error) {
            console.error('Error checking purchase status:', error);
            setIsPurchased(false);
        } finally {
            setPurchaseCheckLoading(false);
        }
    };

    const fetchDesigns = async () => {
        try {
            setLoading(true);
            const params = {
                search,
                page,
                limit: 12,
                ...filters
            };
            if (params.category === 'All') delete params.category;

            const response = await getDesigns(params);

            // Handle new paginated response structure
            if (response.data.designs) {
                setDesigns(response.data.designs);
                setTotalPages(response.data.pages);
                setTotalDesigns(response.data.total);
            } else {
                // Fallback for older API version if needed
                setDesigns(response.data);
            }
        } catch (error) {
            console.error('Error fetching designs:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchDesignStats = async (designId) => {
        try {
            setStatsLoading(true);
            const response = await getDesignStats(designId);
            setDesignStats(response.data);
        } catch (error) {
            console.error('Error fetching design stats:', error);
        } finally {
            setStatsLoading(false);
        }
    };

    const handleDelete = async (e, id) => {
        e.stopPropagation(); // Prevent opening the modal
        if (window.confirm('Are you sure you want to delete this design? This action cannot be undone.')) {
            try {
                await deleteDesign(id);
                setDesigns(designs.filter(design => design._id !== id));
                if (selectedDesign && selectedDesign._id === id) {
                    setSelectedDesign(null);
                }
                alert('Design deleted successfully');
            } catch (error) {
                console.error('Error deleting design:', error);
                alert('Failed to delete design');
            }
        }
    };

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
        setPage(1); // Reset to first page on filter change
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setPage(newPage);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const { error, isLoading, Razorpay } = useRazorpay();

    async function handleBuy(design) {
        if (!user) {
            alert('Please login to purchase designs');
            return;
        }
        if (isLoading) {
            alert('Payment system is loading, please wait...');
            return;
        }
        if (error) {
            alert('Failed to load payment system');
            console.error('Razorpay load error:', error);
            return;
        }
        if (!Razorpay) {
            alert('Razorpay SDK not loaded');
            return;
        }

        try {
            // 1. Create Order
            const orderResponse = await createOrder(design._id);
            const order = orderResponse.data;

            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID,
                amount: order.amount,
                currency: order.currency,
                name: "MKP Designs",
                description: `License for ${design.title}`,
                image: design.imageUrl, // Optional
                order_id: order.id,
                handler: async (response) => {
                    try {
                        // 2. Verify Payment
                        await verifyPayment(response);
                        alert('Payment Successful! You can now download the design.');
                        // Optionally refresh designs or redirect to purchase history
                    } catch (error) {
                        console.error('Payment verification failed:', error);
                        alert('Payment verification failed. Please contact support.');
                    }
                },
                prefill: {
                    name: user.name,
                    email: user.email,
                    contact: user.phone || ''
                },
                notes: {
                    address: "MKP Designs Corporate Office"
                },
                theme: {
                    color: "#3399cc"
                }
            };

            const rzp1 = new Razorpay(options);
            rzp1.on('payment.failed', function (response) {
                alert(response.error.description);
            });
            rzp1.open();

        } catch (error) {
            console.error('Error initiating purchase:', error);
            alert('Failed to initiate purchase. Please try again.');
        }
    }

    return (
        <>
            <DashboardLayout>
                <div className="min-h-screen bg-background">

                    {/* Hero Section */}
                    <div className="relative bg-muted/30 pt-10 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
                        <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,black)] pointer-events-none" />
                        <div className="max-w-7xl mx-auto relative z-10 text-center">
                            <h1 className="text-4xl md:text-5xl font-extrabold text-foreground tracking-tight sm:text-6xl mb-6">
                                Patented <span className="text-primary">Design</span> Library
                            </h1>
                            <p className="mt-4 text-xl text-muted-foreground max-w-2xl mx-auto">
                                Explore our curated collection of architectural and interior designs.
                                Purchase usage rights instantly for your next project.
                            </p>

                            {user?.role === 'admin' && (
                                <div className="mt-8">
                                    <Link
                                        to="/design-upload"
                                        className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-full shadow-sm text-primary-foreground bg-primary hover:bg-primary/90 transition-all hover:scale-105"
                                    >
                                        <Cloud className="mr-2 h-5 w-5" />
                                        Upload New Design
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Search & Filter Bar */}
                    <div className="sticky top-16 z-30 bg-background/80 backdrop-blur-lg border-b border-border shadow-sm">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">

                                <div className="relative w-full md:w-96">
                                    <Search className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                    <input
                                        type="text"
                                        placeholder="Search designs..."
                                        value={search}
                                        onChange={(e) => {
                                            setSearch(e.target.value);
                                            setPage(1); // Reset to first page on search
                                        }}
                                        className="w-full pl-10 pr-4 py-2 rounded-full bg-muted/50 border border-transparent focus:bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                                    />
                                </div>

                                <div className="flex items-center gap-4 w-full md:w-auto">
                                    {/* Category HScroll */}
                                    <div className="flex overflow-x-auto pb-1 md:pb-0 gap-2 no-scrollbar flex-1 md:flex-none">
                                        {['All', 'Residential', 'Commercial', 'Industrial', 'Landscape', 'Interior'].map((cat) => (
                                            <button
                                                key={cat}
                                                onClick={() => {
                                                    setFilters({ ...filters, category: cat });
                                                    setPage(1); // Reset to first page on category change
                                                }}
                                                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${filters.category === cat
                                                    ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25'
                                                    : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
                                                    }`}
                                            >
                                                {cat}
                                            </button>
                                        ))}
                                    </div>

                                    <button
                                        onClick={() => setShowFilters(!showFilters)}
                                        className={`p-2 rounded-full transition-all ${showFilters ? 'bg-primary/10 text-primary' : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                                            }`}
                                    >
                                        <SlidersHorizontal className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Expanded Filters */}
                            {showFilters && (
                                <div className="mt-4 pt-4 border-t border-border grid grid-cols-1 sm:grid-cols-3 gap-4 animate-in slide-in-from-top-2">
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Material</label>
                                        <input
                                            type="text"
                                            name="material"
                                            value={filters.material}
                                            onChange={handleFilterChange}
                                            placeholder="e.g. Concrete"
                                            className="mt-1 w-full px-3 py-2 rounded-lg bg-muted/30 border border-border focus:border-primary focus:ring-1 focus:ring-primary"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Min Price (₹)</label>
                                        <input
                                            type="number"
                                            name="minPrice"
                                            value={filters.minPrice}
                                            onChange={handleFilterChange}
                                            className="mt-1 w-full px-3 py-2 rounded-lg bg-muted/30 border border-border focus:border-primary focus:ring-1 focus:ring-primary"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Max Price (₹)</label>
                                        <input
                                            type="number"
                                            name="maxPrice"
                                            value={filters.maxPrice}
                                            onChange={handleFilterChange}
                                            className="mt-1 w-full px-3 py-2 rounded-lg bg-muted/30 border border-border focus:border-primary focus:ring-1 focus:ring-primary"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

                        {loading ? (
                            <div className="flex justify-center py-20">
                                <Loader2 className="h-12 w-12 text-primary animate-spin" />
                            </div>
                        ) : designs.length === 0 ? (
                            <div className="text-center py-20">
                                <div className="bg-muted/30 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                                    <Search className="h-10 w-10 text-muted-foreground" />
                                </div>
                                <h3 className="text-2xl font-bold text-foreground">No designs found</h3>
                                <p className="text-muted-foreground mt-2">Try adjusting your search or filters.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                                {designs.map((design) => (
                                    <div
                                        key={design._id}
                                        className="group bg-card border border-border rounded-xl  overflow-hidden hover:shadow-2xl hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                                        onClick={() => setSelectedDesign(design)}
                                    >
                                        {/* Image */}
                                        <div className="aspect-[4/3] overflow-hidden relative bg-muted">
                                            <img
                                                src={design.imageUrl}
                                                alt={design.title}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                            />
                                            <div className="absolute top-4 right-4 bg-background/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                                                {design.category}
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className="p-6">
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="text-xl font-bold text-foreground line-clamp-1 group-hover:text-primary transition-colors flex-1">
                                                    {design.title}
                                                </h3>
                                                {user?.role === 'admin' && (
                                                    <button
                                                        onClick={(e) => handleDelete(e, design._id)}
                                                        className="ml-2 text-destructive hover:bg-destructive/10 p-1.5 rounded-full transition-colors z-20"
                                                        title="Delete Design"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                )}
                                            </div>

                                            <p className="text-muted-foreground text-sm line-clamp-2 mb-4 h-10">
                                                {design.description}
                                            </p>

                                            <div className="flex items-center justify-between mt-auto">
                                                <div className="flex items-center text-primary font-bold text-lg">
                                                    <IndianRupee className="h-5 w-5" />
                                                    {design.price.toLocaleString()}
                                                </div>

                                                <button className="p-2 rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                                    <ArrowRight className="h-5 w-5" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Pagination Controls */}
                        {!loading && designs.length > 0 && totalPages > 1 && (
                            <div className="mt-12 flex justify-center items-center gap-4">
                                <button
                                    onClick={() => handlePageChange(page - 1)}
                                    disabled={page === 1}
                                    className="px-4 py-2 rounded-lg border border-border bg-card hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                                >
                                    Previous
                                </button>

                                <span className="text-sm font-medium text-muted-foreground">
                                    Page <span className="text-foreground font-bold">{page}</span> of {totalPages}
                                </span>

                                <button
                                    onClick={() => handlePageChange(page + 1)}
                                    disabled={page === totalPages}
                                    className="px-4 py-2 rounded-lg border border-border bg-card hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Detail Modal */}
                    {selectedDesign && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
                            <div
                                className="absolute inset-0 bg-background/80 backdrop-blur-sm"
                                onClick={() => setSelectedDesign(null)}
                            />

                            <div className="relative w-full max-w-4xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col md:flex-row">

                                <button
                                    onClick={() => setSelectedDesign(null)}
                                    className="absolute top-4 right-4 z-10 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors backdrop-blur-md"
                                >
                                    <X className="h-6 w-6" />
                                </button>

                                {/* Image Side */}
                                <div className="w-full md:w-1/2 h-64 md:h-auto relative bg-black">
                                    <img
                                        src={selectedDesign.imageUrl}
                                        alt={selectedDesign.title}
                                        className="w-full h-full object-cover"
                                    />
                                </div>

                                {/* Info Side */}
                                <div className="w-full md:w-1/2 p-8 overflow-y-auto bg-card">
                                    <div className="mb-6">
                                        <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full mb-3 uppercase tracking-wider">
                                            {selectedDesign.category}
                                        </span>
                                        <h2 className="text-3xl font-bold text-foreground mb-2">{selectedDesign.title}</h2>
                                        <div className="flex items-center text-xl font-bold text-primary">
                                            <IndianRupee className="h-6 w-6" />
                                            {selectedDesign.price.toLocaleString()}
                                            <span className="text-sm font-normal text-muted-foreground ml-2">/ License</span>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div>
                                            <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">Description</h4>
                                            <p className="text-foreground leading-relaxed">
                                                {selectedDesign.description}
                                            </p>
                                        </div>

                                        <div>
                                            <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">Details</h4>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="p-3 bg-muted/20 rounded-lg border border-border">
                                                    <span className="text-xs text-muted-foreground block">Material</span>
                                                    <span className="font-medium">{selectedDesign.material}</span>
                                                </div>
                                                <div className="p-3 bg-muted/20 rounded-lg border border-border">
                                                    <span className="text-xs text-muted-foreground block">Date Added</span>
                                                    <span className="font-medium">{new Date(selectedDesign.createdAt).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Documentation Section */}
                                        <div>
                                            <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">Documentation & Downloads</h4>

                                            <div className="space-y-3">
                                                {/* Public Resources - Always Visible */}
                                                <a
                                                    href={getDesignDownloadUrl(selectedDesign._id, 'public')}
                                                    className="flex items-center p-3 bg-blue-500/10 text-blue-600 rounded-lg border border-blue-500/20 hover:bg-blue-500/20 transition-colors"
                                                >
                                                    <Download className="h-5 w-5 mr-3" />
                                                    <div className="flex-1">
                                                        <span className="font-medium block">Public Resources</span>
                                                        <span className="text-xs opacity-70">Download Brochure/Specs</span>
                                                    </div>
                                                </a>

                                                {/* Private Project Details - Restricted */}
                                                {(isPurchased || user?.role === 'admin') ? (
                                                    <a
                                                        href={getAuthenticatedDesignUrl(selectedDesign._id)}
                                                        onClick={() => console.log('Downloading private file:', getAuthenticatedDesignUrl(selectedDesign._id))}
                                                        className="flex items-center p-3 bg-green-500/10 text-green-600 rounded-lg border border-green-500/20 hover:bg-green-500/20 transition-colors"
                                                    >
                                                        <Unlock className="h-5 w-5 mr-3" />
                                                        <div className="flex-1">
                                                            <span className="font-medium block">Project Details</span>
                                                            <span className="text-xs opacity-70">Full Documentation & Source Files</span>
                                                        </div>
                                                    </a>
                                                ) : (
                                                    <div className="flex items-center p-3 bg-muted/30 text-muted-foreground rounded-lg border border-border opacity-70 cursor-not-allowed">
                                                        <Lock className="h-5 w-5 mr-3" />
                                                        <div className="flex-1">
                                                            <span className="font-medium block">Project Details</span>
                                                            <span className="text-xs">Purchase license to unlock</span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-8 pt-6 border-t border-border">
                                        {user?.role === 'admin' ? (
                                            <div>
                                                <h3 className="text-lg font-bold text-foreground mb-4">Design Statistics</h3>
                                                {statsLoading ? (
                                                    <div className="flex justify-center py-4">
                                                        <Loader2 className="h-8 w-8 text-primary animate-spin" />
                                                    </div>
                                                ) : designStats ? (
                                                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div className="bg-muted/30 p-4 rounded-xl border border-border">
                                                                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                                                                    <ShoppingBag className="h-4 w-4" />
                                                                    <span className="text-xs font-semibold uppercase">Total Sales</span>
                                                                </div>
                                                                <p className="text-2xl font-bold text-foreground">{designStats.totalSales}</p>
                                                            </div>
                                                            <div className="bg-muted/30 p-4 rounded-xl border border-border">
                                                                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                                                                    <IndianRupee className="h-4 w-4" />
                                                                    <span className="text-xs font-semibold uppercase">Total Revenue</span>
                                                                </div>
                                                                <p className="text-2xl font-bold text-primary">₹{designStats.totalRevenue.toLocaleString()}</p>
                                                            </div>
                                                        </div>

                                                        {designStats.recentBuyers && designStats.recentBuyers.length > 0 && (
                                                            <div>
                                                                <h4 className="text-sm font-medium text-muted-foreground mb-2">Recent Buyers</h4>
                                                                <div className="bg-muted/20 rounded-xl border border-border max-h-40 overflow-y-auto">
                                                                    {designStats.recentBuyers.map((tx) => (
                                                                        <div key={tx._id} className="p-3 border-b border-border last:border-0 flex justify-between items-center text-sm">
                                                                            <div className="font-medium">{tx.user?.name || 'Unknown User'}</div>
                                                                            <div className="text-muted-foreground text-xs">{new Date(tx.createdAt).toLocaleDateString()}</div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}

                                                    </div>
                                                ) : (
                                                    <p className="text-muted-foreground">No data available.</p>
                                                )}
                                            </div>
                                        ) : isPurchased ? (
                                            <div className="w-full py-4 bg-green-500/10 text-green-600 rounded-xl font-bold text-lg border border-green-500/20 flex items-center justify-center">
                                                <CheckCircle className="mr-2 h-6 w-6" />
                                                License Purchased
                                            </div>
                                        ) : (
                                            <>
                                                <button
                                                    onClick={() => handleBuy(selectedDesign)}
                                                    className="w-full py-4 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-bold text-lg shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center"
                                                >
                                                    <ShoppingBag className="mr-2 h-6 w-6" />
                                                    Buy License
                                                </button>
                                                <p className="text-center text-xs text-muted-foreground mt-3">
                                                    Powered by Razorpay
                                                </p>
                                            </>
                                        )}
                                    </div>
                                </div>

                            </div>
                        </div>
                    )}
                </div>
            </DashboardLayout >
        </>
    );

};

export default Designs;

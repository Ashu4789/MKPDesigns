import { useState, useEffect, useContext } from 'react';
import { getDesigns } from '../services/api';
import { Search, Filter, SlidersHorizontal, ArrowRight, IndianRupee, Cloud, Download, ShoppingBag, X, Loader2 } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';

const Designs = () => {
    const { user } = useContext(AuthContext);
    const [designs, setDesigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDesign, setSelectedDesign] = useState(null);

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
    }, [filters, search]); // Simple debounce could be added for better performance

    const fetchDesigns = async () => {
        try {
            setLoading(true);
            const params = {
                search,
                ...filters
            };
            if (params.category === 'All') delete params.category;

            const response = await getDesigns(params);
            setDesigns(response.data);
        } catch (error) {
            console.error('Error fetching designs:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const handleBuyRun = (design) => {
        // Mock purchase flow
        alert(`Initiating purchase for usage rights of "${design.title}" for ₹${design.price}. Check your email for next steps!`);
    };

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
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 rounded-full bg-muted/50 border border-transparent focus:bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                                    />
                                </div>

                                <div className="flex items-center gap-4 w-full md:w-auto">
                                    {/* Category HScroll */}
                                    <div className="flex overflow-x-auto pb-1 md:pb-0 gap-2 no-scrollbar flex-1 md:flex-none">
                                        {['All', 'Residential', 'Commercial', 'Industrial', 'Landscape', 'Interior'].map((cat) => (
                                            <button
                                                key={cat}
                                                onClick={() => setFilters({ ...filters, category: cat })}
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
                                                <h3 className="text-xl font-bold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                                                    {design.title}
                                                </h3>
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

                                        {selectedDesign.documentationUrl && (
                                            <div>
                                                <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">Documentation</h4>
                                                <a
                                                    href={selectedDesign.documentationUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center p-3 bg-blue-500/10 text-blue-500 rounded-lg border border-blue-500/20 hover:bg-blue-500/20 transition-colors"
                                                >
                                                    <Download className="h-5 w-5 mr-3" />
                                                    <div className="flex-1">
                                                        <span className="font-medium block">Project Report / Specs</span>
                                                        <span className="text-xs opacity-70">Download PDF/Doc</span>
                                                    </div>
                                                </a>
                                            </div>
                                        )}
                                    </div>

                                    <div className="mt-8 pt-6 border-t border-border">
                                        <button
                                            onClick={() => handleBuyRun(selectedDesign)}
                                            className="w-full py-4 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-bold text-lg shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center"
                                        >
                                            <ShoppingBag className="mr-2 h-6 w-6" />
                                            Buy License
                                        </button>
                                        <p className="text-center text-xs text-muted-foreground mt-3">
                                            Secure payment powered by Stripe (Mock)
                                        </p>
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

import { useState, useEffect } from 'react';
import { getSalesHistory } from '../services/api';
import { IndianRupee, Search, ArrowLeft, ArrowRight, Download } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';

const SalesHistory = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    // Pagination & Filter
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState('');
    const [totalSales, setTotalSales] = useState(0);

    useEffect(() => {
        fetchSales();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, search]);

    const fetchSales = async () => {
        try {
            setLoading(true);
            const response = await getSalesHistory({ page, limit: 10, search });
            setTransactions(response.data.transactions);
            setTotalPages(response.data.pages);
            setTotalSales(response.data.total);
        } catch (error) {
            console.error('Error fetching sales history:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setPage(newPage);
        }
    };

    return (
        <DashboardLayout>
            <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-6xl mx-auto">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                        <h1 className="text-3xl font-bold text-foreground">Sales History</h1>

                        <div className="relative w-full md:w-64">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search transactions..."
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    setPage(1);
                                }}
                                className="w-full pl-9 pr-4 py-2 rounded-lg bg-card border border-border focus:ring-1 focus:ring-primary focus:border-primary"
                            />
                        </div>
                    </div>

                    <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-border bg-muted/30 flex justify-between items-center">
                            <span className="text-sm font-medium text-muted-foreground">Total Sales: {totalSales}</span>
                        </div>

                        {loading ? (
                            <div className="p-8 text-center text-muted-foreground">Loading...</div>
                        ) : transactions.length === 0 ? (
                            <div className="p-12 text-center text-muted-foreground">
                                <h3 className="text-lg font-medium">No sales found</h3>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-muted/50 border-b border-border">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Date</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">User</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Design</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Amount</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Txn ID</th>
                                            <th className="px-6 py-3 text-right text-xs font-semibold text-muted-foreground uppercase">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {transactions.map((transaction) => (
                                            <tr key={transaction._id} className="hover:bg-muted/20 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                                                    {new Date(transaction.createdAt).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-foreground">{transaction.user?.name || 'Unknown'}</div>
                                                    <div className="text-xs text-muted-foreground">{transaction.user?.email}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                                                    {transaction.designTitle}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center text-sm font-medium text-foreground">
                                                        <IndianRupee className="h-3 w-3 mr-1" />
                                                        {transaction.amount}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-xs font-mono text-muted-foreground">
                                                    {transaction.razorpayPaymentId}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-500">
                                                        Completed
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="px-6 py-4 border-t border-border flex items-center justify-between bg-muted/30">
                                <button
                                    onClick={() => handlePageChange(page - 1)}
                                    disabled={page === 1}
                                    className="p-2 rounded-lg hover:bg-muted disabled:opacity-50 transition-colors"
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                </button>
                                <span className="text-sm text-muted-foreground">
                                    Page {page} of {totalPages}
                                </span>
                                <button
                                    onClick={() => handlePageChange(page + 1)}
                                    disabled={page === totalPages}
                                    className="p-2 rounded-lg hover:bg-muted disabled:opacity-50 transition-colors"
                                >
                                    <ArrowRight className="h-4 w-4" />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default SalesHistory;

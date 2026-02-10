import { useState, useEffect } from 'react';
import { getUserTransactions, getDesignDownloadUrl, getInvoiceUrl } from '../services/api';
import DashboardLayout from '../components/DashboardLayout';
import { Download, Calendar, IndianRupee, Clock, CheckCircle, XCircle } from 'lucide-react';

const PurchaseHistory = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTransactions();
    }, []);

    const fetchTransactions = async () => {
        try {
            const response = await getUserTransactions();
            setTransactions(response.data);
        } catch (error) {
            console.error('Error fetching transactions:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed': return 'text-green-500 bg-green-500/10';
            case 'pending': return 'text-yellow-500 bg-yellow-500/10';
            case 'failed': return 'text-red-500 bg-red-500/10';
            default: return 'text-gray-500 bg-gray-500/10';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'completed': return <CheckCircle className="h-4 w-4 mr-1" />;
            case 'pending': return <Clock className="h-4 w-4 mr-1" />;
            case 'failed': return <XCircle className="h-4 w-4 mr-1" />;
            default: return null;
        }
    };

    return (
        <DashboardLayout>
            <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-5xl mx-auto">
                    <h1 className="text-3xl font-bold text-foreground mb-8">Purchase History</h1>

                    <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                        {loading ? (
                            <div className="p-8 text-center text-muted-foreground">Loading...</div>
                        ) : transactions.length === 0 ? (
                            <div className="p-12 text-center text-muted-foreground">
                                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <h3 className="text-lg font-medium">No purchases yet</h3>
                                <p className="mt-2 text-sm">When you buy a design, it will appear here.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-muted/50 border-b border-border">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Design</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Amount</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-4 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {transactions.map((transaction) => (
                                            <tr key={transaction._id} className="hover:bg-muted/20 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="font-medium text-foreground">{transaction.designTitle}</div>
                                                    <div className="text-xs text-muted-foreground font-mono mt-1">ID: {transaction.razorpayPaymentId || '-'}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                                                    {new Date(transaction.createdAt).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center text-sm font-medium text-foreground">
                                                        <IndianRupee className="h-3 w-3 mr-1" />
                                                        {transaction.amount}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                                                        {getStatusIcon(transaction.status)}
                                                        {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    {transaction.status === 'completed' && (
                                                        <div className="flex flex-col space-y-2 text-right">
                                                            <a
                                                                href={getInvoiceUrl(transaction._id)}
                                                                className="text-red-500 hover:text-red-700 inline-flex items-center hover:underline text-xs justify-end"
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                            >
                                                                <Download className="h-4 w-4 mr-1" />
                                                                Download Invoice
                                                            </a>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default PurchaseHistory;

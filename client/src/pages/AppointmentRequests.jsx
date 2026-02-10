import { useState, useEffect } from 'react';
import { getAppointments, updateAppointment } from '../services/api';
import DashboardLayout from '../components/DashboardLayout';
import { Calendar, Clock, Video, Check, X, MessageSquare, ExternalLink, Search, Filter } from 'lucide-react';

const AppointmentRequests = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedAppointment, setSelectedAppointment] = useState(null); // For modal
    const [replyData, setReplyData] = useState({ status: '', adminReply: '', meetingLink: '' });
    const [filterStatus, setFilterStatus] = useState('all');

    useEffect(() => {
        fetchAppointments();
    }, []);

    const fetchAppointments = async () => {
        try {
            const response = await getAppointments();
            setAppointments(response.data);
        } catch (error) {
            console.error('Error fetching appointments:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = (appointment, action) => {
        setSelectedAppointment(appointment);
        setReplyData({
            status: action === 'confirm' ? 'confirmed' : 'cancelled',
            adminReply: '',
            meetingLink: ''
        });
    };

    const handleSubmitReply = async (e) => {
        e.preventDefault();
        try {
            await updateAppointment(selectedAppointment._id, replyData);
            alert('Appointment updated successfully');
            setSelectedAppointment(null);
            fetchAppointments(); // Refresh list
        } catch (error) {
            console.error('Error updating appointment:', error);
            alert('Failed to update appointment');
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            pending: 'bg-yellow-100 text-yellow-800',
            confirmed: 'bg-green-100 text-green-800',
            cancelled: 'bg-red-100 text-red-800',
            completed: 'bg-blue-100 text-blue-800'
        };
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${styles[status] || styles.pending}`}>
                {status}
            </span>
        );
    };

    return (
        <DashboardLayout>
            <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-6xl mx-auto">
                    <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
                        <h1 className="text-3xl font-bold text-foreground mb-4 sm:mb-0">Appointment Requests</h1>
                        <div className="flex items-center bg-card border border-border rounded-lg px-3 py-2 shadow-sm">
                            <Filter className="h-4 w-4 text-muted-foreground mr-2" />
                            <select
                                className="bg-transparent border-none focus:ring-0 text-sm font-medium text-foreground outline-none cursor-pointer"
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                            >
                                <option value="all">All Status</option>
                                <option value="pending">Pending</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>
                    </div>

                    <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                        {loading ? (
                            <div className="p-8 text-center text-muted-foreground">Loading...</div>
                        ) : appointments.length === 0 ? (
                            <div className="p-12 text-center text-muted-foreground">
                                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <h3 className="text-lg font-medium">No appointments found</h3>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-muted/50 border-b border-border">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase">Client</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase">Date & Time</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase">Mode</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase">Remarks</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase">Status</th>
                                            <th className="px-6 py-4 text-right text-xs font-semibold text-muted-foreground uppercase">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {appointments
                                            .filter(apt => filterStatus === 'all' || apt.status === filterStatus)
                                            .map((apt) => (
                                                <tr key={apt._id} className="hover:bg-muted/20 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="font-medium text-foreground">{apt.name}</div>
                                                        <div className="text-xs text-muted-foreground">{apt.email}</div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="text-sm text-foreground flex items-center">
                                                            <Calendar className="h-3 w-3 mr-1" />
                                                            {new Date(apt.date).toLocaleDateString()}
                                                        </div>
                                                        <div className="text-xs text-muted-foreground flex items-center mt-1">
                                                            <Clock className="h-3 w-3 mr-1" />
                                                            {apt.time}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-muted-foreground">
                                                        {apt.mode}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-muted-foreground max-w-xs truncate" title={apt.remarks || 'No remarks'}>
                                                        {apt.remarks || '-'}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {getStatusBadge(apt.status)}
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        {apt.status === 'pending' && (
                                                            <div className="flex justify-end gap-2">
                                                                <button
                                                                    onClick={() => handleAction(apt, 'confirm')}
                                                                    className="p-1.5 rounded-full bg-green-100 text-green-600 hover:bg-green-200 transition-colors"
                                                                    title="Accept"
                                                                >
                                                                    <Check className="h-4 w-4" />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleAction(apt, 'reject')}
                                                                    className="p-1.5 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                                                                    title="Reject"
                                                                >
                                                                    <X className="h-4 w-4" />
                                                                </button>
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

                {/* Reply Modal */}
                {selectedAppointment && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <div className="bg-card rounded-xl max-w-lg w-full p-6 shadow-2xl animate-in zoom-in-95">
                            <h2 className="text-xl font-bold mb-4">
                                {replyData.status === 'confirmed' ? 'Confirm Appointment' : 'Reject Appointment'}
                            </h2>

                            <div className="bg-muted/30 p-4 rounded-lg mb-4 text-sm">
                                <p><strong>User:</strong> {selectedAppointment.name}</p>
                                <p><strong>Date:</strong> {new Date(selectedAppointment.date).toLocaleDateString()} at {selectedAppointment.time}</p>
                                <p><strong>Mode:</strong> {selectedAppointment.mode}</p>
                                <p><strong>Remarks:</strong> {selectedAppointment.remarks || 'None'}</p>
                            </div>

                            <form onSubmit={handleSubmitReply} className="space-y-4">
                                {replyData.status === 'confirmed' && (
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Meeting Link (Optional)</label>
                                        <input
                                            type="text"
                                            className="w-full px-3 py-2 border rounded-lg bg-background"
                                            placeholder="e.g., Google Meet link"
                                            value={replyData.meetingLink}
                                            onChange={(e) => setReplyData({ ...replyData, meetingLink: e.target.value })}
                                        />
                                    </div>
                                )}
                                <div>
                                    <label className="block text-sm font-medium mb-1">Message to Client</label>
                                    <textarea
                                        className="w-full px-3 py-2 border rounded-lg bg-background"
                                        rows="4"
                                        required
                                        placeholder="Add a message..."
                                        value={replyData.adminReply}
                                        onChange={(e) => setReplyData({ ...replyData, adminReply: e.target.value })}
                                    />
                                </div>
                                <div className="flex justify-end gap-3 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => setSelectedAppointment(null)}
                                        className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90"
                                    >
                                        Send Reply
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default AppointmentRequests;

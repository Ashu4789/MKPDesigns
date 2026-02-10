import { useState, useEffect } from 'react';
import { bookAppointment, getAppointments } from '../services/api';
import DashboardLayout from '../components/DashboardLayout';
import { Calendar, Clock, Video, Users, MessageSquare, CheckCircle } from 'lucide-react';

const SetAppointment = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        date: '',
        time: '',
        mode: 'Video Call',
        purpose: '',
        remarks: ''
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [appointments, setAppointments] = useState([]);
    const [fetchingHistory, setFetchingHistory] = useState(true);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const response = await getAppointments();
            setAppointments(response.data);
        } catch (error) {
            console.error('Error fetching appointment history:', error);
        } finally {
            setFetchingHistory(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await bookAppointment(formData);
            setSuccess(true);
        } catch (error) {
            console.error('Error booking appointment:', error);
            alert('Failed to book appointment. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <DashboardLayout>
                <div className="min-h-screen bg-background flex items-center justify-center p-4">
                    <div className="bg-card border border-border rounded-xl p-8 max-w-md w-full text-center shadow-lg">
                        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
                            <CheckCircle className="h-10 w-10 text-green-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-foreground mb-2">Appointment Requested!</h2>
                        <p className="text-muted-foreground mb-6">
                            We have received your request. You will receive a confirmation email shortly.
                        </p>
                        <button
                            onClick={() => window.location.href = '/dashboard'}
                            className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
                        >
                            Back to Dashboard
                        </button>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-3xl mx-auto">
                    <h1 className="text-3xl font-bold text-foreground mb-8">Book an Appointment</h1>

                    <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                        <div className="p-8">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Name */}
                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-2">Name</label>
                                        <input
                                            type="text"
                                            name="name"
                                            required
                                            value={formData.name}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 rounded-lg bg-muted/30 border border-border focus:ring-2 focus:ring-primary focus:border-transparent"
                                        />
                                    </div>

                                    {/* Email */}
                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-2">Email</label>
                                        <input
                                            type="email"
                                            name="email"
                                            required
                                            value={formData.email}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 rounded-lg bg-muted/30 border border-border focus:ring-2 focus:ring-primary focus:border-transparent"
                                        />
                                    </div>

                                    {/* Date */}
                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-2 flex items-center">
                                            <Calendar className="h-4 w-4 mr-2" /> Date
                                        </label>
                                        <input
                                            type="date"
                                            name="date"
                                            required
                                            value={formData.date}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 rounded-lg bg-muted/30 border border-border focus:ring-2 focus:ring-primary focus:border-transparent"
                                        />
                                    </div>

                                    {/* Time */}
                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-2 flex items-center">
                                            <Clock className="h-4 w-4 mr-2" /> Time
                                        </label>
                                        <input
                                            type="time"
                                            name="time"
                                            required
                                            value={formData.time}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 rounded-lg bg-muted/30 border border-border focus:ring-2 focus:ring-primary focus:border-transparent"
                                        />
                                    </div>

                                    {/* Mode */}
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-foreground mb-2">Mode of Communication</label>
                                        <div className="grid grid-cols-3 gap-4">
                                            {['Video Call', 'Voice Call', 'In-Person'].map((mode) => (
                                                <button
                                                    key={mode}
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, mode })}
                                                    className={`p-4 rounded-lg border text-center transition-all ${formData.mode === mode
                                                        ? 'border-primary bg-primary/5 text-primary ring-1 ring-primary'
                                                        : 'border-border bg-card hover:border-primary/50'
                                                        }`}
                                                >
                                                    {mode === 'Video Call' && <Video className="h-6 w-6 mx-auto mb-2" />}
                                                    {mode === 'Voice Call' && <Users className="h-6 w-6 mx-auto mb-2" />}
                                                    {mode === 'In-Person' && <MessageSquare className="h-6 w-6 mx-auto mb-2" />}
                                                    <span className="block text-sm font-medium">{mode}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Purpose */}
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-foreground mb-2">Purpose of Meeting</label>
                                        <textarea
                                            name="purpose"
                                            required
                                            rows="4"
                                            placeholder="Tell us what you'd like to discuss..."
                                            value={formData.purpose}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 rounded-lg bg-muted/30 border border-border focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                                        />
                                    </div>

                                    {/* Remarks */}
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-foreground mb-2">Remarks (Optional)</label>
                                        <textarea
                                            name="remarks"
                                            rows="2"
                                            placeholder="Any additional notes..."
                                            value={formData.remarks}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 rounded-lg bg-muted/30 border border-border focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                                        />
                                    </div>
                                </div>

                                <div className="mt-8 flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="px-8 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-bold shadow-lg shadow-primary/20 transition-all disabled:opacity-50"
                                    >
                                        {loading ? 'Submitting...' : 'Request Appointment'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            {/* Appointment History */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
                <h2 className="text-2xl font-bold text-foreground mb-6">Your Appointment History</h2>
                <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                    {fetchingHistory ? (
                        <div className="p-8 text-center text-muted-foreground">Loading history...</div>
                    ) : appointments.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground">No appointment history found.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-muted/50 border-b border-border">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase">Date & Time</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase">Mode</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase">Purpose</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase">Status</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase">Admin Reply</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {appointments.map((apt) => (
                                        <tr key={apt._id} className="hover:bg-muted/20 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-foreground">{new Date(apt.date).toLocaleDateString()}</div>
                                                <div className="text-xs text-muted-foreground">{apt.time}</div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-muted-foreground">{apt.mode}</td>
                                            <td className="px-6 py-4 text-sm text-muted-foreground max-w-xs truncate" title={apt.purpose}>
                                                {apt.purpose}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${apt.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                                        apt.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                                            apt.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                                                                'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                    {apt.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-muted-foreground">
                                                {apt.adminReply || '-'}
                                                {apt.meetingLink && (
                                                    <a href={apt.meetingLink} target="_blank" rel="noopener noreferrer" className="block text-primary hover:underline mt-1">
                                                        Join Meeting
                                                    </a>
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
        </DashboardLayout>
    );
};

export default SetAppointment;

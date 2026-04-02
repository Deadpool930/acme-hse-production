import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { AlertTriangle, Activity, ShieldCheck, Zap, Loader2, ClipboardList } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { fetchDashboardSummary } from '../api/dashboard';
import { useAuth } from '../context/AuthContext';
import GlassCard from './ui/GlassCard';
import SecureButton from './ui/SecureButton';
import client from '../api/client';

const DashboardTrends = () => {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
    const [assignData, setAssignData] = useState({ assignee_id: '', description: '' });

    // 1. Fetch Dashboard Analytics
    const { data: analytics, isLoading: analyticsLoading, error: analyticsError } = useQuery({
        queryKey: ['dashboardSummary'],
        queryFn: fetchDashboardSummary
    });

    // 2. Fetch Recent Incidents
    const { data: events, isLoading: eventsLoading } = useQuery({
        queryKey: ['events'],
        queryFn: async () => {
            const res = await client.get('/events/');
            return res.data;
        }
    });

    // 3. Fetch Potential Responders (Site Personnel)
    const { data: responders } = useQuery({
        queryKey: ['responders'],
        queryFn: async () => {
            const res = await client.get('/users/');
            return res.data;
        }
    });

    // 4. Assignment Mutation
    const assignTask = useMutation({
        mutationFn: async (data: any) => {
            return await client.post(`/events/${selectedEventId}/action-plan`, {
                description: data.description,
                assignee_id: parseInt(data.assignee_id),
                due_date: new Date(Date.now() + 86400000).toISOString() // 24hr SLA
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['events'] });
            queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] });
            setSelectedEventId(null);
            setAssignData({ assignee_id: '', description: '' });
        }
    });

    if (analyticsLoading || eventsLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 space-y-4 animate-in fade-in duration-700">
                <Loader2 className="animate-spin text-accent" size={48} />
                <p className="text-slate-500 font-medium tracking-widest uppercase text-xs text-center">Aggregating Global HSE Data...</p>
            </div>
        );
    }

    if (analyticsError || !analytics) {
        return (
            <div className="p-8 text-center text-red-500 bg-red-500/10 border border-red-500/20 rounded-2xl">
                System Error: Unable to fetch analytics. Verify backend connection.
            </div>
        );
    }

    const stats = analytics.stats || { total_events: 0, open_actions: 0, closed_cases: 0, critical_risks: 0 };
    const trends = analytics.trends || [];

    const statCards = [
        { label: 'Total Events', value: stats.total_events, icon: Activity, color: 'text-blue-400', bg: 'bg-blue-400/10' },
        { label: 'SLA Breaches', value: stats.open_actions, icon: Zap, color: 'text-amber-400', bg: 'bg-amber-400/10' },
        { label: 'Closed Cases', value: stats.closed_cases, icon: ShieldCheck, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
        { label: 'High Risks', value: stats.critical_risks, icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-400/10' },
    ];

    const riskData = [
        { name: 'Low', value: 45, color: '#10b981' },
        { name: 'Medium', value: 30, color: '#f59e0b' },
        { name: 'High', value: stats.critical_risks || 0, color: '#ef4444' },
    ];

    return (
        <div className="space-y-8 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Top Stats - High Impact Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {statCards.map((stat, i) => (
                    <GlassCard key={i} className="p-6 space-y-4 border-l-4" hoverable>
                        <div className="flex justify-between items-center">
                            <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                                <stat.icon size={24} />
                            </div>
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">LIVE FEED</span>
                        </div>
                        <div className="space-y-1">
                            <div className="text-3xl font-display font-bold text-white tracking-tight">{stat.value}</div>
                            <div className="text-xs font-bold text-slate-400 uppercase tracking-tighter">{stat.label}</div>
                        </div>
                    </GlassCard>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Performance Analytics */}
                <GlassCard className="p-8" hoverable>
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h4 className="text-xl font-bold text-white font-display">Event Trajectory</h4>
                            <p className="text-xs text-slate-500 font-medium uppercase tracking-widest mt-1">Multi-site Comparison • Quarterly</p>
                        </div>
                        <Activity className="text-accent/40" />
                    </div>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={trends}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                <XAxis dataKey="month" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} fontFamily="Inter" />
                                <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} fontFamily="Inter" />
                                <Tooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(51, 65, 85, 0.5)', borderRadius: '16px', backdropFilter: 'blur(12px)' }} />
                                <Bar dataKey="ua" stackId="a" fill="#38bdf8" radius={[0, 0, 0, 0]} name="Unsafe Act" barSize={32} />
                                <Bar dataKey="uc" stackId="a" fill="#818cf8" radius={[0, 0, 0, 0]} name="Unsafe Cond" />
                                <Bar dataKey="nm" stackId="a" fill="#c084fc" radius={[6, 6, 0, 0]} name="Near Miss" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </GlassCard>

                {/* Risk Distribution Profile */}
                <GlassCard className="p-8" hoverable>
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h4 className="text-xl font-bold text-white font-display">Risk Profile</h4>
                            <p className="text-xs text-slate-500 font-medium uppercase tracking-widest mt-1">Site-wide Severity Balance</p>
                        </div>
                        <ShieldCheck className="text-emerald-500/40" />
                    </div>
                    <div className="h-72 relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={riskData} cx="50%" cy="50%" innerRadius={75} outerRadius={95} paddingAngle={8} dataKey="value">
                                    {riskData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(51, 65, 85, 0.5)', borderRadius: '16px' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </GlassCard>
            </div>

            {/* Safety Incident Ledger (Senior Designer View) */}
            <GlassCard className="p-0 overflow-hidden" hoverable>
                <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/40">
                    <h4 className="text-lg font-bold text-white flex items-center gap-3">
                        <ClipboardList className="text-accent" />
                        Incident Authority Ledger
                    </h4>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Global HSE Oversight</span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-900/80 text-slate-400 text-[10px] uppercase tracking-widest font-bold">
                            <tr>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Incident Description</th>
                                <th className="px-6 py-4 text-xs">Site #</th>
                                <th className="px-6 py-4 text-right">Authority Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {events?.map((event: any) => (
                                <tr key={event.id} className="hover:bg-slate-800/30 transition-colors group">
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-md text-[9px] font-bold uppercase tracking-tighter ${
                                            event.status === 'Open' ? 'bg-red-500/10 text-red-500' :
                                            event.status === 'In Progress' ? 'bg-blue-500/10 text-blue-500' :
                                            'bg-emerald-500/10 text-emerald-500'
                                        }`}>
                                            {event.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-xs font-bold text-slate-300 line-clamp-1">{event.description}</div>
                                        <div className="text-[10px] text-slate-500">{event.event_type}</div>
                                    </td>
                                    <td className="px-6 py-4 text-xs text-slate-400">
                                        {event.plant_id}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {((user?.role_level ?? 99) <= 2 && event.status === 'Open') && (
                                            <SecureButton 
                                                onClick={() => setSelectedEventId(event.id)}
                                                className="text-[10px] py-2 px-4 h-auto"
                                            >
                                                Assign Task
                                            </SecureButton>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </GlassCard>

            {/* Assignment Portal Overlay */}
            {selectedEventId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-3xl p-8 shadow-2xl">
                        <h3 className="text-xl font-bold text-white mb-2">Assign Safety Task</h3>
                        <p className="text-xs text-slate-500 mb-6 uppercase tracking-widest font-bold">Incident ID: #{selectedEventId}</p>
                        
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Target Responder</label>
                                <select 
                                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none"
                                    value={assignData.assignee_id}
                                    onChange={(e) => setAssignData({...assignData, assignee_id: e.target.value})}
                                >
                                    <option value="">Select Site Engineer...</option>
                                    {responders?.map((res: any) => (
                                        <option key={res.id} value={res.id}>{res.fullname} ({res.role_name})</option>
                                    ))}
                                </select>
                            </div>
                            <textarea 
                                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none h-32 text-sm"
                                placeholder="Describe the required corrective action..."
                                value={assignData.description}
                                onChange={(e) => setAssignData({...assignData, description: e.target.value})}
                            />
                        </div>

                        <SecureButton 
                            onClick={() => assignTask.mutate(assignData)}
                            loading={assignTask.isPending}
                            className="w-full py-4 mt-8"
                        >
                            Confirm Assignment
                        </SecureButton>
                        <button 
                            onClick={() => setSelectedEventId(null)}
                            className="w-full py-2 mt-2 text-slate-500 text-sm hover:text-slate-300 transition-colors"
                        >
                            Back to Ledger
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DashboardTrends;

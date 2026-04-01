import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { AlertTriangle, Activity, ShieldCheck, Zap, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { fetchDashboardSummary } from '../api/dashboard';
import GlassCard from './ui/GlassCard';

const DashboardTrends = () => {
    const { data, isLoading, error } = useQuery({
        queryKey: ['dashboardSummary'],
        queryFn: fetchDashboardSummary
    });

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-full py-20 space-y-4 animate-in fade-in duration-700">
                <Loader2 className="animate-spin text-accent" size={48} />
                <p className="text-slate-500 font-medium tracking-widest uppercase text-xs">Aggregating Global HSE Data...</p>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="p-8 text-center text-red-500 bg-red-500/10 border border-red-500/20 rounded-2xl">
                System Error: Unable to fetch analytics. Verify backend connection.
            </div>
        );
    }

    const stats = data?.stats || { total_events: 0, open_actions: 0, closed_cases: 0, critical_risks: 0 };
    const trends = data?.trends || [];

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
                                <XAxis 
                                    dataKey="month" 
                                    stroke="#475569" 
                                    fontSize={10} 
                                    tickLine={false} 
                                    axisLine={false} 
                                    fontFamily="Inter"
                                />
                                <YAxis 
                                    stroke="#475569" 
                                    fontSize={10} 
                                    tickLine={false} 
                                    axisLine={false} 
                                    fontFamily="Inter"
                                />
                                <Tooltip 
                                    contentStyle={{ 
                                        backgroundColor: 'rgba(15, 23, 42, 0.95)', 
                                        border: '1px solid rgba(51, 65, 85, 0.5)', 
                                        borderRadius: '16px',
                                        backdropFilter: 'blur(12px)',
                                        boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.5)'
                                    }}
                                    itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                                />
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
                                <Pie
                                    data={riskData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={75}
                                    outerRadius={95}
                                    paddingAngle={8}
                                    dataKey="value"
                                    animationBegin={200}
                                    animationDuration={1500}
                                >
                                    {riskData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                    ))}
                                </Pie>
                                <Tooltip 
                                    contentStyle={{ 
                                        backgroundColor: 'rgba(15, 23, 42, 0.95)', 
                                        border: '1px solid rgba(51, 65, 85, 0.5)', 
                                        borderRadius: '16px' 
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-x-0 bottom-0 flex justify-center gap-6 pb-2">
                            {riskData.map((r, i) => (
                                <div key={i} className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: r.color }} />
                                    <span className="text-[10px] font-bold text-slate-400 uppercase">{r.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </GlassCard>
            </div>
        </div>
    );
};

export default DashboardTrends;

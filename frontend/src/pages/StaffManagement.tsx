import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UserPlus, Shield, Trash2 } from 'lucide-react';
import GlassCard from '../components/ui/GlassCard';
import SecureButton from '../components/ui/SecureButton';
import client from '../api/client';

const StaffManagement = () => {
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        fullname: '',
        email: '',
        password: '',
        role_id: '3',
        region: ''
    });

    // 1. Fetch current users (Admin Only)
    const { data: users } = useQuery({
        queryKey: ['users'],
        queryFn: async () => {
            const res = await client.get('/users/'); 
            return res.data;
        },
        initialData: [] 
    });

    // 2. Create User Mutation
    const createUser = useMutation({
        mutationFn: async (data: any) => {
            return await client.post('/users/admin/create', data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            setIsModalOpen(false);
            setFormData({ fullname: '', email: '', password: '', role_id: '3', region: '' });
        }
    });

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <header className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                        <Shield className="text-accent" />
                        Staff Authority Management
                    </h2>
                    <p className="text-slate-400 mt-1">Manage hierarchical access levels for site and regional personnel.</p>
                </div>
                <SecureButton 
                    onClick={() => setIsModalOpen(true)}
                    loading={createUser.isPending}
                    className="flex items-center gap-2 px-6"
                >
                    <UserPlus size={18} />
                    Onboard Employee
                </SecureButton>
            </header>

            {/* Authority Data Table */}
            <GlassCard className="p-0 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-900/80 text-slate-400 text-xs uppercase tracking-widest font-bold">
                        <tr>
                            <th className="px-6 py-4">Full Name / Email</th>
                            <th className="px-6 py-4 text-center">Rank</th>
                            <th className="px-6 py-4">Region</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                        {users.map((user: any) => (
                            <tr key={user.id} className="hover:bg-slate-800/30 transition-colors group">
                                <td className="px-6 py-4">
                                    <div className="font-semibold text-white">{user.fullname}</div>
                                    <div className="text-xs text-slate-500">{user.email}</div>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                        user.role_level === 1 ? 'bg-amber-500/10 text-amber-500' :
                                        user.role_level === 2 ? 'bg-blue-500/10 text-blue-500' :
                                        'bg-slate-700/50 text-slate-400'
                                    }`}>
                                        {user.role_name}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-slate-400">
                                    {user.region || 'Global'}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button className="p-2 text-slate-500 hover:text-red-400 transition-colors">
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </GlassCard>

            {/* Onboarding Modal Overlay */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-3xl p-8 shadow-2xl relative">
                        <h3 className="text-xl font-bold text-white mb-6">Onboard New Personnel</h3>
                        <form className="space-y-4" onSubmit={(e) => {
                            e.preventDefault();
                            createUser.mutate(formData);
                        }}>
                             <div className="space-y-4">
                                <input 
                                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-accent transition-colors"
                                    placeholder="Full Name"
                                    value={formData.fullname}
                                    onChange={(e) => setFormData({...formData, fullname: e.target.value})}
                                    required
                                />
                                <input 
                                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-accent transition-colors"
                                    type="email"
                                    placeholder="Work Email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                                    required
                                />
                                <input 
                                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-accent transition-colors"
                                    type="password"
                                    placeholder="Secure Initial Password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                                    required
                                />
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Authority Level</label>
                                    <select 
                                        className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none"
                                        value={formData.role_id}
                                        onChange={(e) => setFormData({...formData, role_id: e.target.value})}
                                    >
                                        <option value="2">Regional Lead (Cluster)</option>
                                        <option value="3">Site Head / EHS Officer</option>
                                        <option value="4">External Auditor</option>
                                    </select>
                                </div>
                            </div>
                            <SecureButton 
                                type="submit" 
                                loading={createUser.isPending}
                                className="w-full py-4 mt-6"
                            >
                                Activate Credentials
                            </SecureButton>
                            <button 
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="w-full py-2 text-slate-500 text-sm hover:text-slate-300 transition-colors"
                            >
                                Cancel
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StaffManagement;

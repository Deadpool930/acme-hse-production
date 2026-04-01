import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import EventSubmissionForm from './components/EventSubmissionForm';
import DashboardTrends from './components/DashboardTrends';
import Login from './pages/Login';
import { LayoutDashboard, ShieldCheck, Activity, LogOut, User } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';

const queryClient = new QueryClient();

function AppContent() {
  const [view, setView] = useState<'dashboard' | 'report'>('dashboard');
  const { user, isAuthenticated, handleLogout, checkAuth } = useAuth();

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0f18] outline-none">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 font-medium animate-pulse">Initializing Security Protocol...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login onLoginSuccess={checkAuth} />;
  }

  return (
    <div className="min-h-screen flex bg-[#0a0f18] text-slate-200 relative overflow-hidden">
      {/* Background Accents */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-accent/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />
      {/* Sidebar Navigation - Premium Design */}
      <aside className="w-64 bg-slate-900/50 backdrop-blur-xl border-r border-slate-800 p-6 flex flex-col justify-between">
        <div className="space-y-8">
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center shadow-lg shadow-accent/20">
              <ShieldCheck className="text-slate-900" size={24} />
            </div>
            <h1 className="text-xl font-bold tracking-tight">ACME <span className="text-accent italic">EHS</span></h1>
          </div>

          <nav className="flex flex-col gap-2">
            {[
              { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
              { id: 'report', icon: Activity, label: 'Incident Report' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setView(item.id as any)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  view === item.id 
                    ? 'bg-accent text-slate-900 font-semibold shadow-lg shadow-accent/10' 
                    : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <item.icon size={20} />
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="pt-6 border-t border-slate-800 flex flex-col gap-2">
          <div className="px-4 py-3 bg-slate-800/30 rounded-xl flex items-center gap-3 mb-2">
            <div className="p-2 bg-accent/10 rounded-lg text-accent">
              <User size={18} />
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold truncate text-white">{user?.fullname || 'Authorized User'}</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">
                {user?.role_id === 1 ? 'Corporate' : user?.role_id === 2 ? 'Plant Head' : 'Auditor'}
              </p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors w-full"
          >
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-10 overflow-y-auto">
        <header className="mb-10 flex justify-between items-end">
          <div>
            <h2 className="text-3xl font-bold">
              {view === 'dashboard' ? 'EHS Analytics Overview' : 'HSE Event Reporting'}
            </h2>
            <p className="text-slate-400 mt-1">
              {view === 'dashboard' 
                ? 'Real-time monitoring of safety performance across all plants.' 
                : 'Submit new incident, near-miss, or safety observation reports.'}
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-slate-400 font-medium">Active Deployment</div>
            <div className="text-accent font-semibold italic">ACME Solar (Corporate)</div>
          </div>
        </header>

        <section className="max-w-5xl">
          {view === 'dashboard' ? <DashboardTrends /> : <EventSubmissionForm />}
        </section>
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;

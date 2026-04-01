import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Shield, Mail, Lock, User, AlertCircle, WifiOff } from 'lucide-react';
import { login } from '../api/auth';
import client from '../api/client';
import StandardInput from '../components/ui/StandardInput';
import SecureButton from '../components/ui/SecureButton';
import GlassCard from '../components/ui/GlassCard';

const schema = z.object({
  email: z.string().email('Invalid work email'),
  password: z.string().min(6, 'Minimum 6 characters required'),
  fullname: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

const Login = ({ onLoginSuccess }: { onLoginSuccess: () => void }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isBackendDown, setIsBackendDown] = useState(false);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        await client.get('/');
        setIsBackendDown(false);
      } catch (err) {
        console.error("Backend Connection Deadlock Detected:", err);
        setIsBackendDown(true);
      }
    };
    checkHealth();
  }, []);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    if (isBackendDown) {
      setError("Cannot Proceed: The EHS Backend is currently unresponsive. Ensure the Python server is running.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      if (mode === 'login') {
        await login({ email: data.email, password: data.password });
      } else {
        // Implement register API call here if available
        console.log("Registering:", data);
        setError("Registration is currently managed by Corporate EHS. Please contact your Plant Head.");
        return;
      }
      onLoginSuccess();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'System authentication failed. Verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0f18] relative overflow-hidden p-6">
      {/* Premium Background Accents */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[120px]" />

      <GlassCard className="w-full max-w-md space-y-8 relative z-10" hoverable>
        <div className="text-center space-y-2">
          <div className="inline-flex p-4 rounded-2xl bg-accent/10 text-accent mb-4">
            <Shield size={32} />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white font-display">ACME <span className="text-accent italic">EHS</span></h1>
          <p className="text-slate-400 text-sm">{mode === 'login' ? 'Enterprise Security Portal' : 'Request System Access'}</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {isBackendDown && (
            <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center gap-3 text-amber-400 text-sm animate-in slide-in-from-top-4 duration-500">
              <WifiOff size={18} />
              <p className="font-medium">System Offline: Backend unreachable at http://127.0.0.1:8000</p>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400 text-sm animate-in zoom-in-95">
              <AlertCircle size={18} />
              <p>{typeof error === 'string' ? error : JSON.stringify(error)}</p>
            </div>
          )}

          <div className="space-y-4">
            {mode === 'register' && (
              <StandardInput 
                label="Full Name"
                placeholder="John Doe"
                icon={<User size={18} />}
                {...register('fullname')}
                error={errors.fullname?.message}
              />
            )}

            <StandardInput 
              label="Work Email"
              type="email"
              placeholder="name@acmesolar.com"
              icon={<Mail size={18} />}
              {...register('email')}
              error={errors.email?.message}
            />

            <StandardInput 
              label="Secure Password"
              type="password"
              placeholder="••••••••"
              icon={<Lock size={18} />}
              {...register('password')}
              error={errors.password?.message}
            />
          </div>

          <SecureButton 
            type="submit" 
            loading={loading}
            disabled={isBackendDown}
            className={`w-full py-4 text-lg shadow-xl ${isBackendDown ? 'opacity-50 cursor-not-allowed grayscale' : 'shadow-accent/10'}`}
          >
            {isBackendDown ? 'Backend Unreachable' : (mode === 'login' ? 'Secure Sign In' : 'Submit Request')}
          </SecureButton>
        </form>

        <div className="pt-4 text-center">
          <button 
            type="button"
            onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
            className="text-sm text-slate-500 hover:text-accent transition-colors duration-200"
          >
            {mode === 'login' 
              ? "New here? Request system access" 
              : "Already have access? Secure login"}
          </button>
        </div>

        <p className="text-center text-[10px] text-slate-600 uppercase tracking-[0.2em] pt-2 font-bold">
          Authorized Personnel Only • IP Logged
        </p>
      </GlassCard>
    </div>
  );
};

export default Login;

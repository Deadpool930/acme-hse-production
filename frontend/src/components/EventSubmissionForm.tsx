import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useMutation } from '@tanstack/react-query';
import * as z from 'zod';
import { TriangleAlert, CheckCircle2, ChevronRight, Image as ImageIcon, Loader2, Navigation, Target } from 'lucide-react';
import { fetchPlants } from '../api/master';
import { createEvent } from '../api/events';
import GlassCard from './ui/GlassCard';
import StandardInput from './ui/StandardInput';
import SecureButton from './ui/SecureButton';

const schema = z.object({
  plant_id: z.string().min(1, 'Plant selection is required'),
  event_type: z.enum(['Unsafe Act', 'Unsafe Condition', 'Near Miss', 'First Aid', 'Medical Treatment', 'Fatal']),
  risk_level: z.enum(['Low', 'Medium', 'High']),
  impact_nature: z.string().min(3, 'Specify the nature of impact'),
  description: z.string().min(10, 'Provide a more detailed description'),
  basic_cause: z.string().optional(),
  gps_lat: z.number().optional(),
  gps_lng: z.number().optional(),
});

type FormData = z.infer<typeof schema>;

const EventSubmissionForm = () => {
  const [step, setStep] = useState(1);
  const [synced, setSynced] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const { data: plants, isLoading: plantsLoading } = useQuery({
    queryKey: ['plants'],
    queryFn: fetchPlants
  });

  const mutation = useMutation({
    mutationFn: (data: FormData) => createEvent({ 
      ...data, 
      plant_id: parseInt(data.plant_id),
      gps_lat: coords?.lat,
      gps_lng: coords?.lng
    }),
    onSuccess: () => {
      setSynced(true);
      setTimeout(() => {
        setSynced(false);
        setStep(1);
        setCoords(null);
        setPhotoPreview(null);
      }, 3000);
    },
    onError: (error: any) => {
      console.error('Submission failed, queuing for sync...', error);
      const queue = JSON.parse(localStorage.getItem('hse_sync_queue') || '[]');
      localStorage.setItem('hse_sync_queue', JSON.stringify([...queue, mutation.variables]));
      alert("Submission failed. Report saved locally and will sync when online.");
    }
  });

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      risk_level: 'Low',
      event_type: 'Unsafe Act'
    }
  });

  const handleGetLocation = useCallback(() => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCoords({ lat: latitude, lng: longitude });
        setLocating(false);
      },
      (error) => {
        console.error("Location error:", error);
        setLocating(false);
        alert("Unable to retrieve location. Please check permissions.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  if (synced) {
    return (
      <GlassCard className="p-20 flex flex-col items-center justify-center space-y-4 animate-in zoom-in-95 duration-300">
        <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mb-4">
          <CheckCircle2 className="text-emerald-500" size={48} />
        </div>
        <h3 className="text-2xl font-bold text-white">Record Synchronized</h3>
        <p className="text-slate-400 text-center max-w-sm">The HSE record has been securely logged to the corporate database and audit trial.</p>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between border-b border-slate-800 pb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-accent/20 rounded-lg text-accent">
            <TriangleAlert size={24} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">New Safety Report</h3>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-widest">Protocol 102-B • Active Site</p>
          </div>
        </div>
        <div className="flex gap-3">
          {[1, 2].map((s) => (
            <div key={s} className={`w-12 h-1.5 rounded-full transition-all duration-500 ${step >= s ? "bg-accent shadow-lg shadow-accent/40" : "bg-slate-800"}`} />
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit(mutation.mutate as any)} className="space-y-8">
        {step === 1 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in duration-500">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-400 uppercase tracking-tight">Plant / Facility</label>
                {plantsLoading ? (
                  <div className="flex items-center gap-2 text-slate-500 py-3"><Loader2 className="animate-spin" size={16} /> Connecting to Master DB...</div>
                ) : (
                  <select {...register('plant_id')} className="input-field w-full text-slate-200">
                    <option value="">Select a site...</option>
                    {plants?.map((p: any) => (
                      <option key={p.id} value={p.id}>{p.name} ({p.code})</option>
                    ))}
                  </select>
                )}
                {errors.plant_id && <p className="text-xs text-red-400 mt-1">{errors.plant_id.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-400 uppercase tracking-tight">Incident Category</label>
                <select {...register('event_type')} className="input-field w-full">
                  {['Unsafe Act', 'Unsafe Condition', 'Near Miss', 'First Aid', 'Medical Treatment', 'Fatal'].map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-6">
              <StandardInput 
                label="Impact Nature"
                placeholder="e.g. Mechanical Malfunction"
                {...register('impact_nature')}
                error={errors.impact_nature?.message}
              />
              
              <div className="p-6 bg-slate-900/50 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-400 flex items-center gap-2 uppercase">
                    <Target size={16} className="text-accent" /> Location Telemetry
                  </span>
                  {coords && (
                    <span className="text-[10px] bg-accent/10 text-accent px-2 py-1 rounded-md font-mono tracking-tighter">
                      SECURE FIX
                    </span>
                  )}
                </div>
                
                <div className="flex items-center gap-4">
                  <div className={`flex-1 p-4 rounded-xl border ${coords ? 'border-accent/30 bg-accent/5' : 'border-slate-800 bg-slate-950'} transition-all`}>
                    {coords ? (
                      <div className="font-mono text-sm text-slate-300">
                        LAT: {coords.lat.toFixed(6)}<br />
                        LNG: {coords.lng.toFixed(6)}
                      </div>
                    ) : (
                      <div className="text-sm text-slate-500 italic">No GPS coordinates locked</div>
                    )}
                  </div>
                  <button 
                    type="button"
                    onClick={handleGetLocation}
                    disabled={locating}
                    className="p-4 bg-accent/10 text-accent hover:bg-accent/20 rounded-xl transition-all active:scale-95 disabled:opacity-50"
                  >
                    {locating ? <Loader2 size={24} className="animate-spin" /> : <Navigation size={24} />}
                  </button>
                </div>
              </div>
            </div>

            <div className="md:col-span-2 flex justify-end pt-4">
              <SecureButton 
                type="button" 
                onClick={() => setStep(2)}
                icon={<ChevronRight size={18} />}
                className="w-full md:w-auto"
              >
                Proceed to Details
              </SecureButton>
            </div>
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="space-y-4">
              <label className="text-sm font-semibold text-slate-400 uppercase tracking-tight">Risk Assessment</label>
              <div className="grid grid-cols-3 gap-4">
                {['Low', 'Medium', 'High'].map((level) => (
                  <label key={level} className="cursor-pointer group">
                    <input type="radio" {...register('risk_level')} value={level} className="sr-only peer" />
                    <div className="peer-checked:bg-accent peer-checked:text-slate-900 peer-checked:border-accent border border-slate-800 bg-slate-900/50 p-6 rounded-2xl text-center font-bold tracking-wide transition-all group-hover:bg-slate-800 group-hover:border-slate-700">
                      {level}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-400 uppercase tracking-tight">Technical Description</label>
              <textarea 
                {...register('description')} 
                rows={5}
                className="input-field w-full resize-none p-4"
                placeholder="Detail the sequence of events, root cause indicators, and immediate countermeasures taken..."
              />
              {errors.description && <p className="text-xs text-red-400 mt-1">{errors.description.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative group overflow-hidden rounded-2xl">
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handlePhotoUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer z-20" 
                />
                <div className={`p-8 border-2 border-dashed ${photoPreview ? 'border-accent/40 bg-accent/5' : 'border-slate-800 bg-slate-950'} flex flex-col items-center justify-center gap-3 transition-all group-hover:border-accent/20`}>
                  {photoPreview ? (
                    <img src={photoPreview} alt="Preview" className="h-24 w-full object-cover rounded-lg shadow-xl" />
                  ) : (
                    <>
                      <div className="p-3 bg-slate-900 rounded-xl text-slate-500 group-hover:text-accent transition-colors">
                        <ImageIcon size={28} />
                      </div>
                      <span className="text-sm font-medium text-slate-500 group-hover:text-slate-300">Evidence Documentation</span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex flex-col justify-end gap-3 pb-2">
                <p className="text-[10px] text-slate-500 italic leading-snug">
                  By submitting this report, you certify that all information provided is accurate per ACME Solar safety standards.
                </p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-4 border-t border-slate-800">
              <button 
                type="button" 
                onClick={() => setStep(1)}
                className="text-slate-500 hover:text-slate-200 transition-colors font-semibold uppercase tracking-wider text-xs"
              >
                ← Return to Facility Info
              </button>
              <SecureButton 
                type="submit" 
                loading={mutation.isPending}
                className="w-full md:w-auto"
                icon={<CheckCircle2 size={18} />}
              >
                Log HSE Incident
              </SecureButton>
            </div>
          </div>
        )}
      </form>
    </GlassCard>
  );
};

export default EventSubmissionForm;

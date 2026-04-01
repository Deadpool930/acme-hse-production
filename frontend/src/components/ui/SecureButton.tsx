import React from 'react';

interface SecureButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  icon?: React.ReactNode;
  loading?: boolean;
}

const SecureButton: React.FC<SecureButtonProps> = ({ 
  variant = 'primary', 
  icon, 
  loading = false, 
  children, 
  className = '', 
  ...props 
}) => {
  const baseStyles = "flex items-center justify-center gap-3 px-6 py-3 rounded-xl transition-all duration-300 font-bold active:scale-95 disabled:grayscale disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 shadow-lg shadow-sky-500/10 active:shadow-none";
  
  const variants = {
    primary: "bg-accent text-slate-900 hover:bg-sky-500 shadow-accent/20",
    secondary: "bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700 shadow-slate-900/50",
    ghost: "bg-transparent text-slate-400 hover:bg-slate-800 hover:text-slate-200 shadow-none",
    danger: "bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white shadow-red-500/10"
  };

  return (
    <button 
      className={`
        ${baseStyles} 
        ${variants[variant]} 
        ${loading ? 'animate-pulse' : ''} 
        ${className}
      `}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? (
        <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
      ) : (
        <>
          {icon && <span className="opacity-90">{icon}</span>}
          {children}
        </>
      )}
    </button>
  );
};

export default SecureButton;

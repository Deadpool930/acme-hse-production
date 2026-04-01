import React from 'react';

interface StandardInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

const StandardInput: React.FC<StandardInputProps> = ({ 
  label, 
  error, 
  icon, 
  className = '', 
  ...props 
}) => {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label className="text-sm font-semibold text-slate-400 px-1 uppercase tracking-wider">
          {label}
        </label>
      )}
      <div className="relative group">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-accent transition-colors duration-200">
            {icon}
          </div>
        )}
        <input 
          className={`
            input-field w-full 
            ${icon ? 'pl-11' : ''} 
            ${error ? 'border-red-500/50 focus:ring-red-500/20' : ''} 
            ${className}
          `}
          {...props}
        />
      </div>
      {error && (
        <span className="text-xs font-medium text-red-400 px-1 animate-in fade-in slide-in-from-top-1 duration-200">
          {error}
        </span>
      )}
    </div>
  );
};

export default StandardInput;


import React from 'react';

interface StylishButtonProps {
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  onClick?: () => void;
  className?: string;
  iconBg?: string; 
}

export const StylishButton: React.FC<StylishButtonProps> = ({ 
  title, 
  subtitle, 
  icon, 
  onClick, 
  className = "", 
  iconBg = "bg-[#f97316]" 
}) => {
  return (
    <button 
      onClick={onClick}
      className={`relative bg-white rounded-[2.5rem] p-6 flex flex-col items-center justify-center gap-4 shadow-sm active:scale-[0.97] transition-all hover:shadow-xl hover:border-orange-200 text-center border border-slate-100 w-full min-h-[180px] group ${className}`}
    >
      {/* Glossy Icon Container */}
      <div className={`relative w-20 h-20 ${iconBg} rounded-[2rem] flex items-center justify-center flex-shrink-0 shadow-lg transition-all duration-500 group-hover:rotate-6`}>
        <div className="text-white text-3xl">
          {icon}
        </div>
      </div>

      <div className="flex flex-col items-center">
        <h3 className="text-base font-bold text-slate-800 leading-tight tracking-tight group-hover:text-orange-600 transition-colors">
          {title}
        </h3>
        {subtitle && (
          <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-widest">
            {subtitle}
          </p>
        )}
      </div>
    </button>
  );
};
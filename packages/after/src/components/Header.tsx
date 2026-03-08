import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-[1400px] mx-auto px-6 flex justify-between items-center h-16">
        
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-xl">
            L
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 m-0 leading-none">
              Hanghae Company
            </h1>
            <p className="text-[11px] text-slate-500 m-0 leading-none mt-0.5">
              Design System Migration Project
            </p>
          </div>
        </div>

        {/* User Info */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-sm font-semibold text-slate-900">
              Demo User
            </div>
            <div className="text-xs text-slate-500">
              demo@example.com
            </div>
          </div>
          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-primary font-semibold text-base">
            DU
          </div>
        </div>
      </div>
    </header>
  );
};

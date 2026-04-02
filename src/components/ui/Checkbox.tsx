"use client";

import React from 'react';
import { Check } from 'lucide-react';

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  className?: string;
  theme?: 'blue' | 'emerald' | 'orange' | 'yellow' | 'teal';
}

export function Checkbox({ checked, onChange, label, className = "", theme = 'blue' }: CheckboxProps) {
  const themes = {
    blue: 'bg-blue-600 border-transparent shadow-blue-500/20 text-blue-600 dark:text-blue-400',
    emerald: 'bg-emerald-500 border-transparent shadow-emerald-500/20 text-emerald-500 dark:text-emerald-400',
    orange: 'bg-orange-500 border-transparent shadow-orange-500/20 text-orange-500 dark:text-orange-400',
    yellow: 'bg-yellow-500 border-transparent shadow-yellow-500/20 text-yellow-600 dark:text-yellow-400',
    teal: 'bg-teal-500 border-transparent shadow-teal-500/20 text-teal-600 dark:text-teal-400'
  };

  return (
    <div 
      className={`flex items-center gap-2.5 cursor-pointer group select-none ${className}`} 
      onClick={() => onChange(!checked)}
    >
      <div className={`
        relative w-5 h-5 rounded-lg flex items-center justify-center border-2 transition-all duration-300
        ${checked 
          ? `${themes[theme].split(' ').slice(0, 3).join(' ')} shadow-lg` 
          : 'bg-white dark:bg-[#0D1117] border-gray-200 dark:border-gray-800 group-hover:border-blue-400 dark:group-hover:border-blue-600'
        }
      `}>
        <Check className={`w-3 h-3 text-white transition-all duration-300 ${checked ? 'scale-110 opacity-100' : 'scale-75 opacity-0'}`} strokeWidth={4} />
      </div>
      {label && (
        <span className={`text-[11px] font-black uppercase tracking-widest transition-colors duration-300 ${checked ? themes[theme].split(' ').pop() : 'text-gray-500 dark:text-gray-400 group-hover:text-blue-500'}`}>
          {label}
        </span>
      )}
    </div>
  );
}

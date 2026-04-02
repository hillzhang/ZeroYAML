"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Moon, Sun, Monitor } from "lucide-react";

export function ThemeSwitch() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => setMounted(true), []);

  if (!mounted) return <div className="w-[104px] h-[34px] bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />;

  return (
    <div className="flex bg-gray-100 dark:bg-[#0D1117] rounded-lg p-1 border border-gray-300 dark:border-gray-700 items-center justify-center">
      <button 
        onClick={() => setTheme("light")} 
        className={`p-1.5 rounded-md transition ${theme === 'light' ? 'bg-white shadow text-black' : 'text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300'}`}
        title="白 (Light)"
      >
        <Sun className="w-4 h-4" />
      </button>
      <button 
        onClick={() => setTheme("system")} 
        className={`p-1.5 rounded-md transition ${theme === 'system' ? 'bg-white dark:bg-[#1C2128] shadow text-black dark:text-white' : 'text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300'}`}
        title="根据浏览器 (System)"
      >
        <Monitor className="w-4 h-4" />
      </button>
      <button 
        onClick={() => setTheme("dark")} 
        className={`p-1.5 rounded-md transition ${theme === 'dark' ? 'bg-[#1C2128] shadow text-white' : 'text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300'}`}
        title="黑 (Dark)"
      >
        <Moon className="w-4 h-4" />
      </button>
    </div>
  );
}

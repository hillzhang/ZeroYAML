"use client";

import { Settings } from 'lucide-react';

interface GlobalSettingsProps {
  onOpen: () => void;
}

export function GlobalSettings({ onOpen }: GlobalSettingsProps) {
  return (
    <button
      onClick={onOpen}
      className="p-2.5 rounded-xl bg-gray-100/50 dark:bg-white/5 text-gray-400 hover:text-blue-500 hover:bg-white dark:hover:bg-gray-800 border border-transparent hover:border-gray-200 dark:hover:border-gray-700 transition-all shadow-sm group"
      title="Global Configuration"
    >
      <Settings className="w-5 h-5 group-hover:rotate-90 transition-transform duration-500" />
    </button>
  );
}

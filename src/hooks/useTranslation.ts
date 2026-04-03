
import { useAppStore } from '@/store/useAppStore';
import { zh, Translation } from '@/i18n/zh';
import { en } from '@/i18n/en';

export function useTranslation() {
  const language = useAppStore((s) => s.language);
  const setLanguage = useAppStore((s) => s.setLanguage);

  const dicts: Record<'zh' | 'en', Translation> = { zh, en };
  const t = dicts[language];

  return { t, language, setLanguage };
}

import { EN, AR, FR, ES, PT } from './ui';

export const languages = {
  en: 'English',
  ar: 'العربية',
  fr: 'Français',
  es: 'Español',
  pt: 'Português',
};

export const defaultLang = 'en';
export const showDefaultLang = false;

// We need a combined UI object for the types to work,
// but our ui.ts exports them separately to avoid syntax issues in Node.
const ui: Record<string, any> = {
  en: EN,
  ar: AR,
  fr: FR,
  es: ES,
  pt: PT
};

export function getLangFromUrl(url: URL) {
  const [, lang] = url.pathname.split('/');
  if (lang in ui) return lang as keyof typeof ui;
  return defaultLang;
}

export function useTranslations(lang: string) {
  const validLang = (lang in ui) ? lang as keyof typeof ui : defaultLang;
  return function t(key: keyof typeof ui[typeof defaultLang]) {
    return ui[validLang][key] || ui[defaultLang][key];
  }
}

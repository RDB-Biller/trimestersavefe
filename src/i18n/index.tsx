import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react"
import en from "./locales/en.json"
import fr from "./locales/fr.json"
import pt from "./locales/pt.json"
import es from "./locales/es.json"
import ar from "./locales/ar.json"
import zh from "./locales/zh.json"
import hi from "./locales/hi.json"
import de from "./locales/de.json"
import sw from "./locales/sw.json"
import tw from "./locales/tw.json"
import ha from "./locales/ha.json"
import yo from "./locales/yo.json"
import gaa from "./locales/gaa.json"

/**
 * Languages for the app. Strings are bundled (no network needed) and come from the same catalogs the HNN Biller
 * serves at /i18n/api/catalog/:lang; any missing key falls back to English. Twi, Hausa, Yoruba and Ga are
 * flagged `reviewed: false` (drafts awaiting a native speaker) and are hidden from the switcher unless
 * REACT_APP_SHOW_UNREVIEWED_LANGUAGES=true. Arabic switches the whole page to right-to-left.
 */
export type Language = { code: string; name: string; native: string; rtl: boolean; reviewed: boolean }

export const LANGUAGES: Language[] = [
    { code: "en", name: "English", native: "English", rtl: false, reviewed: true },
    { code: "fr", name: "French", native: "Français", rtl: false, reviewed: true },
    { code: "pt", name: "Portuguese", native: "Português", rtl: false, reviewed: true },
    { code: "es", name: "Spanish", native: "Español", rtl: false, reviewed: true },
    { code: "ar", name: "Arabic", native: "العربية", rtl: true, reviewed: true },
    { code: "zh", name: "Chinese", native: "中文", rtl: false, reviewed: true },
    { code: "hi", name: "Hindi", native: "हिन्दी", rtl: false, reviewed: true },
    { code: "de", name: "German", native: "Deutsch", rtl: false, reviewed: true },
    { code: "sw", name: "Swahili", native: "Kiswahili", rtl: false, reviewed: true },
    { code: "tw", name: "Twi", native: "Twi", rtl: false, reviewed: false },
    { code: "ha", name: "Hausa", native: "Hausa", rtl: false, reviewed: false },
    { code: "yo", name: "Yoruba", native: "Yorùbá", rtl: false, reviewed: false },
    { code: "gaa", name: "Ga", native: "Gã", rtl: false, reviewed: false },
]

const CATALOGS: Record<string, Record<string, string>> = { en, fr, pt, es, ar, zh, hi, de, sw, tw, ha, yo, gaa }
const SHOW_UNREVIEWED = process.env.REACT_APP_SHOW_UNREVIEWED_LANGUAGES === "true"
const STORAGE_KEY = "tms_lang"

export const visibleLanguages = () => LANGUAGES.filter((l) => l.reviewed || SHOW_UNREVIEWED)

const read = (): string | null => { try { return localStorage.getItem(STORAGE_KEY) } catch { return null } }
const write = (v: string) => { try { localStorage.setItem(STORAGE_KEY, v) } catch { /* private mode */ } }

const normalise = (code?: string | null): string => {
    const c = String(code || "").toLowerCase().replace("_", "-")
    if (CATALOGS[c]) return c
    const base = c.split("-")[0]
    return CATALOGS[base] ? base : base === "ak" ? "tw" : "en"
}
const initial = (): string => {
    const l = normalise(read() || (typeof navigator !== "undefined" ? navigator.language : "en"))
    const lang = LANGUAGES.find((x) => x.code === l)
    return lang && (lang.reviewed || SHOW_UNREVIEWED) ? l : "en"
}

/** For non-React code (services) that must tell the Biller which language to text a patient in. */
export const currentLanguage = (): string => initial()

type Vars = Record<string, string | number | undefined>
type Ctx = { lang: string; rtl: boolean; reviewed: boolean; setLang: (c: string) => void; t: (key: string, vars?: Vars) => string }
const I18nContext = createContext<Ctx>({ lang: "en", rtl: false, reviewed: true, setLang: () => undefined, t: (k) => (en as Record<string, string>)[k] || k })

export const I18nProvider = ({ children }: { children: ReactNode }) => {
    const [lang, setLangState] = useState<string>(initial)
    const meta = LANGUAGES.find((l) => l.code === lang) || LANGUAGES[0]

    useEffect(() => {
        document.documentElement.setAttribute("lang", lang)
        document.documentElement.setAttribute("dir", meta.rtl ? "rtl" : "ltr")
    }, [lang, meta.rtl])

    const setLang = useCallback((c: string) => { const n = normalise(c); write(n); setLangState(n) }, [])
    const t = useCallback((key: string, vars?: Vars) => {
        const s = CATALOGS[lang]?.[key] || (en as Record<string, string>)[key] || key
        return vars ? s.replace(/\{(\w+)\}/g, (_m, k) => (vars[k] === undefined ? "" : String(vars[k]))) : s
    }, [lang])

    const value = useMemo(() => ({ lang, rtl: meta.rtl, reviewed: meta.reviewed, setLang, t }), [lang, meta.rtl, meta.reviewed, setLang, t])
    return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export const useI18n = () => useContext(I18nContext)

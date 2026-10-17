import { useI18n, visibleLanguages } from "i18n"

/** Compact language picker; shows a review notice for languages still awaiting a native speaker. */
const LanguageSwitcher = ({ className = "" }: { className?: string }) => {
    const { lang, setLang, t, reviewed } = useI18n()
    return (
        <div className={className}>
            <label className="sr-only" htmlFor="tms-lang">{t("lang.label")}</label>
            <select id="tms-lang" value={lang} onChange={(e) => setLang(e.target.value)}
                className="text-sm border border-slate-200 rounded-md bg-white px-2 py-1 cursor-pointer" aria-label={t("lang.label")}>
                {visibleLanguages().map((l) => <option key={l.code} value={l.code}>{l.native}</option>)}
            </select>
            {!reviewed && <p className="text-xs text-grey_text mt-1">{t("review.notice")}</p>}
        </div>
    )
}

export default LanguageSwitcher

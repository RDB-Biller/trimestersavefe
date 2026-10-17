import { useI18n } from "i18n";
import { useEffect, useRef, useState } from "react";
import { VaultFile, addVaultFile, deleteVaultFile, errorMessage, getVaultFile, getVaultFiles, updateVaultFile } from "services/patient/account";

const MAX = 1024 * 1024;
const CATEGORIES = ["Scans", "Lab results", "Prescriptions", "Insurance", "Receipts", "Other"];

/** Vault: keep your own PDFs, scans and photos of results (up to 1 MB each) so they are with you at every visit. */
const Vault = () => {
  const { t } = useI18n();
  const [files, setFiles] = useState<VaultFile[]>([]);
  const [category, setCategory] = useState("Scans");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  const load = () => getVaultFiles().then((r) => setFiles(r.data.result)).catch((e) => setErr(errorMessage(e)));
  useEffect(() => { load(); }, []);

  const upload = (f: File | undefined) => {
    if (!f) return;
    setErr("");
    if (f.size > MAX) return setErr("Files can be at most 1 MB. Try a smaller photo or a compressed PDF.");
    const reader = new FileReader();
    reader.onload = async () => {
      setBusy(true);
      try { await addVaultFile({ name: f.name, type: f.type, data: String(reader.result), category }); await load(); } catch (e) { setErr(errorMessage(e)); }
      setBusy(false);
      if (input.current) input.current.value = "";
    };
    reader.readAsDataURL(f);
  };

  const open = async (f: VaultFile) => {
    try {
      const r = await getVaultFile(f._id);
      const bytes = Uint8Array.from(atob(r.data.result.data), (c) => c.charCodeAt(0));
      const url = URL.createObjectURL(new Blob([bytes], { type: f.type }));
      const a = document.createElement("a"); a.href = url; a.download = f.name; a.target = "_blank"; a.click();
      setTimeout(() => URL.revokeObjectURL(url), 30000);
    } catch (e) { setErr(errorMessage(e)); }
  };
  const rename = async (f: VaultFile) => { const name = window.prompt("New name", f.name); if (!name || name === f.name) return; try { await updateVaultFile(f._id, { name }); await load(); } catch (e) { setErr(errorMessage(e)); } };
  const remove = async (f: VaultFile) => { if (!window.confirm(`Delete "${f.name}"?`)) return; try { await deleteVaultFile(f._id); await load(); } catch (e) { setErr(errorMessage(e)); } };

  return (
    <div className="p-6 md:p-10">
      <h4 className="text-xl font-semibold">{t('vault.title')}</h4>
      <p className="text-light_grey_text text-sm mb-6">Your own copies of scans, lab results and prescriptions. PDF, image or text files up to 1 MB, 25 files.</p>

      <div className="bg-white rounded-2xl p-6 mb-6 shadow-sm flex gap-3 flex-wrap items-center">
        <select className="border rounded-xl p-3" value={category} onChange={(e) => setCategory(e.target.value)}>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select>
        <input ref={input} type="file" accept="application/pdf,image/png,image/jpeg,image/webp,image/gif,text/plain" disabled={busy} onChange={(e) => upload(e.target.files?.[0])} />
        {busy && <span className="text-sm text-light_grey_text">{t('status.loading')}</span>}
      </div>
      {err && <p className="text-secondary text-sm mb-4">{err}</p>}

      {files.length === 0 && <p className="text-light_grey_text text-sm">No files yet.</p>}
      {files.map((f) => (
        <div key={f._id} className="bg-white rounded-2xl p-4 mb-3 flex justify-between gap-4 flex-wrap shadow-sm">
          <div>
            <p className="font-semibold break-all">{f.name}</p>
            <p className="text-sm text-light_grey_text">{f.category} - {(f.size / 1024).toFixed(0)} KB - {new Date(f.createdAt).toDateString()}</p>
          </div>
          <div className="flex gap-3 text-sm items-start">
            <button className="text-primary" onClick={() => open(f)}>Open</button>
            <button className="text-light_grey_text" onClick={() => rename(f)}>Rename</button>
            <button className="text-secondary" onClick={() => remove(f)}>{t('act.delete')}</button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Vault;

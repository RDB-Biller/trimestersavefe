import NextSteps from 'components/NextSteps';
import { useI18n } from "i18n";
import LanguageSwitcher from "components/LanguageSwitcher";
import { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import logo from "assets/images/logo.png";
import { Facility, Plan, errorText, getFacilities, rememberPlan, signup, startVerification } from "services/birthprep";
import PlanCard from "./PlanCard";

/**
 * Public sign-up: anyone can start a BirthPrep savings plan in three steps:
 *   1. who you are + what you are saving for (delivery / procedure / anything) + horizon + the hospital
 *   2. the one-time code texted to the phone
 *   3. the plan, worked out by the biller from the answers and the hospital's history of the patient
 */
const Signup = () => {
  const { t } = useI18n();
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [sentTo, setSentTo] = useState("");
  const [sandboxCode, setSandboxCode] = useState<string | undefined>();
  const [result, setResult] = useState<{ token: string; plan: Plan; link: string } | null>(null);
  const [f, setF] = useState<Record<string, any>>({ goal: "delivery", horizon: "9" });
  const set = (k: string, v: any) => setF((x) => ({ ...x, [k]: v }));

  useEffect(() => { getFacilities().then((r) => setFacilities(r.data.data)).catch(() => setErr("Could not reach the savings service.")); }, []);

  const start = async () => {
    setErr("");
    if (!f.name || !f.phone || !f.facilityId) return setErr("Your name, phone and the hospital are needed.");
    if (f.goal === "procedure" && !(Number(f.procedureQuote) > 0)) return setErr("Enter the quoted cost of the procedure.");
    if (f.goal === "other" && !(Number(f.otherAmount) > 0)) return setErr("Enter how much you want to save.");
    setBusy(true);
    try { const r = await startVerification(f.phone); setSentTo(r.data.to); setSandboxCode(r.data.codeSandbox); setStep(2); }
    catch (e) { setErr(errorText(e)); }
    setBusy(false);
  };

  const finish = async () => {
    setErr(""); setBusy(true);
    try {
      const answers: Record<string, any> = {};
      for (const k of ["edd", "lmp", "previousBirths", "previousCs", "hypertension", "diabetes", "multiple", "previousPreterm", "plannedCs", "age", "procedureName", "procedureQuote", "procedureDate", "otherAmount", "otherLabel"]) if (f[k] !== undefined && f[k] !== "") answers[k] = f[k];
      const other = f.horizon === "other" ? (f.otherMonths ? { months: Number(f.otherMonths) } : f.otherYears ? { years: Number(f.otherYears) } : { open: true }) : null;
      const r = await signup({ name: f.name, phone: f.phone, code: f.code, facilityId: f.facilityId, goal: f.goal, horizon: f.horizon, other, answers });
      rememberPlan({ planNo: r.data.planNo, token: r.data.token, goal: r.data.plan.goal, goalLabel: r.data.plan.goalLabel, facility: r.data.plan.facility, status: r.data.plan.status, end: r.data.plan.end, progress: r.data.plan.progress, createdAt: new Date().toISOString() });
      setResult({ token: r.data.token, plan: r.data.plan, link: r.data.link }); setStep(3);
    } catch (e) { setErr(errorText(e)); }
    setBusy(false);
  };

  const field = (label: string, el: JSX.Element) => <div className="mb-4"><label className="text-sm block mb-1">{label}</label>{el}</div>;
  const input = (k: string, type = "text", placeholder = "") => <input className="border rounded-xl p-3 w-full" type={type} placeholder={placeholder} value={f[k] ?? ""} onChange={(e) => set(k, e.target.value)} />;
  const yn = (k: string) => <select className="border rounded-xl p-3 w-full" value={f[k] ?? ""} onChange={(e) => set(k, e.target.value)}><option value="">—</option><option value="yes">Yes</option><option value="no">No</option></select>;

  return (
    <div className="min-h-screen bg-[#F2F6FA]">
      <Helmet><title>BirthPrep savings | Trimester Save</title></Helmet>
      <div className="max-w-xl mx-auto p-6">
        <header className="flex items-center justify-between mb-6"><img src={logo} alt="Trimester Save" className="h-10" /><div className="flex items-center gap-3"><LanguageSwitcher /><Link to="/" className="text-secondary text-sm font-semibold">{t('auth.signin')}</Link></div></header>
        <h2 className="text-2xl font-bold">Save towards your delivery</h2>
        <p className="text-light_grey_text text-sm mb-6">A savings plan worked out from your pregnancy, your history and your hospital's prices, with milestones that adjust if things change. Or save for a planned procedure, or anything else.</p>

        {step === 1 && (
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            {field("Your name", input("name"))}
            {field("Phone number (we text you a code)", input("phone", "tel", "024 000 0000"))}
            {field("Hospital you plan to use", (
              <select className="border rounded-xl p-3 w-full" value={f.facilityId ?? ""} onChange={(e) => set("facilityId", e.target.value)}>
                <option value="">Choose a hospital</option>{facilities.map((x) => <option key={x.id} value={x.id}>{x.name} · {x.programme}</option>)}
              </select>
            ))}
            <div className="grid grid-cols-2 gap-4">
              {field("Saving for", <select className="border rounded-xl p-3 w-full" value={f.goal} onChange={(e) => set("goal", e.target.value)}><option value="delivery">Delivery of my baby</option><option value="procedure">A planned procedure</option><option value="other">Something else</option></select>)}
              {field("Over", <select className="border rounded-xl p-3 w-full" value={f.horizon} onChange={(e) => set("horizon", e.target.value)}><option value="9">9 months</option><option value="6">6 months</option><option value="3">3 months</option><option value="other">Other</option></select>)}
            </div>
            {f.horizon === "other" && <div className="grid grid-cols-2 gap-4">{field("Months (or leave blank)", input("otherMonths", "number"))}{field("Years (or leave blank = open-ended)", input("otherYears", "number"))}</div>}
            {f.goal === "delivery" && (
              <>
                <div className="grid grid-cols-2 gap-4">{field("Expected due date", input("edd", "date"))}{field("or first day of last period", input("lmp", "date"))}</div>
                <div className="grid grid-cols-2 gap-4">{field("Babies delivered before", input("previousBirths", "number"))}{field("…of which by caesarean", input("previousCs", "number"))}</div>
                <div className="grid grid-cols-2 gap-4">{field("High blood pressure in pregnancy?", yn("hypertension"))}{field("Diabetes?", yn("diabetes"))}</div>
                <div className="grid grid-cols-2 gap-4">{field("Twins or more?", yn("multiple"))}{field("Caesarean already planned?", yn("plannedCs"))}</div>
                {field("Your age", input("age", "number"))}
              </>
            )}
            {f.goal === "procedure" && (<>{field("Procedure", input("procedureName"))}<div className="grid grid-cols-2 gap-4">{field("Quoted cost (GHS)", input("procedureQuote", "number"))}{field("Planned date", input("procedureDate", "date"))}</div></>)}
            {f.goal === "other" && (<>{field("What for", input("otherLabel"))}{field("Amount (GHS)", input("otherAmount", "number"))}</>)}
            {err && <><p className="text-secondary text-sm mb-3">{err}</p><NextSteps message={err} /></>}
            <button className="bg-primary text-white rounded-2xl p-4 w-full font-semibold" disabled={busy} onClick={start}>{busy ? "Sending code…" : "Text me a code"}</button>
            <p className="text-xs text-light_grey_text mt-4">Financial preparedness, not medical advice. Your clinician decides how and when you deliver; the plan adapts. HNN Biller never holds your money.</p>
          </div>
        )}

        {step === 2 && (
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <p className="text-sm mb-4">We texted a code to <b>{sentTo}</b>.{sandboxCode && <> (Test mode: the code is <b>{sandboxCode}</b>.)</>}</p>
            {field("Code", input("code", "text", "123456"))}
            {err && <><p className="text-secondary text-sm mb-3">{err}</p><NextSteps message={err} /></>}
            <button className="bg-primary text-white rounded-2xl p-4 w-full font-semibold" disabled={busy} onClick={finish}>{busy ? "Working out your plan…" : "Create my plan"}</button>
            <button className="text-primary text-sm mt-4" onClick={() => setStep(1)}>Back</button>
            <button className="text-primary text-sm mt-4 ml-6 underline" disabled={busy} onClick={start}>Did not get a code? Send it again</button>
          </div>
        )}

        {step === 3 && result && (
          <>
            <div className="bg-faded rounded-2xl p-4 mb-6 text-sm">Your plan <b>{result.plan.planNo}</b> is ready and has been texted to you. Keep the plan number: the hospital uses it when you pay. <Link to="/dashboard/birthprep" className="text-primary font-semibold">Open my plans</Link></div>
            <PlanCard plan={result.plan} token={result.token} onUpdate={(p) => setResult({ ...result, plan: p })} />
          </>
        )}
      </div>
    </div>
  );
};

export default Signup;

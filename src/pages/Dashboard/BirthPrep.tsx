import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MyPlan, Plan, errorText, getPlan, myPlans, rememberPlans, savedPlans, startVerification } from "services/birthprep";
import PlanCard from "pages/BirthPrep/PlanCard";

/** "My savings plans": the plans this person holds across every hospital, read from the biller. */
const BirthPrep = () => {
  const [list, setList] = useState<MyPlan[]>(savedPlans());
  const [plans, setPlans] = useState<Record<string, Plan>>({});
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [stage, setStage] = useState<"idle" | "code">("idle");
  const [sandboxCode, setSandboxCode] = useState<string | undefined>();
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    list.forEach((m) => { getPlan(m.token).then((r) => setPlans((p) => ({ ...p, [m.token]: r.data }))).catch(() => null); });
  }, [list]);

  const start = async () => { setErr(""); setBusy(true); try { const r = await startVerification(phone); setSandboxCode(r.data.codeSandbox); setStage("code"); } catch (e) { setErr(errorText(e)); } setBusy(false); };
  const fetchMine = async () => {
    setErr(""); setBusy(true);
    try { const r = await myPlans(phone, code); rememberPlans(r.data.plans); setList(r.data.plans); setStage("idle"); setCode(""); if (!r.data.plans.length) setErr("No savings plan is linked to that phone yet."); }
    catch (e) { setErr(errorText(e)); }
    setBusy(false);
  };

  return (
    <div className="p-6 md:p-10">
      <div className="flex justify-between items-center flex-wrap gap-4 mb-6">
        <div><h4 className="text-xl font-semibold">My savings plans</h4><p className="text-light_grey_text text-sm">BirthPrep plans from your hospital, with milestones that adjust to your pregnancy.</p></div>
        <Link to="/birthprep" className="bg-primary text-white rounded-2xl p-3 px-5 text-sm font-semibold">Start a new plan</Link>
      </div>

      <div className="bg-white rounded-2xl p-6 mb-6 shadow-sm">
        <p className="text-sm mb-3">Find the plans linked to your phone (a code is texted to you).</p>
        <div className="flex gap-3 flex-wrap">
          <input className="border rounded-xl p-3 flex-1 min-w-[180px]" placeholder="Phone number" value={phone} onChange={(e) => setPhone(e.target.value)} />
          {stage === "code" && <input className="border rounded-xl p-3 w-36" placeholder="Code" value={code} onChange={(e) => setCode(e.target.value)} />}
          {stage === "idle"
            ? <button className="bg-primary text-white rounded-xl p-3 px-5" disabled={busy} onClick={start}>Text me a code</button>
            : <button className="bg-primary text-white rounded-xl p-3 px-5" disabled={busy} onClick={fetchMine}>Show my plans</button>}
        </div>
        {sandboxCode && <p className="text-xs text-light_grey_text mt-2">Test mode: the code is {sandboxCode}.</p>}
        {err && <p className="text-secondary text-sm mt-2">{err}</p>}
      </div>

      {list.length === 0 && <p className="text-light_grey_text">No plans on this device yet.</p>}
      {list.map((m) => plans[m.token]
        ? <PlanCard key={m.token} plan={plans[m.token]} token={m.token} onUpdate={(p) => setPlans((x) => ({ ...x, [m.token]: p }))} />
        : <div key={m.token} className="bg-white rounded-2xl p-6 mb-6 text-sm text-light_grey_text">Loading plan {m.planNo}…</div>)}
    </div>
  );
};

export default BirthPrep;

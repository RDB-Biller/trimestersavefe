import { useState } from "react";
import { Plan, answer, errorText } from "services/birthprep";

const ghs = (n: number) => `GHS ${Number(n || 0).toFixed(2)}`;

/** One plan: progress, milestones, how the target was worked out, advice, and the questionnaire that re-plans it. */
const PlanCard = ({ plan, token, onUpdate }: { plan: Plan; token: string; onUpdate?: (p: Plan) => void }) => {
  const [open, setOpen] = useState(false);
  const [vals, setVals] = useState<Record<string, any>>({});
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const p = plan.progress;
  const today = new Date().toISOString().slice(0, 10);

  const save = async () => {
    setBusy(true); setMsg("");
    try { const r = await answer(token, vals); onUpdate && onUpdate(r.data); setMsg("Plan updated."); setVals({}); }
    catch (e) { setMsg(errorText(e)); }
    setBusy(false);
  };

  return (
    <div className="bg-white rounded-2xl p-6 mb-6 shadow-sm">
      <div className="flex justify-between items-start gap-4 flex-wrap">
        <div>
          <p className="text-light_grey_text text-xs">Plan {plan.planNo} · {plan.facility}</p>
          <h4 className="font-semibold">{plan.goalLabel}</h4>
        </div>
        <span className={`text-xs px-3 py-1 rounded-full ${plan.status === "active" ? "bg-faded text-primary" : "bg-gray-100 text-gray-600"}`}>{plan.status}</span>
      </div>
      <p className="text-3xl font-bold mt-4">{ghs(p.saved)} <span className="text-base font-normal text-light_grey_text">of {ghs(p.target)}</span></p>
      <div className="h-3 rounded-full bg-gray-100 overflow-hidden mt-2"><div className="h-full bg-primary" style={{ width: `${p.percent}%` }} /></div>
      <p className="text-sm text-light_grey_text mt-2">
        {plan.end ? <>Needed by <b>{plan.end}</b>. </> : "Open-ended plan. "}
        {p.next && <>Next: {ghs(p.next.amount)} by {p.next.dueDate}. </>}
        {p.overdueMilestones > 0 && <span className="text-secondary">{p.overdueMilestones} milestone(s) overdue. </span>}
        Pay at {plan.facility} or via {plan.partner}.
      </p>

      <h5 className="font-semibold mt-6 mb-2">Milestones</h5>
      {plan.schedule.map((m) => (
        <div key={m.id} className={`flex justify-between py-2 border-b text-sm ${m.status === "paid" ? "text-primary" : m.dueDate < today ? "text-secondary" : ""}`}>
          <span>{m.status === "paid" ? "✓ " : ""}{m.label} · {m.dueDate}</span><b>{ghs(m.amount)}</b>
        </div>
      ))}

      {plan.goal === "delivery" && (
        <>
          <h5 className="font-semibold mt-6 mb-1">How the target was worked out</h5>
          <p className="text-xs text-light_grey_text mb-2">Possible ways the delivery could go, with the cost of each. Target = {ghs(plan.target.basisAmount)} plus a safety buffer.</p>
          {plan.scenarios.map((s, i) => (
            <div key={i} className="flex justify-between py-2 border-b text-sm gap-3">
              <span>{s.label}{s.date ? ` · ${s.date}` : ""}{s.extras.length ? <><br /><span className="text-xs text-light_grey_text">{s.extras.join(", ")}</span></> : null}</span>
              <b className="whitespace-nowrap">{Math.round(s.probability * 100)}% · {ghs(s.cost)}</b>
            </div>
          ))}
        </>
      )}

      {plan.advisories.length > 0 && (
        <>
          <h5 className="font-semibold mt-6 mb-2">Advice</h5>
          <ul className="list-disc pl-5 text-sm">
            {[...plan.advisories].reverse().map((a, i) => <li key={i} className={a.severity === "change" ? "text-secondary" : ""}>{a.text}</li>)}
          </ul>
        </>
      )}

      {plan.bridge?.insureCredit && (
        <div className="bg-faded rounded-xl p-4 mt-6 text-sm"><b>If there is a shortfall.</b> {plan.bridge.insureCredit.note}</div>
      )}

      <button className="text-primary text-sm font-semibold mt-6" onClick={() => setOpen(!open)}>{open ? "Hide" : "Update your details (the plan adjusts)"}</button>
      {open && (
        <div className="mt-4">
          {plan.questions.map((q) => {
            const cur = vals[q.id] !== undefined ? vals[q.id] : plan.answered?.[q.fact];
            const set = (v: any) => setVals({ ...vals, [q.id]: v });
            return (
              <div key={q.id} className="mb-4">
                <label className="text-sm block mb-1">{q.q}</label>
                {q.type === "yesno" ? (
                  <select className="border rounded-xl p-3 w-full" value={cur === true ? "yes" : cur === false ? "no" : cur || ""} onChange={(e) => set(e.target.value)}>
                    <option value="">—</option><option value="yes">Yes</option><option value="no">No</option>
                  </select>
                ) : q.type === "select" ? (
                  <select className="border rounded-xl p-3 w-full" value={cur || ""} onChange={(e) => set(e.target.value)}>{(q.options || []).map((o) => <option key={o} value={o}>{o}</option>)}</select>
                ) : (
                  <input className="border rounded-xl p-3 w-full" type={q.type === "number" ? "number" : q.type === "date" ? "date" : "text"} value={cur ?? ""} onChange={(e) => set(e.target.value)} />
                )}
              </div>
            );
          })}
          <button className="bg-primary text-white rounded-2xl p-3 px-6" disabled={busy} onClick={save}>{busy ? "Saving…" : "Save answers"}</button>
          {msg && <p className="text-sm mt-2">{msg}</p>}
        </div>
      )}
      <p className="text-xs text-light_grey_text mt-6">{plan.disclaimer} {plan.programme} records what you save; the money is held by {plan.partner} or paid at the hospital, never by HNN Biller.</p>
    </div>
  );
};

export default PlanCard;

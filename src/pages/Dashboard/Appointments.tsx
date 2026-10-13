import { useEffect, useState } from "react";
import { Appointment, createAppointment, deleteAppointment, errorMessage, getAppointments, updateAppointment } from "services/patient/account";

const blank = { title: "", date: "", time: "", hospital: "", doctor: "", notes: "", remind_sms: true };

/** Appointments: add visits, get a text reminder the day before, mark them done or cancel them. */
const Appointments = () => {
  const [items, setItems] = useState<Appointment[]>([]);
  const [form, setForm] = useState<any>(blank);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const load = () => getAppointments().then((r) => setItems(r.data.result)).catch((e) => setErr(errorMessage(e))).finally(() => setLoaded(true));
  useEffect(() => { load(); }, []);

  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));
  const save = async () => {
    setErr(""); setBusy(true);
    try { await createAppointment(form); setForm(blank); await load(); } catch (e) { setErr(errorMessage(e)); }
    setBusy(false);
  };
  const mark = async (a: Appointment, status: Appointment["status"]) => { try { await updateAppointment(a._id, { status }); await load(); } catch (e) { setErr(errorMessage(e)); } };
  const remove = async (a: Appointment) => { if (!window.confirm(`Delete "${a.title}"?`)) return; try { await deleteAppointment(a._id); await load(); } catch (e) { setErr(errorMessage(e)); } };

  const upcoming = items.filter((a) => a.status === "upcoming");
  const past = items.filter((a) => a.status !== "upcoming");

  const Row = ({ a }: { a: Appointment }) => (
    <div className="bg-white rounded-2xl p-4 mb-3 flex justify-between gap-4 flex-wrap shadow-sm">
      <div>
        <p className="font-semibold">{a.title} {a.status !== "upcoming" && <span className="text-xs text-light_grey_text font-normal">({a.status})</span>}</p>
        <p className="text-sm text-light_grey_text">{new Date(a.date).toDateString()}{a.time ? ` at ${a.time}` : ""}{a.hospital ? ` - ${a.hospital}` : ""}{a.doctor ? ` - ${a.doctor}` : ""}</p>
        {a.notes && <p className="text-sm mt-1">{a.notes}</p>}
      </div>
      <div className="flex gap-3 text-sm items-start">
        {a.status === "upcoming" && <button className="text-primary" onClick={() => mark(a, "completed")}>Done</button>}
        {a.status === "upcoming" && <button className="text-light_grey_text" onClick={() => mark(a, "cancelled")}>Cancel</button>}
        <button className="text-secondary" onClick={() => remove(a)}>Delete</button>
      </div>
    </div>
  );

  return (
    <div className="p-6 md:p-10">
      <h4 className="text-xl font-semibold">Appointments</h4>
      <p className="text-light_grey_text text-sm mb-6">Keep your visits in one place. We text you a reminder the day before.</p>

      <div className="bg-white rounded-2xl p-6 mb-6 shadow-sm">
        <div className="grid md:grid-cols-2 gap-3">
          <input className="border rounded-xl p-3" placeholder="What is it for? (e.g. Antenatal check)" value={form.title} onChange={(e) => set("title", e.target.value)} />
          <input className="border rounded-xl p-3" placeholder="Hospital or clinic" value={form.hospital} onChange={(e) => set("hospital", e.target.value)} />
          <input className="border rounded-xl p-3" type="date" value={form.date} onChange={(e) => set("date", e.target.value)} />
          <input className="border rounded-xl p-3" type="time" value={form.time} onChange={(e) => set("time", e.target.value)} />
          <input className="border rounded-xl p-3" placeholder="Doctor or midwife (optional)" value={form.doctor} onChange={(e) => set("doctor", e.target.value)} />
          <input className="border rounded-xl p-3" placeholder="Notes (optional)" value={form.notes} onChange={(e) => set("notes", e.target.value)} />
        </div>
        <label className="flex items-center gap-2 text-sm mt-3"><input type="checkbox" checked={form.remind_sms} onChange={(e) => set("remind_sms", e.target.checked)} /> Text me a reminder the day before</label>
        {err && <p className="text-secondary text-sm mt-3">{err}</p>}
        <button className="bg-primary text-white rounded-xl p-3 px-6 mt-4" disabled={busy} onClick={save}>{busy ? "Saving..." : "Add appointment"}</button>
      </div>

      <h5 className="font-semibold mb-3">Coming up</h5>
      {loaded && upcoming.length === 0 && <p className="text-light_grey_text text-sm mb-6">Nothing booked yet.</p>}
      {upcoming.map((a) => <Row key={a._id} a={a} />)}
      {past.length > 0 && <><h5 className="font-semibold mb-3 mt-8">Earlier</h5>{past.map((a) => <Row key={a._id} a={a} />)}</>}
    </div>
  );
};

export default Appointments;

import { useI18n } from "i18n";
import { useCallback, useEffect, useState } from "react";
import { AppNotification, getNotifications, readNotification } from "services/patient/account";

/** The header bell: the patient's notices from the Biller (welcome, appointments, reminders). */
function Notifications() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<AppNotification[]>([]);

  const load = useCallback(() => {
    getNotifications().then((r) => setItems(r.data.result)).catch(() => null);
  }, []);
  useEffect(() => {
    load();
    const t = setInterval(load, 120000);
    return () => clearInterval(t);
  }, [load]);

  const unread = items.filter((n) => !n.read).length;
  const markRead = (id: string) => readNotification(id).then((r) => setItems(r.data.result)).catch(() => null);

  return (
    <div className="relative inline-flex ml-3">
      <button
        className={`w-8 h-8 flex items-center justify-center bg-slate-100 hover:bg-slate-200 transition duration-150 rounded-full ${open ? "bg-slate-200" : ""}`}
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => { setOpen(!open); if (!open) load(); }}
      >
        <span className="sr-only">{t('notif.title')}</span>
        <svg className="w-4 h-4" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
          <path className="fill-current text-slate-500" d="M6.5 0C2.91 0 0 2.462 0 5.5c0 1.075.37 2.074 1 2.922V12l2.699-1.542A7.454 7.454 0 006.5 11c3.59 0 6.5-2.462 6.5-5.5S10.09 0 6.5 0z" />
          <path className="fill-current text-slate-400" d="M16 9.5c0-.987-.429-1.897-1.147-2.639C14.124 10.348 10.66 13 6.5 13c-.103 0-.202-.018-.305-.021C7.231 13.617 8.556 14 10 14c.449 0 .886-.04 1.307-.11L15 16v-4h-.012C15.627 11.285 16 10.425 16 9.5z" />
        </svg>
        {unread > 0 && <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-rose-500 border-2 border-white rounded-full"></div>}
      </button>

      {open && (
        <div className="origin-top-right z-40 absolute top-full right-0 -mr-24 sm:mr-0 w-80 max-w-[90vw] bg-white border border-slate-200 py-1.5 rounded shadow-lg overflow-hidden mt-1">
          <div className="flex justify-between items-center px-4 pt-1.5 pb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase">{t('notif.title')} {unread > 0 ? `(${unread})` : ""}</span>
            {unread > 0 && <button className="text-xs text-primary" onClick={() => markRead("all")}>{t('notif.markall')}</button>}
          </div>
          <ul className="max-h-80 overflow-y-auto">
            {items.length === 0 && <li className="px-4 py-3 text-sm text-slate-400">Nothing yet.</li>}
            {items.map((n) => (
              <li key={n._id} className="border-b border-slate-200 last:border-0">
                <button className={`block w-full text-left py-2 px-4 hover:bg-slate-50 ${n.read ? "opacity-60" : ""}`} onClick={() => !n.read && markRead(n._id)}>
                  <span className="block text-sm font-medium text-slate-800">{n.title}</span>
                  <span className="block text-sm mb-1">{n.message}</span>
                  <span className="block text-xs font-medium text-slate-400">{new Date(n.createdAt).toLocaleString()}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default Notifications;

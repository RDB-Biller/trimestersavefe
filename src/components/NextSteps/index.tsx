import { Link, useLocation } from "react-router-dom";

const HELP = "mailto:info@trimestersave.com?subject=TrimesterSave%20help";
type Step = { label: string; to?: string; reload?: boolean; href?: string };

/** No dead ends: wherever an error shows, it also says where to go next. */
export const stepsFor = (path: string, message = ""): Step[] => {
  const expired = /session|token|sign in|signed in|log in|expired|unauthor/i.test(message);
  const out: Step[] = [];
  if (expired && path !== "/") out.push({ label: "Sign in again", to: "/" });
  if (path === "/") out.push({ label: "Create an account", to: "/register" }, { label: "Forgot your password?", to: "/forgot_password" }, { label: "Verify your phone", to: "/verify" });
  else if (path === "/register") out.push({ label: "Already have an account? Sign in", to: "/" }, { label: "Verify your phone", to: "/verify" });
  else if (path === "/verify") out.push({ label: "Start again from sign-up", to: "/register" }, { label: "Sign in", to: "/" });
  else if (path === "/forgot_password" || path === "/reset_password") out.push({ label: "Ask for a new code", to: "/forgot_password" }, { label: "Sign in", to: "/" }, { label: "Create an account", to: "/register" });
  else if (path === "/birthprep") out.push({ label: "Create an account", to: "/register" }, { label: "Sign in to your plan", to: "/" });
  else if (path.startsWith("/dashboard")) out.push({ label: "Back to your dashboard", to: "/dashboard" }, { label: "Sign in", to: "/" });
  else out.push({ label: "Sign in", to: "/" }, { label: "Create an account", to: "/register" }, { label: "Start a BirthPrep plan", to: "/birthprep" });
  out.push({ label: "Try again", reload: true }, { label: "Get help", href: HELP });
  const seen = new Set<string>();
  return out.filter((s) => { const k = s.to || s.href || "reload"; if (seen.has(k)) return false; seen.add(k); return true; }).slice(0, 4);
};

const NextSteps = ({ message }: { message?: string }) => {
  const { pathname } = useLocation();
  if (!message) return null;
  return (
    <p className="text-xs mt-2 text-left" role="status">
      <b>What to do next:</b>{" "}
      {stepsFor(pathname, message).map((s, i) => (
        <span key={i}>
          {i > 0 && <span aria-hidden="true"> · </span>}
          {s.reload ? <a className="underline text-primary font-semibold" href="/" onClick={(e) => { e.preventDefault(); window.location.reload(); }}>{s.label}</a>
            : s.to ? <Link className="underline text-primary font-semibold" to={s.to}>{s.label}</Link>
            : <a className="underline text-primary font-semibold" href={s.href}>{s.label}</a>}
        </span>
      ))}
    </p>
  );
};
export default NextSteps;

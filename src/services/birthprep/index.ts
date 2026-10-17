import { currentLanguage } from "i18n";
import axios from "axios";

/**
 * BirthPrep savings plans live in the HNN Biller backend (Railway). These are the PUBLIC,
 * phone-verified endpoints: no account on the biller is needed, the person's phone is the
 * identity. Set REACT_APP_BILLER_URL in .env (defaults to the production biller).
 */
export const BILLER_URL =
  process.env.REACT_APP_BILLER_URL || "https://nextgenhnnbiller-production-bdf1.up.railway.app";

const api = axios.create({ baseURL: `${BILLER_URL}/savings/api`, timeout: 20000 });

export type Facility = { id: string; name: string; programme: string; partner: string };
export type Question = { id: string; q: string; type: "select" | "date" | "number" | "yesno" | "text"; options?: string[]; fact: string };
export type Milestone = { id: string; dueDate: string; amount: number; label: string; status: "due" | "paid"; openEnded?: boolean };
export type Plan = {
  planNo: string; status: string; programme: string; partner: string; facility: string; firstName: string;
  goal: string; goalLabel: string; horizon: string; end: string | null; deadline: string | null;
  scenarios: { label: string; date: string | null; probability: number; cost: number; extras: string[] }[];
  target: { target: number; basisAmount: number; expected: number; mostLikely: number; worstCase: number };
  schedule: Milestone[]; advisories: { at: string; text: string; severity: string }[];
  progress: { saved: number; target: number; percent: number; next: Milestone | null; overdueMilestones: number; remaining: number };
  bridge: { shortfall: number; insureCredit: { eligibleUpTo: number; note: string } | null } | null;
  contributions: { at: string; amount: number; via: string }[]; questions: Question[]; answered: Record<string, any>;
  disclaimer: string; brand: string;
};
export type MyPlan = { planNo: string; token: string; goal: string; goalLabel: string; facility: string; status: string; end: string | null; progress: Plan["progress"]; createdAt: string };

export const getFacilities = () => api.get<{ data: Facility[]; questions: Question[]; goals: string[]; horizons: string[] }>("/facilities");
export const startVerification = (phone: string) => api.post<{ sent: boolean; sandbox: boolean; to: string; codeSandbox?: string }>("/verify/start", { phone, lang: currentLanguage() });
export const signup = (body: {
  name: string; phone: string; code: string; facilityId: string; goal: string; horizon: string;
  other?: { months?: number; years?: number; open?: boolean } | null; answers?: Record<string, any>; facts?: Record<string, any>;
}) => api.post<{ planNo: string; token: string; link: string; plan: Plan }>("/signup", body);
/** Registration / password flows: verify the code with the biller (Africa's Talking) and get a signed receipt. */
export const checkVerification = (phone: string, code: string) =>
  api.post<{ verified: boolean; phone: string; verifiedAt: string; receipt: string; provider: string }>("/verify/check", { phone, code });
export const myPlans = (phone: string, code: string) => api.post<{ phone: string; plans: MyPlan[] }>("/my-plans", { phone, code });
export const getPlan = (token: string) => api.get<Plan>(`/${encodeURIComponent(token)}`);
export const answer = (token: string, answers: Record<string, any>) => api.post<Plan>(`/${encodeURIComponent(token)}/answers`, { answers });

// The tokens of the person's plans are kept on this device so the dashboard can open them without a new code.
const KEY = "birthprep_plans";
export const savedPlans = (): MyPlan[] => { try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; } };
export const rememberPlans = (plans: MyPlan[]) => { try { localStorage.setItem(KEY, JSON.stringify(plans)); } catch { /* private mode */ } };
export const rememberPlan = (p: MyPlan) => rememberPlans([p, ...savedPlans().filter((x) => x.planNo !== p.planNo)]);
export const errorText = (e: any) => e?.response?.data?.detail || e?.response?.data?.message || e?.response?.data?.error || e?.message || "Something went wrong";

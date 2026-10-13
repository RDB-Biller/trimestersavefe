import axios from "axios";
import URL from "../../helpers/URL";
import { getToken } from "../../helpers/utilities";

const cfg = () => ({ headers: { Authorization: `Bearer ${getToken()}` }, timeout: 30000 });
const withId = (url: string, id: string) => url.replace(":id", encodeURIComponent(id));

export type Appointment = { _id: string; title: string; date: string; time: string; hospital: string; doctor: string; notes: string; status: "upcoming" | "completed" | "cancelled"; remind_sms: boolean };
export type AppNotification = { _id: string; title: string; message: string; kind: string; read: boolean; createdAt: string };
export type VaultFile = { _id: string; name: string; type: string; size: number; category: string; note: string; createdAt: string };

export const errorMessage = (e: any) => e?.response?.data?.error || (e?.message === "Network Error" ? "Could not reach the server. Check your connection." : e?.message) || "Something went wrong";

// appointments
export const getAppointments = () => axios.get<{ result: Appointment[] }>(URL.getAppointments, cfg());
export const createAppointment = (d: Partial<Appointment>) => axios.post<{ result: Appointment }>(URL.createAppointment, d, cfg());
export const updateAppointment = (id: string, d: Partial<Appointment>) => axios.patch<{ result: Appointment }>(withId(URL.updateAppointment, id), d, cfg());
export const deleteAppointment = (id: string) => axios.delete(withId(URL.deleteAppointment, id), cfg());

// notifications
export const getNotifications = () => axios.get<{ result: AppNotification[]; unread: number }>(withId(URL.getNotifications, "me"), cfg());
export const readNotification = (id: string) => axios.patch<{ result: AppNotification[] }>(withId(URL.readNotification, id), {}, cfg());

// vault
export const getVaultFiles = () => axios.get<{ result: VaultFile[] }>(URL.getVaultFiles, cfg());
export const addVaultFile = (d: { name: string; type: string; data: string; category?: string; note?: string }) => axios.post<{ result: VaultFile }>(URL.addVaultFile, d, cfg());
export const getVaultFile = (id: string) => axios.get<{ result: VaultFile & { data: string } }>(withId(URL.getVaultFile, id), cfg());
export const updateVaultFile = (id: string, d: Partial<VaultFile>) => axios.patch<{ result: VaultFile }>(withId(URL.updateVaultFile, id), d, cfg());
export const deleteVaultFile = (id: string) => axios.delete(withId(URL.deleteVaultFile, id), cfg());

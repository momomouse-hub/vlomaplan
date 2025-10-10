import { apiFetchJson } from "./client";

const base = import.meta.env.VITE_API_BASE_URL || "";

export async function register(email, password, passwordConfirmation) {
  return apiFetchJson(`${base}/api/registration`, {
    method: "POST",
    body: { email, password, password_confirmation: passwordConfirmation },
  });
}

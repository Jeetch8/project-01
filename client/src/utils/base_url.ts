export const base_url = `${
  (import.meta.env.VITE_API_BASE_URL as string) ??
  'https://api.social.jeetchawda.me'
}/api/v1`;

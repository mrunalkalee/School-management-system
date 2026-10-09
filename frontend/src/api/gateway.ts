export type Session = {
  access_token: string;
  refresh_token: string;
  user: { _id: string; name: string; email: string; role: 'admin' | 'teacher' | 'student' | 'parent'; linkedProfileId?: string; linkedStudentIds?: string[] };
};

const baseUrl = ((import.meta.env.VITE_API_GATEWAY_URL as string | undefined) ?? 'http://localhost:3100').replace(/\/$/, '');

export class GatewayError extends Error {
  constructor(public readonly status: number, message: string) { super(message); }
}

export async function gateway<T>(path: string, init: RequestInit = {}, token?: string): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${baseUrl}${path}`, {
      ...init,
      headers: { Accept: 'application/json', ...(init.body ? { 'Content-Type': 'application/json' } : {}), ...(token ? { Authorization: `Bearer ${token}` } : {}), ...init.headers },
    });
  } catch { throw new GatewayError(0, `Cannot reach the API Gateway at ${baseUrl}.`); }
  const raw = await response.text();
  const data: unknown = raw ? JSON.parse(raw) : undefined;
  if (!response.ok) {
    const message = typeof data === 'object' && data && 'message' in data
      ? Array.isArray(data.message) ? data.message.join(', ') : String(data.message)
      : `Request failed with status ${response.status}.`;
    // Only an authenticated request can expire a saved browser session. A
    // failed login is also a 401, but must remain on the login form.
    if (response.status === 401 && token) {
      clearSession();
      window.dispatchEvent(new Event('brightboard-session-expired'));
    }
    throw new GatewayError(response.status, message);
  }
  return data as T;
}

export function loadSession(): Session | null { try { return JSON.parse(sessionStorage.getItem('brightboard-session') ?? 'null') as Session | null; } catch { return null; } }
export function saveSession(session: Session): void { sessionStorage.setItem('brightboard-session', JSON.stringify(session)); }
export function clearSession(): void { sessionStorage.removeItem('brightboard-session'); }

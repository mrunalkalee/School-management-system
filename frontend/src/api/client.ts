import type { ApiErrorBody } from '../types/student';

export const STUDENT_SERVICE_URL: string =
  (import.meta.env.VITE_STUDENT_SERVICE_URL as string | undefined) ?? 'http://localhost:3001';

/** Error thrown for any non-2xx response, carrying the parsed backend error body when available. */
export class ApiError extends Error {
  readonly statusCode: number;
  readonly body?: ApiErrorBody;

  constructor(statusCode: number, body?: ApiErrorBody) {
    const message = Array.isArray(body?.message)
      ? body.message.join(', ')
      : body?.message ?? `Request failed with status ${statusCode}`;
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.body = body;
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
  query?: Record<string, string | undefined>;
}

function buildUrl(path: string, query?: Record<string, string | undefined>): string {
  const url = new URL(path, STUDENT_SERVICE_URL);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== '') {
        url.searchParams.set(key, value);
      }
    }
  }
  return url.toString();
}

/** Thin fetch wrapper: JSON in, JSON out, typed errors, no auth header (none required yet). */
export async function apiRequest<TResponse>(
  path: string,
  { method = 'GET', body, query }: RequestOptions = {},
): Promise<TResponse> {
  let response: Response;
  try {
    response = await fetch(buildUrl(path, query), {
      method,
      headers: body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    // Network failure — service unreachable, CORS, offline, etc.
    throw new ApiError(0, {
      statusCode: 0,
      error: 'Network Error',
      message: 'Could not reach the Student Service. Is it running on ' + STUDENT_SERVICE_URL + '?',
    });
  }

  if (response.status === 204) {
    return undefined as TResponse;
  }

  const text = await response.text();
  const data: unknown = text ? JSON.parse(text) : undefined;

  if (!response.ok) {
    throw new ApiError(response.status, data as ApiErrorBody);
  }

  return data as TResponse;
}

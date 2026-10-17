export class ApiError extends Error {
  constructor(
    public status: number,
    public fields: Record<string, string[]>,
  ) {
    super('Request failed');
  }
}
export const apiOrigin = import.meta.env.VITE_API_SAME_ORIGIN === 'true'
  ? ''
  : import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://api.avrixdigital.co.uk' : 'http://localhost:8000');
export async function post<T>(path: string, data: unknown): Promise<T> {
  const response = await fetch(
    `${apiOrigin}/api/${path}/`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Env': import.meta.env.VITE_SITE_ENV || 'development',
      },
      body: JSON.stringify(data),
      signal: AbortSignal.timeout(60000),
      credentials: 'omit',
    },
  );
  if (!response.ok) {
    let fields = {};
    try {
      fields = await response.json();
    } catch {
      /* Fallback is rendered by the form. */
    }
    throw new ApiError(response.status, fields);
  }
  return response.json() as Promise<T>;
}

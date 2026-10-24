/**
 * Robust JSON Fetch helper that guards against HTML responses (e.g. Vite SPA fallbacks, 404/502/504 gateway pages)
 * to prevent: "Unexpected token '<', '<!doctype '... is not valid JSON"
 */

export interface ApiResponse<T = any> {
  ok: boolean;
  status: number;
  data?: T;
  error?: string;
}

export async function safeFetchJson<T = any>(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<ApiResponse<T>> {
  try {
    const res = await fetch(input, init);
    const contentType = res.headers.get('content-type') || '';

    if (!contentType.includes('application/json')) {
      const text = await res.text();
      const isHtml = text.trim().toLowerCase().startsWith('<!doctype') || text.trim().startsWith('<html');
      const snippet = text.trim().slice(0, 100);

      return {
        ok: false,
        status: res.status,
        error: isHtml
          ? `Server returned HTML (${res.status}) instead of JSON for ${input.toString()}. Endpoint may be missing or server restarting.`
          : `Unexpected response format (${contentType}): ${snippet}`,
      };
    }

    const data = await res.json();
    return {
      ok: res.ok,
      status: res.status,
      data,
      error: !res.ok ? (data?.error || `Request failed with status ${res.status}`) : undefined,
    };
  } catch (err: any) {
    return {
      ok: false,
      status: 0,
      error: err?.message || 'Network error occurred while contacting the server.',
    };
  }
}

/**
 * Safely parse a fetch Response as JSON or extract a readable error message if HTML was returned.
 */
export async function safeParseResponse<T = any>(res: Response): Promise<{ success: boolean; data?: T; error?: string }> {
  try {
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      const text = await res.text();
      const isHtml = text.trim().toLowerCase().startsWith('<!doctype') || text.trim().startsWith('<html');
      return {
        success: false,
        error: isHtml
          ? `Server returned an HTML page (Status ${res.status}) instead of expected JSON data.`
          : `Unexpected content type (${contentType || 'none'}): ${text.slice(0, 100)}`,
      };
    }

    const data = await res.json();
    return {
      success: res.ok && data?.success !== false,
      data,
      error: !res.ok ? (data?.error || `Server responded with HTTP ${res.status}`) : undefined,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || 'Failed to parse JSON response.',
    };
  }
}

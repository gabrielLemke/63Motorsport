const DEFAULT_SUPABASE_URL = 'https://upjxtynowtvjrwscompl.supabase.co';
const DEFAULT_SUPABASE_KEY = 'sb_publishable_BzCjLUFQ5yTRYPUUxj53rw_e5CGSx5V';

export const SUPABASE_URL =
  import.meta.env?.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
export const SUPABASE_KEY =
  import.meta.env?.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_KEY;

function getHeaders(extraHeaders?: Record<string, string>): Record<string, string> {
  const headers: Record<string, string> = {
    apikey: SUPABASE_KEY,
    'Content-Type': 'application/json',
    ...extraHeaders
  };

  if (SUPABASE_KEY.startsWith('eyJ')) {
    headers.Authorization = `Bearer ${SUPABASE_KEY}`;
  }

  return headers;
}

export const supabaseRest = {
  async select<T = any>(table: string, queryParams = 'select=*'): Promise<T[]> {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${queryParams}`, {
      method: 'GET',
      headers: getHeaders()
    });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`Supabase SELECT error (${res.status}): ${text}`);
    }
    return res.json();
  },

  async upsert<T = any>(table: string, rows: any | any[], onConflict = 'id'): Promise<T[]> {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?on_conflict=${onConflict}`, {
      method: 'POST',
      headers: getHeaders({
        Prefer: 'return=representation,resolution=merge-duplicates'
      }),
      body: JSON.stringify(rows)
    });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`Supabase UPSERT error (${res.status}): ${text}`);
    }
    return res.json();
  },

  async update<T = any>(table: string, matchQuery: string, patch: any): Promise<T[]> {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${matchQuery}`, {
      method: 'PATCH',
      headers: getHeaders({
        Prefer: 'return=representation'
      }),
      body: JSON.stringify(patch)
    });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`Supabase UPDATE error (${res.status}): ${text}`);
    }
    return res.json();
  },

  async remove(table: string, matchQuery: string): Promise<boolean> {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${matchQuery}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`Supabase DELETE error (${res.status}): ${text}`);
    }
    return true;
  }
};

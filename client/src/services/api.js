const API = 'http://localhost:5000';

// ── Token helpers ─────────────────────────────────────────────────────────────
export const getToken  = ()        => localStorage.getItem('dots_token');
export const setToken  = (t)       => localStorage.setItem('dots_token', t);
export const clearToken = ()       => localStorage.removeItem('dots_token');
const authHeader = () => ({ 'Authorization': `Bearer ${getToken()}` });

// ── Auth ──────────────────────────────────────────────────────────────────────
export async function signup(name, email, password) {
  const r = await fetch(`${API}/api/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });
  const data = await r.json();
  if (!r.ok) throw new Error(data.error || 'Signup failed');
  return data;
}

export async function login(email, password) {
  const r = await fetch(`${API}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await r.json();
  if (!r.ok) throw new Error(data.error || 'Login failed');
  return data;
}

export async function getMe() {
  const r = await fetch(`${API}/api/auth/me`, { headers: authHeader() });
  if (!r.ok) return null;
  const data = await r.json();
  return data.user;
}

// ── Visualize (SSE) ───────────────────────────────────────────────────────────
export function streamVisualization(prompt, difficulty, quality, onEvent) {
  return new Promise((resolve, reject) => {
    fetch(`${API}/api/visualize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeader() },
      body: JSON.stringify({ prompt, difficulty, quality }),
    }).then(response => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const reader  = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      function processChunk({ done, value }) {
        if (done) { resolve(); return; }
        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split('\n\n');
        buffer = parts.pop();
        for (const part of parts) {
          for (const line of part.split('\n')) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6).trim());
                onEvent(data);
                if (data.stage === 'completed' || data.stage === 'error') { resolve(data); return; }
              } catch (_) {}
            }
          }
        }
        reader.read().then(processChunk).catch(reject);
      }
      reader.read().then(processChunk).catch(reject);
    }).catch(reject);
  });
}

// ── History ───────────────────────────────────────────────────────────────────
export async function getHistory() {
  const r = await fetch(`${API}/api/history`, { headers: authHeader() });
  if (!r.ok) throw new Error('Failed to fetch history');
  return r.json();
}

export async function deleteVisualization(id) {
  const r = await fetch(`${API}/api/history/${id}`, { method: 'DELETE', headers: authHeader() });
  if (!r.ok) throw new Error('Failed to delete');
  return r.json();
}

// Cloudinary URLs are absolute — return as-is
export const getVideoUrl = (url) => url;
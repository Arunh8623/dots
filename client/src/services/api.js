const API_BASE = 'http://localhost:5000';

export function streamVisualization(prompt, difficulty, quality, onEvent) {
  return new Promise((resolve, reject) => {
    fetch(`${API_BASE}/api/visualize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, difficulty, quality })
    })
    .then(response => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      function processChunk({ done, value }) {
        if (done) {
          resolve();
          return;
        }

        buffer += decoder.decode(value, { stream: true });

        // SSE events are separated by double newlines
        // Split on \n\n to get full events
        const parts = buffer.split('\n\n');
        
        // Keep the last incomplete part in the buffer
        buffer = parts.pop();

        for (const part of parts) {
          // Each part may have multiple lines; find the data: line
          const lines = part.split('\n');
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const jsonStr = line.slice(6).trim();
              if (!jsonStr) continue;
              try {
                const data = JSON.parse(jsonStr);
                onEvent(data);
                if (data.stage === 'completed' || data.stage === 'error') {
                  resolve(data);
                  return;
                }
              } catch (e) {
                console.warn('SSE parse error:', e, 'raw:', jsonStr);
              }
            }
          }
        }

        reader.read().then(processChunk).catch(reject);
      }

      reader.read().then(processChunk).catch(reject);
    })
    .catch(reject);
  });
}

export async function getHistory() {
  const res = await fetch(`${API_BASE}/api/history`);
  if (!res.ok) throw new Error('Failed to fetch history');
  return res.json();
}

export async function deleteVisualization(id) {
  const res = await fetch(`${API_BASE}/api/history/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete');
  return res.json();
}

export const getVideoUrl = (path) => `${API_BASE}${path}`;
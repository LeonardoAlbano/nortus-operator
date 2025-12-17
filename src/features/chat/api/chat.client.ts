export async function getChat() {
  const res = await fetch('/api/nortus/chat', {
    method: 'GET',
    credentials: 'include',
    headers: { accept: 'application/json' },
    cache: 'no-store',
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || `Request failed: ${res.status}`);
  }

  return (await res.json()) as unknown;
}

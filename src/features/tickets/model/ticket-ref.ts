export function ticketRef(id: string) {
  if (!id) return 'TK000';

  let sum = 0;
  for (let i = 0; i < id.length; i++) sum = (sum + id.charCodeAt(i)) % 999;

  const n = sum + 1;
  return `TK${String(n).padStart(3, '0')}`;
}

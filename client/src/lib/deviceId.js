const KEY = 'civicpulse_device_id';

export function getDeviceId() {
  const existing = localStorage.getItem(KEY);
  if (existing) return existing;

  const id = crypto.randomUUID ? crypto.randomUUID() : `device-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  localStorage.setItem(KEY, id);
  return id;
}

export function votedKey(issueId) {
  return `civicpulse_voted_${issueId}`;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

async function request(path, options = {}) {
  const headers = options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' };
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...headers,
      ...(options.headers || {})
    }
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || 'Request failed.');
  }
  return data;
}

export function getIssues(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) query.set(key, value);
  });
  const suffix = query.toString() ? `?${query}` : '';
  return request(`/issues${suffix}`);
}

export function getIssue(id) {
  return request(`/issues/${id}`);
}

export function createIssue(formData) {
  return request('/issues', { method: 'POST', body: formData });
}

export function toggleUpvote(id, deviceId) {
  return request(`/issues/${id}/upvote`, {
    method: 'POST',
    body: JSON.stringify({ deviceId })
  });
}

export function updateIssueStatus(id, status) {
  return request(`/issues/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status })
  });
}

export function getStats() {
  return request('/stats');
}

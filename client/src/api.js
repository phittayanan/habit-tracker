const genericMessage = 'Something went wrong. Please try again.';

export async function api(path, options = {}, onUnauthenticated = () => {}) {
  let response;
  try { response = await fetch(path, { credentials: 'same-origin', ...options }); }
  catch { throw new Error(genericMessage); }
  if (response.status === 204) return null;
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    if (response.status === 401) onUnauthenticated();
    throw new Error(response.status >= 500 ? genericMessage : body?.error?.message || genericMessage);
  }
  return body;
}

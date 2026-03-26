import api from '../api/client';

/**
 * Download a protected /api/files/... URL using the JWT (plain <a href> does not send Authorization).
 */
export async function downloadWithAuth(downloadUrl, filename) {
  const path = downloadUrl.startsWith('http') ? downloadUrl.replace(/^https?:\/\/[^/]+/, '') : downloadUrl;
  const { data } = await api.get(path, { responseType: 'blob' });
  const blobUrl = URL.createObjectURL(data);
  const a = document.createElement('a');
  a.href = blobUrl;
  a.download = filename || 'download';
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(blobUrl);
}

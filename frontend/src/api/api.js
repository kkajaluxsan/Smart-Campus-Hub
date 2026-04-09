import api from './client';

export const auth = {
  login: (body) => api.post('/api/auth/login', body),
  register: (body) => api.post('/api/auth/register', body),
  me: () => api.get('/api/auth/me'),
};

export const resources = {
  list: (params) => api.get('/api/resources', { params }),
  get: (id) => api.get(`/api/resources/${id}`),
  schedule: (id, start, end) =>
    api.get(`/api/resources/${id}/schedule`, { params: { start, end } }),
  create: (body) => api.post('/api/resources', body),
  update: (id, body) => api.put(`/api/resources/${id}`, body),
  remove: (id) => api.delete(`/api/resources/${id}`),
};

export const seats = {
  availability: (resourceId, start, end) =>
    api.get(`/api/resources/${resourceId}/seats/availability`, {
      params: { start, end },
    }),
};

export const bookings = {
  list: () => api.get('/api/bookings'),
  get: (id) => api.get(`/api/bookings/${id}`),
  create: (body) => api.post('/api/bookings', body),
  approve: (id, reason) => api.put(`/api/bookings/${id}/approve`, { reason }),
  reject: (id, reason) => api.put(`/api/bookings/${id}/reject`, { reason }),
  cancel: (id) => api.delete(`/api/bookings/${id}`),
};

export const adminBookings = {
  bulkApprove: (body) => api.post('/api/admin/bookings/bulk-approve', body),
  bulkReject: (body) => api.post('/api/admin/bookings/bulk-reject', body),
};

export const dashboard = {
  summary: () => api.get('/api/dashboard/summary'),
};

export const tech = {
  workload: () => api.get('/api/tech/workload'),
};

export const tickets = {
  list: () => api.get('/api/tickets'),
  get: (id) => api.get(`/api/tickets/${id}`),
  create: (body) => api.post('/api/tickets', body),
  update: (id, body) => api.patch(`/api/tickets/${id}`, body),
  assign: (id, technicianId) =>
    api.put(`/api/tickets/${id}/assign`, { technicianId }),
  addComment: (ticketId, body) =>
    api.post(`/api/tickets/${ticketId}/comments`, body),
  updateComment: (ticketId, commentId, body) =>
    api.patch(`/api/tickets/${ticketId}/comments/${commentId}`, body),
  deleteComment: (ticketId, commentId) =>
    api.delete(`/api/tickets/${ticketId}/comments/${commentId}`),
  uploadAttachment: (ticketId, file) => {
    const fd = new FormData();
    fd.append('file', file);
    return api.post(`/api/tickets/${ticketId}/attachments`, fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

export const notifications = {
  list: () => api.get('/api/notifications'),
  markRead: (id) => api.put(`/api/notifications/${id}/read`),
};

export const audit = {
  list: () => api.get('/api/admin/audit-logs'),
};

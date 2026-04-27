import { apiFetch } from './api';

const resignationService = {
  applyResignation: async (data) => {
    return await apiFetch('/resignation/apply', { method: 'POST', body: data });
  },

  getMyResignation: async () => {
    return await apiFetch('/resignation/my');
  },

  getResignations: async (params) => {
    let query = '';
    if (params) {
      query = '?' + new URLSearchParams(params).toString();
    }
    return await apiFetch(`/resignation${query}`);
  },

  getStats: async () => {
    return await apiFetch('/resignation/stats');
  },

  updateStatus: async (id, status) => {
    return await apiFetch(`/resignation/${id}/status`, { method: 'PATCH', body: { status } });
  },

  updateChecklistItem: async (id, data) => {
    return await apiFetch(`/resignation/checklist/${id}`, { method: 'PUT', body: data });
  },

  completeExit: async (id) => {
    return await apiFetch(`/resignation/${id}/complete`, { method: 'POST' });
  },
  updateResignation: async (id, data) => {
    return await apiFetch(`/resignation/${id}`, {
      method: 'PATCH',
      body: data
    });
  },

  recoverAsset: async (assetId, data) => {
    return await apiFetch(`/assets/${assetId}`, {
      method: 'PUT',
      body: {
        status: 'RETURNED',
        returnDate: new Date().toISOString().split('T')[0],
        ...data
      }
    });
  },

  cancelResignation: async (id) => {
    return await apiFetch(`/resignation/my/${id}`, {
      method: 'DELETE'
    });
  }
};

export default resignationService;

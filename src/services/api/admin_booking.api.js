import { httpClient } from "../http/httpClient";

const BASE = "/api/v1/admin/bookings";

export const adminBookingApi = {
  /**
   * GET /api/v1/admin/bookings
   * params: page, size, fieldId, slotId, userId, from, to, statuses, q
   */
  list: (params) => httpClient.get(BASE, { params }),

  /** GET /api/v1/admin/bookings/{id} */
  detail: (id) => httpClient.get(`${BASE}/${id}`),

  /** POST /api/v1/admin/bookings/{id}/mark-paid  body: { amount? } */
  markPaid: (id, payload) => httpClient.post(`${BASE}/${id}/mark-paid`, payload),

  /** POST /api/v1/admin/bookings/{id}/refund body: { amount?, reason? } */
  refund: (id, payload) => httpClient.post(`${BASE}/${id}/refund`, payload),

  /** POST /api/v1/admin/bookings/{id}/expire?reason= */
  expire: (id, reason) =>
    httpClient.post(`${BASE}/${id}/expire`, null, { params: { reason } }),

  /** PATCH /api/v1/admin/bookings/{id}/note body: { note } */
  updateNote: (id, note) => httpClient.patch(`${BASE}/${id}/note`, { note }),

  /** GET /api/v1/admin/bookings/schedule?fieldId=&date= */
  schedule: (fieldId, date) =>
    httpClient.get(`${BASE}/schedule`, { params: { fieldId, date } }),

  /** GET /api/v1/admin/bookings/stats?from=&to= */
  stats: (from, to) => httpClient.get(`${BASE}/stats`, { params: { from, to } }),
};

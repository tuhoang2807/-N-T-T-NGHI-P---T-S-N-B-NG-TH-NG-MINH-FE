// src/services/api/field.api.js
import { httpClient } from "../http/httpClient";

const BASE = "/api/v1/field";

export const fieldApi = {
  // ✅ basic
  getAll: () => httpClient.get(BASE),
  getById: (id) => httpClient.get(`${BASE}/${id}`),

  // ✅ filter
  getByType: (type) => httpClient.get(`${BASE}/type/${type}`),
  getTypes: () => httpClient.get(`${BASE}/types`),

  // ✅ search: /search?type=SEVEN&fieldName=abc
  // (mày fix BE: @RequestParam String fieldName cho rõ)
  search: ({ type, fieldName } = {}) =>
    httpClient.get(`${BASE}/search`, { params: { type, fieldName } }),

  // ✅ ADMIN/STAFF
  create: (payload) => httpClient.post(BASE, payload),
  update: (id, payload) => httpClient.put(`${BASE}/${id}`, payload),
  remove: (id) => httpClient.delete(`${BASE}/${id}`),
};

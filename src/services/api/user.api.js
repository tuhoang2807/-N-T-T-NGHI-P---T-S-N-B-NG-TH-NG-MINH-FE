import { httpClient } from "../http/httpClient";

const BASE = "/api/v1/users";

export const userApi = {
  
  getAll: () => httpClient.get(BASE),

  getById: (id) => httpClient.get(`${BASE}/${id}`),

  create: (payload) => httpClient.post(BASE, payload),

  update: (id, payload) => httpClient.put(`${BASE}/${id}`, payload),

  remove: (id) => httpClient.delete(`${BASE}/${id}`),

  getCoins: (userId) => httpClient.get(`${BASE}/coin/${userId}`),

};

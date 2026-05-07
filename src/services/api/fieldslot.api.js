import { httpClient } from "../http/httpClient";

const BASE = "/api/v1/fieldSlot";

export const fieldSlotApi = {
  /**
   * GET /api/v1/fieldSlot
   * @returns ResponseFormat<List<FieldSlotProjection>>
   * PermitAll
   */
  getAll: () => httpClient.get(BASE),

  /**
   * GET /api/v1/fieldSlot/{id}
   * @returns ResponseFormat<FieldSlot>
   * ADMIN/STAFF
   */
  getById: (id) => httpClient.get(`${BASE}/${id}`),

  /**
   * POST /api/v1/fieldSlot
   * body: FieldSlot
   * @returns ResponseFormat<FieldSlot>
   * ADMIN/STAFF
   */
  create: (payload) => httpClient.post(BASE, payload),

  /**
   * DELETE /api/v1/fieldSlot/{id}
   * @returns ResponseFormat<Void>
   * ADMIN/STAFF
   */
  remove: (id) => httpClient.delete(`${BASE}/${id}`),
};

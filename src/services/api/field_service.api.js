import { httpClient } from "../http/httpClient";

const BASE = "/api/v1/field-services";

export const fieldServiceApi = {
  /**
   * GET /api/v1/field-services
   * @returns ResponseFormat<List<FieldServiceEntity>>
   * PermitAll
   */
  getAll: () => httpClient.get(BASE),

  /**
   * GET /api/v1/field-services/{id}
   * @returns ResponseFormat<FieldServiceEntity>
   * PermitAll
   */
  getById: (id) => httpClient.get(`${BASE}/${id}`),

  /**
   * POST /api/v1/field-services
   * body: FieldServiceEntity
   * @returns ResponseFormat<FieldServiceEntity>
   * ADMIN/STAFF
   */
  create: (payload) => httpClient.post(BASE, payload),

  /**
   * PUT /api/v1/field-services/{id}
   * body: FieldServiceEntity
   * @returns ResponseFormat<FieldServiceEntity>
   * ADMIN/STAFF
   */
  update: (id, payload) => httpClient.put(`${BASE}/${id}`, payload),

  /**
   * DELETE /api/v1/field-services/{id}
   * @returns ResponseFormat<Void>
   * ADMIN/STAFF
   */
  remove: (id) => httpClient.delete(`${BASE}/${id}`),
};

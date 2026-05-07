import { httpClient } from "../http/httpClient";

const BASE = "/api/v1/match-posts";

export const matchmakingApi = {
  /**
   * GET /api/v1/match-posts
   * Lấy danh sách tất cả bài ghép đối
   * @returns {Promise} AxiosResponse<MatchPostListItemDTO[]>
   */
  listAll: () => httpClient.get(BASE),

  /**
   * GET /api/v1/match-posts/{postId}
   * Lấy chi tiết bài ghép đối (kèm applicants)
   * @param {number|string} postId
   * @returns {Promise} AxiosResponse<MatchPostDetailDTO>
   */
  getDetail: (postId) => httpClient.get(`${BASE}/${postId}`),

  /**
   * POST /api/v1/match-posts
   * Tạo bài ghép đối cho booking
   * body: { bookingId, title?, note? }
   * @param {{ bookingId: number|string, title?: string, note?: string }} payload
   * @returns {Promise} AxiosResponse<MatchPostDTO>
   */
  create: (payload) => httpClient.post(BASE, payload),

  /**
   * DELETE /api/v1/match-posts/{postId}
   * Xóa bài (chỉ khi OPEN và là owner)
   * @param {number|string} postId
   * @returns {Promise} AxiosResponse<void>
   */
  delete: (postId) => httpClient.delete(`${BASE}/${postId}`),

  /**
   * POST /api/v1/match-posts/{postId}/apply
   * Ứng tuyển vào bài ghép đối
   * body: { message? }
   * @param {number|string} postId
   * @param {{ message?: string }} payload
   * @returns {Promise} AxiosResponse<void>
   */
  apply: (postId, payload) => httpClient.post(`${BASE}/${postId}/apply`, payload),

  /**
   * POST /api/v1/match-posts/{postId}/choose-opponent
   * Chủ bài chọn đối thủ
   * body: { applicantUserId }
   * @param {number|string} postId
   * @param {number} applicantUserId
   * @returns {Promise} AxiosResponse<MatchPostDTO>
   */
  chooseOpponent: (postId, applicantUserId) =>
    httpClient.post(`${BASE}/${postId}/choose-opponent`, { applicantUserId }),
};
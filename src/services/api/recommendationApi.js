import { httpClient } from "../http/httpClient";

const BASE = "/api/v1/recommendations";

export const recommendationApi = {
  /**
   * GET /api/v1/recommendations/quick-book?userId=&days=&topK=
   * AI gợi ý đặt nhanh (Top-K option có thể đặt ngay)
   * @param {number} userId
   * @param {object} opts { days?, topK? }
   * @returns {Promise} { data: { data: QuickBookOptionDTO[] } }
   */
  getQuickBook: (userId, opts = {}) => {
    const { days = 7, topK = 10 } = opts;
    return httpClient.get(`${BASE}/quick-book`, {
      params: { userId, days, topK },
    });
  },
};
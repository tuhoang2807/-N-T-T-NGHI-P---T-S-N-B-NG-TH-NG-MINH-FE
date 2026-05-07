import { httpClient } from "../http/httpClient";

const BASE = "/api/v1/bookings";

export const bookingApi = {
  /**
   * GET /api/v1/bookings/occupied?fieldId=&date=
   * Lấy danh sách slotId đã bị đặt theo sân và ngày (để bôi đen slot trên UI)
   * @param {number} fieldId
   * @param {string} date - YYYY-MM-DD
   * @returns {Promise} { data: { data: number[] } }
   */
  getOccupiedSlots: (fieldId, date) =>
    httpClient.get(`${BASE}/occupied`, {
      params: { fieldId, date },
    }),

  /**
   * POST /api/v1/bookings
   * Tạo booking trạng thái PENDING_DEPOSIT (giữ chỗ 20 phút chờ cọc)
   * body: { userId, fieldId, slotId, bookingDate, serviceIds?, couponCode? }
   * @param {object} payload
   * @returns {Promise} { data: { data: CreateBookingResponse } }
   */
  create: (payload) => httpClient.post(BASE, payload),

  /**
   * POST /api/v1/bookings/{id}/deposit
   * Thực hiện cọc (trừ coin 30% tiền sân, chuyển DEPOSITED)
   * @param {number|string} bookingId
   * @returns {Promise}
   */
  deposit: (bookingId) => httpClient.post(`${BASE}/${bookingId}/deposit`),

  /**
   * POST /api/v1/bookings/{id}/checkin
   * Check-in tại sân (chỉ khi đã cọc)
   * @param {number|string} bookingId
   * @returns {Promise}
   */
  checkIn: (bookingId) => httpClient.post(`${BASE}/${bookingId}/checkin`),

  /**
   * POST /api/v1/bookings/{id}/cancel
   * Huỷ đơn
   * @param {number|string} bookingId
   * @returns {Promise}
   */
  cancel: (bookingId) => httpClient.post(`${BASE}/${bookingId}/cancel`),


  /**
   * GET /api/v1/bookings/history?userId=&page=&size=&statuses=
   * Lịch sử đặt sân theo user (tạm thời truyền userId)
   * @param {number} userId
   * @param {object} opts { page?, size?, statuses? }  statuses: array BookingStatus
   * @returns {Promise} { data: { data: Page<BookingHistoryItemDTO> } }
   */
  getHistory: (userId, opts = {}) => {
    const { page = 0, size = 10, statuses } = opts;

    // axios sẽ serialize array thành statuses[]=A&statuses[]=B (tùy config)
    // backend Spring thường ăn được cả statuses=A&statuses=B
    return httpClient.get(`${BASE}/history`, {
      params: { userId, page, size, statuses },
      // Nếu bạn gặp vấn đề serialize array, bật đoạn dưới:
      // paramsSerializer: { indexes: null },
    });
  },
};

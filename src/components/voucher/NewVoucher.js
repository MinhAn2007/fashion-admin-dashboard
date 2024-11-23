import React, { useState } from 'react';
import { X } from "lucide-react";

const AddVoucherModal = ({ isOpen, onClose, onSubmit }) => {
  const API_ENDPOINT = process.env.REACT_APP_API_ENDPOINT;
  const [loading, setLoading] = useState(false);

  const [voucher, setVoucher] = useState({
    coupon_code: '',
    coupon_type: 'percent',
    coupon_value: '',
    coupon_start_date: '',
    coupon_end_date: '',
    coupon_min_spend: '',
    coupon_max_spend: '',
    coupon_uses_per_customer: '',
    coupon_uses_per_coupon: '',
    coupon_status: 'active'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setVoucher(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      const response = await fetch(`${API_ENDPOINT}/api/voucher`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(voucher),
      });

      if (!response.ok) {
        throw new Error('Failed to create voucher');
      }

      alert('Thêm voucher thành công');
      if (onSubmit) {
        onSubmit();
      }
      onClose();
      
    } catch (error) {
      console.error('Error creating voucher:', error);
      alert('Thêm voucher thất bại');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;
  

  return (
    <div className="fixed inset-0 z-[999999999] flex items-center justify-center">
      <div className="absolute inset-0 bg-black bg-opacity-50" />
      <div className="relative bg-white rounded-lg w-full max-w-2xl mx-4 my-6">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-xl font-semibold text-gray-900">Thêm Voucher Mới</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            type="button"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            {/* Mã voucher */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Mã voucher
              </label>
              <input
                type="text"
                name="coupon_code"
                value={voucher.coupon_code}
                onChange={handleChange}
                className="w-full border rounded-md px-3 py-2"
                required
              />
            </div>

            {/* Loại voucher */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Loại voucher
              </label>
              <select
                name="coupon_type"
                value={voucher.coupon_type}
                onChange={handleChange}
                className="w-full border rounded-md px-3 py-2"
                required
              >
                <option value="percent">Phần trăm</option>
                <option value="fixed_amount">Số tiền cố định</option>
              </select>
            </div>

            {/* Giá trị */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Giá trị {voucher.coupon_type === 'percent' ? '(%)' : '(VND)'}
              </label>
              <input
                type="number"
                name="coupon_value"
                value={voucher.coupon_value}
                onChange={handleChange}
                className="w-full border rounded-md px-3 py-2"
                required
                min="0"
                max={voucher.coupon_type === 'percent' ? "100" : ""}
              />
            </div>

            {/* Thời gian hiệu lực */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Ngày bắt đầu
                </label>
                <input
                  type="date"
                  name="coupon_start_date"
                  value={voucher.coupon_start_date}
                  onChange={handleChange}
                  className="w-full border rounded-md px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Ngày kết thúc
                </label>
                <input
                  type="date"
                  name="coupon_end_date"
                  value={voucher.coupon_end_date}
                  onChange={handleChange}
                  className="w-full border rounded-md px-3 py-2"
                  required
                />
              </div>
            </div>

            {/* Điều kiện sử dụng */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Giá trị đơn hàng tối thiểu
                </label>
                <input
                  type="number"
                  name="coupon_min_spend"
                  value={voucher.coupon_min_spend}
                  onChange={handleChange}
                  className="w-full border rounded-md px-3 py-2"
                  required
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Giá trị đơn hàng tối đa
                </label>
                <input
                  type="number"
                  name="coupon_max_spend"
                  value={voucher.coupon_max_spend}
                  onChange={handleChange}
                  className="w-full border rounded-md px-3 py-2"
                  min="0"
                />
              </div>
            </div>

            {/* Giới hạn sử dụng */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Số lần sử dụng tối đa/khách hàng
                </label>
                <input
                  type="number"
                  name="coupon_uses_per_customer"
                  value={voucher.coupon_uses_per_customer}
                  onChange={handleChange}
                  className="w-full border rounded-md px-3 py-2"
                  required
                  min="1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Tổng số lần sử dụng tối đa
                </label>
                <input
                  type="number"
                  name="coupon_uses_per_coupon"
                  value={voucher.coupon_uses_per_coupon}
                  onChange={handleChange}
                  className="w-full border rounded-md px-3 py-2"
                  required
                  min="1"
                />
              </div>
            </div>

            {/* Trạng thái */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Trạng thái
              </label>
              <select
                name="coupon_status"
                value={voucher.coupon_status}
                onChange={handleChange}
                className="w-full border rounded-md px-3 py-2"
                required
              >
                <option value="active">Kích hoạt</option>
                <option value="disabled">Vô hiệu hóa</option>
              </select>
            </div>
          </div>

          {/* Submit buttons */}
          <div className="mt-8 flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              disabled={loading}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Đang xử lý..." : "Lưu voucher"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddVoucherModal;
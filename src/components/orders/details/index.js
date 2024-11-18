import React, { useState, useEffect } from "react";
import {
  ChevronLeft,
  Printer,
  XCircle,
  CheckCircle,
  TruckIcon,
  RotateCcw,
} from "lucide-react";
import { formatPrice } from "../../../utils/FormatPrice";
import { useParams, useNavigate } from "react-router-dom";

const STATUS_DISPLAY_MAP = {
  "Pending Confirmation": "Chờ xác nhận",
  "In Transit": "Đang giao hàng",
  Cancelled: "Đã hủy",
  Completed: "Hoàn thành",
  Delivered: "Đã giao hàng",
  Returned: "Đã trả hàng",
};

const STATUS_COLORS = {
  "Pending Confirmation": "bg-yellow-100 text-yellow-800",
  "In Transit": "bg-blue-100 text-blue-800",
  Cancelled: "bg-red-100 text-red-800",
  Completed: "bg-green-100 text-green-800",
  Delivered: "bg-green-100 text-green-800",
  Returned: "bg-red-100 text-red-800",
};

const STATUS_ACTIONS = {
  "Pending Confirmation": ["confirm", "cancel"],
  "In Transit": ["deliver"],
  Delivered: ["complete", "return"],
  Completed: ["return"],
  Returned: ["confirm"],
  Cancelled: [],
};

const OrderDetail = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const API = process.env.REACT_APP_API_ENDPOINT;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrderDetail = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API}/api/orders/${id}`);
        if (!response.ok) {
          alert("Không thể tải chi tiết đơn hàng");
          throw new Error("Failed to fetch order detail");
        }
        const data = await response.json();
        setOrder(data.data);
        console.log(data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetail();
  }, []);

  const handleStatusUpdate = async (newStatus) => {
    try {
      const response = await fetch(`${API}/api/orders/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!response.ok) {
        alert("Cập nhật trạng thái đơn hàng thất bại");
        throw new Error("Failed to update order status");
      }

      alert("Cập nhật trạng thái đơn hàng thành công");
      window.location.reload();
    } catch (error) {
      console.error("Failed to update order status:", error);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Đang tải...</div>
      </div>
    );

  if (error)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-red-600">Lỗi: {error}</div>
      </div>
    );

  if (!order) return null;

  const renderStatusActions = () => {
    const actions = STATUS_ACTIONS[order.status] || [];    
    return (
      <div className="flex gap-2">
        {actions.includes("confirm") && (
          <button
            onClick={() => handleStatusUpdate("In Transit")}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            {order.status === "Returned" ? "Xác nhận trả hàng" : "Xác nhận đơn hàng"}
          </button>
        )}
        {actions.includes("cancel") && (
          <button
            onClick={() => handleStatusUpdate("Cancelled")}
            className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            <XCircle className="w-4 h-4 mr-2" />
            Hủy đơn hàng
          </button>
        )}
        {actions.includes("deliver") && (
          <button
            onClick={() => handleStatusUpdate("Delivered")}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <TruckIcon className="w-4 h-4 mr-2" />
            Xác nhận đã giao
          </button>
        )}
        {actions.includes("complete") && (
          <button
            onClick={() => handleStatusUpdate("Completed")}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Hoàn thành
          </button>
        )}
        {actions.includes("return") && (
          <button
            onClick={() => handleStatusUpdate("Returned")}
            className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Hoàn trả
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate("/order")}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Quay lại
        </button>
      </div>

      {/* Order Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold mb-2">Đơn hàng #{order.id}</h1>
            <p className="text-gray-500">
              Ngày tạo: {new Date(order.createdAt).toLocaleString()}
            </p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={handlePrint}
              className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              <Printer className="w-4 h-4 mr-2" />
              In đơn hàng
            </button>
            {renderStatusActions()}
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className={`px-3 py-1 rounded-full text-sm ${STATUS_COLORS[order.status]}`}>
            {STATUS_DISPLAY_MAP[order.status]}
          </span>
          <div className="text-right">
            <p className="text-sm text-gray-500">Cập nhật lần cuối:</p>
            <p className="font-medium">{new Date(order.updatedAt).toLocaleString()}</p>            
          </div>
        </div>
      
      </div>

      {/* Customer Info & Shipping */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Thông tin khách hàng</h2>
          <div className="space-y-2">
            <p>
              <span className="text-gray-500">Tên:</span> {order.customerName}
            </p>
            <p>
              <span className="text-gray-500">Email:</span> {order.email}
            </p>
            <p>
              <span className="text-gray-500">Số điện thoại:</span>{" "}
              {order.phone}
            </p>
            <p>
              <span className="text-gray-500">Địa chỉ:</span> {order.address}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Thông tin vận chuyển</h2>
          <div className="space-y-2">
            <p>
              <span className="text-gray-500">Phương thức:</span>{" "}
              {order.shipping.method}
            </p>
            <p>
              <span className="text-gray-500">Phí vận chuyển:</span>{" "}
              {formatPrice(order.shipping.fee)}
            </p>
            <p>
              <span className="text-gray-500">Dự kiến giao:</span>{" "}
              {new Date(order.shipping.estimatedDelivery).toLocaleDateString()}
            </p>
            <p>
              <span className="text-gray-500">Thanh toán:</span>{" "}
              {order.paymentMethod}
            </p>
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Chi tiết đơn hàng</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-4">Sản phẩm</th>
                <th className="text-left p-4">SKU</th>
                <th className="text-left p-4">Kích cỡ</th>
                <th className="text-left p-4">Màu sắc</th>
                <th className="text-right p-4">Đơn giá</th>
                <th className="text-right p-4">Số lượng</th>
                <th className="text-right p-4">Tổng</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item) => (
                <tr key={item.id} className="border-b">
                  <td className="p-4">
                    <div className="flex items-center">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-12 h-12 rounded object-cover mr-3"
                      />
                      <span>{item.name}</span>
                    </div>
                  </td>
                  <td className="p-4">{item.sku}</td>
                  <td className="p-4">{item.size}</td>
                  <td className="p-4">{item.color}</td>
                  <td className="p-4 text-right">{formatPrice(item.price)}</td>
                  <td className="p-4 text-right">{item.quantity}</td>
                  <td className="p-4 text-right">
                    {formatPrice(item.price * item.quantity)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Order Summary */}
        <div className="mt-6 border-t pt-6">
          <div className="w-72 ml-auto">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500">Tạm tính:</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Phí vận chuyển:</span>
                <span>{formatPrice(order.shippingFee)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Giảm giá:</span>
                <span>-{formatPrice(order.discount)}</span>
              </div>
              <div className="flex justify-between font-semibold text-lg pt-2 border-t">
                <span>Tổng cộng:</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;

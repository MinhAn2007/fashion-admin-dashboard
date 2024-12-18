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
import moment from "moment";
import io from "socket.io-client";

const STATUS_DISPLAY_MAP = {
  "Return Request": "Yêu cầu trả hàng",
  "Pending Confirmation": "Chờ xác nhận",
  "In Transit": "Đang giao hàng",
  Cancelled: "Đã hủy",
  Completed: "Hoàn thành",
  Delivered: "Đã giao hàng",
  Returned: "Đã trả hàng",
  Processing: "Đang xử lý",
};

const STATUS_COLORS = {
  "Return Request": "bg-orange-100",
  "Pending Confirmation": "bg-yellow-100 text-yellow-800",
  "In Transit": "bg-blue-100 text-blue-800",
  Cancelled: "bg-red-100 text-red-800",
  Completed: "bg-green-100 text-green-800",
  Delivered: "bg-green-100 text-green-800",
  Returned: "bg-red-100 text-red-800",
  Processing: "bg-yellow-100 text-yellow-800",
};

const STATUS_ACTIONS = {
  "Pending Confirmation": ["confirm", "cancel"],
  "In Transit": ["deliver"],
  Processing: ["in-transit", "cancel"],
  Delivered: ["isGet", "inNotGet"],
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
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [socket, setSocket] = useState(null);
  useEffect(() => {
    // Create socket connection
    const newSocket = io(API, {
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 5000,
      auth: {
        token: localStorage.getItem("token"), // Add authentication if needed
      },
    });
    setSocket(newSocket);

    // Socket connection event handlers
    const handleConnect = () => {
      console.log("Socket connected successfully");
      console.log("Socket ID:", newSocket.id);

      // Register user after successful connection
      const userId = localStorage.getItem("userId");
      if (userId) {
        newSocket.emit("register", { userId }, (response) => {
          console.log("Register response:", response);
        });
      }
    };

    const handleConnectError = (error) => {
      console.error("Socket connection error:", error);
      // Optional: Add user-friendly error handling or notification
    };

    const handleDisconnect = (reason) => {
      console.log("Socket disconnected:", reason);
      // Optional: Implement reconnection logic or show user a reconnection message
    };

    // Listen for order updates
    const handleOrderUpdated = async (updatedOrder) => {
      console.log("Received order update:", updatedOrder);
      const response = await fetch(`${API}/api/orders/${id}`);
      if (!response.ok) {
        alert("Không thể tải chi tiết đơn hàng");
        throw new Error("Failed to fetch order detail");
      }
      const data = await response.json();
      setOrder(data.data);
      console.log(data.data);
      
      // Update order in state
    };

    // Attach event listeners
    newSocket.on("connect", handleConnect);
    newSocket.on("connect_error", handleConnectError);
    newSocket.on("disconnect", handleDisconnect);
    newSocket.on("orderUpdated", handleOrderUpdated);

    // Cleanup on component unmount
    return () => {
      newSocket.off("connect", handleConnect);
      newSocket.off("connect_error", handleConnectError);
      newSocket.off("disconnect", handleDisconnect);
      newSocket.off("orderUpdated", handleOrderUpdated);
      newSocket.disconnect();
    };
  }, []);
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
  useEffect(() => {
    fetchOrderDetail();
  }, []);

  const handleStatusUpdate = async (newStatus) => {
    try {
      setIsUpdatingStatus(true);

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
    } catch (error) {
      console.error("Failed to update order status:", error);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleGetOrder = async (orderId, isGet) => {
    try {
      const response = await fetch(`${API}/api/orders/${orderId}/check`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isGet: isGet }),
      });
      if (!response.ok) {
        alert("Đã xảy ra lỗi khi cập nhật trạng thái đơn hàng");
        return;
      }
      alert("Cập nhật trạng thái đơn hàng thành công");
      window.location.reload();
    } catch (err) {
      console.error("Error updating order status:", err);
    }
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
    if (order.status === "Returned" && order.returnReason) {
      return null;
    }
    const actions = STATUS_ACTIONS[order.status] || [];
    if (order.status === "Delivered" && order.returnReason) {
      return (
        <div className="flex gap-2">
          <button
            onClick={() => handleStatusUpdate("Returned")}
            disabled={isUpdatingStatus}
            className={`flex items-center px-4 py-2 text-white rounded-lg ${
              isUpdatingStatus
                ? "bg-green-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {isUpdatingStatus ? (
              <div className="flex items-center">
                <svg
                  className="animate-spin h-4 w-4 mr-2 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Đang xử lý...
              </div>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Xác nhận đã nhận hàng trả
              </>
            )}
          </button>
        </div>
      );
    }

    return (
      <div className="flex gap-2">
        {actions.includes("isGet") && (
          <>
            {order.isGet === 1 ? (
              // Buttons when isGet is 1 (Order received)
              <>
                <button
                  onClick={() => handleStatusUpdate("Completed")}
                  disabled={isUpdatingStatus}
                  className={`flex items-center px-4 py-2 text-white rounded-lg ${
                    isUpdatingStatus
                      ? "bg-green-400 cursor-not-allowed"
                      : "bg-green-600 hover:bg-green-700"
                  }`}
                >
                  {isUpdatingStatus ? (
                    <div className="flex items-center">
                      <svg
                        className="animate-spin h-4 w-4 mr-2 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Đang xử lý...
                    </div>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Hoàn thành đơn hàng
                    </>
                  )}
                </button>
                <button
                  onClick={() => handleStatusUpdate("Returned")}
                  disabled={isUpdatingStatus}
                  className={`flex items-center px-4 py-2 text-white rounded-lg ${
                    isUpdatingStatus
                      ? "bg-red-400 cursor-not-allowed"
                      : "bg-red-600 hover:bg-red-700"
                  }`}
                >
                  {isUpdatingStatus ? (
                    <div className="flex items-center">
                      <svg
                        className="animate-spin h-4 w-4 mr-2 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Đang xử lý...
                    </div>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Trả hàng
                    </>
                  )}
                </button>
              </>
            ) : order.isGet === 0 ? (
              <>
                <button
                  onClick={() => handleGetOrder(order.id, null)}
                  disabled={isUpdatingStatus}
                  className={`flex items-center px-4 py-2 text-white rounded-lg ${
                    isUpdatingStatus
                      ? "bg-green-400 cursor-not-allowed"
                      : "bg-green-600 hover:bg-green-700"
                  }`}
                >
                  {isUpdatingStatus ? (
                    <div className="flex items-center">
                      <svg
                        className="animate-spin h-4 w-4 mr-2 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Đang xử lý...
                    </div>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Đã giao lại
                    </>
                  )}
                </button>
                <button
                  onClick={() => handleStatusUpdate("Returned")}
                  disabled={isUpdatingStatus}
                  className={`flex items-center px-4 py-2 text-white rounded-lg ${
                    isUpdatingStatus
                      ? "bg-red-400 cursor-not-allowed"
                      : "bg-red-600 hover:bg-red-700"
                  }`}
                >
                  {isUpdatingStatus ? (
                    <div className="flex items-center">
                      <svg
                        className="animate-spin h-4 w-4 mr-2 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Đang xử lý...
                    </div>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Trả Hàng
                    </>
                  )}
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => handleGetOrder(order.id, 1)}
                  disabled={isUpdatingStatus}
                  className={`flex items-center px-4 py-2 text-white rounded-lg ${
                    isUpdatingStatus
                      ? "bg-green-400 cursor-not-allowed"
                      : "bg-green-600 hover:bg-green-700"
                  }`}
                >
                  {isUpdatingStatus ? (
                    <div className="flex items-center">
                      <svg
                        className="animate-spin h-4 w-4 mr-2 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Đang xử lý...
                    </div>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Đã giao hàng
                    </>
                  )}
                </button>
                <button
                  onClick={() => handleGetOrder(order.id, 0)}
                  disabled={isUpdatingStatus}
                  className={`flex items-center px-4 py-2 text-white rounded-lg ${
                    isUpdatingStatus
                      ? "bg-red-400 cursor-not-allowed"
                      : "bg-red-600 hover:bg-red-700"
                  }`}
                >
                  {isUpdatingStatus ? (
                    <div className="flex items-center">
                      <svg
                        className="animate-spin h-4 w-4 mr-2 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Đang xử lý...
                    </div>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Chưa nhận hàng
                    </>
                  )}
                </button>
              </>
            )}
          </>
        )}
        {actions.includes("confirm") && (
          <button
            onClick={() => handleStatusUpdate("Processing")}
            disabled={isUpdatingStatus}
            className={`flex items-center px-4 py-2 text-white rounded-lg ${
              isUpdatingStatus
                ? "bg-green-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {isUpdatingStatus ? (
              <div className="flex items-center">
                <svg
                  className="animate-spin h-4 w-4 mr-2 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Đang xử lý...
              </div>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                {order.status === "Returned"
                  ? "Xác nhận trả hàng"
                  : "Xác nhận đơn hàng"}
              </>
            )}
          </button>
        )}
        {actions.includes("in-transit") && (
          <button
            onClick={() => handleStatusUpdate("In Transit")}
            disabled={isUpdatingStatus}
            className={`flex items-center px-4 py-2 text-white rounded-lg ${
              isUpdatingStatus
                ? "bg-green-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {isUpdatingStatus ? (
              <div className="flex items-center">
                <svg
                  className="animate-spin h-4 w-4 mr-2 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Đang xử lý...
              </div>
            ) : (
              <>
                <TruckIcon className="w-4 h-4 mr-2" />
                Xác nhận giao hàng
              </>
            )}
          </button>
        )}
        {actions.includes("cancel") && (
          <button
            onClick={() => handleStatusUpdate("Cancelled")}
            disabled={isUpdatingStatus}
            className={`flex items-center px-4 py-2 text-white rounded-lg ${
              isUpdatingStatus
                ? "bg-red-400 cursor-not-allowed"
                : "bg-red-600 hover:bg-red-700"
            }`}
          >
            {isUpdatingStatus ? (
              <div className="flex items-center">
                <svg
                  className="animate-spin h-4 w-4 mr-2 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Đang xử lý...
              </div>
            ) : (
              <>
                <XCircle className="w-4 h-4 mr-2" />
                Hủy đơn hàng
              </>
            )}
          </button>
        )}
        {actions.includes("deliver") && (
          <button
            onClick={() => handleStatusUpdate("Delivered")}
            disabled={isUpdatingStatus}
            className={`flex items-center px-4 py-2 text-white rounded-lg ${
              isUpdatingStatus
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {isUpdatingStatus ? (
              <div className="flex items-center">
                <svg
                  className="animate-spin h-4 w-4 mr-2 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Đang xử lý...
              </div>
            ) : (
              <>
                <TruckIcon className="w-4 h-4 mr-2" />
                Xác nhận đã giao
              </>
            )}
          </button>
        )}
        {actions.includes("complete") && (
          <button
            onClick={() => handleStatusUpdate("Completed")}
            disabled={isUpdatingStatus}
            className={`flex items-center px-4 py-2 text-white rounded-lg ${
              isUpdatingStatus
                ? "bg-green-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {isUpdatingStatus ? (
              <div className="flex items-center">
                <svg
                  className="animate-spin h-4 w-4 mr-2 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Đang xử lý...
              </div>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Hoàn thành
              </>
            )}
          </button>
        )}
        {actions.includes("return") && order.status !== "Completed" && (
          <button
            onClick={() => handleStatusUpdate("Returned")}
            disabled={isUpdatingStatus}
            className={`flex items-center px-4 py-2 text-white rounded-lg ${
              isUpdatingStatus
                ? "bg-red-400 cursor-not-allowed"
                : "bg-red-600 hover:bg-red-700"
            }`}
          >
            {isUpdatingStatus ? (
              <div className="flex items-center">
                <svg
                  className="animate-spin h-4 w-4 mr-2 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Đang xử lý...
              </div>
            ) : (
              <>
                <RotateCcw className="w-4 h-4 mr-2" />
                Trả hàng
              </>
            )}
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
          {order.status === "Delivered" &&
          (order.isGet === 1 || order.isGet === 0) &&
          !order.returnReason ? (
            <span
              className={`px-3 py-1 rounded-full text-sm ${
                order.isGet === 1
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {order.isGet === 1 ? "Đã nhận hàng" : "Chưa nhận hàng"}
            </span>
          ) : (
            <span
              className={`px-3 py-1 rounded-full text-sm ${
                STATUS_COLORS[
                  order.status === "Delivered" && order.returnReason
                    ? "Delivered"
                    : order.returnReason &&
                      order.status === "Pending Confirmation"
                    ? "Return Request"
                    : order.status
                ]
              }`}
            >
              {STATUS_DISPLAY_MAP[
                order.status === "Delivered" && order.returnReason
                  ? "Delivered"
                  : order.returnReason &&
                    order.status === "Pending Confirmation"
                  ? "Return Request"
                  : order.status
              ] || order.status}
            </span>
          )}

          <div className="text-right">
            <p className="text-sm text-gray-500">Cập nhật lần cuối:</p>
            <p className="font-medium">
              {new Date(order.updatedAt).toLocaleString()}
            </p>
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
        {(order.returnReason || order.cancelReason) && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">
              {order.status === "Cancelled"
                ? "Lý do hủy đơn"
                : "Lý do trả hàng"}
            </h2>
            <p className="text-gray-700">
              {order.status === "Cancelled"
                ? order.cancelReason || "Không có lý do cụ thể"
                : order.returnReason || "Không có lý do cụ thể"}
            </p>
          </div>
        )}
      </div>

      {/* Order Items */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Chi tiết đơn hàng</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-4">Tên Sản phẩm</th>
                <th className="text-left p-4">Hình ảnh</th>
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
                  <td className="p-4">{item.name}</td>
                  <td className="p-4">
                    <div className="flex items-center">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-12 h-12 rounded object-cover mr-3"
                      />
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
          <div className="w-96 ml-auto">
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
                <div className="flex items-center space-x-2">
                  <span className="text-gray-500">
                    {order.couponCode ? order.couponCode : ""}
                  </span>
                  {order.couponType === "percent" ? (
                    <span className="text-gray-900">-{order.couponValue}%</span>
                  ) : (
                    <span className="text-gray-900">
                      - {formatPrice(order.couponValue || 0)}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">
                  Giảm giá qua hình thức thanh toán:
                </span>{" "}
                <span>
                  {order.paymentMethod === "ONLINE" ? "- 50.000 đ" : "0 đ"}
                </span>
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

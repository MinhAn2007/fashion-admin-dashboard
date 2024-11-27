import React, { useState } from "react";
import { Copy, ExternalLink } from "lucide-react";

const BotpressAccess = () => {
  const [dashboardCopied, setDashboardCopied] = useState(false);
  const [tokenCopied, setTokenCopied] = useState(false);

  const dashboardUrl =
    "https://app.botpress.cloud/workspaces/wkspace_01J7GZNR52JG4BCNJM3XDHM783/bots/5dc09bcc-5e44-40da-bd94-0f15200d0421/overview";
  const personalAccessToken = "bp_pat_NhKyO62WMr7Kt2di2g1WZcUXvGh3WPjGvjzu";
  const inboxUrl = "https://inbox.botpress.sh/";

  const copyText = (text, type) => {
    navigator.clipboard.writeText(text);
    if (type === "dashboard") {
      setDashboardCopied(true);
      setTimeout(() => setDashboardCopied(false), 2000);
    } else {
      setTokenCopied(true);
      setTimeout(() => setTokenCopied(false), 2000);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg ">
      <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">
        Hướng Dẫn Truy Cập Botpress
      </h2>
      <div className="text-sm text-gray-600 mb-4">
        <p>
          Click vào{" "}
          <a
            href={dashboardUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 underline font-semibold transition duration-200 ease-in-out hover:text-blue-700 hover:underline-offset-4"
          >
            đây
          </a>{" "}
          để xem tổng quát thông tin của chatbot. Thông tin đăng nhập vui lòng
          liên hệ Admin An để được cung cấp.
        </p>
      </div>

      <div className="space-y-4 text-gray-700">
        <p className="text-sm leading-relaxed">
          Để quản lý và theo dõi tin nhắn chatbot, bạn cần thực hiện các bước
          sau:
        </p>

        <ol className="list-decimal list-inside text-sm space-y-2">
          <li>
            Sao chép <strong>Dashboard URL</strong> để truy cập giao diện quản
            lý
          </li>
          <li>
            Lấy <strong>Personal Access Token</strong> để xác thực
          </li>
          <li>
            Nhấn nút <strong>Mở Inbox</strong> để truy cập hộp thư
          </li>
        </ol>

        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
          <p className="text-xs text-yellow-700 font-medium mb-2 flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2 text-yellow-500"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            Lưu Ý Quan Trọng
          </p>
          <ul className="text-xs text-yellow-700 space-y-2 list-disc list-inside">
            <li>
              <strong>Personal Access Token</strong> là thông tin nhạy cảm,
              <span className="text-red-600 font-bold">
                {" "}
                KHÔNG ĐƯỢC chia sẻ
              </span>{" "}
              với bất kỳ ai khác.
            </li>
            <li>
              Đây là dịch vụ của bên thứ ba (<em>third-party service</em>), tích
              hợp không hoàn toàn tối ưu.
            </li>
            <li>
              <span className="font-semibold text-red-600">Chú ý:</span> Làm mới
              trang mỗi <strong>5 giây</strong> để cập nhật tin nhắn mới nhất.
            </li>
          </ul>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="font-semibold text-gray-700">Dashboard URL</span>
            <button
              onClick={() => copyText(dashboardUrl, "dashboard")}
              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded flex items-center transition-colors"
            >
              <Copy size={16} className="mr-2" />
              {dashboardCopied ? "Đã sao chép" : "Sao chép"}
            </button>
          </div>
          <input
            type="text"
            value={dashboardUrl}
            readOnly
            className="w-full border border-gray-300 rounded p-2 text-gray-600 text-sm bg-white"
          />
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="font-semibold text-gray-700">
              Personal Access Token
            </span>
            <button
              onClick={() => copyText(personalAccessToken, "token")}
              className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded flex items-center transition-colors"
            >
              <Copy size={16} className="mr-2" />
              {tokenCopied ? "Đã sao chép" : "Sao chép"}
            </button>
          </div>
          <input
            type="text"
            value={personalAccessToken}
            readOnly
            className="w-full border border-gray-300 rounded p-2 text-gray-600 text-sm bg-white"
          />
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="font-semibold text-gray-700">Inbox URL</span>
            <a
              href={inboxUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-1 rounded flex items-center transition-colors"
            >
              Mở Inbox <ExternalLink size={16} className="ml-2" />
            </a>
          </div>
          <input
            type="text"
            value={inboxUrl}
            readOnly
            className="w-full border border-gray-300 rounded p-2 text-gray-600 text-sm bg-white"
          />
        </div>
      </div>
    </div>
  );
};

export default BotpressAccess;
